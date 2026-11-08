'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sigma,
  Plus,
  Trash2,
  Check,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import katex from 'katex';
import { compileMathAstToLatex, VISUAL_MATH_TEMPLATES } from '@visualflow/editor-core';
import type { MathASTNode } from '@visualflow/shared-types';
import { useEditorStore } from '@/stores/editor-store';
import { createDefaultElement } from '@visualflow/document-schema';
import toast from 'react-hot-toast';

interface VisualMathModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VisualMathModal({ isOpen, onClose }: VisualMathModalProps) {
  const { addElement } = useEditorStore();

  const [activeCategory, setActiveCategory] = useState<'algebra' | 'calculus' | 'matrices' | 'greek'>('algebra');
  const [currentAst, setCurrentAst] = useState<MathASTNode>(VISUAL_MATH_TEMPLATES.quadraticFormula.ast);
  const [renderedHtml, setRenderedHtml] = useState<string>('');

  // Recompile AST to KaTeX vector HTML in real-time
  useEffect(() => {
    try {
      const internalLatex = compileMathAstToLatex(currentAst);
      const html = katex.renderToString(internalLatex, {
        displayMode: true,
        throwOnError: false,
      });
      setRenderedHtml(html);
    } catch (e) {
      console.error(e);
    }
  }, [currentAst]);

  if (!isOpen) return null;

  const handleSelectTemplate = (ast: MathASTNode) => {
    setCurrentAst(JSON.parse(JSON.stringify(ast)));
  };

  const handleInsertIntoCanvas = () => {
    const internalLatex = compileMathAstToLatex(currentAst);
    const element = createDefaultElement('equation', 300, 220, {
      name: 'Mathematical Equation',
      equationAst: currentAst,
      latex: internalLatex,
      renderedSvg: renderedHtml,
      width: 320,
      height: 90,
      style: {
        fill: '#ffffff',
        stroke: '#6366f1',
        strokeWidth: 2,
        cornerRadius: 10,
        opacity: 1,
      },
    });

    addElement(element);
    toast.success('Inserted visual equation into project');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col text-slate-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Sigma className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Visual Mathematical Equation Builder</h2>
              <p className="text-xs text-slate-400">Zero LaTeX required. Construct equations visually using high-precision vector typography.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Real-Time KaTeX Rendered Preview Area */}
          <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center min-h-[140px] relative">
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 absolute top-3 left-3 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
              Vector Typography Preview
            </span>
            <div
              className="text-2xl text-white py-4 overflow-x-auto max-w-full"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          </div>

          {/* Categorized Visual Tool Palettes */}
          <div>
            <div className="flex space-x-2 border-b border-slate-800 pb-2 mb-4">
              <button
                onClick={() => setActiveCategory('algebra')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeCategory === 'algebra' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Algebra & Polynomials
              </button>
              <button
                onClick={() => setActiveCategory('calculus')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeCategory === 'calculus' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Calculus & Integrals
              </button>
              <button
                onClick={() => setActiveCategory('matrices')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeCategory === 'matrices' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Linear Algebra & Matrices
              </button>
              <button
                onClick={() => setActiveCategory('greek')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeCategory === 'greek' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Greek Alphabet & Physics
              </button>
            </div>

            {/* ALGEBRA PRESETS */}
            {activeCategory === 'algebra' && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSelectTemplate(VISUAL_MATH_TEMPLATES.quadraticFormula.ast)}
                  className="p-3 bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-xl text-left transition-colors"
                >
                  <span className="font-bold text-xs text-white block">Quadratic Formula</span>
                  <span className="text-[11px] text-slate-400">Roots with fraction, plus-minus & radical</span>
                </button>
                <button
                  onClick={() => handleSelectTemplate(VISUAL_MATH_TEMPLATES.pythagoreanTheorem.ast)}
                  className="p-3 bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-xl text-left transition-colors"
                >
                  <span className="font-bold text-xs text-white block">Pythagorean Relation</span>
                  <span className="text-[11px] text-slate-400">a² + b² = c² geometric sum</span>
                </button>
              </div>
            )}

            {/* CALCULUS PRESETS */}
            {activeCategory === 'calculus' && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSelectTemplate(VISUAL_MATH_TEMPLATES.gaussianIntegral.ast)}
                  className="p-3 bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-xl text-left transition-colors"
                >
                  <span className="font-bold text-xs text-white block">Definite Integral</span>
                  <span className="text-[11px] text-slate-400">Integral with lower/upper limits</span>
                </button>
                <button
                  onClick={() =>
                    handleSelectTemplate({
                      id: 'lim-1',
                      type: 'limit',
                      lowerLimit: [{ id: '1', type: 'symbol', value: 'x \\to 0' }],
                      children: [
                        {
                          id: 'f1',
                          type: 'fraction',
                          numerator: [{ id: 's', type: 'symbol', value: '\\sin x' }],
                          denominator: [{ id: 'x', type: 'symbol', value: 'x' }],
                        },
                        { id: 'eq', type: 'symbol', value: '= 1' },
                      ],
                    })
                  }
                  className="p-3 bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-xl text-left transition-colors"
                >
                  <span className="font-bold text-xs text-white block">Limits & Continuity</span>
                  <span className="text-[11px] text-slate-400">lim (sin x / x) = 1</span>
                </button>
              </div>
            )}

