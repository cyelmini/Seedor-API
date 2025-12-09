import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import {
  CreateTenantDto,
  CreateTenantWithAdminDto,
  UpdateTenantDto,
  SetDefaultTenantDto,
  EnableModuleDto,
  EnableMultipleModulesDto,
  CheckSlugDto,
} from './dto';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  // ==================== PUBLIC ENDPOINTS ====================

  @Get('check-slug')
  async checkSlugAvailability(@Query('slug') slug: string) {
    const available = await this.tenantService.isSlugAvailable(slug);
    return { available };
  }

  @Get('by-slug/:slug')
  async getTenantBySlug(@Param('slug') slug: string) {
    const tenant = await this.tenantService.getTenantBySlug(slug);
    return { tenant };
  }

  @Post('create-with-admin')
  async createTenantWithAdmin(@Body() dto: CreateTenantWithAdminDto) {
    const result = await this.tenantService.createTenantWithAdmin(dto);
    return {
      tenant: result.tenant,
      membership: result.membership,
      userId: result.userId,
    };
  }

  // ==================== AUTHENTICATED ENDPOINTS ====================

  @UseGuards(SupabaseAuthGuard)
  @Get('user-tenants')
  async getUserTenants(@Request() req: { user: { id: string } }) {
    const tenants = await this.tenantService.getUserTenants(req.user.id);
    return { tenants };
  }

  @UseGuards(SupabaseAuthGuard)
  @Get(':tenantId')
  async getTenantById(@Param('tenantId') tenantId: string) {
    const tenant = await this.tenantService.getTenantById(tenantId);
    return { tenant };
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('create')
  async createTenant(
    @Body() dto: CreateTenantDto,
    @Request() req: { user: { id: string } },
  ) {
    const result = await this.tenantService.createTenantForUser(
      dto,
      req.user.id,
    );
    return {
      tenant: result.tenant,
      membership: result.membership,
    };
  }

  @UseGuards(SupabaseAuthGuard)
  @Put(':tenantId')
  async updateTenant(
    @Param('tenantId') tenantId: string,
    @Body() dto: UpdateTenantDto,
    @Request() req: { user: { id: string } },
  ) {
    const tenant = await this.tenantService.updateTenant(
      tenantId,
      dto,
      req.user.id,
    );
    return { tenant };
  }

  @UseGuards(SupabaseAuthGuard)
  @Get(':tenantId/membership')
  async getUserMembership(
    @Param('tenantId') tenantId: string,
    @Request() req: { user: { id: string } },
  ) {
    const membership = await this.tenantService.getUserMembership(
      req.user.id,
      tenantId,
    );
    return { membership };
  }

  // ==================== MODULES ====================

  @UseGuards(SupabaseAuthGuard)
  @Get(':tenantId/modules')
  async getTenantModules(@Param('tenantId') tenantId: string) {
    const modules = await this.tenantService.getTenantModules(tenantId);
    return { modules };
  }

  @UseGuards(SupabaseAuthGuard)
  @Post(':tenantId/modules')
  async enableModule(
    @Param('tenantId') tenantId: string,
    @Body() dto: Omit<EnableModuleDto, 'tenantId'>,
    @Request() req: { user: { id: string } },
  ) {
    await this.tenantService.enableModule({ ...dto, tenantId }, req.user.id);
    return { success: true };
  }

  @UseGuards(SupabaseAuthGuard)
  @Post(':tenantId/modules/bulk')
  async enableMultipleModules(
    @Param('tenantId') tenantId: string,
    @Body() dto: Omit<EnableMultipleModulesDto, 'tenantId'>,
    @Request() req: { user: { id: string } },
  ) {
    await this.tenantService.enableMultipleModules(
      { ...dto, tenantId },
      req.user.id,
    );
    return { success: true };
  }

  // ==================== LIMITS ====================

  @UseGuards(SupabaseAuthGuard)
  @Get(':tenantId/limits')
  async getTenantLimits(@Param('tenantId') tenantId: string) {
    const limits = await this.tenantService.getTenantLimits(tenantId);
    return limits;
  }

  @UseGuards(SupabaseAuthGuard)
  @Get(':tenantId/can-add-user')
  async canAddUser(@Param('tenantId') tenantId: string) {
    const canAdd = await this.tenantService.canAddUser(tenantId);
    return { canAdd };
  }

  @UseGuards(SupabaseAuthGuard)
  @Get(':tenantId/can-add-field')
  async canAddField(@Param('tenantId') tenantId: string) {
    const canAdd = await this.tenantService.canAddField(tenantId);
    return { canAdd };
  }

  // ==================== USER DEFAULT TENANT ====================

  @UseGuards(SupabaseAuthGuard)
  @Post('set-default')
  async setDefaultTenant(
    @Body() dto: SetDefaultTenantDto,
    @Request() req: { user: { id: string } },
  ) {
    await this.tenantService.setUserDefaultTenant(req.user.id, dto.tenantId);
    return { success: true };
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('clear-default')
  async clearDefaultTenant(@Request() req: { user: { id: string } }) {
    await this.tenantService.clearUserDefaultTenant(req.user.id);
    return { success: true };
  }
}
