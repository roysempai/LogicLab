/**
 * Input Node — a toggleable switch (click to flip 0/1)
 */
import { Handle, Position } from '@xyflow/react';
import useCircuitStore from '../../store/circuitStore.js';

const InputNode = ({ id, data, selected }) => {
  const toggleInput = useCircuitStore(s => s.toggleInput);
  const nodeOutputs = useCircuitStore(s => s.nodeOutputs);
  const value = nodeOutputs[id] ?? data.value ?? 0;
  const isHigh = value === 1;

  return (
    <div
      className={`input-node ${isHigh ? 'high' : 'low'}`}
      style={{
        borderColor: selected
          ? (isHigh ? '#00FF88' : '#EF4444')
          : (isHigh ? '#00FF8888' : '#EF444444'),
        boxShadow: selected
          ? `0 0 0 2px ${isHigh ? '#00FF88' : '#EF4444'}, 0 0 20px ${isHigh ? '#00FF8844' : '#EF444422'}`
          : 'none',
        cursor: 'pointer',
        userSelect: 'none',
        minWidth: 72,
      }}
      onDoubleClick={() => toggleInput(id)}
    >
      {/* Label */}
      <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 4, textTransform: 'uppercase' }}>
        {data.label || 'IN'}
      </div>

      {/* Toggle switch visual */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        {/* Track */}
        <div style={{
          width: 36,
          height: 20,
          borderRadius: 10,
          background: isHigh ? 'rgba(0,255,136,0.15)' : 'rgba(239,68,68,0.1)',
          border: `1.5px solid ${isHigh ? '#00FF88' : '#EF4444'}`,
          position: 'relative',
          transition: 'all 0.2s ease',
          flexShrink: 0,
        }}>
          {/* Knob */}
          <div style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: isHigh ? '#00FF88' : '#EF4444',
            position: 'absolute',
            top: 2,
            left: isHigh ? 18 : 2,
            transition: 'all 0.2s ease',
            boxShadow: isHigh ? '0 0 8px rgba(0,255,136,0.8)' : '0 0 6px rgba(239,68,68,0.5)',
          }} />
        </div>
        {/* Value badge */}
        <span style={{
          fontSize: 16,
          fontWeight: 800,
          fontFamily: 'JetBrains Mono, monospace',
          color: isHigh ? '#00FF88' : '#EF4444',
          lineHeight: 1,
        }}>
          {value}
        </span>
      </div>

      <div style={{ fontSize: 9, color: '#4B5563', marginTop: 3, textAlign: 'center' }}>
        double-click to toggle
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={{
          background: isHigh ? '#00FF88' : '#1A1A1A',
          borderColor: isHigh ? '#00FF88' : '#333333',
        }}
      />
    </div>
  );
};

export default InputNode;
