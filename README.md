# VisualFlow Studio

> **All-in-One Visual Document, PDF, Presentation, Diagram & Chart Creation Platform**

VisualFlow Studio is a unified, commercial-grade visual authoring platform designed for creators, engineers, researchers, and product teams. Inspired by Figma, Canva, Linear, Miro, and Notion, it enables users to build high-impact technical documents, publication-grade PDFs, investor pitch decks, node-based flowcharts, architectural diagrams, and interactive charts **without writing any code or raw LaTeX**.

---

## 🌟 The 5 Specialized Studios

VisualFlow Studio provides five specialized studios sharing a single universal JSON project and rendering schema:

| Studio | Core Engine | Complementary Libraries | Primary Use Cases |
|---|---|---|---|
| **Document Studio** | **Tiptap / ProseMirror** | KaTeX, Canvas plugins | Paged A4/Letter rich-text flow, continuous margins, real headers/footers, footnotes, visual math blocks |
| **Slide Studio** | **React-Konva** | Fabric.js / PptxGenJS | 16:9 & 4:3 presentation slides, transitions, presenter mode with speaker notes, native PPTX exports |
| **Flowchart Studio** | **React Flow** | Dagre, ELK.js, Smoothstep | Interactive node-based logic flows (Start/End, Process, Decision, Cloud, Database), auto-layout, mini-map |
| **Diagram Studio** | **React Flow + Shapes** | SVG vector connectors | UML class diagrams, ER database schemas, microservice architectures, cloud infrastructure topologies |
| **Chart Studio** | **Apache ECharts** | PapaParse, Live Data Grid | Bar, line, area, pie, donut, scatter, radar charts, live tabular data editor, CSV/Excel import |

### 🔬 Zero-LaTeX Mathematical Equation Engine
**Users must NEVER be required to write or understand LaTeX.**
- **Visual Palette**: Categorized palettes for Fractions, Roots, Powers, Subscripts, Definite Integrals, Summations, Limits, Matrices, and Greek Symbols.
- **Visual AST**: Construct equations interactively; the engine internally synthesizes sanitized LaTeX and renders vector-perfect KaTeX SVG typography.
- **Editable Output**: Equations are saved as structured MathAST nodes, remaining editable visually at any point.

---

## 🏗️ Architecture & Monorepo Structure

```
visualflow-studio/
├── apps/
│   ├── web/                     # Next.js 15 App Router frontend (Port 3000)
│   │   ├── app/
│   │   │   ├── (auth)/          # Authentication & One-Click Demo
│   │   │   ├── (dashboard)/     # Projects explorer, filters, studio launchers
│   │   │   ├── studio/[id]/     # Universal studio workspace
│   │   │   └── page.tsx         # Modern SaaS landing page
│   │   ├── components/studio/   # StudioNavbar, ElementLibrary, PropertiesPanel
│   │   │   ├── renderers/       # KonvaCanvas, Flowchart, Document, Chart renderers
│   │   │   └── modals/          # VisualMathModal, AIAssistantDrawer, ExportModal, PresenterModeModal
│   │   └── stores/              # Zustand editor store with history undo/redo
│   └── api/                     # NestJS Core Backend (Port 4000)
│       ├── src/
│       │   ├── auth/            # JWT, session guards, demo user auto-provisioning
│       │   ├── projects/        # Project CRUD, versioning, debounced autosave
│       │   ├── templates/       # Prebuilt multi-studio templates catalog
│       │   ├── exports/         # Multi-format exports (PDF, PPTX, PNG, SVG)
│       │   ├── ai/              # Provider-independent structured JSON assistant
│       │   └── database/        # Prisma module & client
│       └── prisma/              # Prisma schema & SQLite / PostgreSQL migrations
├── packages/
│   ├── shared-types/            # Canonical TypeScript interfaces & types
│   ├── document-schema/         # Universal Project JSON Schema & Zod validators
│   └── editor-core/             # Undo/redo stack, transform geometry, math compiler, layer ordering
├── docs/                        # Architecture, Implementation Roadmap & Progress ledger
└── pnpm-workspace.yaml          # Monorepo configuration
```

---

## 🚀 Quick Start & Development

### Prerequisites
- **Node.js** >= 20.x (Tested on v24)
- **pnpm** >= 10.x (Installed globally via `npm install -g pnpm`)

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Initialize Database
```bash
cd apps/api
npx prisma db push
```

### 3. Build Core Packages
```bash
pnpm --filter @visualflow/shared-types build
pnpm --filter @visualflow/document-schema build
pnpm --filter @visualflow/editor-core build
```

### 4. Run Both Frontend & Backend
You can run both concurrently from the root:
```bash
# Start NestJS API (Port 4000)
pnpm --filter @visualflow/api dev

# In another terminal, start Next.js Web (Port 3000)
pnpm --filter @visualflow/web dev
```

- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:4000/api](http://localhost:4000/api)
- **Swagger Documentation**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

---

## 🛡️ Enterprise Security & Resilience

1. **Authentication & Authorization**: Bearer JWT tokens with password hashing via `bcryptjs`, project ownership checks on every read and mutation.
2. **Offline Resilience**: Automatic client-side fallback if the backend is temporarily offline; projects automatically cache in `localStorage` and synchronize seamlessly.
3. **Smart Debounced Autosave**: 1.5-second inactivity timer preventing database overload while ensuring zero work loss.
4. **Structured AI Validation**: AI outputs strictly validated against Zod schemas; zero raw unsanitized HTML execution.

---

## 📄 License
MIT © VisualFlow Studio

