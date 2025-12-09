import {
  IsInt,
  IsNumber,
  IsDateString,
  Min,
  IsOptional,
} from 'class-validator';

export class CreatePreprocesoDto {
  @IsInt()
  @Min(1)
  semana: number;

  @IsDateString()
  fecha: string;

  @IsNumber()
  @Min(0)
  duracion: number;

  @IsInt()
  @Min(0)
  binVolcados: number;

  @IsNumber()
  @Min(0)
  ritmoMaquina: number;

  @IsNumber()
  @Min(0)
  duracionProceso: number;

  @IsInt()
  @Min(0)
  binPleno: number;

  @IsInt()
  @Min(0)
  binIntermedioI: number;

  @IsInt()
  @Min(0)
  binIntermedioII: number;

  @IsInt()
  @Min(0)
  binIncipiente: number;

  @IsInt()
  @Min(0)
  cantPersonal: number;
}

export class UpdatePreprocesoDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  semana?: number;

  @IsDateString()
  @IsOptional()
  fecha?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  duracion?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  binVolcados?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  ritmoMaquina?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  duracionProceso?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  binPleno?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  binIntermedioI?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  binIntermedioII?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  binIncipiente?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  cantPersonal?: number;
}
