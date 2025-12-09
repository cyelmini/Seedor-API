import { IsString, IsOptional, IsNumber, IsUUID, Min } from 'class-validator';

export class CreateItemDto {
  @IsString()
  name: string;

  @IsUUID()
  categoryId: string;

  @IsUUID()
  locationId: string;

  @IsString()
  unit: string;

  @IsNumber()
  @Min(0)
  minStock: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  currentStock?: number;
}

export class UpdateItemDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  locationId?: string;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minStock?: number;
}
