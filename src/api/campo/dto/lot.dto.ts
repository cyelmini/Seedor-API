import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsIn,
  MinLength,
  Min,
  IsDateString,
} from 'class-validator';

export class CreateLotDto {
  @IsUUID()
  farmId: string;

  @IsString()
  @MinLength(1)
  code: string;

  @IsString()
  @MinLength(1)
  crop: string;

  @IsString()
  @IsOptional()
  variety?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  areaHa?: number;

  @IsDateString()
  @IsOptional()
  plantDate?: string;

  @IsString()
  @IsIn(['activo', 'inactivo', 'preparacion'])
  status: string;
}

export class UpdateLotDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  code?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  crop?: string;

  @IsString()
  @IsOptional()
  variety?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  areaHa?: number;

  @IsDateString()
  @IsOptional()
  plantDate?: string;

  @IsString()
  @IsIn(['activo', 'inactivo', 'preparacion'])
  @IsOptional()
  status?: string;
}
