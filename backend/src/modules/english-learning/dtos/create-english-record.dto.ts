import { IsEnum, IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';
import { EnglishRecordType } from '@prisma/client';

export class CreateEnglishRecordDto {
  @IsEnum(EnglishRecordType)
  type: EnglishRecordType;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  definition?: string;

  @IsOptional()
  @IsString()
  translation?: string;

  @IsOptional()
  @IsString()
  example?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
