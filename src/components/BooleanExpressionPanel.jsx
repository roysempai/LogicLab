/**
 * Boolean Expression Panel — shows derived boolean expressions for each output
 */
import { useState } from 'react';
import useCircuitStore from '../store/circuitStore.js';

const BooleanExpressionPanel = () => {
  const { nodes, booleanExpressions, generateBooleanExpressions } = useCircuitStore();
  const [copied, setCopied] = useState(null);

  const outputNodes = nodes.filter(n => n.type === 'outputNode' || n.data?.gateType === 'OUTPUT');
  const inputNodes  = nodes.filter(n => n.type === 'inputNode'  || n.data?.gateType === 'INPUT');
  const hasIO = inputNodes.length > 0 && outputNodes.length > 0;

  const copyExpr = (expr, idx) => {
    navigator.clipboard.writeText(expr).then(() => {
      setCopied(idx);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid #1A1A1A',
        fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
        color: '#4B5563', textTransform: 'uppercase',
      }}>
        Boolean Expression
      </div>

      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {!hasIO ? (
          <div style={{ fontSize: 12, color: '#2D2D2D', textAlign: 'center', padding: '12px 0', lineHeight: 1.6 }}>
            🧮 Add input/output nodes and connect a circuit
          </div>
        ) : booleanExpressions.length === 0 ? (
          <div style={{ fontSize: 12, color: '#2D2D2D', textAlign: 'center', padding: '12px 0' }}>
            Click Derive to generate the expression
          </div>
        ) : (
          booleanExpressions.map((item, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', letterSpacing: '0.06em' }}>
                {item.label} =
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                background: '#0A0A0A',
                border: '1px solid #1E1E1E',
                borderRadius: 8,
                padding: '10px 12px',
              }}>
                <div style={{
                  flex: 1,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 13,
                  color: '#00FF88',
                  lineHeight: 1.6,
                  wordBreak: 'break-all',
                  textShadow: '0 0 10px rgba(0,255,136,0.3)',
                }}>
                  {item.expr}
                </div>
                <button
                  onClick={() => copyExpr(item.expr, i)}
                  title="Copy expression"
                  style={{
                    flexShrink: 0,
                    background: 'transparent',
                    border: '1px solid #2A2A2A',
                    borderRadius: 6,
                    color: copied === i ? '#00FF88' : '#4B5563',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: 11,
                    transition: 'all 0.15s',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {copied === i ? '✓' : 'Copy'}
                </button>
              </div>
            </div>
          ))
        )}

        <button
          id="btn-derive-expression"
          onClick={generateBooleanExpressions}
          disabled={!hasIO}
          style={{
            padding: '8px 0',
            borderRadius: 7,
            border: '1px solid #8B5CF644',
            background: 'rgba(139,92,246,0.08)',
            color: '#8B5CF6',
            fontSize: 12,
            fontWeight: 600,
            cursor: hasIO ? 'pointer' : 'not-allowed',
            opacity: hasIO ? 1 : 0.4,
            transition: 'all 0.15s',
            fontFamily: 'Inter, sans-serif',
            marginTop: 4,
          }}
          onMouseEnter={e => { if (hasIO) e.target.style.background = 'rgba(139,92,246,0.14)'; }}
          onMouseLeave={e => { e.target.style.background = 'rgba(139,92,246,0.08)'; }}
        >
          Derive Expression
        </button>
      </div>
    </div>
  );
};

export default BooleanExpressionPanel;
