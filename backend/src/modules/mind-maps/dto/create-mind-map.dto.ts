import { IsString, IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMindMapNodeDto {
  @IsString()
  id: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsOptional()
  data: any;

  @IsNumber()
  positionX: number;

  @IsNumber()
  positionY: number;

  @IsOptional()
  style?: any;
}

export class CreateMindMapEdgeDto {
  @IsString()
  id: string;

  @IsString()
  source: string;

  @IsString()
  target: string;

  @IsString()
  @IsOptional()
  sourceHandle?: string;

  @IsString()
  @IsOptional()
  targetHandle?: string;

  @IsString()
  @IsOptional()
  label?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsOptional()
  animated?: boolean;

  @IsOptional()
  style?: any;
}

export class CreateMindMapDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMindMapNodeDto)
  @IsOptional()
  nodes?: CreateMindMapNodeDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMindMapEdgeDto)
  @IsOptional()
  edges?: CreateMindMapEdgeDto[];
}
