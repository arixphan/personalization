import { EnglishRecordType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class GenerateAiContentDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsEnum(EnglishRecordType)
  type: EnglishRecordType;
}
