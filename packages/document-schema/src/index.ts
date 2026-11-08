import { z } from 'zod';
import type {
  UniversalProject,
  UniversalPage,
  CanvasElement,
  ProjectType,
  ShapeKind,
} from '@visualflow/shared-types';

export const ProjectTypeSchema = z.enum([
  'document',
  'slide',
  'flowchart',
  'diagram',
  'chart',
  'pdf',
]);

export const ElementStyleSchema = z.object({
  fill: z.string().default('#ffffff'),
  fillOpacity: z.number().min(0).max(1).optional(),
  stroke: z.string().default('#0f172a'),
  strokeWidth: z.number().min(0).default(1.5),
  strokeDasharray: z.array(z.number()).optional(),
  strokeStyle: z.enum(['solid', 'dashed', 'dotted']).default('solid'),
  opacity: z.number().min(0).max(1).default(1),
  cornerRadius: z.number().min(0).optional(),
  shadowColor: z.string().optional(),
  shadowBlur: z.number().optional(),
  shadowOffsetX: z.number().optional(),
  shadowOffsetY: z.number().optional(),
  shadowOpacity: z.number().optional(),

  // Text specific
  fontFamily: z.string().default('Inter, sans-serif'),
  fontSize: z.number().default(16),
  fontWeight: z.enum(['normal', 'bold', '600', '700', '800']).default('normal'),
  fontStyle: z.enum(['normal', 'italic']).default('normal'),
  textDecoration: z.enum(['none', 'underline', 'line-through']).default('none'),
  textAlign: z.enum(['left', 'center', 'right', 'justify']).default('left'),
  verticalAlign: z.enum(['top', 'middle', 'bottom']).default('top'),
  lineHeight: z.number().default(1.4),
  letterSpacing: z.number().default(0),
  color: z.string().default('#0f172a'),

  // Arrow specific
  startArrow: z.enum(['none', 'arrow', 'circle', 'diamond']).default('none'),
  endArrow: z.enum(['none', 'arrow', 'circle', 'diamond']).default('arrow'),
  curvature: z.number().default(0),
});

export const MathASTNodeSchema: z.ZodType<unknown> = z.lazy(() =>
  z.object({
    id: z.string(),
    type: z.string(),
    value: z.string().optional(),
    children: z.array(MathASTNodeSchema).optional(),
    numerator: z.array(MathASTNodeSchema).optional(),
    denominator: z.array(MathASTNodeSchema).optional(),
    radicand: z.array(MathASTNodeSchema).optional(),
    index: z.array(MathASTNodeSchema).optional(),
    base: z.array(MathASTNodeSchema).optional(),
    exponent: z.array(MathASTNodeSchema).optional(),
    subscript: z.array(MathASTNodeSchema).optional(),
    lowerLimit: z.array(MathASTNodeSchema).optional(),
    upperLimit: z.array(MathASTNodeSchema).optional(),
    matrixRows: z.array(z.array(MathASTNodeSchema)).optional(),
  })
);

export const CanvasElementSchema = z.object({
  id: z.string(),
  type: z.enum([
    'text',
    'shape',
    'arrow',
    'connector',
    'image',
    'icon',
    'table',
    'equation',
    'chart',
    'group',
  ]),
  name: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  rotation: z.number().default(0),
  zIndex: z.number().default(1),
  isLocked: z.boolean().default(false),
  isVisible: z.boolean().default(true),
  groupId: z.string().optional(),
  style: ElementStyleSchema,

  text: z.string().optional(),
  shapeKind: z.string().optional(),
  imageUrl: z.string().optional(),
  svgPath: z.string().optional(),
  equationAst: MathASTNodeSchema.optional(),
  renderedSvg: z.string().optional(),
  latex: z.string().optional(),
  chartConfig: z.any().optional(),
  points: z.array(z.number()).optional(),
  customData: z.record(z.unknown()).optional(),
});

export const PageBackgroundSchema = z.object({
  type: z.enum(['solid', 'gradient', 'image', 'pattern']).default('solid'),
  color: z.string().default('#ffffff'),
  gradient: z
    .object({
      type: z.enum(['linear', 'radial']),
      stops: z.array(z.object({ color: z.string(), offset: z.number() })),
      angle: z.number().optional(),
    })
    .optional(),
  imageUrl: z.string().optional(),
});

export const UniversalPageSchema = z.object({
  id: z.string(),
  order: z.number(),
  name: z.string(),
  width: z.number().default(1200),
  height: z.number().default(800),
  unit: z.enum(['px', 'mm', 'in']).default('px'),
  background: PageBackgroundSchema,
  elements: z.array(CanvasElementSchema).default([]),
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
  documentContent: z.any().optional(),
  chartConfig: z.any().optional(),
  slideSettings: z
    .object({
      transition: z.enum(['none', 'fade', 'slide-x', 'slide-y', 'zoom']).default('none'),
      transitionDuration: z.number().default(300),
      speakerNotes: z.string().optional(),
    })
    .optional(),
});

