import { IsString, IsOptional } from 'class-validator';

export class GetUserTenantsDto {
  @IsString()
  userId: string;
}

export class GetTenantBySlugDto {
  @IsString()
  slug: string;
}

export class CheckSlugDto {
  @IsString()
  slug: string;
}
