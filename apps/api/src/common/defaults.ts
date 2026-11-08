export function createDefaultProject(type: string, title = 'Untitled Project') {
  const pageId = 'page-' + Math.random().toString(36).substring(2, 9);
  const now = new Date().toISOString();

  let defaultWidth = 1200;
  let defaultHeight = 800;

  if (type === 'document') {
    defaultWidth = 794;
    defaultHeight = 1123;
  } else if (type === 'slide') {
    defaultWidth = 1280;
    defaultHeight = 720;
  } else if (type === 'flowchart' || type === 'diagram') {
    defaultWidth = 1600;
    defaultHeight = 1000;
  } else if (type === 'chart') {
    defaultWidth = 1000;
    defaultHeight = 650;
  }

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
    pages: [
      {
        id: pageId,
        order: 0,
        name: 'Page 1',
        width: defaultWidth,
        height: defaultHeight,
        unit: 'px',
        background: { type: 'solid', color: '#ffffff' },
        elements: [],
        nodes: [],
        edges: [],
      },
    ],
    assets: [],
    metadata: {},
  };
}

export const VISUAL_MATH_TEMPLATES: Record<string, any> = {
  quadraticFormula: {
    name: 'Quadratic Formula',
    category: 'Algebra',
    description: 'Roots of a quadratic equation',
    latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
  },
  pythagoreanTheorem: {
    name: 'Pythagorean Theorem',
    category: 'Geometry',
    description: 'Relation in a right triangle',
    latex: 'a^2 + b^2 = c^2',
  },
  gaussianIntegral: {
    name: 'Definite Integral',
    category: 'Calculus',
    description: 'Standard calculus definite integral',
    latex: '\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}',
  },
  einsteinRelativity: {
    name: 'Mass-Energy Equivalence',
    category: 'Physics',
    description: 'Einstein famous mass-energy formula',
    latex: 'E = mc^2',
  },
  rotationMatrix: {
    name: '2D Rotation Matrix',
    category: 'Linear Algebra',
    description: 'Standard 2x2 coordinate rotation matrix',
    latex: '\\begin{pmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{pmatrix}',
  },
};
