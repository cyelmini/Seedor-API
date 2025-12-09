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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
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

@ApiTags('Tenant')
@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  // ==================== PUBLIC ENDPOINTS ====================

  @Get('check-slug')
  @ApiOperation({ summary: 'Verificar disponibilidad de slug' })
  async checkSlugAvailability(@Query('slug') slug: string) {
    const available = await this.tenantService.isSlugAvailable(slug);
    return { available };
  }

  @Get('by-slug/:slug')
  @ApiOperation({ summary: 'Obtener tenant por slug' })
  async getTenantBySlug(@Param('slug') slug: string) {
    const tenant = await this.tenantService.getTenantBySlug(slug);
    return { tenant };
  }

  @Post('create-with-admin')
  @ApiOperation({ summary: 'Crear tenant con administrador' })
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
  @ApiBearerAuth('bearer')
  @Get('user-tenants')
  @ApiOperation({ summary: 'Listar tenants del usuario' })
  async getUserTenants(@Request() req: { user: { id: string } }) {
    const tenants = await this.tenantService.getUserTenants(req.user.id);
    return { tenants };
  }

  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('bearer')
  @Get(':tenantId')
  @ApiOperation({ summary: 'Obtener tenant por ID' })
  async getTenantById(@Param('tenantId') tenantId: string) {
    const tenant = await this.tenantService.getTenantById(tenantId);
    return { tenant };
  }

  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('bearer')
  @Post('create')
  @ApiOperation({ summary: 'Crear nuevo tenant' })
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
  @ApiBearerAuth('bearer')
  @Put(':tenantId')
  @ApiOperation({ summary: 'Actualizar tenant' })
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
  @ApiBearerAuth('bearer')
  @Get(':tenantId/membership')
  @ApiOperation({ summary: 'Obtener membresía del usuario en tenant' })
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
  @ApiBearerAuth('bearer')
  @Get(':tenantId/modules')
  @ApiOperation({ summary: 'Listar módulos del tenant' })
  async getTenantModules(@Param('tenantId') tenantId: string) {
    const modules = await this.tenantService.getTenantModules(tenantId);
    return { modules };
  }

  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('bearer')
  @Post(':tenantId/modules')
  @ApiOperation({ summary: 'Habilitar/deshabilitar módulo' })
  async enableModule(
    @Param('tenantId') tenantId: string,
    @Body() dto: Omit<EnableModuleDto, 'tenantId'>,
    @Request() req: { user: { id: string } },
  ) {
    await this.tenantService.enableModule({ ...dto, tenantId }, req.user.id);
    return { success: true };
  }

  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('bearer')
  @Post(':tenantId/modules/bulk')
  @ApiOperation({ summary: 'Habilitar múltiples módulos' })
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
  @ApiBearerAuth('bearer')
  @Get(':tenantId/limits')
  @ApiOperation({ summary: 'Obtener límites del tenant' })
  async getTenantLimits(@Param('tenantId') tenantId: string) {
    const limits = await this.tenantService.getTenantLimits(tenantId);
    return limits;
  }

  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('bearer')
  @Get(':tenantId/can-add-user')
  @ApiOperation({ summary: 'Verificar si puede agregar usuarios' })
  async canAddUser(@Param('tenantId') tenantId: string) {
    const canAdd = await this.tenantService.canAddUser(tenantId);
    return { canAdd };
  }

  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('bearer')
  @Get(':tenantId/can-add-field')
  @ApiOperation({ summary: 'Verificar si puede agregar campos' })
  async canAddField(@Param('tenantId') tenantId: string) {
    const canAdd = await this.tenantService.canAddField(tenantId);
    return { canAdd };
  }

  // ==================== USER DEFAULT TENANT ====================

  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('bearer')
  @Post('set-default')
  @ApiOperation({ summary: 'Establecer tenant por defecto' })
  async setDefaultTenant(
    @Body() dto: SetDefaultTenantDto,
    @Request() req: { user: { id: string } },
  ) {
    await this.tenantService.setUserDefaultTenant(req.user.id, dto.tenantId);
    return { success: true };
  }

  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('bearer')
  @Post('clear-default')
  @ApiOperation({ summary: 'Limpiar tenant por defecto' })
  async clearDefaultTenant(@Request() req: { user: { id: string } }) {
    await this.tenantService.clearUserDefaultTenant(req.user.id);
    return { success: true };
  }
}
