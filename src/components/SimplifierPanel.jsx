/**
 * Simplifier Panel — Boolean algebra simplification with step-by-step display
 * Shows original vs simplified expression and lets users toggle/stamp circuits.
 */
import { useState } from 'react';
import useCircuitStore from '../store/circuitStore.js';
import { astToString } from '../engine/expressionParser.js';

const SimplifierPanel = () => {
  const {
    expressionInput,
    originalAST, simplifiedAST, simplificationSteps, showSimplified,
    simplifyCurrentExpression, toggleSimplifiedView, stampSimplifiedCircuit,
  } = useCircuitStore();

  const [result, setResult] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [stepsVisible, setStepsVisible] = useState(false);

  const hasInput = !!expressionInput.trim();
  const hasResult = !!simplifiedAST;
  const simplifiedStr = simplifiedAST ? astToString(simplifiedAST) : '';
  const originalStr   = originalAST   ? astToString(originalAST)   : expressionInput;

  const handleSimplify = () => {
    const r = simplifyCurrentExpression(expressionInput);
    setResult(r);
    setStepsVisible(false);
  };

  const isAlreadySimple = hasResult && simplifiedStr === originalStr;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Section header */}
      <div
        onClick={() => setCollapsed(v => !v)}
        style={{
          padding: '10px 14px',
          borderTop: '1px solid #1A1A1A',
          borderBottom: collapsed ? 'none' : '1px solid #1A1A1A',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
          color: '#4B5563', textTransform: 'uppercase',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          cursor: 'pointer', userSelect: 'none',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13 }}>∴</span> Simplifier
        </span>
        <span style={{ opacity: 0.5 }}>{collapsed ? '▸' : '▾'}</span>
      </div>

      {!collapsed && (
        <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {!hasInput && (
            <div style={{ fontSize: 12, color: '#2D2D2D', textAlign: 'center', padding: '8px 0' }}>
              Type an expression in the Build tab above
            </div>
          )}

          {/* Simplify button */}
          {hasInput && (
            <button
              id="btn-simplify"
              onClick={handleSimplify}
              style={{
                padding: '8px 0', borderRadius: 7,
                border: '1px solid #06B6D444',
                background: 'rgba(6,182,212,0.08)',
                color: '#06B6D4', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={e => { e.target.style.background = 'rgba(6,182,212,0.15)'; }}
              onMouseLeave={e => { e.target.style.background = 'rgba(6,182,212,0.08)'; }}
            >
              ∴ Simplify Expression
            </button>
          )}

          {/* Result */}
          {hasResult && (
            <>
              {/* Already simple badge */}
              {isAlreadySimple && (
                <div style={{
                  background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.15)',
                  borderRadius: 8, padding: '8px 12px', fontSize: 11, color: '#00FF88', textAlign: 'center',
                }}>
                  ✓ Already in simplest form
                </div>
              )}

              {/* Expression comparison */}
              {!isAlreadySimple && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <ExprBox label="Original" expr={originalStr} color="#6B7280" />
                  <div style={{ textAlign: 'center', fontSize: 14, color: '#4B5563' }}>↓</div>
                  <ExprBox label="Simplified" expr={simplifiedStr} color="#06B6D4" glow />
                </div>
              )}

              {/* Steps toggle */}
              {simplificationSteps.length > 0 && (
                <button
                  onClick={() => setStepsVisible(v => !v)}
                  style={{
                    background: 'transparent', border: 'none', color: '#4B5563',
                    fontSize: 11, cursor: 'pointer', textAlign: 'left', padding: '2px 0',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {stepsVisible ? '▾' : '▸'} {simplificationSteps.length} simplification step{simplificationSteps.length !== 1 ? 's' : ''}
                </button>
              )}

              {stepsVisible && (
                <div style={{
                  background: '#080808', border: '1px solid #1A1A1A',
                  borderRadius: 8, padding: '10px', display: 'flex', flexDirection: 'column', gap: 8,
                  maxHeight: 200, overflowY: 'auto',
                }}>
                  {simplificationSteps.map((step, i) => (
                    <div key={i} style={{ fontSize: 10, borderLeft: '2px solid #06B6D422', paddingLeft: 8 }}>
                      <div style={{ color: '#06B6D4', fontWeight: 700, marginBottom: 2 }}>
                        {step.law}
                      </div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#6B7280' }}>
                        {step.before}
                      </div>
                      <div style={{ color: '#4B5563', margin: '2px 0' }}>→</div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9CA3AF' }}>
                        {step.after}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              {!isAlreadySimple && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    id="btn-toggle-simplified"
                    onClick={toggleSimplifiedView}
                    title={showSimplified ? 'Show original circuit' : 'Show simplified circuit'}
                    style={{
                      flex: 1, padding: '7px 0', borderRadius: 7,
                      border: `1px solid ${showSimplified ? '#06B6D4' : '#1E1E1E'}`,
                      background: showSimplified ? 'rgba(6,182,212,0.12)' : 'transparent',
                      color: showSimplified ? '#06B6D4' : '#4B5563',
                      fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      transition: 'all 0.15s', fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {showSimplified ? '⟵ Original' : '⟶ Simplified'}
                  </button>
                  <button
                    id="btn-stamp-simplified"
                    onClick={stampSimplifiedCircuit}
                    title="Add simplified circuit to canvas"
                    style={{
                      flex: 1, padding: '7px 0', borderRadius: 7,
                      border: '1px solid #06B6D444',
                      background: 'rgba(6,182,212,0.06)',
                      color: '#06B6D4',
                      fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      transition: 'all 0.15s', fontFamily: 'Inter, sans-serif',
                    }}
                    onMouseEnter={e => { e.target.style.background = 'rgba(6,182,212,0.14)'; }}
                    onMouseLeave={e => { e.target.style.background = 'rgba(6,182,212,0.06)'; }}
                  >
                    ⊕ Stamp
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const ExprBox = ({ label, expr, color, glow }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <div style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', letterSpacing: '0.06em' }}>
      {label}
    </div>
    <div style={{
      background: '#0A0A0A', border: `1px solid ${color}22`,
      borderRadius: 7, padding: '8px 12px',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 12, color,
      lineHeight: 1.5, wordBreak: 'break-all',
      textShadow: glow ? `0 0 8px ${color}55` : 'none',
    }}>
      {expr}
    </div>
  </div>
);

export default SimplifierPanel;
