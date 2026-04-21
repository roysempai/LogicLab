/**
 * Boolean Expression Generator
 * Traverses the circuit graph backwards from an output node
 * to derive a human-readable boolean expression.
 */

const OPERATORS = {
  AND:  { op: '·', wrap: true },
  OR:   { op: '+', wrap: true },
  NOT:  { op: null, prefix: "¬", wrap: false },
  NAND: { op: '·', wrap: true, negate: true },
  NOR:  { op: '+', wrap: true, negate: true },
  XOR:  { op: '⊕', wrap: true },
  XNOR: { op: '⊕', wrap: true, negate: true },
};

/**
 * Build reverse adjacency (target → sources with handles)
 */
function buildReverseMap(nodes, edges) {
  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });

  const reverseMap = {};
  nodes.forEach(n => { reverseMap[n.id] = []; });

  edges.forEach(e => {
    if (reverseMap[e.target]) {
      reverseMap[e.target].push({
        sourceId: e.source,
        targetHandle: e.targetHandle || 'a',
      });
    }
  });

  // Sort sources by handle
  Object.keys(reverseMap).forEach(k => {
    reverseMap[k].sort((a, b) => a.targetHandle.localeCompare(b.targetHandle));
  });

  return { nodeMap, reverseMap };
}

/**
 * Recursively derive expression for a node
 */
function deriveExpression(nodeId, nodeMap, reverseMap, visited = new Set()) {
  if (visited.has(nodeId)) return '?'; // cycle guard
  visited.add(nodeId);

  const node = nodeMap[nodeId];
  if (!node) return '?';

  const type = (node.data?.gateType || node.type || '').toUpperCase().replace('NODE', '');
  const label = node.data?.label || node.id;

  if (type === 'INPUT') {
    visited.delete(nodeId);
    return label;
  }

  const sources = reverseMap[nodeId] || [];

  if (sources.length === 0) {
    visited.delete(nodeId);
    return label;
  }

  const subExprs = sources.map(s =>
    deriveExpression(s.sourceId, nodeMap, reverseMap, new Set(visited))
  );

  let expr;

  if (type === 'NOT') {
    expr = `¬(${subExprs[0]})`;
  } else if (type === 'OUTPUT' || type === 'BUFFER') {
    expr = subExprs[0] || '?';
  } else {
    const info = OPERATORS[type];
    if (!info) {
      expr = `${type}(${subExprs.join(', ')})`;
    } else {
      const joined = subExprs.join(` ${info.op} `);
      const inner = subExprs.length > 1 ? `(${joined})` : joined;
      expr = info.negate ? `¬${inner}` : inner;
    }
  }

  visited.delete(nodeId);
  return expr;
}

/**
 * Generate boolean expressions for all output nodes.
 * @param {Array} nodes
 * @param {Array} edges
 * @returns {{ expressions: Array<{label: string, expr: string}>, error: string|null }}
 */
export function generateBooleanExpressions(nodes, edges) {
  const outputNodes = nodes.filter(n =>
    n.type === 'outputNode' || n.data?.gateType === 'OUTPUT'
  );

  if (outputNodes.length === 0) {
    return { expressions: [], error: 'No output nodes found.' };
  }

  const { nodeMap, reverseMap } = buildReverseMap(nodes, edges);

  const expressions = outputNodes.map(out => {
    const label = out.data?.label || out.id;
    const expr = deriveExpression(out.id, nodeMap, reverseMap);
    return { label, expr };
  });

  return { expressions, error: null };
}
