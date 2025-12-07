import {
  IsString,
  IsOptional,
  IsIn,
  IsUUID,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAttendanceDto {
  @IsUUID()
  workerId: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsIn(['PRE', 'AUS', 'TAR', 'LIC', 'VAC'])
  status: string;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class UpdateAttendanceDto {
  @IsString()
  @IsIn(['PRE', 'AUS', 'TAR', 'LIC', 'VAC'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class BulkCreateAttendanceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAttendanceDto)
  attendances: CreateAttendanceDto[];
}

export class GetAttendanceQueryDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsDateString()
  @IsOptional()
  date?: string;
}
