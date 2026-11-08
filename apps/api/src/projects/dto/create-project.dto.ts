import { IsNotEmpty, IsString, IsIn, IsOptional } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title!: string;

  @IsString()
  @IsIn(['document', 'slide', 'flowchart', 'diagram', 'chart', 'pdf'])
  type!: 'document' | 'slide' | 'flowchart' | 'diagram' | 'chart' | 'pdf';

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  folderId?: string;

  @IsOptional()
  initialData?: any;
}