            {/* MATRICES PRESETS */}
            {activeCategory === 'matrices' && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSelectTemplate(VISUAL_MATH_TEMPLATES.rotationMatrix.ast)}
                  className="p-3 bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-xl text-left transition-colors"
                >
                  <span className="font-bold text-xs text-white block">2x2 Rotation Matrix</span>
                  <span className="text-[11px] text-slate-400">Trigonometric matrix transformation</span>
                </button>
                <button
                  onClick={() =>
                    handleSelectTemplate({
                      id: 'identity-matrix',
                      type: 'matrix',
                      matrixRows: [
                        [{ id: '1', type: 'symbol', value: '1' }, { id: '0', type: 'symbol', value: '0' }],
                        [{ id: '0a', type: 'symbol', value: '0' }, { id: '1a', type: 'symbol', value: '1' }],
                      ],
                    })
                  }
                  className="p-3 bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-xl text-left transition-colors"
                >
                  <span className="font-bold text-xs text-white block">Identity Matrix I₂</span>
                  <span className="text-[11px] text-slate-400">Standard 2x2 identity matrix</span>
                </button>
              </div>
            )}

            {/* GREEK & PHYSICS */}
            {activeCategory === 'greek' && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSelectTemplate(VISUAL_MATH_TEMPLATES.einsteinRelativity.ast)}
                  className="p-3 bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-xl text-left transition-colors"
                >
                  <span className="font-bold text-xs text-white block">Mass-Energy Equivalence</span>
                  <span className="text-[11px] text-slate-400">E = mc² relativity formula</span>
                </button>
                <button
                  onClick={() =>
                    handleSelectTemplate({
                      id: 'schrodinger',
                      type: 'formula',
                      children: [
                        { id: 'i', type: 'symbol', value: 'i\\hbar' },
                        {
                          id: 'dpsi',
                          type: 'fraction',
                          numerator: [{ id: 'p1', type: 'symbol', value: '\\partial\\Psi' }],
                          denominator: [{ id: 'p2', type: 'symbol', value: '\\partial t' }],
                        },
                        { id: 'eq', type: 'symbol', value: '=' },
                        { id: 'h', type: 'symbol', value: '\\hat{H}\\Psi' },
                      ],
                    })
                  }
                  className="p-3 bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-xl text-left transition-colors"
                >
                  <span className="font-bold text-xs text-white block">Schrödinger Equation</span>
                  <span className="text-[11px] text-slate-400">Quantum state evolution formula</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-[11px] text-emerald-400 font-medium">
            ✓ Internal KaTeX vector synthesis ready
          </span>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleInsertIntoCanvas}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors"
            >
              Insert into Canvas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
