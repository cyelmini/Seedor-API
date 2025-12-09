import { IsString, MinLength, MaxLength } from 'class-validator';

export class SetPasswordDto {
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(128, {
    message: 'La contraseña no puede tener más de 128 caracteres',
  })
  password: string;
}
