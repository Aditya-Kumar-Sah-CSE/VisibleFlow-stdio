import { IsOptional, IsString, IsBoolean, IsArray } from 'class-validator';

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isStarred?: boolean;

  @IsString()
  @IsOptional()
  folderId?: string | null;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsOptional()
  settings?: any;

  @IsArray()
  @IsOptional()
  pages?: any[];
}

