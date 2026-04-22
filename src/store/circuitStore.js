/**
 * Zustand circuit store — manages all circuit state, simulation, undo/redo, and persistence
 */
import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import { evaluateCircuit } from '../engine/logicEngine.js';
import { generateTruthTable } from '../engine/truthTableGenerator.js';
import { generateBooleanExpressions } from '../engine/booleanExpression.js';
import { parseExpression, astToString, getVariables } from '../engine/expressionParser.js';
import { astToCircuit, findFreePosition } from '../engine/astToCircuit.js';
import { simplifyExpression } from '../engine/booleanSimplifier.js';

const MAX_HISTORY = 50;

function snapshot(nodes, edges) {
  return { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) };
}

// IC definitions: inputs, outputs, and how to expand them into gates
const IC_DEFINITIONS = {
  HALF_ADDER: {
    inputs:  [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }],
    outputs: [{ id: 'sum', label: 'Sum' }, { id: 'carry', label: 'Carry' }],
    expand: (baseX, baseY) => {
      const xorId = `ha-xor-${Date.now()}`;
      const andId = `ha-and-${Date.now()+1}`;
      const nodes = [
        { id: xorId, type: 'xorNode', position: { x: baseX + 120, y: baseY },
          data: { gateType: 'XOR', label: 'XOR', inputHandles: ['a','b'] } },
        { id: andId, type: 'andNode', position: { x: baseX + 120, y: baseY + 120 },
          data: { gateType: 'AND', label: 'AND', inputHandles: ['a','b'] } },
      ];
      return { nodes, inputMap: { a: [xorId, andId], b: [xorId, andId] }, outputMap: { sum: xorId, carry: andId } };
    },
  },
  FULL_ADDER: {
    inputs:  [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'cin', label: 'Cin' }],
    outputs: [{ id: 'sum', label: 'Sum' }, { id: 'carry', label: 'Cout' }],
    expand: (baseX, baseY) => {
      const xor1 = `fa-xor1-${Date.now()}`;
      const xor2 = `fa-xor2-${Date.now()+1}`;
      const and1 = `fa-and1-${Date.now()+2}`;
      const and2 = `fa-and2-${Date.now()+3}`;
      const or1  = `fa-or1-${Date.now()+4}`;
      const nodes = [
        { id: xor1, type: 'xorNode', position: { x: baseX+120, y: baseY },
          data: { gateType: 'XOR', label: 'XOR', inputHandles: ['a','b'] } },
        { id: and1, type: 'andNode', position: { x: baseX+120, y: baseY+120 },
          data: { gateType: 'AND', label: 'AND', inputHandles: ['a','b'] } },
        { id: xor2, type: 'xorNode', position: { x: baseX+320, y: baseY },
          data: { gateType: 'XOR', label: 'XOR', inputHandles: ['a','b'] } },
        { id: and2, type: 'andNode', position: { x: baseX+320, y: baseY+120 },
          data: { gateType: 'AND', label: 'AND', inputHandles: ['a','b'] } },
        { id: or1,  type: 'orNode',  position: { x: baseX+520, y: baseY+80 },
          data: { gateType: 'OR',  label: 'OR',  inputHandles: ['a','b'] } },
      ];
      const edges = [
        { id: `fa-e1-${Date.now()}`, source: xor1, sourceHandle: 'out', target: xor2, targetHandle: 'a', type: 'custom', style: { stroke: '#2D2D2D', strokeWidth: 2 } },
        { id: `fa-e2-${Date.now()+1}`, source: xor1, sourceHandle: 'out', target: and2, targetHandle: 'a', type: 'custom', style: { stroke: '#2D2D2D', strokeWidth: 2 } },
        { id: `fa-e3-${Date.now()+2}`, source: and1, sourceHandle: 'out', target: or1,  targetHandle: 'a', type: 'custom', style: { stroke: '#2D2D2D', strokeWidth: 2 } },
        { id: `fa-e4-${Date.now()+3}`, source: and2, sourceHandle: 'out', target: or1,  targetHandle: 'b', type: 'custom', style: { stroke: '#2D2D2D', strokeWidth: 2 } },
      ];
      return { nodes, edges, inputMap: { a: [xor1, and1], b: [xor1, and1], cin: [xor2, and2] }, outputMap: { sum: xor2, carry: or1 } };
    },
  },
  MUX_2_1: {
    inputs:  [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'sel', label: 'Sel' }],
    outputs: [{ id: 'y', label: 'Y' }],
    expand: (baseX, baseY) => {
      const not1  = `mux-not-${Date.now()}`;
      const and1  = `mux-and1-${Date.now()+1}`;
      const and2  = `mux-and2-${Date.now()+2}`;
      const or1   = `mux-or-${Date.now()+3}`;
      const nodes = [
        { id: not1, type: 'notNode', position: { x: baseX+100, y: baseY+120 },
          data: { gateType: 'NOT', label: 'NOT', inputHandles: ['a'] } },
        { id: and1, type: 'andNode', position: { x: baseX+240, y: baseY },
          data: { gateType: 'AND', label: 'AND', inputHandles: ['a','b'] } },
        { id: and2, type: 'andNode', position: { x: baseX+240, y: baseY+150 },
          data: { gateType: 'AND', label: 'AND', inputHandles: ['a','b'] } },
        { id: or1,  type: 'orNode',  position: { x: baseX+400, y: baseY+70 },
          data: { gateType: 'OR',  label: 'OR',  inputHandles: ['a','b'] } },
      ];
      const edges = [
        { id: `mux-e1-${Date.now()}`, source: not1, sourceHandle: 'out', target: and1, targetHandle: 'b', type: 'custom', style: { stroke: '#2D2D2D', strokeWidth: 2 } },
        { id: `mux-e2-${Date.now()+1}`, source: and1, sourceHandle: 'out', target: or1, targetHandle: 'a', type: 'custom', style: { stroke: '#2D2D2D', strokeWidth: 2 } },
        { id: `mux-e3-${Date.now()+2}`, source: and2, sourceHandle: 'out', target: or1, targetHandle: 'b', type: 'custom', style: { stroke: '#2D2D2D', strokeWidth: 2 } },
      ];
      return { nodes, edges, inputMap: { a: [and1], b: [and2], sel: [and2, not1] }, outputMap: { y: or1 } };
    },
  },
  D_FLIPFLOP: {
    inputs:  [{ id: 'd', label: 'D' }, { id: 'clk', label: 'Clk' }],
    outputs: [{ id: 'q', label: 'Q' }, { id: 'qbar', label: 'Q̄' }],
    expand: null, // simplified: no gate-level expansion shown
  },
};

