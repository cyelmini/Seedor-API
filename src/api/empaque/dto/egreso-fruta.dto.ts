import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateEgresoFrutaDto {
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
  finca?: string;

  @IsString()
  @IsOptional()
  producto?: string;

  @IsString()
  @IsOptional()
  DTV?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  tara?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  pesoNeto?: number;

  @IsString()
  @IsOptional()
  transporte?: string;

  @IsString()
  @IsOptional()
  chasis?: string;

  @IsString()
  @IsOptional()
  acoplado?: string;

  @IsString()
  @IsOptional()
  chofer?: string;
}

export class UpdateEgresoFrutaDto {
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
  finca?: string;

  @IsString()
  @IsOptional()
  producto?: string;

  @IsString()
  @IsOptional()
  DTV?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  tara?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  pesoNeto?: number;

  @IsString()
  @IsOptional()
  transporte?: string;

  @IsString()
  @IsOptional()
  chasis?: string;

  @IsString()
  @IsOptional()
  acoplado?: string;

  @IsString()
  @IsOptional()
  chofer?: string;
}
