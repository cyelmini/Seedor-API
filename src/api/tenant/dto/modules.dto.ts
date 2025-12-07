import { IsString, IsBoolean, IsArray, IsOptional, IsIn } from 'class-validator';

export const VALID_MODULES = [
  'dashboard',
  'campo',
  'empaque',
  'finanzas',
  'inventario',
  'usuarios',
  'trabajadores',
  'ajustes',
] as const;

export type ModuleCode = (typeof VALID_MODULES)[number];

export class EnableModuleDto {
  @IsString()
  tenantId: string;

  @IsString()
  @IsIn(VALID_MODULES)
  moduleCode: ModuleCode;

  @IsBoolean()
  enabled: boolean;
}

export class EnableMultipleModulesDto {
  @IsString()
  tenantId: string;

  @IsArray()
  @IsString({ each: true })
  moduleCodes: ModuleCode[];
}
