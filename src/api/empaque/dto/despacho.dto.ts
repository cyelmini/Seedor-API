import {
  IsString,
  IsOptional,
  IsInt,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateDespachoDto {
  @IsDateString()
  fecha: string;

  @IsString()
  @IsOptional()
  numRemito?: string;

  @IsString()
  @IsOptional()
  cliente?: string;

  @IsString()
  @IsOptional()
  DTV?: string;

  @IsString()
  @IsOptional()
  codigoCierre?: string;

  @IsString()
  @IsOptional()
  termografo?: string;

  @IsString()
  @IsOptional()
  DTC?: string;

  @IsString()
  @IsOptional()
  destino?: string;

  @IsString()
  @IsOptional()
  transporte?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  totalPallets?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  totalCajas?: number;

  @IsString()
  @IsOptional()
  cuit?: string;

  @IsString()
  @IsOptional()
  chasis?: string;

  @IsString()
  @IsOptional()
  acoplado?: string;

  @IsString()
  @IsOptional()
  chofer?: string;

  @IsString()
  @IsOptional()
  dni?: string;

  @IsString()
  @IsOptional()
  celular?: string;

  @IsString()
  @IsOptional()
  operario?: string;
}

export class UpdateDespachoDto {
  @IsDateString()
  @IsOptional()
  fecha?: string;

  @IsString()
  @IsOptional()
  numRemito?: string;

  @IsString()
  @IsOptional()
  cliente?: string;

  @IsString()
  @IsOptional()
  DTV?: string;

  @IsString()
  @IsOptional()
  codigoCierre?: string;

  @IsString()
  @IsOptional()
  termografo?: string;

  @IsString()
  @IsOptional()
  DTC?: string;

  @IsString()
  @IsOptional()
  destino?: string;

  @IsString()
  @IsOptional()
  transporte?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  totalPallets?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  totalCajas?: number;

  @IsString()
  @IsOptional()
  cuit?: string;

  @IsString()
  @IsOptional()
  chasis?: string;

  @IsString()
  @IsOptional()
  acoplado?: string;

  @IsString()
  @IsOptional()
  chofer?: string;

  @IsString()
  @IsOptional()
  dni?: string;

  @IsString()
  @IsOptional()
  celular?: string;

  @IsString()
  @IsOptional()
  operario?: string;
}
