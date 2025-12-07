import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email es requerido' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Código es requerido' })
  @Length(6, 6, { message: 'El código debe tener 6 caracteres' })
  code: string;
}
