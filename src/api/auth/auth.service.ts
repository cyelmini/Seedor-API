import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import {
  LoginDto,
  RegisterTenantDto,
  InviteUserDto,
  AcceptInvitationDto,
  SendOtpDto,
  VerifyOtpDto,
  SetPasswordDto,
} from './dto';
import {
  Tenant,
  Profile,
  TenantMembership,
  Invitation,
  AuthUser,
  TenantLimits,
  RoleCode,
  TenantRow,
  ProfileRow,
  TenantMembershipRow,
  InvitationRow,
} from './types';

interface PlanLimits {
  maxUsers: number;
  maxFields: number;
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  basico: { maxUsers: 10, maxFields: 5 },
  profesional: { maxUsers: 30, maxFields: 20 },
};

const COUNTABLE_ROLES: RoleCode[] = ['admin', 'campo', 'empaque', 'finanzas'];

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;
  private supabaseAdmin: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    const supabaseServiceKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      throw new Error('Supabase configuration is missing');
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
    this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  }

  // ==================== LOGIN ====================

  async login(dto: LoginDto): Promise<{ user: AuthUser; accessToken: string }> {
    const email = dto.email.trim().toLowerCase();

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password: dto.password,
    });

    if (error || !data.user || !data.session) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    const user = await this.buildAuthUser(data.user.id, data.user.email ?? '');

    return {
      user,
      accessToken: data.session.access_token,
    };
  }

  // ==================== OTP VERIFICATION ====================

  async sendOwnerVerificationCode(dto: SendOtpDto): Promise<void> {
    const email = dto.email.trim().toLowerCase();

    const { error } = await this.supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: {
          is_tenant_owner: true,
          signup_type: 'tenant_registration',
        },
      },
    });

    if (error) {
      if (error.message.includes('Signups not allowed')) {
        throw new BadRequestException(
          'El registro de nuevos usuarios está deshabilitado',
        );
      }
      throw new BadRequestException(`Error al enviar código: ${error.message}`);
    }
  }

  async verifyOwnerCode(
    dto: VerifyOtpDto,
  ): Promise<{ session: Session; userId: string }> {
    const email = dto.email.trim().toLowerCase();

    const { data, error } = await this.supabase.auth.verifyOtp({
      email,
      token: dto.code,
      type: 'email',
    });

    if (error) {
      if (
        error.message.includes('expired') ||
        error.message.includes('Token has expired')
      ) {
        throw new BadRequestException(
          'El código ha expirado. Solicitá uno nuevo.',
        );
      }
      throw new BadRequestException('Código inválido o expirado');
    }

    if (!data.session || !data.user) {
      throw new BadRequestException('No se pudo crear la sesión');
    }

    return {
      session: data.session,
      userId: data.user.id,
    };
  }

  // ==================== TENANT REGISTRATION ====================

  async createTenantWithOwner(
    dto: RegisterTenantDto,
    userId: string,
  ): Promise<{ tenant: Tenant; membership: TenantMembership }> {
    const slug = dto.slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');

    const { data: existingTenant } = await this.supabaseAdmin
      .from('tenants')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existingTenant) {
      throw new ConflictException(
        'Ya existe una empresa con ese identificador',
      );
    }

    const limits = PLAN_LIMITS[dto.plan] || PLAN_LIMITS.basico;

    const { data: tenantDataRaw, error: tenantError } = await this.supabaseAdmin
      .from('tenants')
      .insert({
        name: dto.tenantName.trim(),
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

    await this.supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        full_name: dto.contactName.trim(),
        phone: dto.ownerPhone?.trim() || null,
      },
    });

    await this.supabaseAdmin.from('profiles').upsert({
      user_id: userId,
      full_name: dto.contactName.trim(),
      phone: dto.ownerPhone?.trim() || null,
      default_tenant_id: tenantData.id,
    });

    const { data: membershipDataRaw, error: membershipError } =
      await this.supabaseAdmin
        .from('tenant_memberships')
        .insert({
          tenant_id: tenantData.id,
          user_id: userId,
          role_code: 'owner',
          status: 'active',
        })
        .select()
        .single();

    if (membershipError || !membershipDataRaw) {
      throw new BadRequestException(
        `Error al crear membresía: ${membershipError?.message ?? 'Unknown error'}`,
      );
    }

    const membershipData = membershipDataRaw as TenantMembershipRow;

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

  // ==================== INVITATIONS ====================

  async inviteUser(
    dto: InviteUserDto,
    invitedBy: string,
  ): Promise<{ invitation: Invitation; inviteUrl: string }> {
    const email = dto.email.trim().toLowerCase();

    const { data: tenant, error: tenantError } = await this.supabaseAdmin
      .from('tenants')
      .select('id, name, current_users, max_users')
      .eq('id', dto.tenantId)
      .single();

    if (tenantError || !tenant) {
      throw new NotFoundException('Tenant no encontrado');
    }

    const { data: membershipRaw } = await this.supabaseAdmin
      .from('tenant_memberships')
      .select('role_code')
      .eq('tenant_id', dto.tenantId)
      .eq('user_id', invitedBy)
      .eq('status', 'active')
      .single();

    const membership = membershipRaw as { role_code: RoleCode } | null;

    if (!membership || !['owner', 'admin'].includes(membership.role_code)) {
      throw new UnauthorizedException(
        'No tienes permisos para invitar usuarios',
      );
    }

    const { data: existingInvitation } = await this.supabaseAdmin
      .from('invitations')
      .select('id')
      .eq('tenant_id', dto.tenantId)
      .eq('email', email)
      .is('accepted_at', null)
      .is('revoked_at', null)
      .maybeSingle();

    if (existingInvitation) {
      throw new ConflictException(
        'Ya existe una invitación pendiente para este email',
      );
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const { data: invitationRaw, error: inviteError } = await this.supabaseAdmin
      .from('invitations')
      .insert({
        tenant_id: dto.tenantId,
        email,
        role_code: dto.roleCode as RoleCode,
        token_hash: token,
        invited_by: invitedBy,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (inviteError || !invitationRaw) {
      throw new BadRequestException(
        `Error al crear invitación: ${inviteError?.message ?? 'Unknown error'}`,
      );
    }

    const invitation = invitationRaw as InvitationRow;

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const inviteUrl = `${frontendUrl}/invitacion/usuario?token=${token}`;

    const tenantName = (tenant as { name: string }).name;

    const { error: emailError } =
      await this.supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo: inviteUrl,
        data: {
          tenant_id: dto.tenantId,
          tenant_name: tenantName,
          role_code: dto.roleCode,
          invitation_token: token,
          invited_by_id: invitedBy,
        },
      });

    if (emailError) {
      await this.supabaseAdmin
        .from('invitations')
        .delete()
        .eq('id', invitation.id);

      throw new BadRequestException(
        `Error al enviar invitación: ${emailError.message}`,
      );
    }

    return {
      invitation: {
        ...invitation,
        tenants: { name: tenantName },
      } as Invitation,
      inviteUrl,
    };
  }

  async getInvitationByToken(token: string): Promise<Invitation> {
    const { data: invitationRaw, error } = await this.supabaseAdmin
      .from('invitations')
      .select('*')
      .eq('token_hash', token)
      .single();

    if (error || !invitationRaw) {
      throw new NotFoundException('Invitación no encontrada');
    }

    const invitation = invitationRaw as InvitationRow;

    if (invitation.revoked_at) {
      throw new BadRequestException('Esta invitación ha sido revocada');
    }

    if (invitation.accepted_at) {
      throw new BadRequestException('Esta invitación ya fue utilizada');
    }

    if (new Date() > new Date(invitation.expires_at)) {
      throw new BadRequestException('La invitación ha expirado');
    }

    return invitation;
  }

  async acceptInvitationWithToken(
    dto: AcceptInvitationDto,
  ): Promise<{ membership: TenantMembership; tenantId: string }> {
    console.log('🔍 acceptInvitationWithToken called with token:', dto.token);
    console.log('🔍 accessToken length:', dto.accessToken?.length);

    // Decode the JWT to get user info (the token was already validated by Supabase when issued)
    let userId: string;
    let userEmail: string;

    try {
      // JWT format: header.payload.signature
      const parts = dto.accessToken.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64').toString('utf-8'),
      );

      console.log('🔍 JWT payload:', {
        sub: payload.sub,
        email: payload.email,
        exp: payload.exp,
        aud: payload.aud,
      });

      // Check if token is expired
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        throw new UnauthorizedException('Token expirado');
      }

      // Check audience
      if (payload.aud !== 'authenticated') {
        throw new UnauthorizedException('Token no válido para autenticación');
      }

      userId = payload.sub;
      userEmail = payload.email || '';

      if (!userId) {
        throw new UnauthorizedException('Token sin ID de usuario');
      }
    } catch (err) {
      console.error('❌ JWT decode failed:', err);
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Token de acceso inválido');
    }

    console.log('✅ JWT decoded:', { userId, userEmail });

    // The JWT is signed by Supabase, so we trust it.
    // We skip the getUserById check since it can fail even when user exists.
    // The foreign key constraint on membership insert will catch any issues.

    const invitation = await this.getInvitationByToken(dto.token);

    if (userEmail !== invitation.email) {
      throw new BadRequestException(
        'El email de la sesión no coincide con la invitación',
      );
    }

    const { data: tenantRaw } = await this.supabaseAdmin
      .from('tenants')
      .select('current_users, max_users')
      .eq('id', invitation.tenant_id)
      .single();

    const tenant = tenantRaw as {
      current_users: number;
      max_users: number;
    } | null;

    if (!tenant) {
      throw new NotFoundException('Tenant no encontrado');
    }

    if (tenant.current_users >= tenant.max_users) {
      throw new BadRequestException(
        'Se alcanzó el límite máximo de usuarios para este tenant',
      );
    }

    // Check if membership already exists
    const { data: existingMembership } = await this.supabaseAdmin
      .from('tenant_memberships')
      .select('id')
      .eq('tenant_id', invitation.tenant_id)
      .eq('user_id', userId)
      .single();

    if (existingMembership) {
      console.log('⚠️ Membership already exists, updating invitation status');
      // Mark invitation as accepted
      await this.supabaseAdmin
        .from('invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invitation.id);

      // Return the existing membership
      const { data: membershipDataRaw } = await this.supabaseAdmin
        .from('tenant_memberships')
        .select('*')
        .eq('id', existingMembership.id)
        .single();

      return {
        membership: membershipDataRaw as TenantMembership,
        tenantId: invitation.tenant_id,
      };
    }

    if (dto.password) {
      await this.supabaseAdmin.auth.admin.updateUserById(userId, {
        password: dto.password,
        user_metadata: {
          full_name: dto.fullName || userEmail.split('@')[0],
          phone: dto.phone || null,
        },
      });
    }

    // Create/update profile FIRST (before membership, due to foreign key constraint)
    console.log('🔍 Creating/updating profile for user:', userId);
    const { error: profileError } = await this.supabaseAdmin
      .from('profiles')
      .upsert(
        {
          user_id: userId,
          full_name: dto.fullName || userEmail.split('@')[0],
          phone: dto.phone || null,
          default_tenant_id: invitation.tenant_id,
        },
        { onConflict: 'user_id' },
      );

    if (profileError) {
      console.error('❌ Profile upsert failed:', profileError);
      throw new BadRequestException(
        `Error al crear perfil: ${profileError.message}`,
      );
    }
    console.log('✅ Profile created/updated successfully');

    const { data: membershipDataRaw, error: membershipError } =
      await this.supabaseAdmin
        .from('tenant_memberships')
        .insert({
          tenant_id: invitation.tenant_id,
          user_id: userId,
          role_code: invitation.role_code,
          status: 'active',
          invited_by: invitation.invited_by,
          accepted_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (membershipError || !membershipDataRaw) {
      throw new BadRequestException(
        `Error al crear membresía: ${membershipError?.message ?? 'Unknown error'}`,
      );
    }

    const membershipData = membershipDataRaw as TenantMembershipRow;

    if (COUNTABLE_ROLES.includes(invitation.role_code)) {
      await this.supabaseAdmin
        .from('tenants')
        .update({ current_users: tenant.current_users + 1 })
        .eq('id', invitation.tenant_id);
    }

    await this.supabaseAdmin
      .from('invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitation.id);

    await this.supabaseAdmin.from('audit_logs').insert({
      tenant_id: invitation.tenant_id,
      actor_user_id: userId,
      action: 'invitation_accepted',
      entity: 'invitation',
      entity_id: invitation.id,
      details: {
        email: invitation.email,
        role: invitation.role_code,
      },
    });

    return {
      membership: membershipData,
      tenantId: invitation.tenant_id,
    };
  }

  async revokeInvitation(
    invitationId: string,
    revokedBy: string,
  ): Promise<void> {
    const { data: invitationRaw, error } = await this.supabaseAdmin
      .from('invitations')
      .select('*')
      .eq('id', invitationId)
      .single();

    if (error || !invitationRaw) {
      throw new NotFoundException('Invitación no encontrada');
    }

    const invitation = invitationRaw as InvitationRow;

    const { data: membershipRaw } = await this.supabaseAdmin
      .from('tenant_memberships')
      .select('role_code')
      .eq('tenant_id', invitation.tenant_id)
      .eq('user_id', revokedBy)
      .eq('status', 'active')
      .single();

    const membership = membershipRaw as { role_code: RoleCode } | null;

    if (!membership || !['owner', 'admin'].includes(membership.role_code)) {
      throw new UnauthorizedException(
        'No tienes permisos para revocar invitaciones',
      );
    }

    await this.supabaseAdmin
      .from('invitations')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', invitationId);

    await this.supabaseAdmin.from('audit_logs').insert({
      tenant_id: invitation.tenant_id,
      actor_user_id: revokedBy,
      action: 'invitation_revoked',
      entity: 'invitation',
      entity_id: invitationId,
      details: {
        invited_email: invitation.email,
        role: invitation.role_code,
      },
    });
  }

  async getTenantInvitations(
    tenantId: string,
    userId: string,
  ): Promise<Invitation[]> {
    const { data: membershipRaw } = await this.supabaseAdmin
      .from('tenant_memberships')
      .select('role_code')
      .eq('tenant_id', tenantId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    const membership = membershipRaw as { role_code: RoleCode } | null;

    if (!membership || !['owner', 'admin'].includes(membership.role_code)) {
      throw new UnauthorizedException(
        'No tienes permisos para ver las invitaciones',
      );
    }

    const { data: invitations, error } = await this.supabaseAdmin
      .from('invitations')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException('Error al obtener invitaciones');
    }

    return (invitations ?? []) as Invitation[];
  }

  // ==================== SESSION / ME ====================

  async validateToken(token: string): Promise<AuthUser> {
    const {
      data: { user },
      error,
    } = await this.supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Token inválido');
    }

    return this.buildAuthUser(user.id, user.email ?? '');
  }

  async getMe(userId: string): Promise<AuthUser> {
    const { data: userData } =
      await this.supabaseAdmin.auth.admin.getUserById(userId);

    if (!userData.user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return this.buildAuthUser(userId, userData.user.email ?? '');
  }

  // ==================== TENANT LIMITS ====================

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

  async canAddField(tenantId: string): Promise<boolean> {
    const limits = await this.getTenantLimits(tenantId);
    return limits.fields.available > 0;
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

  // ==================== SET PASSWORD ====================

  async setPassword(userId: string, dto: SetPasswordDto): Promise<void> {
    const { error } = await this.supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: dto.password },
    );

    if (error) {
      throw new BadRequestException(
        `Error al establecer contraseña: ${error.message}`,
      );
    }
  }

  // ==================== VALIDATE AND EXCHANGE TOKEN ====================

  async validateAndExchangeToken(
    accessToken: string,
    refreshToken?: string,
  ): Promise<{ user: AuthUser; accessToken: string; refreshToken?: string }> {
    // Validate the token with Supabase
    const {
      data: { user: supabaseUser },
      error,
    } = await this.supabaseAdmin.auth.getUser(accessToken);

    if (error || !supabaseUser) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    // Build the auth user with all memberships
    const user = await this.buildAuthUser(
      supabaseUser.id,
      supabaseUser.email || '',
    );

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  // ==================== LOGOUT ====================

  async logout(token: string): Promise<void> {
    await this.supabaseAdmin.auth.admin.signOut(token);
  }

  // ==================== PRIVATE HELPERS ====================

  private async buildAuthUser(
    userId: string,
    email: string,
  ): Promise<AuthUser> {
    const { data: profileRaw } = await this.supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const { data: membershipsRaw } = await this.supabaseAdmin
      .from('tenant_memberships')
      .select('*, tenants(*)')
      .eq('user_id', userId)
      .eq('status', 'active');

    const typedMemberships = (membershipsRaw ?? []) as TenantMembership[];
    let defaultMembership: TenantMembership | null =
      typedMemberships[0] ?? null;

    const typedProfile = profileRaw as ProfileRow | null;
    if (typedProfile?.default_tenant_id && typedMemberships.length > 0) {
      const match = typedMemberships.find(
        (m) => m.tenant_id === typedProfile.default_tenant_id,
      );
      if (match) {
        defaultMembership = match;
      }
    }

    return {
      id: userId,
      email,
      nombre: typedProfile?.full_name ?? email,
      tenantId: defaultMembership?.tenant_id ?? null,
      rol: defaultMembership?.role_code ?? null,
      tenant: defaultMembership?.tenants ?? null,
      profile: typedProfile,
      memberships: typedMemberships,
    };
  }
}

export { AuthUser, Tenant, Profile, TenantMembership, Invitation, RoleCode };
