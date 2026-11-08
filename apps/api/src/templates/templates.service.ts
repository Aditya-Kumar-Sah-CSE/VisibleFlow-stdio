import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(category?: string) {
    // If database has templates, return them; otherwise return rich prebuilt templates
    const templates = this.getPrebuiltTemplates();
    if (category && category !== 'all') {
      return templates.filter(t => t.category === category);
    }
    return templates;
  }

  async findOne(id: string) {
    const all = this.getPrebuiltTemplates();
    return all.find(t => t.id === id) || null;
  }

  private getPrebuiltTemplates() {
    return [
      {
        id: 'tmpl-flowchart-auth',
        title: 'Authentication & SSO Flow',
        description: 'Complete user login, JWT verification, and OAuth provider workflow.',
        category: 'flowchart',
        thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop',
        tags: ['Security', 'OAuth', 'Backend', 'Architecture'],
        isPremium: false,
        projectData: {
          title: 'Authentication Flow',
          type: 'flowchart',
          pages: [
            {
              id: 'page-flow-1',
              name: 'Auth Architecture',
              width: 1400,
              height: 900,
              unit: 'px',
              background: { type: 'solid', color: '#f8fafc' },
              elements: [],
              nodes: [
                {
                  id: 'node-start',
                  type: 'custom',
                  position: { x: 100, y: 350 },
                  data: { label: 'User Login Request', nodeType: 'start' },
                },
                {
                  id: 'node-decision',
                  type: 'custom',
                  position: { x: 380, y: 330 },
                  data: { label: 'OAuth or Email?', nodeType: 'decision' },
                },
                {
                  id: 'node-oauth',
                  type: 'custom',
                  position: { x: 680, y: 200 },
                  data: { label: 'Supabase / Google OAuth', nodeType: 'process' },
                },
                {
                  id: 'node-creds',
                  type: 'custom',
                  position: { x: 680, y: 460 },
                  data: { label: 'Bcrypt Hash Verification', nodeType: 'process' },
                },
                {
                  id: 'node-db',
                  type: 'custom',
                  position: { x: 960, y: 330 },
                  data: { label: 'PostgreSQL User Query', nodeType: 'database' },
                },
                {
                  id: 'node-jwt',
                  type: 'custom',
                  position: { x: 1220, y: 330 },
                  data: { label: 'Issue Signed JWT Token', nodeType: 'end' },
                },
              ],
              edges: [
                { id: 'e1', source: 'node-start', target: 'node-decision', type: 'smoothstep' },
                { id: 'e2', source: 'node-decision', target: 'node-oauth', label: 'OAuth', type: 'smoothstep' },
                { id: 'e3', source: 'node-decision', target: 'node-creds', label: 'Password', type: 'smoothstep' },
                { id: 'e4', source: 'node-oauth', target: 'node-db', type: 'smoothstep' },
                { id: 'e5', source: 'node-creds', target: 'node-db', type: 'smoothstep' },
                { id: 'e6', source: 'node-db', target: 'node-jwt', type: 'smoothstep' },
              ],
            },
          ],
        },
      },
      {
        id: 'tmpl-slide-pitch',
        title: 'Executive Pitch Deck',
        description: 'High-impact investor presentation with modern dark theme and metrics slides.',
        category: 'slide',
        thumbnailUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop',
        tags: ['Pitch Deck', 'Startup', 'Slides', 'Business'],
        isPremium: false,
        projectData: {
          title: 'Executive Pitch Deck',
          type: 'slide',
          pages: [
            {
              id: 'slide-1',
              name: 'Cover Slide',
              width: 1280,
              height: 720,
              unit: 'px',
              background: { type: 'solid', color: '#090d16' },
              elements: [
                {
                  id: 'title-text',
                  type: 'text',
                  name: 'Deck Title',
                  x: 120,
                  y: 220,
                  width: 900,
                  height: 100,
                  rotation: 0,
                  zIndex: 1,
                  isLocked: false,
                  isVisible: true,
                  text: 'VisualFlow Studio',
                  style: {
                    fill: 'transparent',
                    stroke: 'transparent',
                    strokeWidth: 0,
                    opacity: 1,
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 54,
                    fontWeight: '800',
                    color: '#ffffff',
                    textAlign: 'left',
                  },
                },
                {
                  id: 'subtitle-text',
                  type: 'text',
                  name: 'Subtitle',
                  x: 120,
                  y: 340,
                  width: 800,
                  height: 60,
                  rotation: 0,
                  zIndex: 2,
                  isLocked: false,
                  isVisible: true,
                  text: 'Next-Generation Visual Creation & Technical Document Platform',
                  style: {
                    fill: 'transparent',
                    stroke: 'transparent',
                    strokeWidth: 0,
                    opacity: 1,
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 22,
                    fontWeight: 'normal',
                    color: '#94a3b8',
                    textAlign: 'left',
                  },
                },
              ],
            },
          ],
        },
      },
      {
        id: 'tmpl-chart-revenue',
        title: 'SaaS Revenue & Retention Metrics',
        description: 'Interactive multi-series revenue growth and retention analytics dashboard.',
        category: 'chart',
        thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop',
        tags: ['Analytics', 'Finance', 'SaaS', 'Metrics'],
        isPremium: false,
        projectData: {
          title: 'SaaS Revenue Metrics',
          type: 'chart',
          pages: [
            {
              id: 'page-chart-1',
              name: 'Revenue Dashboard',
              width: 1000,
              height: 650,
              unit: 'px',
              background: { type: 'solid', color: '#ffffff' },
              elements: [],
              chartConfig: {
                chartType: 'bar',
                title: 'Monthly Recurring Revenue (MRR) Growth',
                subtitle: 'USD Thousands (2025)',
                theme: 'corporate',
                showLegend: true,
                showTooltips: true,
                showGridLines: true,
                animation: true,
                dataset: {
                  headers: ['Month', 'New ARR', 'Expansion', 'Net MRR'],
                  rows: [
                    ['Jan', 45, 12, 57],
                    ['Feb', 52, 18, 70],
                    ['Mar', 61, 24, 85],
                    ['Apr', 74, 30, 104],
                    ['May', 89, 39, 128],
                    ['Jun', 110, 48, 158],
                  ],
                },
              },
            },
          ],
        },
      },
      {
        id: 'tmpl-doc-tech-spec',
        title: 'System Architecture Specification',
        description: 'Standard engineering design doc with mathematical formulations and tables.',
        category: 'document',
        thumbnailUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop',
        tags: ['Engineering', 'Design Doc', 'Architecture', 'Specification'],
        isPremium: false,
        projectData: {
          title: 'System Architecture Spec',
          type: 'document',
          pages: [
            {
              id: 'page-doc-1',
              name: 'Page 1',
              width: 794,
              height: 1123,
              unit: 'px',
              background: { type: 'solid', color: '#ffffff' },
              elements: [],
            },
          ],
        },
      },
    ];
  }
}

