import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class SavePageDto {
  @IsString()
  @IsNotEmpty()
  pageId!: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  width?: number;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsOptional()
  background?: any;

  @IsOptional()
  elements?: any[];

  @IsOptional()
  nodes?: any[];

  @IsOptional()
  edges?: any[];

  @IsOptional()
  documentContent?: any;

  @IsOptional()
  chartConfig?: any;

  @IsOptional()
  slideSettings?: any;
}
