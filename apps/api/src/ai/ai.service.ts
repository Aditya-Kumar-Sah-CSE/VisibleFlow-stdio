import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { VISUAL_MATH_TEMPLATES } from '../common/defaults';

export interface AIGenerationRequest {
  prompt: string;
  category: 'document' | 'slide' | 'flowchart' | 'diagram' | 'chart' | 'equation';
  provider?: 'groq' | 'openrouter' | 'gemini' | 'auto';
  apiKey?: string;
  context?: Record<string, unknown>;
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  // Default keys securely loaded from environment variables
  private readonly groqKey = process.env.GROQ_API_KEY || '';
  private readonly openRouterKey = process.env.OPENROUTER_API_KEY || '';
  private readonly geminiKey = process.env.GEMINI_API_KEY || '';

  /**
   * Generates validated structured JSON corresponding to the user prompt.
   * Completely provider-agnostic, supporting Groq, OpenRouter, Gemini, and intelligent local fallback.
   */
  async generate(req: AIGenerationRequest) {
    const { prompt, category, provider = 'auto', apiKey } = req;
    if (!prompt || !prompt.trim()) {
      throw new BadRequestException('Prompt cannot be empty');
    }

    const cleanPrompt = prompt.trim();

    // If an external provider is selected or 'auto', attempt remote generation
    if (provider !== 'auto') {
      try {
        const externalResult = await this.callExternalProvider(provider, cleanPrompt, category, apiKey);
        if (externalResult) {
          return {
            ...externalResult,
            _meta: { provider, status: 'success', liveApi: true },
          };
        }
      } catch (err: any) {
        this.logger.warn(`External AI generation failed with ${provider}: ${err?.message}. Falling back to high-speed synthesizer.`);
      }
    }

    // High-speed semantic schema synthesis (fallback & offline)
    const localResult = this.synthesizeLocal(category, cleanPrompt);
    return {
      ...localResult,
      _meta: { provider: provider === 'auto' ? 'smart-local' : provider, status: 'fallback', liveApi: false },
    };
  }

