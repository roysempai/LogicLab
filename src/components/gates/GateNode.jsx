/**
 * Generic Gate Node — renders any 2-input logic gate on the canvas
 * Used for AND, OR, NAND, NOR, XOR, XNOR
 */
import { Handle, Position } from '@xyflow/react';
import { GateIcon, GATE_COLORS } from './GateIcons.jsx';
import useCircuitStore from '../../store/circuitStore.js';

const GateNode = ({ data, selected }) => {
  const nodeOutputs = useCircuitStore(s => s.nodeOutputs);
  const isActive = nodeOutputs[data.nodeId] === 1;
  const colors = GATE_COLORS[data.gateType] || GATE_COLORS.AND;

  const handles = data.inputHandles || ['a', 'b'];

  return (
    <div
      className="gate-node"
      style={{
        borderColor: selected ? colors.accent : (isActive ? colors.accent + '88' : '#2A2A2A'),
        boxShadow: isActive ? `0 0 16px ${colors.accent}33` : 'none',
        background: colors.bg,
        minWidth: 80,
        minHeight: 60,
      }}
    >
      {/* Input Handles */}
      {handles.map((handle, i) => {
        const total = handles.length;
        const top = total === 1 ? 50 : 20 + (i / (total - 1)) * 60;
        return (
          <Handle
            key={handle}
            type="target"
            position={Position.Left}
            id={handle}
            style={{ top: `${top}%`, background: isActive ? colors.accent : '#1A1A1A' }}
          />
        );
      })}

      {/* Gate Icon */}
      <GateIcon type={data.gateType} size={38} color={isActive ? colors.accent : colors.icon} />

      {/* Label */}
      <div className="gate-node-label" style={{ color: isActive ? colors.accent : '#4B5563' }}>
        {data.gateType}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={{ background: isActive ? colors.accent : '#1A1A1A' }}
      />
    </div>
  );
};

// Specific gate node wrappers
export const AndGateNode  = (props) => <GateNode {...props} data={{ ...props.data, gateType: 'AND',  inputHandles: ['a','b'], nodeId: props.id }} />;
export const OrGateNode   = (props) => <GateNode {...props} data={{ ...props.data, gateType: 'OR',   inputHandles: ['a','b'], nodeId: props.id }} />;
export const NandGateNode = (props) => <GateNode {...props} data={{ ...props.data, gateType: 'NAND', inputHandles: ['a','b'], nodeId: props.id }} />;
export const NorGateNode  = (props) => <GateNode {...props} data={{ ...props.data, gateType: 'NOR',  inputHandles: ['a','b'], nodeId: props.id }} />;
export const XorGateNode  = (props) => <GateNode {...props} data={{ ...props.data, gateType: 'XOR',  inputHandles: ['a','b'], nodeId: props.id }} />;
export const XnorGateNode = (props) => <GateNode {...props} data={{ ...props.data, gateType: 'XNOR', inputHandles: ['a','b'], nodeId: props.id }} />;
export const NotGateNode  = (props) => <GateNode {...props} data={{ ...props.data, gateType: 'NOT',  inputHandles: ['a'],     nodeId: props.id }} />;

export default GateNode;
