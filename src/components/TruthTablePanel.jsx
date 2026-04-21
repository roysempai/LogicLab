/**
 * Truth Table Panel — auto-generated truth table with active row highlighting
 */
import { useState } from 'react';
import useCircuitStore from '../store/circuitStore.js';

const TruthTablePanel = () => {
  const {
    nodes, truthTable, nodeOutputs,
    generateTruthTable, exportTruthTableCSV,
  } = useCircuitStore();

  const [autoUpdate, setAutoUpdate] = useState(false);

  const inputNodes = nodes.filter(n => n.type === 'inputNode' || n.data?.gateType === 'INPUT');
  const outputNodes = nodes.filter(n => n.type === 'outputNode' || n.data?.gateType === 'OUTPUT');
  const hasIO = inputNodes.length > 0 && outputNodes.length > 0;
  const tooManyInputs = inputNodes.length > 5;

  // Find the currently active row index
  const findActiveRow = () => {
    if (!truthTable?.rows?.length) return -1;
    const currentInputs = inputNodes.map(n => nodeOutputs[n.id] ?? n.data?.value ?? 0);
    return truthTable.rows.findIndex(row =>
      row.inputs.every((v, i) => v === currentInputs[i])
    );
  };

  const activeRow = findActiveRow();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid #1A1A1A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#4B5563', textTransform: 'uppercase' }}>
          Truth Table
        </span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {/* Auto-update toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontSize: 11, color: '#4B5563' }}>
            <div
              onClick={() => setAutoUpdate(v => !v)}
              style={{
                width: 28, height: 16, borderRadius: 8,
                background: autoUpdate ? 'rgba(0,255,136,0.2)' : '#1A1A1A',
                border: `1px solid ${autoUpdate ? '#00FF88' : '#2A2A2A'}`,
                position: 'relative', cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: autoUpdate ? '#00FF88' : '#333',
                position: 'absolute', top: 2,
                left: autoUpdate ? 14 : 2, transition: 'all 0.2s',
              }} />
            </div>
            Auto
          </label>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        {!hasIO ? (
          <EmptyState text="Add Input and Output nodes, then generate the table" />
        ) : tooManyInputs ? (
          <EmptyState text="Max 5 inputs supported for truth table" warn />
        ) : !truthTable ? (
          <EmptyState text="Click Generate to build the truth table" />
        ) : truthTable.error ? (
          <EmptyState text={truthTable.error} warn />
        ) : (
          <table className="truth-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                {truthTable.headers.map((h, i) => {
                  const isOutput = i >= (truthTable.inputIds?.length ?? 0);
                  return (
                    <th key={i} style={{
                      color: isOutput ? '#00FF88' : '#9CA3AF',
                      background: isOutput ? 'rgba(0,255,136,0.05)' : '#1A1A1A',
                    }}>
                      {h}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {truthTable.rows.map((row, ri) => {
                const isActive = ri === activeRow;
                return (
                  <tr key={ri} className={isActive ? 'active-row' : ''}>
                    {row.inputs.map((v, i) => (
                      <td key={`in-${i}`}>{v}</td>
                    ))}
                    {row.outputs.map((v, i) => (
                      <td
                        key={`out-${i}`}
                        className={`output-col ${v === 0 ? 'zero' : ''}`}
                      >
                        {v}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer buttons */}
      <div style={{
        padding: '10px 12px',
        borderTop: '1px solid #1A1A1A',
        display: 'flex',
        gap: 6,
        flexShrink: 0,
      }}>
        <button
          id="btn-generate-truth-table"
          onClick={generateTruthTable}
          disabled={!hasIO || tooManyInputs}
          style={{
            flex: 1,
            padding: '8px 0',
            borderRadius: 7,
            border: '1px solid #00FF8844',
            background: 'rgba(0,255,136,0.08)',
            color: '#00FF88',
            fontSize: 12,
            fontWeight: 600,
            cursor: hasIO && !tooManyInputs ? 'pointer' : 'not-allowed',
            opacity: hasIO && !tooManyInputs ? 1 : 0.4,
            transition: 'all 0.15s',
            fontFamily: 'Inter, sans-serif',
          }}
          onMouseEnter={e => e.target.style.background = 'rgba(0,255,136,0.14)'}
          onMouseLeave={e => e.target.style.background = 'rgba(0,255,136,0.08)'}
        >
          Generate
        </button>
        {truthTable?.rows?.length > 0 && (
          <button
            id="btn-export-csv"
            onClick={exportTruthTableCSV}
            style={{
              padding: '8px 12px',
              borderRadius: 7,
              border: '1px solid #2A2A2A',
              background: 'transparent',
              color: '#6B7280',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontFamily: 'Inter, sans-serif',
            }}
            onMouseEnter={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.color = '#3B82F6'; }}
            onMouseLeave={e => { e.target.style.borderColor = '#2A2A2A'; e.target.style.color = '#6B7280'; }}
          >
            CSV
          </button>
        )}
      </div>
    </div>
  );
};

const EmptyState = ({ text, warn }) => (
  <div style={{
    textAlign: 'center',
    padding: '24px 12px',
    color: warn ? '#F59E0B' : '#2D2D2D',
    fontSize: 12,
    lineHeight: 1.6,
  }}>
    <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>{warn ? '⚠️' : '📊'}</div>
    {text}
  </div>
);

export default TruthTablePanel;
