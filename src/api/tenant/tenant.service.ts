import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  CreateTenantDto,
  CreateTenantWithAdminDto,
  UpdateTenantDto,
  SetDefaultTenantDto,
  EnableModuleDto,
  EnableMultipleModulesDto,
  ModuleCode,
  VALID_MODULES,
} from './dto';
import {
  Tenant,
  TenantMembership,
  TenantModule,
  TenantLimits,
  TenantRow,
  TenantMembershipRow,
  TenantModuleRow,
  ProfileRow,
  RoleCode,
} from './types';

interface PlanLimits {
  maxUsers: number;
  maxFields: number;
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  basico: { maxUsers: 10, maxFields: 5 },
  profesional: { maxUsers: 30, maxFields: 20 },
  enterprise: { maxUsers: 100, maxFields: 100 },
};

const DEFAULT_MODULES: ModuleCode[] = ['dashboard', 'usuarios'];

const COUNTABLE_ROLES: RoleCode[] = ['admin', 'campo', 'empaque', 'finanzas'];

@Injectable()
export class TenantService {
  private supabaseAdmin: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is missing');
    }

    this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  }

  // ==================== GET OPERATIONS ====================

  async getTenantById(tenantId: string): Promise<Tenant | null> {
    const { data, error } = await this.supabaseAdmin
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(
        `Error al obtener tenant: ${error.message}`,
      );
    }

    return data as Tenant | null;
  }

  async getTenantBySlug(slug: string): Promise<Tenant | null> {
    const { data, error } = await this.supabaseAdmin
      .from('tenants')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(
        `Error al obtener tenant: ${error.message}`,
      );
    }

    return data as Tenant | null;
  }

  async getUserTenants(userId: string): Promise<Tenant[]> {
    const { data, error } = await this.supabaseAdmin
      .from('tenant_memberships')
      .select('tenants(*)')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) {
      throw new BadRequestException(
        `Error al obtener tenants del usuario: ${error.message}`,
      );
    }

    return (data || [])
      .map((m: { tenants: TenantRow | TenantRow[] | null }) => {
        // Handle both single object and array responses
        if (Array.isArray(m.tenants)) {
          return m.tenants[0] || null;
        }
        return m.tenants;
      })
      .filter((t): t is TenantRow => t !== null);
  }

  async getUserMembership(
    userId: string,
    tenantId: string,
  ): Promise<TenantMembership | null> {
    const { data, error } = await this.supabaseAdmin
      .from('tenant_memberships')
      .select('*')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .maybeSingle();

    if (error) {
      throw new BadRequestException(
        `Error al obtener membresía: ${error.message}`,
      );
    }

    return data as TenantMembership | null;
  }

  async isSlugAvailable(slug: string): Promise<boolean> {
    const tenant = await this.getTenantBySlug(slug);
    return tenant === null;
  }

  // ==================== CREATE OPERATIONS ====================

  async createTenantForUser(
    dto: CreateTenantDto,
    userId: string,
  ): Promise<{ tenant: Tenant; membership: TenantMembership }> {
    const slug = dto.slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');

    // Check slug availability
    const existingTenant = await this.getTenantBySlug(slug);
    if (existingTenant) {
      throw new ConflictException(
        'Ya existe una empresa con ese identificador',
      );
    }

    const limits = PLAN_LIMITS[dto.plan] || PLAN_LIMITS.basico;

    // Create tenant
    const { data: tenantDataRaw, error: tenantError } = await this.supabaseAdmin
      .from('tenants')
      .insert({
        name: dto.name.trim(),
        slug,
        plan: dto.plan,
        contact_name: dto.contactName.trim(),
        contact_email: dto.contactEmail.trim().toLowerCase(),
        created_by: userId,
        max_users: limits.maxUsers,
        max_fields: limits.maxFields,
        current_users: 0,
        current_fields: 0,
      })
      .select()
      .single();

    if (tenantError || !tenantDataRaw) {
      throw new BadRequestException(
        `Error al crear empresa: ${tenantError?.message ?? 'Unknown error'}`,
      );
    }

    const tenantData = tenantDataRaw as TenantRow;

    // Create membership as owner
    const { data: membershipDataRaw, error: membershipError } =
      await this.supabaseAdmin
        .from('tenant_memberships')
        .insert({
          tenant_id: tenantData.id,
          user_id: userId,
          role_code: 'owner',
          status: 'active',
          accepted_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (membershipError || !membershipDataRaw) {
      // Rollback tenant creation
      await this.supabaseAdmin.from('tenants').delete().eq('id', tenantData.id);
      throw new BadRequestException(
        `Error al crear membresía: ${membershipError?.message ?? 'Unknown error'}`,
      );
    }

    const membershipData = membershipDataRaw as TenantMembershipRow;

    // Enable default modules
    await this.enableDefaultModules(tenantData.id);

    // Update user's default tenant
    await this.supabaseAdmin.from('profiles').upsert(
      {
        user_id: userId,
        default_tenant_id: tenantData.id,
      },
      { onConflict: 'user_id' },
    );

    // Audit log
    await this.supabaseAdmin.from('audit_logs').insert({
      tenant_id: tenantData.id,
      actor_user_id: userId,
      action: 'tenant_created',
      entity: 'tenant',
      entity_id: tenantData.id,
      details: {
        tenant_name: tenantData.name,
        slug: tenantData.slug,
        plan: dto.plan,
      },
    });

    return {
      tenant: tenantData,
      membership: membershipData,
    };
  }

  async createTenantWithAdmin(
    dto: CreateTenantWithAdminDto,
  ): Promise<{ tenant: Tenant; membership: TenantMembership; userId: string }> {
    const email = dto.adminEmail.trim().toLowerCase();

    // Create the admin user
    const { data: authData, error: authError } =
      await this.supabaseAdmin.auth.admin.createUser({
        email,
        password: dto.adminPassword,
        email_confirm: true,
        user_metadata: {
          full_name: dto.adminFullName,
          phone: dto.adminPhone || null,
        },
      });

    if (authError || !authData.user) {
      if (authError?.message?.includes('already been registered')) {
        throw new ConflictException('Ya existe un usuario con ese email');
      }
      throw new BadRequestException(
        `Error al crear usuario: ${authError?.message ?? 'Unknown error'}`,
      );
    }

    const userId = authData.user.id;

    try {
      // Create tenant with the new user
      const result = await this.createTenantForUser(dto, userId);

      // Create profile
      await this.supabaseAdmin.from('profiles').upsert(
        {
          user_id: userId,
          full_name: dto.adminFullName.trim(),
          phone: dto.adminPhone?.trim() || null,
          default_tenant_id: result.tenant.id,
        },
        { onConflict: 'user_id' },
      );

      return {
        ...result,
        userId,
      };
    } catch (error) {
      // Rollback user creation on failure
      await this.supabaseAdmin.auth.admin.deleteUser(userId);
      throw error;
    }
  }

  // ==================== UPDATE OPERATIONS ====================

  async updateTenant(
    tenantId: string,
    dto: UpdateTenantDto,
    userId: string,
  ): Promise<Tenant> {
    // Verify user has permission
    const membership = await this.getUserMembership(userId, tenantId);
    if (!membership || !['owner', 'admin'].includes(membership.role_code)) {
      throw new UnauthorizedException(
        'No tienes permisos para modificar esta empresa',
      );
    }

    const updateData: Record<string, unknown> = {};
    if (dto.name) updateData.name = dto.name.trim();
    if (dto.plan) updateData.plan = dto.plan;
    if (dto.contactName) updateData.contact_name = dto.contactName.trim();
    if (dto.contactEmail)
      updateData.contact_email = dto.contactEmail.trim().toLowerCase();
    if (dto.maxUsers !== undefined) updateData.max_users = dto.maxUsers;
    if (dto.maxFields !== undefined) updateData.max_fields = dto.maxFields;

    const { data, error } = await this.supabaseAdmin
      .from('tenants')
      .update(updateData)
      .eq('id', tenantId)
      .select()
      .single();

    if (error || !data) {
      throw new BadRequestException(
        `Error al actualizar empresa: ${error?.message ?? 'Unknown error'}`,
      );
    }

    return data as Tenant;
  }

  async setUserDefaultTenant(userId: string, tenantId: string): Promise<void> {
    // Verify user has membership
    const membership = await this.getUserMembership(userId, tenantId);
    if (!membership) {
      throw new UnauthorizedException('No tienes acceso a esta empresa');
    }

    const { error } = await this.supabaseAdmin.from('profiles').upsert(
      {
        user_id: userId,
        default_tenant_id: tenantId,
      },
      { onConflict: 'user_id' },
    );

    if (error) {
      throw new BadRequestException(
        `Error al establecer tenant por defecto: ${error.message}`,
      );
    }
  }

  async clearUserDefaultTenant(userId: string): Promise<void> {
    const { error } = await this.supabaseAdmin
      .from('profiles')
      .update({ default_tenant_id: null })
      .eq('user_id', userId);

    if (error) {
      throw new BadRequestException(
        `Error al limpiar tenant por defecto: ${error.message}`,
      );
    }
  }

  // ==================== MODULES ====================

  async getTenantModules(tenantId: string): Promise<TenantModule[]> {
    const { data, error } = await this.supabaseAdmin
      .from('tenant_modules')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('enabled', true);

    if (error) {
      throw new BadRequestException(
        `Error al obtener módulos: ${error.message}`,
      );
    }

    return (data || []) as TenantModule[];
  }

  async enableModule(dto: EnableModuleDto, userId: string): Promise<void> {
    // Verify user has permission
    const membership = await this.getUserMembership(userId, dto.tenantId);
    if (!membership || !['owner', 'admin'].includes(membership.role_code)) {
      throw new UnauthorizedException(
        'No tienes permisos para modificar módulos',
      );
    }

    const { error } = await this.supabaseAdmin.from('tenant_modules').upsert(
      {
        tenant_id: dto.tenantId,
        module_code: dto.moduleCode,
        enabled: dto.enabled,
      },
      { onConflict: 'tenant_id,module_code' },
    );

    if (error) {
      throw new BadRequestException(
        `Error al actualizar módulo: ${error.message}`,
      );
    }
  }

  async enableMultipleModules(
    dto: EnableMultipleModulesDto,
    userId: string,
  ): Promise<void> {
    // Verify user has permission
    const membership = await this.getUserMembership(userId, dto.tenantId);
    if (!membership || !['owner', 'admin'].includes(membership.role_code)) {
      throw new UnauthorizedException(
        'No tienes permisos para modificar módulos',
      );
    }

    const moduleInserts = dto.moduleCodes.map((code) => ({
      tenant_id: dto.tenantId,
      module_code: code,
      enabled: true,
    }));

    const { error } = await this.supabaseAdmin
      .from('tenant_modules')
      .upsert(moduleInserts, { onConflict: 'tenant_id,module_code' });

    if (error) {
      throw new BadRequestException(
        `Error al habilitar módulos: ${error.message}`,
      );
    }
  }

  private async enableDefaultModules(tenantId: string): Promise<void> {
    const moduleInserts = DEFAULT_MODULES.map((code) => ({
      tenant_id: tenantId,
      module_code: code,
      enabled: true,
    }));

    await this.supabaseAdmin.from('tenant_modules').insert(moduleInserts);
  }

  // ==================== LIMITS ====================

  async getTenantLimits(tenantId: string): Promise<TenantLimits> {
    const { data: tenantRaw, error } = await this.supabaseAdmin
      .from('tenants')
      .select('max_users, current_users, max_fields, current_fields, plan')
      .eq('id', tenantId)
      .single();

    if (error || !tenantRaw) {
      throw new NotFoundException('Tenant no encontrado');
    }

    const tenant = tenantRaw as Pick<
      TenantRow,
      'max_users' | 'current_users' | 'max_fields' | 'current_fields' | 'plan'
    >;

    return {
      users: {
        max: tenant.max_users,
        current: tenant.current_users,
        available: tenant.max_users - tenant.current_users,
      },
      fields: {
        max: tenant.max_fields,
        current: tenant.current_fields,
        available: tenant.max_fields - tenant.current_fields,
      },
      plan: tenant.plan,
    };
  }

  async canAddUser(tenantId: string): Promise<boolean> {
    const limits = await this.getTenantLimits(tenantId);
    return limits.users.available > 0;
  }

  async canAddField(tenantId: string): Promise<boolean> {
    const limits = await this.getTenantLimits(tenantId);
    return limits.fields.available > 0;
  }

  async incrementUserCount(tenantId: string): Promise<void> {
    const { data: tenantRaw } = await this.supabaseAdmin
      .from('tenants')
      .select('current_users, max_users')
      .eq('id', tenantId)
      .single();

    const tenant = tenantRaw as Pick<
      TenantRow,
      'current_users' | 'max_users'
    > | null;

    if (!tenant) {
      throw new NotFoundException('Tenant no encontrado');
    }

    if (tenant.current_users >= tenant.max_users) {
      throw new BadRequestException('Se alcanzó el límite máximo de usuarios');
    }

    await this.supabaseAdmin
      .from('tenants')
      .update({ current_users: tenant.current_users + 1 })
      .eq('id', tenantId);
  }

  async decrementUserCount(tenantId: string): Promise<void> {
    const { data: tenantRaw } = await this.supabaseAdmin
      .from('tenants')
      .select('current_users')
      .eq('id', tenantId)
      .single();

    const tenant = tenantRaw as Pick<TenantRow, 'current_users'> | null;

    if (!tenant) {
      throw new NotFoundException('Tenant no encontrado');
    }

    const newCount = Math.max(0, tenant.current_users - 1);

    await this.supabaseAdmin
      .from('tenants')
      .update({ current_users: newCount })
      .eq('id', tenantId);
  }

  async incrementFieldCount(tenantId: string): Promise<void> {
    const { data: tenantRaw } = await this.supabaseAdmin
      .from('tenants')
      .select('current_fields, max_fields')
      .eq('id', tenantId)
      .single();

    const tenant = tenantRaw as Pick<
      TenantRow,
      'current_fields' | 'max_fields'
    > | null;

    if (!tenant) {
      throw new NotFoundException('Tenant no encontrado');
    }

    if (tenant.current_fields >= tenant.max_fields) {
      throw new BadRequestException('Se alcanzó el límite máximo de campos');
    }

    await this.supabaseAdmin
      .from('tenants')
      .update({ current_fields: tenant.current_fields + 1 })
      .eq('id', tenantId);
  }

  async decrementFieldCount(tenantId: string): Promise<void> {
    const { data: tenantRaw } = await this.supabaseAdmin
      .from('tenants')
      .select('current_fields')
      .eq('id', tenantId)
      .single();

    const tenant = tenantRaw as Pick<TenantRow, 'current_fields'> | null;

    if (!tenant) {
      throw new NotFoundException('Tenant no encontrado');
    }

    const newCount = Math.max(0, tenant.current_fields - 1);

    await this.supabaseAdmin
      .from('tenants')
      .update({ current_fields: newCount })
      .eq('id', tenantId);
  }
}