export const ProjectSettingsSchema = z.object({
  defaultUnit: z.enum(['px', 'mm', 'in']).default('px'),
  gridSize: z.number().default(20),
  snapToGrid: z.boolean().default(true),
  showGrid: z.boolean().default(true),
  showRulers: z.boolean().default(true),
  theme: z.enum(['light', 'dark', 'system']).default('light'),
  backgroundColor: z.string().default('#f8fafc'),
});

export const UniversalProjectSchema = z.object({
  id: z.string(),
  version: z.number().default(1),
  type: ProjectTypeSchema,
  title: z.string().min(1, 'Project title is required'),
  description: z.string().optional(),
  folderId: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  thumbnailUrl: z.string().optional(),
  isStarred: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
  settings: ProjectSettingsSchema,
  pages: z.array(UniversalPageSchema),
  assets: z.array(z.any()).default([]),
  metadata: z.record(z.unknown()).optional(),
});

export function validateProject(data: unknown): UniversalProject {
  return UniversalProjectSchema.parse(data) as UniversalProject;
}

export function safeValidateProject(data: unknown) {
  return UniversalProjectSchema.safeParse(data);
}

export function createDefaultProject(
  type: ProjectType,
  title = 'Untitled Project'
): UniversalProject {
  const pageId = 'page-' + Math.random().toString(36).substring(2, 9);
  const now = new Date().toISOString();

  let defaultWidth = 1200;
  let defaultHeight = 800;

  if (type === 'document') {
    // A4 at 96 DPI: ~794 x 1123
    defaultWidth = 794;
    defaultHeight = 1123;
  } else if (type === 'slide') {
    // 16:9 Standard: 1920 x 1080 or 1280 x 720
    defaultWidth = 1280;
    defaultHeight = 720;
  } else if (type === 'flowchart' || type === 'diagram') {
    defaultWidth = 1600;
    defaultHeight = 1000;
  } else if (type === 'chart') {
    defaultWidth = 1000;
    defaultHeight = 650;
  }

  const initialPage: UniversalPage = {
    id: pageId,
    order: 0,
    name: 'Page 1',
    width: defaultWidth,
    height: defaultHeight,
    unit: 'px',
    background: {
      type: 'solid',
      color: '#ffffff',
    },
    elements: [],
    nodes: [],
    edges: [],
  };

  return {
    id: 'proj-' + Math.random().toString(36).substring(2, 9),
    version: 1,
    type,
    title,
    description: '',
    folderId: null,
    tags: [],
    isStarred: false,
    createdAt: now,
    updatedAt: now,
    settings: {
      defaultUnit: 'px',
      gridSize: 20,
      snapToGrid: true,
      showGrid: true,
      showRulers: true,
      theme: 'light',
      backgroundColor: '#f1f5f9',
    },
    pages: [initialPage],
    assets: [],
    metadata: {},
  };
}

export function createDefaultElement(
  type: CanvasElement['type'],
  x: number,
  y: number,
  extra: Partial<CanvasElement> = {}
): CanvasElement {
  const id = 'elem-' + Math.random().toString(36).substring(2, 9);

  const base: CanvasElement = {
    id,
    type,
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${id.slice(-4)}`,
    x,
    y,
    width: 140,
    height: 90,
    rotation: 0,
    zIndex: 1,
    isLocked: false,
    isVisible: true,
    style: {
      fill: '#3b82f6',
      stroke: '#1d4ed8',
      strokeWidth: 2,
      opacity: 1,
      cornerRadius: 6,
      fontFamily: 'Inter, sans-serif',
      fontSize: 16,
      color: '#0f172a',
      textAlign: 'center',
      verticalAlign: 'middle',
      lineHeight: 1.4,
      letterSpacing: 0,
    },
    ...extra,
  };

  if (type === 'text') {
    base.text = extra.text || 'Double click to edit text';
    base.width = 240;
    base.height = 48;
    base.style.fill = 'transparent';
    base.style.stroke = 'transparent';
    base.style.strokeWidth = 0;
  } else if (type === 'shape') {
    base.shapeKind = (extra.shapeKind as ShapeKind) || 'rectangle';
    base.text = extra.text || '';
    if (base.shapeKind === 'circle') {
      base.width = 100;
      base.height = 100;
    }
  } else if (type === 'arrow') {
    base.width = 160;
    base.height = 40;
    base.points = [0, 20, 160, 20];
    base.style.fill = '#1e293b';
    base.style.stroke = '#1e293b';
    base.style.strokeWidth = 3;
    base.style.endArrow = 'arrow';
  }

  return base;
}
