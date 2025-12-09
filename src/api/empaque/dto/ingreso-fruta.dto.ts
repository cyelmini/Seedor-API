import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsInt,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateIngresoFrutaDto {
  @IsDateString()
  fecha: string;

  @IsBoolean()
  @IsOptional()
  estadoLiquidacion?: boolean;

  @IsInt()
  @IsOptional()
  @Min(0)
  numTicket?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  numRemito?: number;

  @IsString()
  productor: string;

  @IsString()
  @IsOptional()
  finca?: string;

  @IsString()
  producto: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  lote?: number;

  @IsString()
  @IsOptional()
  contratista?: string;

  @IsString()
  @IsOptional()
  tipoCosecha?: string;

  @IsInt()
  @Min(1)
  cantBin: number;

  @IsString()
  tipoBin: string;

  @IsNumber()
  @Min(0)
  pesoNeto: number;

  @IsString()
  @IsOptional()
  transporte?: string;

  @IsString()
  @IsOptional()
  chofer?: string;

  @IsString()
  @IsOptional()
  chasis?: string;

  @IsString()
  @IsOptional()
  acoplado?: string;

  @IsString()
  @IsOptional()
  operario?: string;
}

export class UpdateIngresoFrutaDto {
  @IsDateString()
  @IsOptional()
  fecha?: string;

  @IsBoolean()
  @IsOptional()
  estadoLiquidacion?: boolean;

  @IsInt()
  @IsOptional()
  @Min(0)
  numTicket?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  numRemito?: number;

  @IsString()
  @IsOptional()
  productor?: string;

  @IsString()
  @IsOptional()
  finca?: string;

  @IsString()
  @IsOptional()
  producto?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  lote?: number;

  @IsString()
  @IsOptional()
  contratista?: string;

  @IsString()
  @IsOptional()
  tipoCosecha?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  cantBin?: number;

  @IsString()
  @IsOptional()
  tipoBin?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  pesoNeto?: number;

  @IsString()
  @IsOptional()
  transporte?: string;

  @IsString()
  @IsOptional()
  chofer?: string;

  @IsString()
  @IsOptional()
  chasis?: string;

  @IsString()
  @IsOptional()
  acoplado?: string;

  @IsString()
  @IsOptional()
  operario?: string;
}
