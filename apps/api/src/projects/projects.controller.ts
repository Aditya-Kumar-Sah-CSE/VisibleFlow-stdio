import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { SavePageDto } from './dto/save-page.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'List user projects with optional filtering' })
  async findAll(
    @CurrentUser() user: any,
    @Query('type') type?: string,
    @Query('folderId') folderId?: string,
    @Query('isStarred') isStarred?: string,
    @Query('search') search?: string,
  ) {
    return this.projectsService.findAll(user.id, {
      type,
      folderId,
      isStarred: isStarred !== undefined ? isStarred === 'true' : undefined,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full project by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.projectsService.findOne(id, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  async create(@CurrentUser() user: any, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(user.id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update project metadata and pages' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, user.id, dto);
  }

  @Post(':id/pages')
  @ApiOperation({ summary: 'Save/Autosave a specific page (debounced)' })
  async savePage(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: SavePageDto,
  ) {
    return this.projectsService.savePage(id, user.id, dto);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate an existing project' })
  async duplicate(@Param('id') id: string, @CurrentUser() user: any) {
    return this.projectsService.duplicate(id, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.projectsService.delete(id, user.id);
  }
}
