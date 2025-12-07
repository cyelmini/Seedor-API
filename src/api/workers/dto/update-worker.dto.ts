import {
  IsString,
  IsEmail,
  IsOptional,
  IsIn,
  MinLength,
  IsUUID,
} from 'class-validator';

export class UpdateWorkerDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  fullName?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  documentId?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsIn(['admin', 'campo', 'empaque', 'finanzas'])
  @IsOptional()
  areaModule?: string;

  @IsUUID()
  @IsOptional()
  membershipId?: string;

  @IsString()
  @IsIn(['active', 'inactive'])
  @IsOptional()
  status?: string;
}
