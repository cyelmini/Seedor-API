import { IsEmail, IsNotEmpty, IsString, IsUUID, IsIn } from 'class-validator';

export class InviteUserDto {
  @IsUUID('4', { message: 'Tenant ID inválido' })
  @IsNotEmpty({ message: 'Tenant ID es requerido' })
  tenantId: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email es requerido' })
  email: string;

  @IsString()
  @IsIn(['admin', 'campo', 'empaque', 'finanzas'], {
    message: 'Rol inválido. Debe ser: admin, campo, empaque o finanzas',
  })
  roleCode: string;
}
