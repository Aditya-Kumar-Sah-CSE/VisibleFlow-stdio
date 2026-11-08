import type { MathASTNode } from '@visualflow/shared-types';

/**
 * Compiles a visual MathAST into standard LaTeX internally.
 * The end user NEVER sees or interacts with this raw LaTeX string directly.
 */
export function compileMathAstToLatex(node: MathASTNode | undefined): string {
  if (!node) return '';

  switch (node.type) {
    case 'formula': {
      if (!node.children || node.children.length === 0) return '';
      return node.children.map(compileMathAstToLatex).join(' ');
    }

    case 'symbol':
    case 'text': {
      return node.value || '';
    }

    case 'fraction': {
      const num = (node.numerator || []).map(compileMathAstToLatex).join(' ') || '1';
      const den = (node.denominator || []).map(compileMathAstToLatex).join(' ') || '1';
      return `\\frac{${num}}{${den}}`;
    }

    case 'sqrt': {
      const rad = (node.radicand || []).map(compileMathAstToLatex).join(' ') || 'x';
      if (node.index && node.index.length > 0) {
        const idx = node.index.map(compileMathAstToLatex).join(' ');
        return `\\sqrt[${idx}]{${rad}}`;
      }
      return `\\sqrt{${rad}}`;
    }

    case 'power': {
      const base = (node.base || []).map(compileMathAstToLatex).join(' ') || 'x';
      const exp = (node.exponent || []).map(compileMathAstToLatex).join(' ') || '2';
      return `{${base}}^{${exp}}`;
    }

    case 'subscript': {
      const base = (node.base || []).map(compileMathAstToLatex).join(' ') || 'x';
      const sub = (node.subscript || []).map(compileMathAstToLatex).join(' ') || 'i';
      return `{${base}}_{${sub}}`;
    }

    case 'supersub': {
      const base = (node.base || []).map(compileMathAstToLatex).join(' ') || 'x';
      const sub = (node.subscript || []).map(compileMathAstToLatex).join(' ') || 'i';
      const exp = (node.exponent || []).map(compileMathAstToLatex).join(' ') || '2';
      return `{${base}}_{${sub}}^{${exp}}`;
    }

    case 'integral': {
      const lower = (node.lowerLimit || []).map(compileMathAstToLatex).join(' ') || 'a';
      const upper = (node.upperLimit || []).map(compileMathAstToLatex).join(' ') || 'b';
      const integrand = (node.children || []).map(compileMathAstToLatex).join(' ') || 'f(x)dx';
      return `\\int_{${lower}}^{${upper}} ${integrand}`;
    }

    case 'summation': {
      const lower = (node.lowerLimit || []).map(compileMathAstToLatex).join(' ') || 'i=1';
      const upper = (node.upperLimit || []).map(compileMathAstToLatex).join(' ') || 'n';
      const body = (node.children || []).map(compileMathAstToLatex).join(' ') || 'a_i';
      return `\\sum_{${lower}}^{${upper}} ${body}`;
    }

    case 'limit': {
      const lower = (node.lowerLimit || []).map(compileMathAstToLatex).join(' ') || 'x \\to \\infty';
      const body = (node.children || []).map(compileMathAstToLatex).join(' ') || 'f(x)';
      return `\\lim_{${lower}} ${body}`;
    }

    case 'matrix': {
      if (!node.matrixRows || node.matrixRows.length === 0) return '\\begin{pmatrix} 0 \\end{pmatrix}';
      const rows = node.matrixRows.map(row =>
        row.map(compileMathAstToLatex).join(' & ')
      );
      return `\\begin{pmatrix} ${rows.join(' \\\\ ')} \\end{pmatrix}`;
    }

    case 'parentheses': {
      const inner = (node.children || []).map(compileMathAstToLatex).join(' ');
      return `\\left( ${inner} \\right)`;
    }

    case 'brackets': {
      const inner = (node.children || []).map(compileMathAstToLatex).join(' ');
      return `\\left[ ${inner} \\right]`;
    }

    default:
      return node.value || '';
  }
}

/**
 * Predefined visual equation templates available for one-click insertion
 */
