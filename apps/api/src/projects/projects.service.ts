import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { SavePageDto } from './dto/save-page.dto';
import { createDefaultProject } from '../common/defaults';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, filter?: { type?: string; folderId?: string; isStarred?: boolean; search?: string }) {
    const where: any = { userId };

    if (filter?.type && filter.type !== 'all') {
      where.type = filter.type;
    }

    if (filter?.folderId) {
      where.folderId = filter.folderId;
    }

    if (filter?.isStarred !== undefined) {
      where.isStarred = filter.isStarred;
    }

    if (filter?.search) {
      where.title = { contains: filter.search };
    }

    const projects = await this.prisma.project.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        pages: {
          select: { id: true, name: true, order: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    return projects.map(p => ({
      ...p,
      settings: p.settingsJson ? JSON.parse(p.settingsJson) : null,
      pageCount: p.pages.length,
    }));
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        pages: {
          orderBy: { order: 'asc' },
        },
        assets: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('Access denied to this project');
    }

    return {
      id: project.id,
      version: project.version,
      type: project.type,
      title: project.title,
      description: project.description,
      folderId: project.folderId,
      thumbnailUrl: project.thumbnailUrl,
      isStarred: project.isStarred,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      settings: project.settingsJson ? JSON.parse(project.settingsJson) : {},
      pages: project.pages.map(page => ({
        id: page.id,
        order: page.order,
        name: page.name,
        width: page.width,
        height: page.height,
        unit: page.unit,
        background: page.backgroundJson ? JSON.parse(page.backgroundJson) : { type: 'solid', color: '#ffffff' },
        elements: page.elementsJson ? JSON.parse(page.elementsJson) : [],
        nodes: page.nodesJson ? JSON.parse(page.nodesJson) : [],
        edges: page.edgesJson ? JSON.parse(page.edgesJson) : [],
        documentContent: page.documentJson ? JSON.parse(page.documentJson) : undefined,
        chartConfig: page.chartConfigJson ? JSON.parse(page.chartConfigJson) : undefined,
        slideSettings: page.slideJson ? JSON.parse(page.slideJson) : undefined,
      })),
      assets: project.assets,
      tags: [],
    };
  }

  async create(userId: string, dto: CreateProjectDto) {
    const defaultData = dto.initialData || createDefaultProject(dto.type, dto.title);

    const project = await this.prisma.project.create({
      data: {
        userId,
        type: dto.type,
        title: dto.title,
        description: dto.description || '',
        folderId: dto.folderId || null,
        settingsJson: JSON.stringify(defaultData.settings || {}),
        pages: {
          create: (defaultData.pages || []).map((page: any, index: number) => ({
            name: page.name || `Page ${index + 1}`,
            order: page.order ?? index,
            width: page.width || 1200,
            height: page.height || 800,
            unit: page.unit || 'px',
            backgroundJson: JSON.stringify(page.background || { type: 'solid', color: '#ffffff' }),
            elementsJson: JSON.stringify(page.elements || []),
            nodesJson: JSON.stringify(page.nodes || []),
            edgesJson: JSON.stringify(page.edges || []),
            documentContent: page.documentContent ? JSON.stringify(page.documentContent) : null,
            chartConfigJson: page.chartConfig ? JSON.stringify(page.chartConfig) : null,
            slideJson: page.slideSettings ? JSON.stringify(page.slideSettings) : null,
          })),
        },
      },
      include: {
        pages: true,
      },
    });

    return this.findOne(project.id, userId);
  }

  async update(id: string, userId: string, dto: UpdateProjectDto) {
    const existing = await this.prisma.project.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Project not found');
    if (existing.userId !== userId) throw new ForbiddenException('Access denied');

    const updateData: any = {
      version: { increment: 1 },
    };

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.isStarred !== undefined) updateData.isStarred = dto.isStarred;
    if (dto.folderId !== undefined) updateData.folderId = dto.folderId;
    if (dto.thumbnailUrl !== undefined) updateData.thumbnailUrl = dto.thumbnailUrl;
    if (dto.settings !== undefined) updateData.settingsJson = JSON.stringify(dto.settings);

    await this.prisma.project.update({
      where: { id },
      data: updateData,
    });

    if (dto.pages && Array.isArray(dto.pages)) {
      for (const page of dto.pages) {
        if (!page.id) continue;
        await this.prisma.projectPage.upsert({
          where: { id: page.id },
          update: {
            name: page.name,
            order: page.order,
            width: page.width,
            height: page.height,
            backgroundJson: page.background ? JSON.stringify(page.background) : undefined,
            elementsJson: page.elements ? JSON.stringify(page.elements) : undefined,
            nodesJson: page.nodes ? JSON.stringify(page.nodes) : undefined,
            edgesJson: page.edges ? JSON.stringify(page.edges) : undefined,
            documentJson: page.documentContent ? JSON.stringify(page.documentContent) : undefined,
            chartConfigJson: page.chartConfig ? JSON.stringify(page.chartConfig) : undefined,
            slideJson: page.slideSettings ? JSON.stringify(page.slideSettings) : undefined,
          },
          create: {
            id: page.id,
            projectId: id,
            name: page.name || 'Page',
            order: page.order || 0,
            width: page.width || 1200,
            height: page.height || 800,
            backgroundJson: JSON.stringify(page.background || { type: 'solid', color: '#ffffff' }),
            elementsJson: JSON.stringify(page.elements || []),
            nodesJson: JSON.stringify(page.nodes || []),
            edgesJson: JSON.stringify(page.edges || []),
            documentJson: page.documentContent ? JSON.stringify(page.documentContent) : null,
            chartConfigJson: page.chartConfig ? JSON.stringify(page.chartConfig) : null,
            slideJson: page.slideSettings ? JSON.stringify(page.slideSettings) : null,
          },
        });
      }
    }

    return this.findOne(id, userId);
  }

  async savePage(projectId: string, userId: string, dto: SavePageDto) {
    const existing = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!existing) throw new NotFoundException('Project not found');
    if (existing.userId !== userId) throw new ForbiddenException('Access denied');

    const updatedPage = await this.prisma.projectPage.upsert({
      where: { id: dto.pageId },
      update: {
        name: dto.name,
        order: dto.order,
        width: dto.width,
        height: dto.height,
        backgroundJson: dto.background ? JSON.stringify(dto.background) : undefined,
        elementsJson: dto.elements ? JSON.stringify(dto.elements) : undefined,
        nodesJson: dto.nodes ? JSON.stringify(dto.nodes) : undefined,
        edgesJson: dto.edges ? JSON.stringify(dto.edges) : undefined,
        documentJson: dto.documentContent ? JSON.stringify(dto.documentContent) : undefined,
        chartConfigJson: dto.chartConfig ? JSON.stringify(dto.chartConfig) : undefined,
        slideJson: dto.slideSettings ? JSON.stringify(dto.slideSettings) : undefined,
      },
      create: {
        id: dto.pageId,
        projectId,
        name: dto.name || 'Page',
        order: dto.order || 0,
        width: dto.width || 1200,
        height: dto.height || 800,
        backgroundJson: JSON.stringify(dto.background || { type: 'solid', color: '#ffffff' }),
        elementsJson: JSON.stringify(dto.elements || []),
        nodesJson: JSON.stringify(dto.nodes || []),
        edgesJson: JSON.stringify(dto.edges || []),
      },
    });

    await this.prisma.project.update({
      where: { id: projectId },
      data: { updatedAt: new Date(), version: { increment: 1 } },
    });

    return updatedPage;
  }

  async duplicate(id: string, userId: string) {
    const original = await this.findOne(id, userId);

    const duplicated = await this.create(userId, {
      title: `${original.title} (Copy)`,
      type: original.type as any,
      description: original.description,
      initialData: {
        settings: original.settings,
        pages: original.pages,
      },
    });

    return duplicated;
  }

  async delete(id: string, userId: string) {
    const existing = await this.prisma.project.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Project not found');
    if (existing.userId !== userId) throw new ForbiddenException('Access denied');

    await this.prisma.project.delete({ where: { id } });
    return { success: true, id };
  }
}
