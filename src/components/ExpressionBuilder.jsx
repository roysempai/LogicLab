/**
 * Expression Builder Panel — two tabs: Build (expression→circuit) and Derive (circuit→expression)
 */
import { useState } from 'react';
import useCircuitStore from '../store/circuitStore.js';

const EXAMPLES = [
  'A AND B',
  '(A OR B) AND NOT C',
  'A XOR B',
  'NOT (A AND B)',
  'A AND (B OR C)',
];

const SyntaxHint = () => (
  <div style={{
    background: '#0A0A0A',
    border: '1px solid #1A1A1A',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 11,
    color: '#4B5563',
    lineHeight: 1.8,
  }}>
    <div style={{ color: '#6B7280', fontWeight: 700, marginBottom: 4, fontSize: 10 }}>SYNTAX</div>
    <div><span style={{ color: '#8B5CF6' }}>AND</span>, <span style={{ color: '#3B82F6' }}>OR</span>, <span style={{ color: '#EC4899' }}>NOT</span>, <span style={{ color: '#10B981' }}>XOR</span>, <span style={{ color: '#F59E0B' }}>NAND</span>, <span style={{ color: '#EF4444' }}>NOR</span>, <span style={{ color: '#06B6D4' }}>XNOR</span></div>
    <div style={{ marginTop: 4 }}>Symbols: <code style={{ color: '#9CA3AF' }}>· + ¬ ⊕ ! ~</code></div>
    <div>Variables: <code style={{ color: '#9CA3AF' }}>A B Cin A1</code></div>
    <div>Parens: <code style={{ color: '#9CA3AF' }}>(A OR B) AND C</code></div>
  </div>
);

