import { IsString, IsEmail, IsOptional, MinLength, IsIn } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(2)
  slug: string;

  @IsString()
  @IsIn(['basico', 'profesional', 'enterprise'])
  plan: string;

  @IsString()
  @MinLength(2)
  contactName: string;

  @IsEmail()
  contactEmail: string;

  @IsString()
  @IsOptional()
  primaryCrop?: string;
}

export class CreateTenantForExistingUserDto extends CreateTenantDto {
  // userId comes from the authenticated user
}

export class CreateTenantWithAdminDto extends CreateTenantDto {
  @IsEmail()
  adminEmail: string;

  @IsString()
  @MinLength(6)
  adminPassword: string;

  @IsString()
  adminFullName: string;

  @IsString()
  @IsOptional()
  adminPhone?: string;
}
