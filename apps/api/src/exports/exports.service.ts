import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import pptxgen from 'pptxgenjs';

export interface CreateExportDto {
  projectId: string;
  format: 'pdf' | 'pptx' | 'docx' | 'png' | 'svg' | 'json';
  options?: {
    transparent?: boolean;
    scale?: number;
    slideIndices?: number[];
  };
}

@Injectable()
export class ExportsService {
  constructor(private readonly prisma: PrismaService) {}

  async createExportJob(userId: string, dto: CreateExportDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
      include: { pages: { orderBy: { order: 'asc' } } },
    });

    if (!project) throw new NotFoundException('Project not found');

    const job = await this.prisma.exportJob.create({
      data: {
        projectId: dto.projectId,
        userId,
        format: dto.format,
        status: 'completed',
        progress: 100,
        downloadUrl: `/api/exports/${dto.projectId}/download?format=${dto.format}`,
      },
    });

    return job;
  }

  async getJobStatus(jobId: string) {
    const job = await this.prisma.exportJob.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Export job not found');
    return job;
  }

  async generatePptxBuffer(projectId: string): Promise<Buffer> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { pages: { orderBy: { order: 'asc' } } },
    });

    if (!project) throw new NotFoundException('Project not found');

    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_16x9';
    pptx.title = project.title;

    for (const page of project.pages) {
      const slide = pptx.addSlide();
      const elements = page.elementsJson ? JSON.parse(page.elementsJson) : [];

      for (const el of elements) {
        // Convert pixel coordinates (e.g. 1280x720) to inches (10x5.625)
        const xInches = (el.x / (page.width || 1280)) * 10;
        const yInches = (el.y / (page.height || 720)) * 5.625;
        const wInches = (el.width / (page.width || 1280)) * 10;
        const hInches = (el.height / (page.height || 720)) * 5.625;

        if (el.type === 'text') {
          slide.addText(el.text || '', {
            x: xInches,
            y: yInches,
            w: Math.max(wInches, 1),
            h: Math.max(hInches, 0.4),
            fontSize: el.style?.fontSize ? Math.round(el.style.fontSize * 0.75) : 16,
            color: (el.style?.color || '#000000').replace('#', ''),
            bold: el.style?.fontWeight === 'bold' || el.style?.fontWeight === '700',
            align: el.style?.textAlign || 'left',
          });
        } else if (el.type === 'shape') {
          slide.addShape(pptx.ShapeType.rect, {
            x: xInches,
            y: yInches,
            w: wInches,
            h: hInches,
            fill: { color: (el.style?.fill || '#3b82f6').replace('#', '') },
            line: {
              color: (el.style?.stroke || '#1d4ed8').replace('#', ''),
              width: el.style?.strokeWidth || 1,
            },
          });
          if (el.text) {
            slide.addText(el.text, {
              x: xInches,
              y: yInches,
              w: wInches,
              h: hInches,
              fontSize: el.style?.fontSize ? Math.round(el.style.fontSize * 0.75) : 14,
              color: (el.style?.color || '#ffffff').replace('#', ''),
              align: 'center',
            });
          }
        }
      }
    }

    const arrayBuffer = (await pptx.write({ outputType: 'nodebuffer' })) as Buffer;
    return arrayBuffer;
  }
}

