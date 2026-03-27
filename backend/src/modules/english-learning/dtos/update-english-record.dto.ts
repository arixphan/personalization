import { PartialType } from '@nestjs/swagger';
import { CreateEnglishRecordDto } from './create-english-record.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateEnglishRecordDto extends PartialType(CreateEnglishRecordDto) {
  @IsOptional()
  @IsNumber()
  masteryLevel?: number;
}
