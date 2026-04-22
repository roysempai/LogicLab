/**
 * AST → Circuit Layout
 *
 * Converts a Boolean expression AST (from expressionParser.js) into
 * a set of React Flow nodes and edges, with a left-to-right column layout:
 *
 *   Col 0  : Input nodes (one per unique variable)
 *   Col 1+ : Gate nodes in BFS order (leaves first)
 *   Last   : Output node
 *
 * Horizontal spacing : COL_W  px
 * Vertical spacing   : ROW_H  px
 */

import { getVariables } from './expressionParser.js';

const COL_W = 220;  // pixels between columns
const ROW_H = 120;  // pixels between rows

let _idCounter = 0;
const uid = (prefix) => `${prefix}-${++_idCounter}-${Date.now()}`;

/**
 * Map AST type → gate type string understood by the circuit engine.
 */
const AST_TO_GATE = {
  and:  'AND',
  or:   'OR',
  not:  'NOT',
  nand: 'NAND',
  nor:  'NOR',
  xor:  'XOR',
  xnor: 'XNOR',
};

/**
 * Map gate type → React Flow node type key.
 */
const GATE_TO_NODE_TYPE = {
  AND:  'andNode',
  OR:   'orNode',
  NOT:  'notNode',
  NAND: 'nandNode',
  NOR:  'norNode',
  XOR:  'xorNode',
  XNOR: 'xnorNode',
};

/**
 * Recursively walk the AST, building nodes & edges.
 *
 * @param {object} astNode      - current AST node
 * @param {Map}    varNodeMap   - varName → existing inputNode id
 * @param {Array}  nodes        - accumulator
 * @param {Array}  edges        - accumulator
 * @param {number} depth        - current depth (for x-column placement)
 * @param {number} maxDepth     - total depth of the tree (used for x-offset)
 * @param {object} depthCounters - { [depth]: count } for y-placement
 * @param {object} basePos      - { x, y } canvas offset
 * @returns {string} - the React Flow node id that represents this sub-expression
 */
function buildNodes(astNode, varNodeMap, nodes, edges, depth, maxDepth, depthCounters, basePos) {
  if (!depthCounters[depth]) depthCounters[depth] = 0;

  if (astNode.type === 'variable') {
    // Return the pre-created input node id
    return varNodeMap.get(astNode.name);
  }

  const gateType = AST_TO_GATE[astNode.type];
  if (!gateType) throw new Error(`Unknown AST node type: ${astNode.type}`);

  const nodeType = GATE_TO_NODE_TYPE[gateType];
  const id = uid('expr-gate');

  // x: columns go left-to-right, deeper = further right (but before the output)
  // We reverse depth so that deeper sub-expressions are leftmost gate columns.
  const x = basePos.x + COL_W + (maxDepth - depth) * COL_W;
  const y = basePos.y + depthCounters[depth] * ROW_H;
  depthCounters[depth]++;

  nodes.push({
    id,
    type: nodeType,
    position: { x, y },
    data: {
      gateType,
      label: gateType,
      inputHandles: astNode.type === 'not' ? ['a'] : ['a', 'b'],
    },
  });

  // recurse into children
  const children = astNode.type === 'not' ? [astNode.arg] : astNode.args;
  children.forEach((child, i) => {
    const handle = ['a', 'b', 'c'][i];
    const childId = buildNodes(child, varNodeMap, nodes, edges, depth + 1, maxDepth, depthCounters, basePos);
    const edgeId = uid('expr-edge');
    edges.push({
      id: edgeId,
      source: childId,
      sourceHandle: 'out',
      target: id,
      targetHandle: handle,
      type: 'custom',
      animated: false,
      style: { stroke: '#2D2D2D', strokeWidth: 2 },
    });
  });

  return id;
}

/**
 * Compute the maximum depth of the AST.
 */
function treeDepth(node) {
  if (!node) return 0;
  if (node.type === 'variable') return 0;
  if (node.type === 'not') return 1 + treeDepth(node.arg);
  return 1 + Math.max(...(node.args || []).map(treeDepth));
}

/**
 * Main export: convert an AST to React Flow nodes + edges.
 *
 * @param {object} ast          - root AST node from parseExpression()
 * @param {{ x, y }} basePos    - top-left canvas position to start layout
 * @param {string} outputLabel  - label for the output node (default 'Y')
 * @returns {{ nodes: Array, edges: Array }}
 */
export function astToCircuit(ast, basePos = { x: 100, y: 100 }, outputLabel = 'Y') {
  if (!ast) return { nodes: [], edges: [] };

  _idCounter = 0; // reset for deterministic ids within this call
  const vars = getVariables(ast);
  const depth = treeDepth(ast);

  const nodes = [];
  const edges = [];

  // --- Create input nodes (column 0) ---
  const varNodeMap = new Map(); // varName → nodeId
  vars.forEach((v, i) => {
    const id = uid('expr-input');
    varNodeMap.set(v, id);
    nodes.push({
      id,
      type: 'inputNode',
      position: {
        x: basePos.x,
        y: basePos.y + i * ROW_H,
      },
      data: {
        gateType: 'INPUT',
        label: v,
        value: 0,
      },
    });
  });

  // --- Build gate nodes recursively ---
  const depthCounters = {};
  const rootGateId = buildNodes(ast, varNodeMap, nodes, edges, 0, depth, depthCounters, basePos);

  // --- Create output node (rightmost column) ---
  const outId = uid('expr-output');
  const outX = basePos.x + COL_W + (depth + 1) * COL_W;
  const outY = basePos.y + Math.floor((vars.length - 1) / 2) * ROW_H;

  nodes.push({
    id: outId,
    type: 'outputNode',
    position: { x: outX, y: outY },
    data: {
      gateType: 'OUTPUT',
      label: outputLabel,
    },
  });

  edges.push({
    id: uid('expr-out-edge'),
    source: rootGateId,
    sourceHandle: 'out',
    target: outId,
    targetHandle: 'a',
    type: 'custom',
    animated: false,
    style: { stroke: '#2D2D2D', strokeWidth: 2 },
  });

  return { nodes, edges };
}

/**
 * Compute a good base position for the new circuit so it doesn't
 * overlap with existing nodes (places it below them).
 *
 * @param {Array} existingNodes
 * @returns {{ x, y }}
 */
export function findFreePosition(existingNodes) {
  if (existingNodes.length === 0) return { x: 80, y: 80 };
  const maxY = Math.max(...existingNodes.map(n => (n.position?.y ?? 0) + 120));
  return { x: 80, y: maxY + 60 };
}
