import { IsString, IsNotEmpty } from 'class-validator';

export class ValidateTokenDto {
  @IsString()
  @IsNotEmpty({ message: 'El token es requerido' })
  accessToken: string;

  @IsString()
  refreshToken?: string;
}