export const VISUAL_MATH_TEMPLATES: Record<string, { name: string; category: string; description: string; ast: MathASTNode }> = {
  quadraticFormula: {
    name: 'Quadratic Formula',
    category: 'Algebra',
    description: 'Roots of a quadratic equation',
    ast: {
      id: 'root-quadratic',
      type: 'formula',
      children: [
        { id: '1', type: 'symbol', value: 'x' },
        { id: '2', type: 'symbol', value: '=' },
        {
          id: '3',
          type: 'fraction',
          numerator: [
            { id: '3a', type: 'symbol', value: '-b' },
            { id: '3b', type: 'symbol', value: '\\pm' },
            {
              id: '3c',
              type: 'sqrt',
              radicand: [
                {
                  id: '3c1',
                  type: 'power',
                  base: [{ id: 'b', type: 'symbol', value: 'b' }],
                  exponent: [{ id: '2', type: 'symbol', value: '2' }],
                },
                { id: '3c2', type: 'symbol', value: '- 4ac' },
              ],
            },
          ],
          denominator: [{ id: '3d', type: 'symbol', value: '2a' }],
        },
      ],
    },
  },
  pythagoreanTheorem: {
    name: 'Pythagorean Theorem',
    category: 'Geometry',
    description: 'Relation in a right triangle',
    ast: {
      id: 'root-pythagoras',
      type: 'formula',
      children: [
        {
          id: '1',
          type: 'power',
          base: [{ id: 'a', type: 'symbol', value: 'a' }],
          exponent: [{ id: '2', type: 'symbol', value: '2' }],
        },
        { id: 'plus', type: 'symbol', value: '+' },
        {
          id: '2',
          type: 'power',
          base: [{ id: 'b', type: 'symbol', value: 'b' }],
          exponent: [{ id: '2', type: 'symbol', value: '2' }],
        },
        { id: 'eq', type: 'symbol', value: '=' },
        {
          id: '3',
          type: 'power',
          base: [{ id: 'c', type: 'symbol', value: 'c' }],
          exponent: [{ id: '2', type: 'symbol', value: '2' }],
        },
      ],
    },
  },
  gaussianIntegral: {
    name: 'Definite Integral',
    category: 'Calculus',
    description: 'Standard calculus definite integral',
    ast: {
      id: 'root-integral',
      type: 'integral',
      lowerLimit: [{ id: 'l', type: 'symbol', value: '0' }],
      upperLimit: [{ id: 'u', type: 'symbol', value: '\\infty' }],
      children: [
        {
          id: 'intg',
          type: 'power',
          base: [{ id: 'e', type: 'symbol', value: 'e' }],
          exponent: [{ id: 'exp', type: 'symbol', value: '-x^2' }],
        },
        { id: 'dx', type: 'symbol', value: 'dx' },
        { id: 'eq', type: 'symbol', value: '=' },
        {
          id: 'res',
          type: 'fraction',
          numerator: [
            {
              id: 'sqpi',
              type: 'sqrt',
              radicand: [{ id: 'pi', type: 'symbol', value: '\\pi' }],
            },
          ],
          denominator: [{ id: 'two', type: 'symbol', value: '2' }],
        },
      ],
    },
  },
  einsteinRelativity: {
    name: 'Mass-Energy Equivalence',
    category: 'Physics',
    description: 'Einstein famous mass-energy formula',
    ast: {
      id: 'root-einstein',
      type: 'formula',
      children: [
        { id: 'e', type: 'symbol', value: 'E' },
        { id: 'eq', type: 'symbol', value: '=' },
        { id: 'm', type: 'symbol', value: 'm' },
        {
          id: 'c2',
          type: 'power',
          base: [{ id: 'c', type: 'symbol', value: 'c' }],
          exponent: [{ id: '2', type: 'symbol', value: '2' }],
        },
      ],
    },
  },
  rotationMatrix: {
    name: '2D Rotation Matrix',
    category: 'Linear Algebra',
    description: 'Standard 2x2 coordinate rotation matrix',
    ast: {
      id: 'root-matrix',
      type: 'matrix',
      matrixRows: [
        [
          { id: 'm11', type: 'symbol', value: '\\cos\\theta' },
          { id: 'm12', type: 'symbol', value: '-\\sin\\theta' },
        ],
        [
          { id: 'm21', type: 'symbol', value: '\\sin\\theta' },
          { id: 'm22', type: 'symbol', value: '\\cos\\theta' },
        ],
      ],
    },
  },
};

export const compileMathASTToLatex = compileMathAstToLatex;

