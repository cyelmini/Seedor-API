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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ==================== PUBLIC ENDPOINTS ====================

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() dto: SendOtpDto) {
    await this.authService.sendOwnerVerificationCode(dto);
    return { message: 'Código enviado al email' };
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const result = await this.authService.verifyOwnerCode(dto);
    return {
      accessToken: result.session.access_token,
      userId: result.userId,
    };
  }

  @Post('register-tenant')
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
  async getInvitation(@Param('token') token: string) {
    const invitation = await this.authService.getInvitationByToken(token);
    return { invitation };
  }

  @Post('validate-token')
  @HttpCode(HttpStatus.OK)
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
  getMe(@CurrentUser() user: AuthUser) {
    return { user };
  }

  @Post('logout')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Token() token: string) {
    await this.authService.logout(token);
    return { message: 'Sesión cerrada' };
  }

  @Post('set-password')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  async setPassword(
    @Body() dto: SetPasswordDto,
    @CurrentUser('id') userId: string,
  ) {
    await this.authService.setPassword(userId, dto);
    return { message: 'Contraseña establecida correctamente' };
  }

  @Post('invite')
  @UseGuards(SupabaseAuthGuard)
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
  @HttpCode(HttpStatus.OK)
  async revokeInvitation(
    @Param('id') invitationId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.authService.revokeInvitation(invitationId, userId);
    return { message: 'Invitación revocada' };
  }

  @Get('tenant/:tenantId/invitations')
  @UseGuards(SupabaseAuthGuard)
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

  // Public endpoint - returns non-sensitive plan information
  // Needed during invitation flow before user has auth token
  @Get('tenant/:tenantId/limits')
  async getTenantLimits(@Param('tenantId') tenantId: string) {
    const limits = await this.authService.getTenantLimits(tenantId);
    return { limits };
  }
}
