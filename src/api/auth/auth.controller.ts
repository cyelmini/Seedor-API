import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthUser } from './types/database.types';
import {
  LoginDto,
  RegisterTenantDto,
  InviteUserDto,
  AcceptInvitationDto,
  SendOtpDto,
  VerifyOtpDto,
  SetPasswordDto,
  ValidateTokenDto,
} from './dto';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import { CurrentUser, Token } from '../../common/decorators';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ==================== PUBLIC ENDPOINTS ====================

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión con email y contraseña' })
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar código OTP al email' })
  async sendOtp(@Body() dto: SendOtpDto) {
    await this.authService.sendOwnerVerificationCode(dto);
    return { message: 'Código enviado al email' };
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar código OTP' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const result = await this.authService.verifyOwnerCode(dto);
    return {
      accessToken: result.session.access_token,
      userId: result.userId,
    };
  }

  @Post('register-tenant')
  @ApiOperation({ summary: 'Registrar nuevo tenant con owner' })
  async registerTenant(
    @Body() dto: RegisterTenantDto,
    @Body('userId') userId: string,
  ) {
    const result = await this.authService.createTenantWithOwner(dto, userId);
    return {
      tenant: result.tenant,
      membership: result.membership,
    };
  }

  @Get('invitation/:token')
  @ApiOperation({ summary: 'Obtener invitación por token' })
  async getInvitation(@Param('token') token: string) {
    const invitation = await this.authService.getInvitationByToken(token);
    return { invitation };
  }

  @Post('validate-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validar y refrescar token de acceso' })
  async validateToken(@Body() dto: ValidateTokenDto) {
    const result = await this.authService.validateAndExchangeToken(
      dto.accessToken,
      dto.refreshToken,
    );
    return {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  // ==================== PROTECTED ENDPOINTS ====================

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Obtener usuario actual autenticado' })
  getMe(@CurrentUser() user: AuthUser) {
    return { user };
  }

  @Post('logout')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('bearer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión' })
  async logout(@Token() token: string) {
    await this.authService.logout(token);
    return { message: 'Sesión cerrada' };
  }

  @Post('set-password')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('bearer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Establecer contraseña del usuario' })
  async setPassword(
    @Body() dto: SetPasswordDto,
    @CurrentUser('id') userId: string,
  ) {
    await this.authService.setPassword(userId, dto);
    return { message: 'Contraseña establecida correctamente' };
  }

  @Post('invite')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Invitar usuario a un tenant' })
  async inviteUser(
    @Body() dto: InviteUserDto,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.authService.inviteUser(dto, userId);
    return {
      invitation: result.invitation,
      inviteUrl: result.inviteUrl,
      message: 'Invitación enviada por email',
    };
  }

  @Post('accept-invitation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Aceptar invitación a un tenant' })
  async acceptInvitation(@Body() dto: AcceptInvitationDto) {
    const result = await this.authService.acceptInvitationWithToken(dto);
    return {
      membership: result.membership,
      tenantId: result.tenantId,
      message: 'Invitación aceptada',
    };
  }

  @Delete('invitation/:id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('bearer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revocar invitación pendiente' })
  async revokeInvitation(
    @Param('id') invitationId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.authService.revokeInvitation(invitationId, userId);
    return { message: 'Invitación revocada' };
  }

  @Get('tenant/:tenantId/invitations')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Listar invitaciones de un tenant' })
  async getTenantInvitations(
    @Param('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    const invitations = await this.authService.getTenantInvitations(
      tenantId,
      userId,
    );
    return { invitations };
  }

  @Get('tenant/:tenantId/limits')
  @ApiOperation({ summary: 'Obtener límites del plan del tenant' })
  async getTenantLimits(@Param('tenantId') tenantId: string) {
    const limits = await this.authService.getTenantLimits(tenantId);
    return { limits };
  }
}
