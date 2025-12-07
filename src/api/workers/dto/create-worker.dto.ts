import {
  IsString,
  IsEmail,
  IsOptional,
  IsIn,
  MinLength,
  IsUUID,
} from 'class-validator';

export class CreateWorkerDto {
  @IsString()
  @MinLength(2)
  fullName: string;

  @IsString()
  @MinLength(1)
  documentId: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsIn(['admin', 'campo', 'empaque', 'finanzas'])
  areaModule: string;

  @IsUUID()
  @IsOptional()
  membershipId?: string;
}
