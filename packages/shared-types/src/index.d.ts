/**
 * VisualFlow Studio - Shared Type Definitions
 */
export type ProjectType = 'document' | 'slide' | 'flowchart' | 'diagram' | 'chart' | 'pdf';
export interface ProjectSettings {
    defaultUnit: 'px' | 'mm' | 'in';
    gridSize: number;
    snapToGrid: boolean;
    showGrid: boolean;
    showRulers: boolean;
    theme: 'light' | 'dark' | 'system';
    backgroundColor: string;
}
export interface ProjectAssetReference {
    id: string;
    name: string;
    url: string;
    mimeType: string;
    sizeBytes: number;
    width?: number;
    height?: number;
    createdAt: string;
}
export interface UniversalProject {
    id: string;
    version: number;
    type: ProjectType;
    title: string;
    description?: string;
    folderId?: string | null;
    tags: string[];
    thumbnailUrl?: string;
    isStarred: boolean;
    createdAt: string;
    updatedAt: string;
    settings: ProjectSettings;
    pages: UniversalPage[];
    assets: ProjectAssetReference[];
    metadata?: Record<string, unknown>;
}
export interface PageBackground {
    type: 'solid' | 'gradient' | 'image' | 'pattern';
    color?: string;
    gradient?: {
        type: 'linear' | 'radial';
        stops: Array<{
            color: string;
            offset: number;
        }>;
        angle?: number;
    };
    imageUrl?: string;
}
export interface UniversalPage {
    id: string;
    order: number;
    name: string;
    width: number;
    height: number;
    unit: 'px' | 'mm' | 'in';
    background: PageBackground;
    elements: CanvasElement[];
    nodes?: FlowNode[];
    edges?: FlowEdge[];
    documentContent?: RichDocContent;
    chartConfig?: EChartProjectConfig;
    slideSettings?: SlidePageSettings;
}
export interface SlidePageSettings {
    transition: 'none' | 'fade' | 'slide-x' | 'slide-y' | 'zoom';
    transitionDuration: number;
    speakerNotes?: string;
}
export interface RichDocContent {
    type: 'doc';
    content?: unknown[];
}
export type ElementType = 'text' | 'shape' | 'arrow' | 'connector' | 'image' | 'icon' | 'table' | 'equation' | 'chart' | 'group';
export type ShapeKind = 'rectangle' | 'circle' | 'ellipse' | 'triangle' | 'star' | 'polygon' | 'diamond' | 'cylinder' | 'callout' | 'parallelogram' | 'rounded-rect';
export interface ElementStyle {
    fill: string;
    fillOpacity?: number;
    stroke: string;
    strokeWidth: number;
    strokeDasharray?: number[];
    strokeStyle?: 'solid' | 'dashed' | 'dotted';
    opacity: number;
    cornerRadius?: number;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    shadowOpacity?: number;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: 'normal' | 'bold' | '600' | '700' | '800';
    fontStyle?: 'normal' | 'italic';
    textDecoration?: 'none' | 'underline' | 'line-through';
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    verticalAlign?: 'top' | 'middle' | 'bottom';
    lineHeight?: number;
    letterSpacing?: number;
    color?: string;
    startArrow?: 'none' | 'arrow' | 'circle' | 'diamond';
    endArrow?: 'none' | 'arrow' | 'circle' | 'diamond';
    curvature?: number;
}
export interface CanvasElement {
    id: string;
    type: ElementType;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    zIndex: number;
    isLocked: boolean;
    isVisible: boolean;
    groupId?: string;
    style: ElementStyle;
    text?: string;
    shapeKind?: ShapeKind;
    imageUrl?: string;
    svgPath?: string;
    equationAst?: MathASTNode;
    renderedSvg?: string;
    latex?: string;
    chartConfig?: EChartProjectConfig;
    points?: number[];
    customData?: Record<string, unknown>;
}
export type FlowNodeType = 'start' | 'end' | 'process' | 'decision' | 'input' | 'output' | 'database' | 'document' | 'cloud' | 'subroutine' | 'custom';
export interface FlowNode {
    id: string;
    type: string;
    position: {
        x: number;
        y: number;
    };
    data: {
        label: string;
        description?: string;
        nodeType: FlowNodeType;
        icon?: string;
        style?: Partial<ElementStyle>;
        customData?: Record<string, unknown>;
    };
    width?: number;
    height?: number;
}
export interface FlowEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
    label?: string;
    type?: 'default' | 'straight' | 'step' | 'smoothstep' | 'bezier';
    animated?: boolean;
    style?: {
        stroke?: string;
        strokeWidth?: number;
        strokeDasharray?: string;
    };
}
export type MathNodeType = 'formula' | 'symbol' | 'fraction' | 'sqrt' | 'power' | 'subscript' | 'supersub' | 'integral' | 'summation' | 'limit' | 'matrix' | 'parentheses' | 'brackets' | 'text';
export interface MathASTNode {
    id: string;
    type: MathNodeType;
    value?: string;
    children?: MathASTNode[];
    numerator?: MathASTNode[];
    denominator?: MathASTNode[];
    radicand?: MathASTNode[];
    index?: MathASTNode[];
    base?: MathASTNode[];
    exponent?: MathASTNode[];
    subscript?: MathASTNode[];
    lowerLimit?: MathASTNode[];
    upperLimit?: MathASTNode[];
    matrixRows?: MathASTNode[][];
}
export type ChartType = 'bar' | 'line' | 'pie' | 'donut' | 'area' | 'scatter' | 'radar' | 'heatmap' | 'candlestick' | 'waterfall';
export interface EChartDataset {
    headers: string[];
    rows: (string | number)[][];
}
export interface EChartProjectConfig {
    chartType: ChartType;
    title: string;
    subtitle?: string;
    theme: string;
    showLegend: boolean;
    showTooltips: boolean;
    showGridLines: boolean;
    dataset: EChartDataset;
    colors?: string[];
    animation: boolean;
    customOptions?: Record<string, unknown>;
}
export interface User {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    role: 'user' | 'admin' | 'enterprise';
    createdAt: string;
}
export interface Folder {
    id: string;
    userId: string;
    name: string;
    color?: string;
    parentId?: string | null;
    createdAt: string;
}
export interface Template {
    id: string;
    title: string;
    description: string;
    category: ProjectType;
    thumbnailUrl: string;
    tags: string[];
    isPremium: boolean;
    projectData: Partial<UniversalProject>;
}
export type ExportFormat = 'pdf' | 'pptx' | 'docx' | 'png' | 'svg' | 'json';
export interface ExportJob {
    id: string;
    projectId: string;
    format: ExportFormat;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    downloadUrl?: string;
    error?: string;
    progress: number;
    createdAt: string;
}
//# sourceMappingURL=index.d.ts.map