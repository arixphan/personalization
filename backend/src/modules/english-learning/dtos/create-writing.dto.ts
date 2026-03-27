import { IsString, IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateWritingDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(10000)
  content: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;
}
