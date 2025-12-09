import {
  IsString,
  IsNumber,
  IsOptional,
  IsIn,
  IsDateString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateMovementDto {
  @IsDateString()
  date: string;

  @IsIn(['ingreso', 'egreso'])
  kind: 'ingreso' | 'egreso';

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  categoryName?: string;

  @IsString()
  @IsOptional()
  receipt?: string;

  @IsUUID()
  @IsOptional()
  createdBy?: string;
}

export class UpdateMovementDto {
  @IsDateString()
  @IsOptional()
  date?: string;

  @IsIn(['ingreso', 'egreso'])
  @IsOptional()
  kind?: 'ingreso' | 'egreso';

  @IsNumber()
  @Min(0.01)
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  receipt?: string;
}
