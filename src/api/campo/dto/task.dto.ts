import {
  IsString,
  IsOptional,
  IsUUID,
  IsIn,
  MinLength,
  IsDateString,
} from 'class-validator';

export class CreateTaskDto {
  @IsUUID()
  @IsOptional()
  farmId?: string;

  @IsUUID()
  lotId: string;

  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsIn(['riego', 'fertilizacion', 'poda', 'control_plagas', 'cosecha', 'otro'])
  @IsOptional()
  typeCode?: string;

  @IsString()
  @IsIn(['pendiente', 'en_curso', 'completada'])
  statusCode: string;

  @IsDateString()
  @IsOptional()
  scheduledDate?: string;

  @IsUUID()
  @IsOptional()
  responsibleMembershipId?: string;

  @IsUUID()
  @IsOptional()
  workerId?: string;
}

export class UpdateTaskDto {
  @IsUUID()
  @IsOptional()
  farmId?: string;

  @IsUUID()
  @IsOptional()
  lotId?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsIn(['riego', 'fertilizacion', 'poda', 'control_plagas', 'cosecha', 'otro'])
  @IsOptional()
  typeCode?: string;

  @IsString()
  @IsIn(['pendiente', 'en_curso', 'completada'])
  @IsOptional()
  statusCode?: string;

  @IsDateString()
  @IsOptional()
  scheduledDate?: string;

  @IsUUID()
  @IsOptional()
  responsibleMembershipId?: string;

  @IsUUID()
  @IsOptional()
  workerId?: string;
}