const BuildTab = () => {
  const {
    expressionInput, expressionError,
    setExpressionInput, buildCircuitFromExpression,
  } = useCircuitStore();
  const [showHint, setShowHint] = useState(false);

  const handleBuild = () => {
    buildCircuitFromExpression(expressionInput);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleBuild();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Textarea */}
      <textarea
        id="expression-input"
        value={expressionInput}
        onChange={e => setExpressionInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="e.g. A AND B OR NOT C"
        rows={3}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          background: '#0A0A0A',
          border: `1px solid ${expressionError ? '#EF444444' : '#1E1E1E'}`,
          borderRadius: 8,
          padding: '10px 12px',
          color: '#E5E7EB',
          fontSize: 13,
          fontFamily: 'JetBrains Mono, monospace',
          resize: 'vertical',
          outline: 'none',
          lineHeight: 1.6,
          transition: 'border-color 0.15s',
        }}
        onFocus={e => { e.target.style.borderColor = '#8B5CF644'; }}
        onBlur={e => { e.target.style.borderColor = expressionError ? '#EF444444' : '#1E1E1E'; }}
      />

      {/* Error */}
      {expressionError && (
        <div style={{ fontSize: 11, color: '#EF4444', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
          <span>⚠</span>
          <span>{expressionError}</span>
        </div>
      )}

      {/* Examples */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {EXAMPLES.map(ex => (
          <button
            key={ex}
            onClick={() => setExpressionInput(ex)}
            style={{
              background: 'rgba(139,92,246,0.06)',
              border: '1px solid #8B5CF622',
              borderRadius: 5,
              color: '#6B7280',
              fontSize: 10,
              padding: '2px 7px',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.target.style.color = '#8B5CF6'; e.target.style.borderColor = '#8B5CF644'; }}
            onMouseLeave={e => { e.target.style.color = '#6B7280'; e.target.style.borderColor = '#8B5CF622'; }}
          >
            {ex}
          </button>
        ))}
      </div>

      {/* Syntax hint toggle */}
      <button
        onClick={() => setShowHint(v => !v)}
        style={{
          background: 'transparent', border: 'none', color: '#4B5563',
          fontSize: 11, cursor: 'pointer', textAlign: 'left', padding: 0,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {showHint ? '▾ Hide syntax guide' : '▸ Syntax guide'}
      </button>
      {showHint && <SyntaxHint />}

      {/* Build button */}
      <button
        id="btn-build-circuit"
        onClick={handleBuild}
        disabled={!expressionInput.trim()}
        style={{
          padding: '9px 0',
          borderRadius: 8,
          border: '1px solid #8B5CF644',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.1))',
          color: '#8B5CF6',
          fontSize: 13, fontWeight: 700,
          cursor: expressionInput.trim() ? 'pointer' : 'not-allowed',
          opacity: expressionInput.trim() ? 1 : 0.4,
          transition: 'all 0.2s',
          fontFamily: 'Inter, sans-serif',
          letterSpacing: '0.02em',
        }}
        onMouseEnter={e => { if (expressionInput.trim()) e.target.style.background = 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(59,130,246,0.18))'; }}
        onMouseLeave={e => { e.target.style.background = 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.1))'; }}
      >
        ⚡ Build Circuit
      </button>
      <div style={{ fontSize: 10, color: '#2D2D2D', textAlign: 'center' }}>Ctrl+Enter to build</div>
    </div>
  );
};

const DeriveTab = () => {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
              display: 'flex', alignItems: 'flex-start', gap: 8,
              background: '#0A0A0A', border: '1px solid #1E1E1E',
              borderRadius: 8, padding: '10px 12px',
            }}>
              <div style={{
                flex: 1, fontFamily: 'JetBrains Mono, monospace',
                fontSize: 13, color: '#00FF88', lineHeight: 1.6,
                wordBreak: 'break-all', textShadow: '0 0 10px rgba(0,255,136,0.3)',
              }}>
                {item.expr}
              </div>
              <button
                onClick={() => copyExpr(item.expr, i)}
                style={{
                  flexShrink: 0, background: 'transparent',
                  border: '1px solid #2A2A2A', borderRadius: 6,
                  color: copied === i ? '#00FF88' : '#4B5563',
                  padding: '4px 8px', cursor: 'pointer',
                  fontSize: 11, transition: 'all 0.15s',
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
          padding: '8px 0', borderRadius: 7,
          border: '1px solid #8B5CF644',
          background: 'rgba(139,92,246,0.08)',
          color: '#8B5CF6', fontSize: 12, fontWeight: 600,
          cursor: hasIO ? 'pointer' : 'not-allowed',
          opacity: hasIO ? 1 : 0.4,
          transition: 'all 0.15s', fontFamily: 'Inter, sans-serif', marginTop: 4,
        }}
        onMouseEnter={e => { if (hasIO) e.target.style.background = 'rgba(139,92,246,0.14)'; }}
        onMouseLeave={e => { e.target.style.background = 'rgba(139,92,246,0.08)'; }}
      >
        Derive Expression
      </button>
    </div>
  );
};

const ExpressionBuilder = () => {
  const [tab, setTab] = useState('build');

  const tabStyle = (active) => ({
    flex: 1, padding: '8px 0', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
    textTransform: 'uppercase', cursor: 'pointer',
    background: active ? 'rgba(139,92,246,0.12)' : 'transparent',
    border: 'none', borderBottom: active ? '2px solid #8B5CF6' : '2px solid transparent',
    color: active ? '#8B5CF6' : '#374151',
    transition: 'all 0.15s', fontFamily: 'Inter, sans-serif',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px 0',
        borderBottom: '1px solid #1A1A1A',
        fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
        color: '#4B5563', textTransform: 'uppercase',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 13 }}>𝑓</span> Boolean Expression
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1A1A1A' }}>
        <button style={tabStyle(tab === 'build')} onClick={() => setTab('build')}>Build</button>
        <button style={tabStyle(tab === 'derive')} onClick={() => setTab('derive')}>Derive</button>
      </div>

      <div style={{ padding: 12 }}>
        {tab === 'build' ? <BuildTab /> : <DeriveTab />}
      </div>
    </div>
  );
};

export default ExpressionBuilder;
