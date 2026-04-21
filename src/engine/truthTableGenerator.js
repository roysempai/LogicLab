/**
 * Truth Table Generator
 * Enumerates all 2^n input combinations and evaluates the circuit for each.
 */
import { evaluateCircuit } from './logicEngine.js';

/**
 * Generate a complete truth table for the given circuit.
 * @param {Array} nodes - React Flow nodes
 * @param {Array} edges - React Flow edges
 * @returns {{ headers: string[], inputIds: string[], outputIds: string[], rows: Array, error: string|null }}
 */
export function generateTruthTable(nodes, edges) {
  const inputNodes = nodes.filter(n =>
    n.type === 'inputNode' || n.data?.gateType === 'INPUT'
  );
  const outputNodes = nodes.filter(n =>
    n.type === 'outputNode' || n.data?.gateType === 'OUTPUT'
  );

  if (inputNodes.length === 0) {
    return { headers: [], inputIds: [], outputIds: [], rows: [], error: 'No input nodes found.' };
  }
  if (outputNodes.length === 0) {
    return { headers: [], inputIds: [], outputIds: [], rows: [], error: 'No output nodes found.' };
  }
  if (inputNodes.length > 5) {
    return { headers: [], inputIds: [], outputIds: [], rows: [], error: 'Truth table supports up to 5 inputs.' };
  }

  const inputIds = inputNodes.map(n => n.id);
  const outputIds = outputNodes.map(n => n.id);
  const inputLabels = inputNodes.map(n => n.data?.label || n.id);
  const outputLabels = outputNodes.map(n => n.data?.label || n.id);
  const headers = [...inputLabels, ...outputLabels];
  const totalRows = Math.pow(2, inputIds.length);
  const rows = [];

  for (let i = 0; i < totalRows; i++) {
    // Assign bit values to inputs (MSB first)
    const combination = {};
    inputIds.forEach((id, idx) => {
      const bit = (i >> (inputIds.length - 1 - idx)) & 1;
      combination[id] = bit;
    });

    // Clone nodes with this input combination
    const testNodes = nodes.map(n => {
      if (inputIds.includes(n.id)) {
        return { ...n, data: { ...n.data, value: combination[n.id] } };
      }
      return n;
    });

    const { nodeOutputs, error } = evaluateCircuit(testNodes, edges);
    if (error) {
      return { headers, inputIds, outputIds, rows: [], error };
    }

    const row = {
      inputs: inputIds.map(id => combination[id]),
      outputs: outputIds.map(id => nodeOutputs[id] ?? 0),
    };
    rows.push(row);
  }

  return { headers, inputIds, outputIds, rows, error: null };
}
