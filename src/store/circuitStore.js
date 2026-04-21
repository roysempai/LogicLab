/**
 * Zustand circuit store — manages all circuit state, simulation, undo/redo, and persistence
 */
import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import { evaluateCircuit } from '../engine/logicEngine.js';
import { generateTruthTable } from '../engine/truthTableGenerator.js';
import { generateBooleanExpressions } from '../engine/booleanExpression.js';

const MAX_HISTORY = 50;

function snapshot(nodes, edges) {
  return { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) };
}

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
    // Rerun engine after position/select changes
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
    set({ nodes: [], edges: [], nodeOutputs: {}, truthTable: null, booleanExpressions: [], engineError: null });
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
