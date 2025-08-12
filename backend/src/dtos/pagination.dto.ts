import { IsOptional, IsPositive, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @Transform(({ value }) => (value as string)?.toLowerCase())
  sortBy?: string;

  @IsOptional()
  @Transform(({ value }) => (value as string)?.toLowerCase())
  sortOrder?: 'asc' | 'desc' = 'asc';

  @IsOptional()
  search?: string;
}
