import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendOtpDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email es requerido' })
  email: string;
}
