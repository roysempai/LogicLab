/**
 * Output Node — LED-style indicator showing computed circuit output
 */
import { Handle, Position } from '@xyflow/react';
import useCircuitStore from '../../store/circuitStore.js';

const OutputNode = ({ id, data, selected }) => {
  const nodeOutputs = useCircuitStore(s => s.nodeOutputs);
  const value = nodeOutputs[id] ?? 0;
  const isHigh = value === 1;

  return (
    <div
      className={`output-node ${isHigh ? 'high' : 'low'}`}
      style={{
        borderColor: selected
          ? (isHigh ? '#00FF88' : '#2A2A2A')
          : (isHigh ? '#00FF8888' : '#2A2A2A'),
        boxShadow: selected
          ? `0 0 0 2px #00FF88, 0 0 24px rgba(0,255,136,0.3)`
          : isHigh ? '0 0 20px rgba(0,255,136,0.3)' : 'none',
        minWidth: 80,
      }}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="a"
        style={{
          background: isHigh ? '#00FF88' : '#1A1A1A',
          borderColor: isHigh ? '#00FF88' : '#333333',
        }}
      />

      {/* Label */}
      <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 8, textTransform: 'uppercase', textAlign: 'center' }}>
        {data.label || 'OUT'}
      </div>

      {/* LED */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        {/* Outer ring */}
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: isHigh
            ? 'radial-gradient(circle, rgba(0,255,136,0.2), rgba(0,255,136,0.05))'
            : 'rgba(20,20,20,0.5)',
          border: `2px solid ${isHigh ? '#00FF88' : '#222222'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.25s ease',
          boxShadow: isHigh ? '0 0 20px rgba(0,255,136,0.5), inset 0 0 10px rgba(0,255,136,0.2)' : 'none',
        }}>
          {/* Inner LED */}
          <div className={`led ${isHigh ? 'on' : 'off'}`} style={{ width: 20, height: 20 }} />
        </div>

        {/* Value */}
        <span style={{
          fontSize: 20,
          fontWeight: 800,
          fontFamily: 'JetBrains Mono, monospace',
          color: isHigh ? '#00FF88' : '#2A2A2A',
          transition: 'all 0.2s ease',
          textShadow: isHigh ? '0 0 12px rgba(0,255,136,0.8)' : 'none',
        }}>
          {value}
        </span>
      </div>
    </div>
  );
};

export default OutputNode;
