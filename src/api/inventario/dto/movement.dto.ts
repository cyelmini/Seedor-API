import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsIn,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateMovementDto {
  @IsUUID()
  itemId: string;

  @IsDateString()
  date: string;

  @IsIn(['IN', 'OUT'])
  type: 'IN' | 'OUT';

  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  unitCost?: number;

  @IsString()
  reason: string;

  @IsString()
  @IsOptional()
  refModule?: string;

  @IsString()
  @IsOptional()
  refId?: string;

  @IsString()
  @IsOptional()
  createdBy?: string;
}
