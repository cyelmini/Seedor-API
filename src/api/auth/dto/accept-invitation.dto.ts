import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

export class AcceptInvitationDto {
  @IsString()
  @IsNotEmpty({ message: 'Token es requerido' })
  token: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(128)
  password?: string;
}
