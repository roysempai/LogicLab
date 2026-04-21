/**
 * Logic Engine — evaluates a circuit of logic gates
 * Uses topological sort (Kahn's algorithm) for dependency ordering
 */

const GATE_FUNCTIONS = {
  AND:  (inputs) => inputs.every(Boolean) ? 1 : 0,
  OR:   (inputs) => inputs.some(Boolean) ? 1 : 0,
  NOT:  (inputs) => inputs[0] === 1 ? 0 : 1,
  NAND: (inputs) => inputs.every(Boolean) ? 0 : 1,
  NOR:  (inputs) => inputs.some(Boolean) ? 0 : 1,
  XOR:  (inputs) => inputs.reduce((acc, v) => acc ^ v, 0),
  XNOR: (inputs) => (inputs.reduce((acc, v) => acc ^ v, 0)) === 0 ? 1 : 0,
  INPUT: (inputs, node) => node.data.value ?? 0,
  OUTPUT: (inputs) => inputs[0] ?? 0,
  BUFFER: (inputs) => inputs[0] ?? 0,
};

/**
 * Build an adjacency list and in-degree map from edges
 * @param {Array} nodes - React Flow nodes
 * @param {Array} edges - React Flow edges
 */
function buildGraph(nodes, edges) {
  const nodeMap = {};
  const inEdges = {}; // nodeId -> [{ sourceId, sourceHandle, targetHandle }]
  const outEdges = {}; // nodeId -> [targetId]
  const inDegree = {};

  nodes.forEach(n => {
    nodeMap[n.id] = n;
    inEdges[n.id] = [];
    outEdges[n.id] = [];
    inDegree[n.id] = 0;
  });

  edges.forEach(e => {
    if (!nodeMap[e.source] || !nodeMap[e.target]) return;
    outEdges[e.source].push(e.target);
    inEdges[e.target].push({
      sourceId: e.source,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
      edgeId: e.id,
    });
    inDegree[e.target]++;
  });

  return { nodeMap, inEdges, outEdges, inDegree };
}

/**
 * Topological sort using Kahn's algorithm
 */
function topoSort(nodes, inDegree, outEdges) {
  const queue = [];
  const deg = { ...inDegree };

  nodes.forEach(n => {
    if (deg[n.id] === 0) queue.push(n.id);
  });

  const order = [];
  while (queue.length > 0) {
    const id = queue.shift();
    order.push(id);
    (outEdges[id] || []).forEach(targetId => {
      deg[targetId]--;
      if (deg[targetId] === 0) queue.push(targetId);
    });
  }

  return order;
}

/**
 * Main evaluation function.
 * @param {Array} nodes
 * @param {Array} edges
 * @returns {{ nodeOutputs: Object, error: string|null }}
 */
export function evaluateCircuit(nodes, edges) {
  if (!nodes || nodes.length === 0) {
    return { nodeOutputs: {}, error: null };
  }

  const { nodeMap, inEdges, outEdges, inDegree } = buildGraph(nodes, edges);
  const order = topoSort(nodes, inDegree, outEdges);

  if (order.length !== nodes.length) {
    return { nodeOutputs: {}, error: 'Circuit contains a cycle — cannot evaluate.' };
  }

  const nodeOutputs = {};

  order.forEach(nodeId => {
    const node = nodeMap[nodeId];
    const type = node.type?.toUpperCase() || node.data?.gateType?.toUpperCase();

    if (type === 'INPUT' || type === 'INPUTNODE') {
      nodeOutputs[nodeId] = node.data.value ?? 0;
      return;
    }

    // Gather inputs, ordered by targetHandle (a, b, c, ...)
    const incoming = inEdges[nodeId];
    const sortedInputs = [...incoming].sort((a, b) => {
      const ha = a.targetHandle || 'a';
      const hb = b.targetHandle || 'a';
      return ha.localeCompare(hb);
    });

    const inputValues = sortedInputs.map(e => nodeOutputs[e.sourceId] ?? 0);

    const fn = GATE_FUNCTIONS[type] || GATE_FUNCTIONS[node.data?.gateType?.toUpperCase()];
    if (fn) {
      nodeOutputs[nodeId] = fn(inputValues, node);
    } else {
      nodeOutputs[nodeId] = 0;
    }
  });

  return { nodeOutputs, error: null };
}

/**
 * Check if a given edge carries a high (1) signal
 */
export function getEdgeValue(edge, nodeOutputs) {
  return nodeOutputs[edge.source] ?? 0;
}
