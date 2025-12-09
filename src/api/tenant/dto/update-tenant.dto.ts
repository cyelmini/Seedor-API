import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  IsIn,
  IsNumber,
  Min,
} from 'class-validator';

export class UpdateTenantDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @IsString()
  @IsIn(['basico', 'profesional', 'enterprise'])
  @IsOptional()
  plan?: string;

  @IsString()
  @MinLength(2)
  @IsOptional()
  contactName?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxUsers?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxFields?: number;
}

export class SetDefaultTenantDto {
  @IsString()
  tenantId: string;
}
