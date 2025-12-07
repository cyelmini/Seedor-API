import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsIn,
} from 'class-validator';

export class RegisterTenantDto {
  @IsString()
  @IsNotEmpty({ message: 'Nombre de empresa es requerido' })
  @MaxLength(255)
  tenantName: string;

  @IsString()
  @IsNotEmpty({ message: 'Slug es requerido' })
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug solo puede contener letras minúsculas, números y guiones',
  })
  slug: string;

  @IsString()
  @IsIn(['basico', 'profesional'], { message: 'Plan inválido' })
  plan: string;

  @IsString()
  @IsNotEmpty({ message: 'Nombre de contacto es requerido' })
  @MaxLength(255)
  contactName: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email es requerido' })
  contactEmail: string;

  @IsString()
  @IsNotEmpty({ message: 'Contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(128)
  ownerPassword: string;

  @IsOptional()
  @IsString()
  ownerPhone?: string;
}
