import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  IsDateString,
  IsIn,
  Min,
} from 'class-validator';

export class CreatePalletDto {
  @IsInt()
  @IsOptional()
  @Min(1)
  semana?: number;

  @IsDateString()
  @IsOptional()
  fecha?: string;

  @IsString()
  @IsOptional()
  numPallet?: string;

  @IsString()
  @IsOptional()
  producto?: string;

  @IsString()
  @IsOptional()
  productor?: string;

  @IsString()
  @IsOptional()
  categoria?: string;

  @IsString()
  @IsOptional()
  codEnvase?: string;

  @IsString()
  @IsOptional()
  destino?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  kilos?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  cantCajas?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  peso?: number;

  @IsString()
  @IsIn(['armado', 'en_camara', 'listo_despacho', 'despachado'])
  @IsOptional()
  estado?: string;

  @IsString()
  @IsOptional()
  ubicacion?: string;

  @IsNumber()
  @IsOptional()
  temperatura?: number;

  @IsDateString()
  @IsOptional()
  vencimiento?: string;

  @IsString()
  @IsOptional()
  loteOrigen?: string;
}

export class UpdatePalletDto {
  @IsInt()
  @IsOptional()
  @Min(1)
  semana?: number;

  @IsDateString()
  @IsOptional()
  fecha?: string;

  @IsString()
  @IsOptional()
  numPallet?: string;

  @IsString()
  @IsOptional()
  producto?: string;

  @IsString()
  @IsOptional()
  productor?: string;

  @IsString()
  @IsOptional()
  categoria?: string;

  @IsString()
  @IsOptional()
  codEnvase?: string;

  @IsString()
  @IsOptional()
  destino?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  kilos?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  cantCajas?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  peso?: number;

  @IsString()
  @IsIn(['armado', 'en_camara', 'listo_despacho', 'despachado'])
  @IsOptional()
  estado?: string;

  @IsString()
  @IsOptional()
  ubicacion?: string;

  @IsNumber()
  @IsOptional()
  temperatura?: number;

  @IsDateString()
  @IsOptional()
  vencimiento?: string;

  @IsString()
  @IsOptional()
  loteOrigen?: string;
}
