import {
  IsString,
  IsOptional,
  IsNumber,
  MinLength,
  Min,
} from 'class-validator';

export class CreateFarmDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  areaHa?: number;

  @IsString()
  @IsOptional()
  defaultCrop?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateFarmDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  areaHa?: number;

  @IsString()
  @IsOptional()
  defaultCrop?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