const useCircuitStore = create((set, get) => ({
  // ===== State =====
  nodes: [],
  edges: [],
  nodeOutputs: {},
  truthTable: null,
  booleanExpressions: [],
  engineError: null,
  history: [],
  future: [],
  isSimulating: false,

  // Expression builder state
  expressionInput: '',
  expressionError: null,
  parsedAST: null,
  originalAST: null,
  simplifiedAST: null,
  simplificationSteps: [],
  showSimplified: false,
  originalCircuit: null,   // { nodes, edges } snapshot for toggle
  simplifiedCircuit: null, // { nodes, edges } snapshot for toggle

  // ===== Internal helpers =====
  _pushHistory: () => {
    const { nodes, edges, history } = get();
    const newHistory = [...history, snapshot(nodes, edges)].slice(-MAX_HISTORY);
    set({ history: newHistory, future: [] });
  },

  _runEngine: (nodes, edges) => {
    const { nodeOutputs, error } = evaluateCircuit(nodes, edges);
    set({ nodeOutputs, engineError: error });
    return nodeOutputs;
  },

  // ===== Nodes =====
  onNodesChange: (changes) => {
    set(state => ({ nodes: applyNodeChanges(changes, state.nodes) }));
    const { nodes, edges } = get();
    get()._runEngine(nodes, edges);
  },

  addNode: (node) => {
    get()._pushHistory();
    set(state => ({ nodes: [...state.nodes, node] }));
  },

  removeNode: (nodeId) => {
    get()._pushHistory();
    set(state => ({
      nodes: state.nodes.filter(n => n.id !== nodeId),
      edges: state.edges.filter(e => e.source !== nodeId && e.target !== nodeId),
    }));
    const { nodes, edges } = get();
    get()._runEngine(nodes, edges);
  },

  updateNodeData: (nodeId, data) => {
    set(state => ({
      nodes: state.nodes.map(n =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
      ),
    }));
    const { nodes, edges } = get();
    get()._runEngine(nodes, edges);
  },

  toggleInput: (nodeId) => {
    const node = get().nodes.find(n => n.id === nodeId);
    if (!node) return;
    const newValue = (node.data.value ?? 0) === 1 ? 0 : 1;
    get().updateNodeData(nodeId, { value: newValue });
  },

  // ===== Edges =====
  onEdgesChange: (changes) => {
    set(state => ({ edges: applyEdgeChanges(changes, state.edges) }));
    const { nodes, edges } = get();
    get()._runEngine(nodes, edges);
  },

  onConnect: (connection) => {
    get()._pushHistory();
    set(state => ({
      edges: addEdge(
        {
          ...connection,
          id: `e-${connection.source}-${connection.sourceHandle || 'out'}-${connection.target}-${connection.targetHandle || 'a'}-${Date.now()}`,
          animated: false,
          style: { stroke: '#2D2D2D', strokeWidth: 2 },
          className: 'edge-inactive',
        },
        state.edges
      ),
    }));
    const { nodes, edges } = get();
    get()._runEngine(nodes, edges);
  },

  // ===== Simulation =====
  runSimulation: () => {
    const { nodes, edges } = get();
    get()._runEngine(nodes, edges);
  },

  generateTruthTable: () => {
    const { nodes, edges } = get();
    const result = generateTruthTable(nodes, edges);
    set({ truthTable: result });
  },

  generateBooleanExpressions: () => {
    const { nodes, edges } = get();
    const { expressions, error } = generateBooleanExpressions(nodes, edges);
    set({ booleanExpressions: expressions, engineError: error || get().engineError });
  },

  // ===== Expression Builder =====
  setExpressionInput: (str) => {
    set({ expressionInput: str, expressionError: null });
  },

  buildCircuitFromExpression: (str) => {
    const { ast, error } = parseExpression(str);
    if (error) {
      set({ expressionError: error });
      return false;
    }
    const { nodes: existingNodes } = get();
    const basePos = findFreePosition(existingNodes);
    const { nodes: newNodes, edges: newEdges } = astToCircuit(ast, basePos, 'Y');

    get()._pushHistory();
    set(state => ({
      nodes: [...state.nodes, ...newNodes],
      edges: [...state.edges, ...newEdges],
      parsedAST: ast,
      originalAST: ast,
      expressionInput: str,
      expressionError: null,
      simplifiedAST: null,
      simplificationSteps: [],
      showSimplified: false,
      originalCircuit: { nodes: newNodes, edges: newEdges },
      simplifiedCircuit: null,
    }));
    const { nodes, edges } = get();
    get()._runEngine(nodes, edges);
    return true;
  },

  // ===== Simplifier =====
  simplifyCurrentExpression: (str) => {
    const sourceStr = str || get().expressionInput;
    if (!sourceStr) return;
    const { ast, error } = parseExpression(sourceStr);
    if (error) { set({ expressionError: error }); return; }

    const { simplifiedAST, steps } = simplifyExpression(ast);
    const simplifiedStr = astToString(simplifiedAST);

    // Build simplified circuit from simplified AST
    const { nodes: existingNodes } = get();
    const basePos = findFreePosition(existingNodes);
    const { nodes: simpNodes, edges: simpEdges } = astToCircuit(simplifiedAST, basePos, 'Y');

    // Also build original circuit for toggle
    const origBasePos = { x: basePos.x, y: basePos.y };
    const { nodes: origNodes, edges: origEdges } = astToCircuit(ast, origBasePos, 'Y');

    set({
      parsedAST: ast,
      originalAST: ast,
      simplifiedAST,
      simplificationSteps: steps,
      expressionError: null,
      originalCircuit:   { nodes: origNodes,  edges: origEdges },
      simplifiedCircuit: { nodes: simpNodes, edges: simpEdges },
      showSimplified: false,
    });

    return { simplifiedStr, steps };
  },

  toggleSimplifiedView: () => {
    const { showSimplified, originalCircuit, simplifiedCircuit } = get();
    const target = showSimplified ? originalCircuit : simplifiedCircuit;
    if (!target) return;

    get()._pushHistory();
    set(state => ({
      nodes: [...state.nodes.filter(n => !originalCircuit?.nodes.find(on => on.id === n.id) && !simplifiedCircuit?.nodes.find(sn => sn.id === n.id)), ...target.nodes],
      edges: [...state.edges.filter(e => !originalCircuit?.edges.find(oe => oe.id === e.id) && !simplifiedCircuit?.edges.find(se => se.id === e.id)), ...target.edges],
      showSimplified: !showSimplified,
    }));
    const { nodes, edges } = get();
    get()._runEngine(nodes, edges);
  },

  stampSimplifiedCircuit: () => {
    const { simplifiedCircuit, simplifiedAST } = get();
    if (!simplifiedCircuit) return;
    get()._pushHistory();
    const basePos = findFreePosition(get().nodes);
    const { nodes: newNodes, edges: newEdges } = astToCircuit(simplifiedAST, basePos, 'Y');
    set(state => ({
      nodes: [...state.nodes, ...newNodes],
      edges: [...state.edges, ...newEdges],
    }));
    const { nodes, edges } = get();
    get()._runEngine(nodes, edges);
  },

  // ===== IC Expand =====
  expandIC: (nodeId) => {
    const { nodes, edges } = get();
    const icNode = nodes.find(n => n.id === nodeId);
    if (!icNode) return;

    const gateType = icNode.data?.gateType;
    const def = IC_DEFINITIONS[gateType];
    if (!def || !def.expand) return;

    get()._pushHistory();
    const { nodes: innerNodes, edges: innerEdges = [], inputMap, outputMap } = def.expand(
      icNode.position.x, icNode.position.y
    );

    // Find existing edges connected to the IC node
    const incomingEdges  = edges.filter(e => e.target === nodeId);
    const outgoingEdges  = edges.filter(e => e.source === nodeId);
    const unrelatedEdges = edges.filter(e => e.source !== nodeId && e.target !== nodeId);

    // Re-wire incoming edges → internal input nodes
    const rewiredIn = incomingEdges.flatMap(e => {
      const targetIds = inputMap[e.targetHandle] || [];
      return targetIds.map((tid, i) => ({
        ...e,
        id: `${e.id}-exp-${i}-${Date.now()}`,
        target: tid,
        targetHandle: 'a',
      }));
    });

    // Re-wire outgoing edges → internal output nodes
    const rewiredOut = outgoingEdges.map(e => {
      const sourceId = outputMap[e.sourceHandle] || outputMap.y || outputMap.sum || Object.values(outputMap)[0];
      return { ...e, id: `${e.id}-exp-out-${Date.now()}`, source: sourceId, sourceHandle: 'out' };
    });

    set({
      nodes: [...nodes.filter(n => n.id !== nodeId), ...innerNodes],
      edges: [...unrelatedEdges, ...innerEdges, ...rewiredIn, ...rewiredOut],
    });
    get()._runEngine(get().nodes, get().edges);
  },

  // ===== Undo / Redo =====
  undo: () => {
    const { history, nodes, edges, future } = get();
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    set({
      nodes: prev.nodes,
      edges: prev.edges,
      history: newHistory,
      future: [snapshot(nodes, edges), ...future].slice(0, MAX_HISTORY),
    });
    get()._runEngine(prev.nodes, prev.edges);
  },

  redo: () => {
    const { future, nodes, edges, history } = get();
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    set({
      nodes: next.nodes,
      edges: next.edges,
      future: newFuture,
      history: [...history, snapshot(nodes, edges)].slice(-MAX_HISTORY),
    });
    get()._runEngine(next.nodes, next.edges);
  },

  // ===== Clear =====
  clearCanvas: () => {
    get()._pushHistory();
    set({
      nodes: [], edges: [], nodeOutputs: {}, truthTable: null, booleanExpressions: [],
      engineError: null, parsedAST: null, originalAST: null, simplifiedAST: null,
      simplificationSteps: [], showSimplified: false, originalCircuit: null, simplifiedCircuit: null,
    });
  },

  // ===== Save / Load =====
  saveCircuit: () => {
    const { nodes, edges } = get();
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `circuit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  loadCircuit: (jsonString) => {
    try {
      const { nodes, edges } = JSON.parse(jsonString);
      get()._pushHistory();
      set({ nodes, edges, truthTable: null, booleanExpressions: [] });
      get()._runEngine(nodes, edges);
    } catch {
      alert('Invalid circuit file.');
    }
  },

  // ===== Export Truth Table as CSV =====
  exportTruthTableCSV: () => {
    const { truthTable } = get();
    if (!truthTable || !truthTable.rows.length) return;
    const { headers, rows } = truthTable;
    const csvLines = [
      headers.join(','),
      ...rows.map(r => [...r.inputs, ...r.outputs].join(',')),
    ];
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'truth-table.csv';
    a.click();
    URL.revokeObjectURL(url);
  },
}));

export default useCircuitStore;
