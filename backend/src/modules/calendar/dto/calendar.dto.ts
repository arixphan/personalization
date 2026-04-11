import { IsEnum, IsInt, IsISO8601, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { RecurrenceType } from '@prisma/client';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsISO8601()
  @IsNotEmpty()
  start: string;

  @IsISO8601()
  @IsNotEmpty()
  end: string;

  @IsString()
  @IsOptional()
  color?: string;
}

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsISO8601()
  @IsNotEmpty()
  startTime: string;

  @IsInt()
  @Min(1)
  duration: number; // in minutes

  @IsEnum(RecurrenceType)
  @IsOptional()
  recurrence?: RecurrenceType;

  @IsISO8601()
  @IsOptional()
  recurrenceEnd?: string;

  @IsString()
  @IsOptional()
  color?: string;
}

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsISO8601()
  @IsOptional()
  start?: string;

  @IsISO8601()
  @IsOptional()
  end?: string;

  @IsString()
  @IsOptional()
  color?: string;
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsISO8601()
  @IsOptional()
  startTime?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  duration?: number;

  @IsEnum(RecurrenceType)
  @IsOptional()
  recurrence?: RecurrenceType;

  @IsISO8601()
  @IsOptional()
  recurrenceEnd?: string;

  @IsString()
  @IsOptional()
  color?: string;
}

export class CompleteTaskDto {
  @IsISO8601()
  @IsNotEmpty()
  completedAt: string;
}
