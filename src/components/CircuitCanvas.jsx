/**
 * Circuit Canvas — main React Flow canvas with custom node types
 */
import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import useCircuitStore from '../store/circuitStore.js';
import {
  AndGateNode, OrGateNode, NotGateNode,
  NandGateNode, NorGateNode, XorGateNode, XnorGateNode
} from './gates/GateNode.jsx';
import InputNode from './gates/InputNode.jsx';
import OutputNode from './gates/OutputNode.jsx';
import ICNode from './gates/ICNode.jsx';
import CustomEdge from './CustomEdge.jsx';
import { ALL_IC_TYPES } from './gates/icCatalog.js';

// Register custom node types
const nodeTypes = {
  andNode:    AndGateNode,
  orNode:     OrGateNode,
  notNode:    NotGateNode,
  nandNode:   NandGateNode,
  norNode:    NorGateNode,
  xorNode:    XorGateNode,
  xnorNode:   XnorGateNode,
  inputNode:  InputNode,
  outputNode: OutputNode,
  icNode:     ICNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

// Map gate type string → node type key
const GATE_TYPE_MAP = {
  AND:         'andNode',
  OR:          'orNode',
  NOT:         'notNode',
  NAND:        'nandNode',
  NOR:         'norNode',
  XOR:         'xorNode',
  XNOR:        'xnorNode',
  INPUT:       'inputNode',
  OUTPUT:      'outputNode',
  ...Object.fromEntries(ALL_IC_TYPES.map(type => [type, 'icNode'])),
};

// Input label counter
let inputLabelCounter = 0;
const getNextInputLabel = () => {
  const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  return labels[inputLabelCounter++ % labels.length];
};

let outputLabelCounter = 0;
const getNextOutputLabel = () => {
  const labels = ['Y', 'Z', 'W', 'X'];
  return labels[outputLabelCounter++ % labels.length];
};

let nodeCounter = 0;

const CircuitCanvas = () => {
  const {
    nodes, edges, nodeOutputs,
    onNodesChange, onEdgesChange, onConnect,
    addNode,
  } = useCircuitStore();

  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const gateType = e.dataTransfer.getData('application/reactflow-type');
    if (!gateType) return;

    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const nodeType = GATE_TYPE_MAP[gateType];
    if (!nodeType) return;

    const id = `node-${++nodeCounter}-${Date.now()}`;

    let label = gateType;
    if (gateType === 'INPUT')  label = getNextInputLabel();
    if (gateType === 'OUTPUT') label = getNextOutputLabel();

    const newNode = {
      id,
      type: nodeType,
      position,
      data: {
        gateType,
        label,
        value: gateType === 'INPUT' ? 0 : undefined,
      },
    };

    addNode(newNode);
  }, [screenToFlowPosition, addNode]);

  // Color edges based on signal value (handles IC multi-output objects)
  const styledEdges = edges.map(edge => {
    const raw = nodeOutputs[edge.source];
    let isActive = false;
    if (raw !== null && raw !== undefined && typeof raw === 'object') {
      isActive = raw[edge.sourceHandle] === 1;
    } else {
      isActive = raw === 1;
    }
    return {
      ...edge,
      type: 'custom',
      data: { ...edge.data, isActive },
      style: {
        stroke: isActive ? '#00FF88' : '#2D2D2D',
        strokeWidth: 2,
        filter: isActive ? 'drop-shadow(0 0 4px rgba(0,255,136,0.6))' : 'none',
      },
    };
  });

  return (
    <div
      ref={reactFlowWrapper}
      style={{ flex: 1, height: '100%', position: 'relative' }}
    >
      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode="Shift"
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: 'custom',
          animated: false,
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1}
          color="#1E1E1E"
        />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === 'inputNode') return '#1E1A00';
            if (n.type === 'outputNode') return '#001A0A';
            if (n.type === 'icNode') return '#001A20';
            return '#1A1A2A';
          }}
          nodeStrokeColor="#333333"
          maskColor="rgba(0,0,0,0.6)"
          style={{ bottom: 16, right: 16 }}
        />
      </ReactFlow>

      {/* Empty state hint */}
      {nodes.length === 0 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          animation: 'fadeIn 0.5s ease-out',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.15 }}>⚡</div>
          <div style={{ fontSize: 15, color: '#2D2D2D', fontWeight: 600 }}>
            Drag gates from the library to begin
          </div>
          <div style={{ fontSize: 12, color: '#1E1E1E', marginTop: 4 }}>
            Or type a Boolean expression and click Build Circuit →
          </div>
        </div>
      )}
    </div>
  );
};

export default CircuitCanvas;
