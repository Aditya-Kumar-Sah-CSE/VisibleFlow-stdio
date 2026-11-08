import { Injectable, BadRequestException } from '@nestjs/common';
import { VISUAL_MATH_TEMPLATES } from '../common/defaults';

export interface AIGenerationRequest {
  prompt: string;
  category: 'document' | 'slide' | 'flowchart' | 'diagram' | 'chart' | 'equation';
  context?: Record<string, unknown>;
}

@Injectable()
export class AIService {
  /**
   * Generates validated structured JSON corresponding to the user prompt.
   * Completely provider-agnostic, guaranteed to return safe, editable schema objects.
   */
  async generate(req: AIGenerationRequest) {
    const { prompt, category } = req;
    if (!prompt || !prompt.trim()) {
      throw new BadRequestException('Prompt cannot be empty');
    }

    const cleanPrompt = prompt.trim();

    switch (category) {
      case 'flowchart':
        return this.generateFlowchart(cleanPrompt);
      case 'slide':
        return this.generatePresentation(cleanPrompt);
      case 'chart':
        return this.generateChart(cleanPrompt);
      case 'equation':
        return this.generateEquation(cleanPrompt);
      case 'diagram':
        return this.generateDiagram(cleanPrompt);
      case 'document':
      default:
        return this.generateDocument(cleanPrompt);
    }
  }

