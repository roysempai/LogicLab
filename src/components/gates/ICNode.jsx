/**
 * IC Node — renders an Integrated Circuit chip on the canvas
 * Used for HALF_ADDER, FULL_ADDER, MUX_2_1, D_FLIPFLOP
 */
import { Handle, Position } from '@xyflow/react';
import useCircuitStore from '../../store/circuitStore.js';
import { IC_CONFIGS } from './icCatalog.js';

const ICNode = ({ id, data, selected }) => {
  const expandIC = useCircuitStore(s => s.expandIC);
  const nodeOutputs = useCircuitStore(s => s.nodeOutputs);

  const gateType = data?.gateType;
  const cfg = IC_CONFIGS[gateType];
  if (!cfg) return null;

  const raw = nodeOutputs[id];
  const pinValue = (pinId) => {
    if (raw && typeof raw === 'object') return raw[pinId] ?? 0;
    return 0;
  };

  const height = Math.max(cfg.inputs.length, cfg.outputs.length) * 44 + 48;

  return (
    <div
      className="gate-node"
      style={{
        background: cfg.bg,
        borderColor: selected ? cfg.color : cfg.border,
        borderWidth: selected ? 2 : 1,
        borderStyle: 'solid',
        borderRadius: 10,
        minWidth: 120,
        width: 120,
        height,
        padding: 0,
        boxShadow: selected ? `0 0 20px ${cfg.color}33` : 'none',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'visible',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${cfg.color}22, ${cfg.color}11)`,
        borderBottom: `1px solid ${cfg.border}`,
        padding: '6px 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: '9px 9px 0 0',
      }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: cfg.color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {cfg.short}
        </span>
        {cfg.expandable && (
          <button
            onClick={() => expandIC(id)}
            title="Expand into internal gates"
            style={{
              background: 'transparent',
              border: `1px solid ${cfg.color}44`,
              borderRadius: 4,
              color: cfg.color,
              fontSize: 9,
              padding: '1px 5px',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.5,
            }}
          >
            Expand
          </button>
        )}
      </div>

      {/* Label */}
      <div style={{ textAlign: 'center', fontSize: 10, color: '#6B7280', padding: '4px 0 0', letterSpacing: '0.04em' }}>
        {cfg.label}
      </div>

      {/* Pins */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Input pins (left) */}
        {cfg.inputs.map((pin, i) => {
          const top = `${20 + (i / Math.max(cfg.inputs.length - 1, 1)) * 60}%`;
          return (
            <Handle
              key={pin.id}
              type="target"
              position={Position.Left}
              id={pin.id}
              style={{ top, background: '#1E2A35', border: `1.5px solid ${cfg.color}66`, width: 10, height: 10 }}
            >
              <span style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 9,
                color: '#9CA3AF',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}>{pin.label}</span>
            </Handle>
          );
        })}

        {/* Output pins (right) */}
        {cfg.outputs.map((pin, i) => {
          const top = `${20 + (i / Math.max(cfg.outputs.length - 1, 1)) * 60}%`;
          const val = pinValue(pin.id);
          return (
            <Handle
              key={pin.id}
              type="source"
              position={Position.Right}
              id={pin.id}
              style={{ top, background: val ? cfg.color : '#1E2A35', border: `1.5px solid ${cfg.color}66`, width: 10, height: 10 }}
            >
              <span style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 9,
                color: val ? cfg.color : '#6B7280',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}>{pin.label}</span>
            </Handle>
          );
        })}
      </div>
    </div>
  );
};

export default ICNode;
