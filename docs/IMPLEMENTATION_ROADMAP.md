# VisualFlow Studio - Implementation Roadmap

This document outlines the six-phase execution plan for building VisualFlow Studio from initial setup to a complete, commercial-grade visual creation platform.

---

## Phase 1: Foundation, Core Monorepo, Auth, Dashboard & Universal Canvas
- [ ] **1.1 Workspace Setup & Monorepo Configuration**
  - Setup pnpm workspace with `apps/web`, `apps/api`, `packages/shared-types`, `packages/document-schema`, `packages/editor-core`, `packages/rendering`, `packages/ui`.
  - TypeScript, ESLint, Prettier, Tailwind CSS, shadcn/ui configuration.
- [ ] **1.2 NestJS Backend Core & Prisma Database**
  - NestJS modular structure with Swagger OpenAPI.
  - Prisma schema (`User`, `Project`, `ProjectPage`, `Folder`, `Template`, `Asset`, `ExportJob`).
  - Auth module (JWT, Supabase Auth integration, session guards, user context).
  - Projects CRUD with versioning, debounced autosave endpoint, ownership guards.
- [ ] **1.3 Premium Landing Page & SaaS Dashboard**
  - Landing page with Hero, Interactive Visual Showcase, Feature Matrix, Templates, CTA, Footer.
  - Dashboard: Project grid with live thumbnails, Studio selector, Recent/Starred, Folders, Search, Duplicate, Rename, Delete.
- [ ] **1.4 Universal Visual Canvas Engine**
  - Left Element Library: Text, Shapes (Rect, Circle, Triangle, Star, Polygon, Callout), Arrows, Connectors, Icons, Media.
  - Center Canvas: Konva/React-Konva infinite canvas with pan, zoom (10%-400%), snap-to-grid, alignment smart guides, multi-select, group/ungroup, layer reordering (bring to front, send to back), keyboard shortcuts, undo/redo history.
  - Right Properties Panel: Context-sensitive inspector (Typography, Fill, Stroke, Shadows, Opacity, Radii, Transforms).

---

## Phase 2: Flowchart & Diagram Studio (React Flow + Auto-Layout)
- [ ] **2.1 Dedicated Flowchart Studio**
  - React Flow integration with custom styled nodes (Start/End, Process, Decision, Database, Input/Output, Document, Cloud).
  - Smart connectors: Curved bezier, Orthogonal step, Straight with customizable arrowheads and connection handles.
  - Interactive label editing and inline node formatting.
- [ ] **2.2 Diagram Studio & Auto-Layout**
  - UML, ER diagrams, Cloud Architecture node sets.
  - Auto-layout integration (Dagre / ELK graph layout) for one-click clean layout organizing.
  - Mini-map, background grid customization, and SVG/PNG vector exports.

---

## Phase 3: Document Studio & Hidden LaTeX Equation Engine
- [ ] **3.1 Document Studio**
  - Real A4, Letter, and custom page geometry with authentic margin management.
  - Tiptap / ProseMirror rich text integration (Headings 1-4, Paragraphs, Lists, Blockquotes, Code blocks, Tables, Images).
  - Page-break engine with dynamic page counting, headers, footers, and page numbers.
- [ ] **3.2 Hidden LaTeX Engine & Visual Math Builder**
  - Visual math palette: Fractions, Roots, Powers, Integrals, Summations, Matrices, Greek alphabet, Calculus symbols.
  - Real-time compilation from visual AST to KaTeX vector SVG rendering.
  - Zero raw LaTeX exposed to end-users; fully editable visual formula blocks.
  - PDF export with print CSS and high-fidelity typography.

---

## Phase 4: Chart Studio & Live Data Grid
- [ ] **4.1 Apache ECharts Integration**
  - Comprehensive chart types: Bar, Horizontal Bar, Line, Smooth Line, Area, Pie, Donut, Scatter, Radar, Heatmap, Candlestick, Waterfall.
  - ECharts theme presets: Modern Dark, Elegant Light, Vibrant, Pastel, Monochrome, Corporate.
- [ ] **4.2 Tabular Data Editor & Importers**
  - Spreadsheet-like data grid for editing chart series and categories.
  - CSV and Excel file parsing (PapaParse / XLSX) with auto-column mapping.
  - Dynamic customization of legend, axes, tooltips, animation speed, and data labels.

---

## Phase 5: Slide Studio & Presentation Engine
- [ ] **5.1 Presentation Editor**
  - Slide thumbnail drawer with reorder, add, duplicate, delete.
  - Slide aspect ratios (16:9 widescreen, 4:3 standard, custom).
  - Pre-styled slide layouts (Title, Two-column, Metric showcase, Big quote, Comparison).
  - Slide backgrounds (Solid, Gradient, Image).
- [ ] **5.2 Presenter Mode & PPTX Export**
  - Full-screen presentation runner with slide transitions, timer, and presenter notes.
  - Native PPTX export using PptxGenJS (editable shapes, text frames, images).

---

## Phase 6: PDF Studio, AI Assistant, Collaboration & Final Polish
- [ ] **6.1 PDF Studio & Management**
  - PDF document viewer, page reorder, split, merge, page rotation, and markup annotations.
- [ ] **6.2 Provider-Independent AI Assistant**
  - Structured prompt-to-project generator (Prompt -> Validated JSON -> Studio Project).
  - Conversational AI sidebar for copy improvement, diagram drafting, and chart synthesis.
- [ ] **6.3 Real-Time Collaboration & Presence**
  - WebSocket collaboration gateway for multiplayer cursor tracking and live state sync.
- [ ] **6.4 End-to-End Verification & Production Build**
  - Monorepo production build, TypeScript verification, linting, and automated test suite.
