import { IsString, IsIn, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsIn(['ingreso', 'egreso'])
  kind: 'ingreso' | 'egreso';
}

export class UpdateCategoryDto {
  @IsString()
  @MinLength(1)
  name: string;
}
