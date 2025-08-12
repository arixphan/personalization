import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { ProjectStatus, ProjectType } from '../enums/project-type.enum';
import { Transform, Type } from 'class-transformer';

function parseCommaSeparated(
  value: string | string[] | undefined,
): string[] | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) return value.flatMap((v) => v.split(','));
  return value.split(',');
}

export class FindAllByOwnerIdDto extends PaginationDto {
  @IsOptional()
  @Transform(({ value }) => parseCommaSeparated(value))
  @IsEnum(ProjectType, { each: true })
  @Type(() => String)
  type?: string[];

  @IsOptional()
  @Transform(({ value }) => parseCommaSeparated(value))
  @IsEnum(ProjectStatus, { each: true })
  @Type(() => String)
  status?: string[];
}