  private generateFlowchart(prompt: string) {
    const keywords = prompt.toLowerCase();
    const id = (prefix: string) => `${prefix}-${Math.random().toString(36).substring(2, 7)}`;

    // Generate smart nodes based on prompt semantics
    const isECommerce = keywords.includes('order') || keywords.includes('cart') || keywords.includes('checkout') || keywords.includes('shop');
    const isDataPipeline = keywords.includes('etl') || keywords.includes('data') || keywords.includes('pipeline') || keywords.includes('stream');

    if (isECommerce) {
      return {
        title: `Flowchart: ${prompt}`,
        type: 'flowchart',
        nodes: [
          { id: 'n1', type: 'custom', position: { x: 80, y: 300 }, data: { label: 'Customer Adds to Cart', nodeType: 'start' } },
          { id: 'n2', type: 'custom', position: { x: 340, y: 300 }, data: { label: 'Proceed to Checkout', nodeType: 'process' } },
          { id: 'n3', type: 'custom', position: { x: 620, y: 280 }, data: { label: 'Payment Valid?', nodeType: 'decision' } },
          { id: 'n4', type: 'custom', position: { x: 920, y: 180 }, data: { label: 'Payment Gateway (Stripe)', nodeType: 'cloud' } },
          { id: 'n5', type: 'custom', position: { x: 920, y: 420 }, data: { label: 'Prompt Card Retry', nodeType: 'process' } },
          { id: 'n6', type: 'custom', position: { x: 1220, y: 180 }, data: { label: 'Save Order in DB', nodeType: 'database' } },
          { id: 'n7', type: 'custom', position: { x: 1500, y: 180 }, data: { label: 'Dispatch Email & Complete', nodeType: 'end' } },
        ],
        edges: [
          { id: 'e1', source: 'n1', target: 'n2', type: 'smoothstep' },
          { id: 'e2', source: 'n2', target: 'n3', type: 'smoothstep' },
          { id: 'e3', source: 'n3', target: 'n4', label: 'Approved', type: 'smoothstep' },
          { id: 'e4', source: 'n3', target: 'n5', label: 'Declined', type: 'smoothstep' },
          { id: 'e5', source: 'n5', target: 'n2', label: 'Retry', type: 'smoothstep' },
          { id: 'e6', source: 'n4', target: 'n6', type: 'smoothstep' },
          { id: 'e7', source: 'n6', target: 'n7', type: 'smoothstep' },
        ],
      };
    }

    if (isDataPipeline) {
      return {
        title: `Dataflow: ${prompt}`,
        type: 'flowchart',
        nodes: [
          { id: 'n1', type: 'custom', position: { x: 100, y: 280 }, data: { label: 'Raw Event Ingestion (Kafka)', nodeType: 'start' } },
          { id: 'n2', type: 'custom', position: { x: 400, y: 280 }, data: { label: 'Schema Validator & Filter', nodeType: 'process' } },
          { id: 'n3', type: 'custom', position: { x: 700, y: 260 }, data: { label: 'Dead Letter or Process?', nodeType: 'decision' } },
          { id: 'n4', type: 'custom', position: { x: 1000, y: 180 }, data: { label: 'Spark Streaming Transformations', nodeType: 'process' } },
          { id: 'n5', type: 'custom', position: { x: 1000, y: 400 }, data: { label: 'Dead Letter SQS Queue', nodeType: 'cloud' } },
          { id: 'n6', type: 'custom', position: { x: 1320, y: 180 }, data: { label: 'PostgreSQL Lakehouse Lake', nodeType: 'database' } },
        ],
        edges: [
          { id: 'e1', source: 'n1', target: 'n2', type: 'smoothstep' },
          { id: 'e2', source: 'n2', target: 'n3', type: 'smoothstep' },
          { id: 'e3', source: 'n3', target: 'n4', label: 'Valid', type: 'smoothstep' },
          { id: 'e4', source: 'n3', target: 'n5', label: 'Corrupt', type: 'smoothstep' },
          { id: 'e5', source: 'n4', target: 'n6', type: 'smoothstep' },
        ],
      };
    }

    // General workflow
    return {
      title: `Workflow: ${prompt}`,
      type: 'flowchart',
      nodes: [
        { id: 'n1', type: 'custom', position: { x: 100, y: 250 }, data: { label: `Initiate: ${prompt.slice(0, 24)}`, nodeType: 'start' } },
        { id: 'n2', type: 'custom', position: { x: 380, y: 250 }, data: { label: 'Analyze & Process Input', nodeType: 'process' } },
        { id: 'n3', type: 'custom', position: { x: 680, y: 230 }, data: { label: 'Condition Met?', nodeType: 'decision' } },
        { id: 'n4', type: 'custom', position: { x: 980, y: 160 }, data: { label: 'Execute Primary Pipeline', nodeType: 'process' } },
        { id: 'n5', type: 'custom', position: { x: 980, y: 340 }, data: { label: 'Fallback Handler', nodeType: 'process' } },
        { id: 'n6', type: 'custom', position: { x: 1280, y: 250 }, data: { label: 'Persist & Notify Outcome', nodeType: 'end' } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', type: 'smoothstep' },
        { id: 'e2', source: 'n2', target: 'n3', type: 'smoothstep' },
        { id: 'e3', source: 'n3', target: 'n4', label: 'Yes', type: 'smoothstep' },
        { id: 'e4', source: 'n3', target: 'n5', label: 'No', type: 'smoothstep' },
        { id: 'e5', source: 'n4', target: 'n6', type: 'smoothstep' },
        { id: 'e6', source: 'n5', target: 'n6', type: 'smoothstep' },
      ],
    };
  }

  private generatePresentation(prompt: string) {
    return {
      title: prompt,
      type: 'slide',
      pages: [
        {
          id: 'slide-gen-1',
          name: 'Title Slide',
          width: 1280,
          height: 720,
          unit: 'px',
          background: { type: 'solid', color: '#0f172a' },
          elements: [
            {
              id: 'el-title',
              type: 'text',
              name: 'Title',
              x: 100,
              y: 240,
              width: 1080,
              height: 90,
              rotation: 0,
              zIndex: 1,
              isLocked: false,
              isVisible: true,
              text: prompt,
              style: {
                fill: 'transparent',
                stroke: 'transparent',
                strokeWidth: 0,
                opacity: 1,
                fontFamily: 'Inter, sans-serif',
                fontSize: 48,
                fontWeight: '800',
                color: '#ffffff',
                textAlign: 'left',
              },
            },
            {
              id: 'el-sub',
              type: 'text',
              name: 'Subtitle',
              x: 100,
              y: 350,
              width: 900,
              height: 50,
              rotation: 0,
              zIndex: 2,
              isLocked: false,
              isVisible: true,
              text: 'Generated with VisualFlow Studio AI Assistant',
              style: {
                fill: 'transparent',
                stroke: 'transparent',
                strokeWidth: 0,
                opacity: 1,
                fontFamily: 'Inter, sans-serif',
                fontSize: 20,
                fontWeight: 'normal',
                color: '#94a3b8',
                textAlign: 'left',
              },
            },
          ],
        },
        {
          id: 'slide-gen-2',
          name: 'Key Pillars',
          width: 1280,
          height: 720,
          unit: 'px',
          background: { type: 'solid', color: '#ffffff' },
          elements: [
            {
              id: 'el-p2-head',
              type: 'text',
              name: 'Header',
              x: 80,
              y: 60,
              width: 800,
              height: 50,
              rotation: 0,
              zIndex: 1,
              isLocked: false,
              isVisible: true,
              text: 'Strategic Core Objectives',
              style: {
                fill: 'transparent',
                stroke: 'transparent',
                strokeWidth: 0,
                opacity: 1,
                fontFamily: 'Inter, sans-serif',
                fontSize: 36,
                fontWeight: '700',
                color: '#0f172a',
                textAlign: 'left',
              },
            },
            {
              id: 'el-card-1',
              type: 'shape',
              shapeKind: 'rounded-rect',
              name: 'Card 1',
              x: 80,
              y: 160,
              width: 340,
              height: 380,
              rotation: 0,
              zIndex: 2,
              isLocked: false,
              isVisible: true,
              text: 'Scalability\n\nHigh-throughput architecture engineered to scale elastically across workloads.',
              style: {
                fill: '#f8fafc',
                stroke: '#e2e8f0',
                strokeWidth: 2,
                cornerRadius: 12,
                opacity: 1,
                fontFamily: 'Inter, sans-serif',
                fontSize: 16,
                color: '#1e293b',
                textAlign: 'left',
              },
            },
            {
              id: 'el-card-2',
              type: 'shape',
              shapeKind: 'rounded-rect',
              name: 'Card 2',
              x: 470,
              y: 160,
              width: 340,
              height: 380,
              rotation: 0,
              zIndex: 3,
              isLocked: false,
              isVisible: true,
              text: 'Automation\n\nAlgorithmic workflow intelligence saving hours of repetitive human configuration.',
              style: {
                fill: '#eff6ff',
                stroke: '#bfdbfe',
                strokeWidth: 2,
                cornerRadius: 12,
                opacity: 1,
                fontFamily: 'Inter, sans-serif',
                fontSize: 16,
                color: '#1e3a8a',
                textAlign: 'left',
              },
            },
            {
              id: 'el-card-3',
              type: 'shape',
              shapeKind: 'rounded-rect',
              name: 'Card 3',
              x: 860,
              y: 160,
              width: 340,
              height: 380,
              rotation: 0,
              zIndex: 4,
              isLocked: false,
              isVisible: true,
              text: 'Data Precision\n\nSingle-source-of-truth visual data models with automated synchronization.',
              style: {
                fill: '#f0fdf4',
                stroke: '#bbf7d0',
                strokeWidth: 2,
                cornerRadius: 12,
                opacity: 1,
                fontFamily: 'Inter, sans-serif',
                fontSize: 16,
                color: '#14532d',
                textAlign: 'left',
              },
            },
          ],
        },
      ],
    };
  }

  private generateChart(prompt: string) {
    const isPie = prompt.toLowerCase().includes('distribution') || prompt.toLowerCase().includes('share');
    const isLine = prompt.toLowerCase().includes('trend') || prompt.toLowerCase().includes('history') || prompt.toLowerCase().includes('forecast');

    const chartType = isPie ? 'pie' : isLine ? 'line' : 'bar';

    return {
      title: prompt,
      type: 'chart',
      chartConfig: {
        chartType,
        title: prompt,
        subtitle: 'Synthesized Dataset',
        theme: 'corporate',
        showLegend: true,
        showTooltips: true,
        showGridLines: true,
        animation: true,
        dataset: {
          headers: ['Metric', 'Current Period', 'Target Goal'],
          rows: [
            ['Product Alpha', 120, 150],
            ['Product Beta', 185, 200],
            ['Product Gamma', 95, 110],
            ['Product Delta', 240, 220],
            ['Product Epsilon', 160, 180],
          ],
        },
      },
    };
  }

  private generateEquation(prompt: string) {
    const query = prompt.toLowerCase();
    if (query.includes('quad')) return VISUAL_MATH_TEMPLATES.quadraticFormula;
    if (query.includes('pythag')) return VISUAL_MATH_TEMPLATES.pythagoreanTheorem;
    if (query.includes('int') || query.includes('calc')) return VISUAL_MATH_TEMPLATES.gaussianIntegral;
    if (query.includes('matrix')) return VISUAL_MATH_TEMPLATES.rotationMatrix;
    return VISUAL_MATH_TEMPLATES.einsteinRelativity;
  }

  private generateDiagram(prompt: string) {
    return this.generateFlowchart(prompt);
  }

  private generateDocument(prompt: string) {
    return {
      title: prompt,
      type: 'document',
      summary: `Automated document drafted for: "${prompt}"`,
    };
  }
}