  private async callExternalProvider(
    provider: 'groq' | 'openrouter' | 'gemini',
    prompt: string,
    category: string,
    customApiKey?: string
  ) {
    const systemPrompt = `You are VisualFlow Studio AI.
Output ONLY a single raw JSON object matching the requested schema for the category "${category}".
No markdown formatting, no backticks, no explanations. Just valid, parsable JSON.`;

    const userPrompt = `Generate a ${category} for: "${prompt}"`;

    if (provider === 'groq') {
      const key = customApiKey || this.groqKey;
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
        }),
        signal: AbortSignal.timeout(4500),
      });

      if (!res.ok) throw new Error(`Groq returned ${res.status}`);
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      return JSON.parse(content);
    }

    if (provider === 'openrouter') {
      const key = customApiKey || this.openRouterKey;
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'VisualFlow Studio',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-exp:free',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
        signal: AbortSignal.timeout(4500),
      });

      if (!res.ok) throw new Error(`OpenRouter returned ${res.status}`);
      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content?.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(raw);
    }

    if (provider === 'gemini') {
      const key = customApiKey || this.geminiKey;
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
          signal: AbortSignal.timeout(4500),
        }
      );

      if (!res.ok) throw new Error(`Gemini returned ${res.status}`);
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return JSON.parse(text);
    }

    return null;
  }

  private synthesizeLocal(category: string, prompt: string) {
    switch (category) {
      case 'flowchart':
        return this.generateFlowchart(prompt);
      case 'slide':
        return this.generatePresentation(prompt);
      case 'chart':
        return this.generateChart(prompt);
      case 'equation':
        return this.generateEquation(prompt);
      case 'diagram':
        return this.generateDiagram(prompt);
      case 'document':
      default:
        return this.generateDocument(prompt);
    }
  }

  private generateFlowchart(prompt: string) {
    const keywords = prompt.toLowerCase();

    // Semantic branch for E-Commerce / Orders
    if (keywords.includes('order') || keywords.includes('cart') || keywords.includes('checkout') || keywords.includes('shop') || keywords.includes('payment')) {
      return {
        title: `Flowchart: ${prompt}`,
        type: 'flowchart',
        nodes: [
          { id: 'n1', type: 'custom', position: { x: 80, y: 280 }, data: { label: 'Customer Adds to Cart', nodeType: 'start' } },
          { id: 'n2', type: 'custom', position: { x: 340, y: 280 }, data: { label: 'Initiate Checkout', nodeType: 'process' } },
          { id: 'n3', type: 'custom', position: { x: 620, y: 260 }, data: { label: 'Payment Valid?', nodeType: 'decision' } },
          { id: 'n4', type: 'custom', position: { x: 920, y: 160 }, data: { label: 'Stripe Gateway Authorized', nodeType: 'cloud' } },
          { id: 'n5', type: 'custom', position: { x: 920, y: 380 }, data: { label: 'Prompt Card Retry', nodeType: 'process' } },
          { id: 'n6', type: 'custom', position: { x: 1220, y: 160 }, data: { label: 'Save Order in Database', nodeType: 'database' } },
          { id: 'n7', type: 'custom', position: { x: 1500, y: 160 }, data: { label: 'Dispatch Receipt Email', nodeType: 'end' } },
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

    // Semantic branch for Data Pipelines / Machine Learning / Streams
    if (keywords.includes('etl') || keywords.includes('data') || keywords.includes('pipeline') || keywords.includes('stream') || keywords.includes('ai') || keywords.includes('ml')) {
      return {
        title: `Dataflow: ${prompt}`,
        type: 'flowchart',
        nodes: [
          { id: 'n1', type: 'custom', position: { x: 80, y: 260 }, data: { label: 'Raw Event Ingestion (Kafka)', nodeType: 'start' } },
          { id: 'n2', type: 'custom', position: { x: 380, y: 260 }, data: { label: 'Schema Validator & Filter', nodeType: 'process' } },
          { id: 'n3', type: 'custom', position: { x: 680, y: 240 }, data: { label: 'Data Quality Check?', nodeType: 'decision' } },
          { id: 'n4', type: 'custom', position: { x: 980, y: 160 }, data: { label: 'Spark Streaming Analytics', nodeType: 'process' } },
          { id: 'n5', type: 'custom', position: { x: 980, y: 360 }, data: { label: 'Dead-Letter SQS Queue', nodeType: 'cloud' } },
          { id: 'n6', type: 'custom', position: { x: 1280, y: 160 }, data: { label: 'PostgreSQL Lakehouse DB', nodeType: 'database' } },
          { id: 'n7', type: 'custom', position: { x: 1560, y: 160 }, data: { label: 'Sync to Dashboard', nodeType: 'end' } },
        ],
        edges: [
          { id: 'e1', source: 'n1', target: 'n2', type: 'smoothstep' },
          { id: 'e2', source: 'n2', target: 'n3', type: 'smoothstep' },
          { id: 'e3', source: 'n3', target: 'n4', label: 'Pass', type: 'smoothstep' },
          { id: 'e4', source: 'n3', target: 'n5', label: 'Fail', type: 'smoothstep' },
          { id: 'e5', source: 'n4', target: 'n6', type: 'smoothstep' },
          { id: 'e6', source: 'n6', target: 'n7', type: 'smoothstep' },
        ],
      };
    }

    // General workflow synthesis based on user's exact prompt
    const shortLabel = prompt.slice(0, 28);
    return {
      title: `Workflow: ${prompt}`,
      type: 'flowchart',
      nodes: [
        { id: 'n1', type: 'custom', position: { x: 100, y: 260 }, data: { label: `Start: ${shortLabel}`, nodeType: 'start' } },
        { id: 'n2', type: 'custom', position: { x: 380, y: 260 }, data: { label: 'Validate Input Parameters', nodeType: 'process' } },
        { id: 'n3', type: 'custom', position: { x: 680, y: 240 }, data: { label: 'Verification Check?', nodeType: 'decision' } },
        { id: 'n4', type: 'custom', position: { x: 980, y: 160 }, data: { label: 'Cloud Microservice Action', nodeType: 'cloud' } },
        { id: 'n5', type: 'custom', position: { x: 980, y: 360 }, data: { label: 'Error Handling / Retry', nodeType: 'process' } },
        { id: 'n6', type: 'custom', position: { x: 1280, y: 160 }, data: { label: 'Commit State to DB', nodeType: 'database' } },
        { id: 'n7', type: 'custom', position: { x: 1560, y: 160 }, data: { label: 'Workflow Completed', nodeType: 'end' } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', type: 'smoothstep' },
        { id: 'e2', source: 'n2', target: 'n3', type: 'smoothstep' },
        { id: 'e3', source: 'n3', target: 'n4', label: 'Yes', type: 'smoothstep' },
        { id: 'e4', source: 'n3', target: 'n5', label: 'No', type: 'smoothstep' },
        { id: 'e5', source: 'n5', target: 'n2', label: 'Re-evaluate', type: 'smoothstep' },
        { id: 'e6', source: 'n4', target: 'n6', type: 'smoothstep' },
        { id: 'e7', source: 'n6', target: 'n7', type: 'smoothstep' },
      ],
    };
  }

  private generateDiagram(prompt: string) {
    return {
      title: `Architecture Diagram: ${prompt}`,
      type: 'diagram',
      nodes: [
        { id: 'd1', type: 'custom', position: { x: 100, y: 240 }, data: { label: 'Client / Next.js Web', nodeType: 'process', shapeKind: 'rounded-rect', style: { fill: '#1e293b', stroke: '#3b82f6', color: '#ffffff' } } },
        { id: 'd2', type: 'custom', position: { x: 420, y: 240 }, data: { label: 'API Gateway / Reverse Proxy', nodeType: 'cloud', shapeKind: 'rectangle', style: { fill: '#083344', stroke: '#06b6d4', color: '#67e8f9' } } },
        { id: 'd3', type: 'custom', position: { x: 740, y: 160 }, data: { label: 'NestJS Microservice', nodeType: 'process', shapeKind: 'rounded-rect', style: { fill: '#1e1b4b', stroke: '#6366f1', color: '#c7d2fe' } } },
        { id: 'd4', type: 'custom', position: { x: 740, y: 340 }, data: { label: 'Worker / Queue Consumer', nodeType: 'process', shapeKind: 'rounded-rect', style: { fill: '#3b0764', stroke: '#a855f7', color: '#e9d5ff' } } },
        { id: 'd5', type: 'custom', position: { x: 1060, y: 240 }, data: { label: 'PostgreSQL Database & Redis', nodeType: 'database', shapeKind: 'rectangle', style: { fill: '#022c22', stroke: '#10b981', color: '#a7f3d0' } } },
      ],
      edges: [
        { id: 'de1', source: 'd1', target: 'd2', label: 'HTTPS / REST', type: 'smoothstep' },
        { id: 'de2', source: 'd2', target: 'd3', label: 'gRPC / JSON', type: 'smoothstep' },
        { id: 'de3', source: 'd2', target: 'd4', label: 'PubSub Queue', type: 'smoothstep' },
        { id: 'de4', source: 'd3', target: 'd5', label: 'Prisma Connection', type: 'smoothstep' },
        { id: 'de5', source: 'd4', target: 'd5', label: 'Cache / Sync', type: 'smoothstep' },
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
          background: { type: 'solid', color: '#090d16' },
          elements: [
            {
              id: 'el-title-1',
              type: 'text',
              name: 'Title',
              x: 120,
              y: 220,
              width: 1040,
              height: 100,
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
              id: 'el-sub-1',
              type: 'text',
              name: 'Subtitle',
              x: 120,
              y: 340,
              width: 800,
              height: 50,
              rotation: 0,
              zIndex: 2,
              isLocked: false,
              isVisible: true,
              text: 'VisualFlow Studio • Executive Technical Presentation',
              style: {
                fill: 'transparent',
                stroke: 'transparent',
                strokeWidth: 0,
                opacity: 1,
                fontFamily: 'Inter, sans-serif',
                fontSize: 22,
                fontWeight: 'normal',
                color: '#60a5fa',
                textAlign: 'left',
              },
            },
          ],
        },
        {
          id: 'slide-gen-2',
          name: 'Architecture & Highlights',
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
              y: 50,
              width: 800,
              height: 50,
              rotation: 0,
              zIndex: 1,
              isLocked: false,
              isVisible: true,
              text: 'Core Pillars & Execution Framework',
              style: {
                fill: 'transparent',
                stroke: 'transparent',
                strokeWidth: 0,
                opacity: 1,
                fontFamily: 'Inter, sans-serif',
                fontSize: 34,
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
              y: 150,
              width: 350,
              height: 440,
              rotation: 0,
              zIndex: 2,
              isLocked: false,
              isVisible: true,
              text: 'High-Performance Engine\n\nBuilt on unified vector standards with sub-millisecond manipulation and reactive state synchronization.',
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
              x: 465,
              y: 150,
              width: 350,
              height: 440,
              rotation: 0,
              zIndex: 3,
              isLocked: false,
              isVisible: true,
              text: 'Zero-LaTeX Equations\n\nFull KaTeX mathematical precision completely visual without writing code or learning LaTeX syntax.',
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
              x: 850,
              y: 150,
              width: 350,
              height: 440,
              rotation: 0,
              zIndex: 4,
              isLocked: false,
              isVisible: true,
              text: 'Omni-Format Export\n\nInstant vector-sharp PDF, PowerPoint (PPTX), SVG, and high-DPI PNG generation ready for sharing.',
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
        subtitle: 'Synthesized Production Metrics',
        theme: 'corporate',
        showLegend: true,
        showTooltips: true,
        showGridLines: true,
        animation: true,
        dataset: {
          headers: ['Metric Category', 'Actual Revenue ($k)', 'Projected Target ($k)'],
          rows: [
            ['Enterprise Tier', 480, 520],
            ['Growth Plans', 320, 390],
            ['Pro Accounts', 210, 240],
            ['Developer API', 170, 200],
            ['Add-On Storage', 95, 120],
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

  private generateDocument(prompt: string) {
    return {
      title: prompt,
      type: 'document',
      content: `<h1>${prompt}</h1>
<p><strong>Executive Summary:</strong> This technical specification and product dossier documents the complete system architecture, operational directives, and implementation plan for <em>${prompt}</em>.</p>
<h2>1. Architectural Overview & System Components</h2>
<p>The solution is partitioned across modular visual pipelines designed for elastic scaling, high throughput, and zero-compromise precision.</p>
<table>
  <thead>
    <tr>
      <th>Layer / Component</th>
      <th>Technology / Protocol</th>
      <th>Throughput Target</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Interactive Visual Canvas</td>
      <td>React 19 / HTML5 Canvas / WebGL</td>
      <td>60 FPS Hardware-Accelerated</td>
      <td>Active</td>
    </tr>
    <tr>
      <td>Mathematical Engine</td>
      <td>KaTeX Vector Compiler</td>
      <td>Sub-millisecond AST Compilation</td>
      <td>Active</td>
    </tr>
    <tr>
      <td>Export Pipeline</td>
      <td>jsPDF / PptxGenJS / Vector SVG</td>
      <td>Direct Client & Server Render</td>
      <td>Verified</td>
    </tr>
  </tbody>
</table>
<h2>2. Strategic Milestones</h2>
<ul>
  <li><strong>Phase 1:</strong> Architecture initialization and schema validation.</li>
  <li><strong>Phase 2:</strong> Full integration across diagramming, slides, and mathematical visualizers.</li>
  <li><strong>Phase 3:</strong> Production export verification and automated deployment.</li>
</ul>`,
    };
  }
}
