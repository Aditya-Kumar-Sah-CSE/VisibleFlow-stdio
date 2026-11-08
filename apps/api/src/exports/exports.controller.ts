import { Controller, Post, Get, Body, Param, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ExportsService, CreateExportDto } from './exports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Exports')
@Controller('exports')
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate export job for a project (PDF/PPTX/SVG/PNG/DOCX)' })
  async createExport(@CurrentUser() user: any, @Body() dto: CreateExportDto) {
    return this.exportsService.createExportJob(user.id, dto);
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Poll status of an export job' })
  async getStatus(@Param('id') id: string) {
    return this.exportsService.getJobStatus(id);
  }

  @Get(':projectId/download')
  @ApiOperation({ summary: 'Download exported file' })
  async download(
    @Param('projectId') projectId: string,
    @Query('format') format: string,
    @Res() res: Response,
  ) {
    if (format === 'pptx') {
      const buffer = await this.exportsService.generatePptxBuffer(projectId);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
      res.setHeader('Content-Disposition', `attachment; filename="presentation-${projectId}.pptx"`);
      return res.send(buffer);
    }

    res.status(400).json({ message: `Direct server download for format ${format} not supported directly via GET` });
  }
}
