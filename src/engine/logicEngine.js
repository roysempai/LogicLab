/**
 * Logic Engine — evaluates a circuit of logic gates
 * Uses topological sort (Kahn's algorithm) for dependency ordering
 */

const SEQ_STATE = new Map();

const getSeqState = (nodeId) => {
  if (!SEQ_STATE.has(nodeId)) {
    SEQ_STATE.set(nodeId, {
      q: 0,
      prevClk: 0,
      reg: [0, 0, 0, 0],
      count: 0,
    });
  }
  return SEQ_STATE.get(nodeId);
};

const bitsToInt = (bits) => bits.reduce((acc, bit, i) => acc | ((bit ? 1 : 0) << i), 0);
const intToBits = (value, width) => Array.from({ length: width }, (_, i) => (value >> i) & 1);

const addBits = (aBits, bBits, cin = 0) => {
  const max = Math.max(aBits.length, bBits.length);
  const sum = [];
  let carry = cin;
  for (let i = 0; i < max; i++) {
    const a = aBits[i] ?? 0;
    const b = bBits[i] ?? 0;
    const s = a ^ b ^ carry;
    carry = (a & b) | (a & carry) | (b & carry);
    sum.push(s);
  }
  return { sum, carry };
};

const subBits = (aBits, bBits, bin = 0) => {
  const max = Math.max(aBits.length, bBits.length);
  const diff = [];
  let borrow = bin;
  for (let i = 0; i < max; i++) {
    const a = aBits[i] ?? 0;
    const b = bBits[i] ?? 0;
    const d = a ^ b ^ borrow;
    borrow = ((a ^ 1) & (b | borrow)) | (b & borrow);
    diff.push(d);
  }
  return { diff, borrow };
};

const muxValue = (inputs, dataCount, selCount) => {
  const d = inputs.slice(0, dataCount);
  const sel = inputs.slice(dataCount, dataCount + selCount);
  const idx = bitsToInt(sel);
  return d[idx] ?? 0;
};

const oneHotDecode = (inputs, outputCount) => {
  const idx = bitsToInt(inputs);
  const out = {};
  for (let i = 0; i < outputCount; i++) {
    out[`y${i}`] = i === idx ? 1 : 0;
  }
  return out;
};

const priorityEncode = (inputs) => {
  let highest = -1;
  for (let i = inputs.length - 1; i >= 0; i--) {
    if (inputs[i]) {
      highest = i;
      break;
    }
  }
  if (highest < 0) return { b0: 0, b1: 0, b2: 0, valid: 0 };
  return {
    b0: highest & 1,
    b1: (highest >> 1) & 1,
    b2: (highest >> 2) & 1,
    valid: 1,
  };
};

const buildQOutputs = (bits) =>
  bits.reduce((acc, b, i) => {
    acc[`q${i}`] = b;
    return acc;
  }, {});

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

  // ── Integrated Circuits ─────────────────────────────────────────────────
  // Each IC function returns an object { pinName: value } for multi-output support.
  // The engine stores these as { nodeId: { sum: 0, carry: 0, ... } }
  // getICPinOutput() below is used to resolve individual output edges.

  HALF_ADDER: ([a = 0, b = 0]) => ({
    sum:   (a ^ b),        // XOR
    carry: (a & b),        // AND
  }),

  FULL_ADDER: ([a = 0, b = 0, cin = 0]) => {
    const s1 = a ^ b;
    const sum   = s1 ^ cin;
    const carry = (a & b) | (s1 & cin);
    return { sum, carry };
  },

  RCA_4: (inputs) => {
    const a = inputs.slice(0, 4);
    const b = inputs.slice(4, 8);
    const cin = inputs[8] ?? 0;
    const { sum, carry } = addBits(a, b, cin);
    return { s0: sum[0], s1: sum[1], s2: sum[2], s3: sum[3], cout: carry };
  },

  CLA_4: (inputs) => {
    const a = inputs.slice(0, 4);
    const b = inputs.slice(4, 8);
    const cin = inputs[8] ?? 0;
    const { sum, carry } = addBits(a, b, cin);
    return { s0: sum[0], s1: sum[1], s2: sum[2], s3: sum[3], cout: carry };
  },

  CSA_4: (inputs) => {
    const a = inputs.slice(0, 4);
    const b = inputs.slice(4, 8);
    const cin = inputs[8] ?? 0;
    const low = addBits(a, b, 0);
    const high = addBits(a, b, 1);
    const chosen = cin ? high : low;
    return { s0: chosen.sum[0], s1: chosen.sum[1], s2: chosen.sum[2], s3: chosen.sum[3], cout: chosen.carry };
  },

  KSA_4: (inputs) => {
    const a = inputs.slice(0, 4);
    const b = inputs.slice(4, 8);
    const cin = inputs[8] ?? 0;
    const { sum, carry } = addBits(a, b, cin);
    return { s0: sum[0], s1: sum[1], s2: sum[2], s3: sum[3], cout: carry };
  },

  BINARY_ADD_SUB_4: (inputs) => {
    const a = inputs.slice(0, 4);
    const b = inputs.slice(4, 8);
    const mode = inputs[8] ?? 0;
    const bx = b.map(bit => bit ^ mode);
    const { sum, carry } = addBits(a, bx, mode);
    return { s0: sum[0], s1: sum[1], s2: sum[2], s3: sum[3], cout: carry };
  },

  MUX_2_1: ([a = 0, b = 0, sel = 0]) => ({
    y: sel === 0 ? a : b,
  }),

  MUX_4_1: (inputs) => ({ y: muxValue(inputs, 4, 2) }),
  MUX_8_1: (inputs) => ({ y: muxValue(inputs, 8, 3) }),
  MUX_16_1: (inputs) => ({ y: muxValue(inputs, 16, 4) }),
  MUX_TREE_8: (inputs) => ({ y: muxValue(inputs, 8, 3) }),

  PRIORITY_MUX_ENCODER_8: (inputs) => priorityEncode(inputs),

  SR_FLIPFLOP: ([s = 0, r = 0, clk = 0], node) => {
    const state = getSeqState(node.id);
    if (clk === 1) {
      if (s === 1 && r === 0) state.q = 1;
      if (s === 0 && r === 1) state.q = 0;
      if (s === 1 && r === 1) state.q = 0;
    }
    state.prevClk = clk;
    return { q: state.q, qbar: state.q ? 0 : 1 };
  },

  D_FLIPFLOP: ([d = 0, clk = 0], node) => {
    const state = getSeqState(node.id);
    const rising = state.prevClk === 0 && clk === 1;
    if (rising) state.q = d;
    state.prevClk = clk;
    return { q: state.q, qbar: state.q ? 0 : 1 };
  },

  JK_FLIPFLOP: ([j = 0, k = 0, clk = 0], node) => {
    const state = getSeqState(node.id);
    const rising = state.prevClk === 0 && clk === 1;
    if (rising) {
      if (j === 0 && k === 0) {
        // hold
      } else if (j === 1 && k === 0) {
        state.q = 1;
      } else if (j === 0 && k === 1) {
        state.q = 0;
      } else {
        state.q = state.q ? 0 : 1;
      }
    }
    state.prevClk = clk;
    return { q: state.q, qbar: state.q ? 0 : 1 };
  },

  T_FLIPFLOP: ([t = 0, clk = 0], node) => {
    const state = getSeqState(node.id);
    const rising = state.prevClk === 0 && clk === 1;
    if (rising && t === 1) state.q = state.q ? 0 : 1;
    state.prevClk = clk;
    return { q: state.q, qbar: state.q ? 0 : 1 };
  },

  MASTER_SLAVE_FF: ([d = 0, clk = 0], node) => {
    const state = getSeqState(node.id);
    const falling = state.prevClk === 1 && clk === 0;
    if (falling) state.q = d;
    state.prevClk = clk;
    return { q: state.q, qbar: state.q ? 0 : 1 };
  },

  EDGE_TRIGGERED_FF: ([d = 0, clk = 0], node) => {
    const state = getSeqState(node.id);
    const rising = state.prevClk === 0 && clk === 1;
    if (rising) state.q = d;
    state.prevClk = clk;
    return { q: state.q, qbar: state.q ? 0 : 1 };
  },

  LEVEL_TRIGGERED_FF: ([d = 0, clk = 0], node) => {
    const state = getSeqState(node.id);
    if (clk === 1) state.q = d;
    state.prevClk = clk;
    return { q: state.q, qbar: state.q ? 0 : 1 };
  },

  SISO_SHIFT_4: ([sin = 0, clk = 0], node) => {
    const state = getSeqState(node.id);
    const rising = state.prevClk === 0 && clk === 1;
    if (rising) {
      state.reg = [sin, state.reg[0], state.reg[1], state.reg[2]];
    }
    state.prevClk = clk;
    return { sout: state.reg[3] };
  },

  SIPO_SHIFT_4: ([sin = 0, clk = 0], node) => {
    const state = getSeqState(node.id);
    const rising = state.prevClk === 0 && clk === 1;
    if (rising) {
      state.reg = [sin, state.reg[0], state.reg[1], state.reg[2]];
    }
    state.prevClk = clk;
    return buildQOutputs(state.reg);
  },

  PISO_SHIFT_4: (inputs, node) => {
    const p = inputs.slice(0, 4);
    const load = inputs[4] ?? 0;
    const sin = inputs[5] ?? 0;
    const clk = inputs[6] ?? 0;
    const state = getSeqState(node.id);
    const rising = state.prevClk === 0 && clk === 1;
    if (rising) {
      if (load) {
        state.reg = [...p];
      } else {
        state.reg = [sin, state.reg[0], state.reg[1], state.reg[2]];
      }
    }
    state.prevClk = clk;
    return { sout: state.reg[3], ...buildQOutputs(state.reg) };
  },

  PIPO_SHIFT_4: (inputs, node) => {
    const p = inputs.slice(0, 4);
    const clk = inputs[4] ?? 0;
    const state = getSeqState(node.id);
    const rising = state.prevClk === 0 && clk === 1;
    if (rising) state.reg = [...p];
    state.prevClk = clk;
    return buildQOutputs(state.reg);
  },

  UNIVERSAL_SHIFT_4: (inputs, node) => {
    const p = inputs.slice(0, 4);
    const sinl = inputs[4] ?? 0;
    const sinr = inputs[5] ?? 0;
    const s0 = inputs[6] ?? 0;
    const s1 = inputs[7] ?? 0;
    const clk = inputs[8] ?? 0;
    const state = getSeqState(node.id);
    const rising = state.prevClk === 0 && clk === 1;
    if (rising) {
      const mode = (s1 << 1) | s0;
      if (mode === 1) {
        state.reg = [sinr, state.reg[0], state.reg[1], state.reg[2]];
      } else if (mode === 2) {
        state.reg = [state.reg[1], state.reg[2], state.reg[3], sinl];
      } else if (mode === 3) {
        state.reg = [...p];
      }
    }
    state.prevClk = clk;
    return buildQOutputs(state.reg);
  },

  RIPPLE_COUNTER_4: ([clk = 0, rst = 0, en = 1], node) => {
    const state = getSeqState(node.id);
    const rising = state.prevClk === 0 && clk === 1;
    if (rst === 1) state.count = 0;
    else if (rising && en === 1) state.count = (state.count + 1) & 0xF;
    state.prevClk = clk;
    return buildQOutputs(intToBits(state.count, 4));
  },

  SYNC_COUNTER_4: ([clk = 0, rst = 0, en = 1], node) => {
    const state = getSeqState(node.id);
    const rising = state.prevClk === 0 && clk === 1;
    if (rst === 1) state.count = 0;
    else if (rising && en === 1) state.count = (state.count + 1) & 0xF;
    state.prevClk = clk;
    return buildQOutputs(intToBits(state.count, 4));
  },

  UP_DOWN_COUNTER_4: ([clk = 0, rst = 0, en = 1, dir = 1], node) => {
    const state = getSeqState(node.id);
    const rising = state.prevClk === 0 && clk === 1;
    if (rst === 1) state.count = 0;
    else if (rising && en === 1) {
      state.count = dir ? (state.count + 1) & 0xF : (state.count - 1 + 16) & 0xF;
    }
    state.prevClk = clk;
    return buildQOutputs(intToBits(state.count, 4));
  },

  DECODER_2_4: (inputs) => oneHotDecode(inputs.slice(0, 2), 4),
  DECODER_3_8: (inputs) => oneHotDecode(inputs.slice(0, 3), 8),
  DECODER_4_16: (inputs) => oneHotDecode(inputs.slice(0, 4), 16),

  PRIORITY_ENCODER_8_3: (inputs) => priorityEncode(inputs),
  OCTAL_BINARY_ENCODER_8_3: (inputs) => priorityEncode(inputs),

  COMPARATOR_1BIT: ([a = 0, b = 0]) => ({
    eq: a === b ? 1 : 0,
    gt: a > b ? 1 : 0,
    lt: a < b ? 1 : 0,
  }),

  COMPARATOR_4BIT: (inputs) => {
    const a = bitsToInt(inputs.slice(0, 4));
    const b = bitsToInt(inputs.slice(4, 8));
    return {
      eq: a === b ? 1 : 0,
      gt: a > b ? 1 : 0,
      lt: a < b ? 1 : 0,
    };
  },

  DEMUX_1_4: ([d = 0, s0 = 0, s1 = 0]) => {
    const idx = (s1 << 1) | s0;
    return {
      y0: idx === 0 ? d : 0,
      y1: idx === 1 ? d : 0,
      y2: idx === 2 ? d : 0,
      y3: idx === 3 ? d : 0,
    };
  },

  MUX_BASED_ADD_SUB_4: (inputs) => {
    const a = inputs.slice(0, 4);
    const b = inputs.slice(4, 8);
    const mode = inputs[8] ?? 0;
    const bx = b.map(bit => bit ^ mode);
    const { sum, carry } = addBits(a, bx, mode);
    return { s0: sum[0], s1: sum[1], s2: sum[2], s3: sum[3], cout: carry };
  },

  BUFFER_IC: ([a = 0]) => ({ y: a }),
  INVERTER_IC: ([a = 0]) => ({ y: a ? 0 : 1 }),

  CLOCKED_LOGIC: ([d = 0, clk = 0], node) => {
    const state = getSeqState(node.id);
    if (clk === 1) state.q = d;
    state.prevClk = clk;
    return { q: state.q };
  },

  ALU_4: (inputs) => {
    const a = inputs.slice(0, 4);
    const b = inputs.slice(4, 8);
    const op = (inputs[9] << 1) | (inputs[8] ?? 0);
    let y = [0, 0, 0, 0];
    let cout = 0;

    if (op === 0) {
      const added = addBits(a, b, 0);
      y = added.sum;
      cout = added.carry;
    } else if (op === 1) {
      const sub = subBits(a, b, 0);
      y = sub.diff;
      cout = sub.borrow ? 0 : 1;
    } else if (op === 2) {
      y = a.map((bit, i) => bit & (b[i] ?? 0));
    } else {
      y = a.map((bit, i) => bit | (b[i] ?? 0));
    }

    const out = {
      y0: y[0] ?? 0,
      y1: y[1] ?? 0,
      y2: y[2] ?? 0,
      y3: y[3] ?? 0,
      cout,
    };
    const asInt = bitsToInt([out.y0, out.y1, out.y2, out.y3]);
    out.zero = asInt === 0 ? 1 : 0;
    out.neg = out.y3;
    return out;
  },

  MULTIPLIER_2: (inputs) => {
    const a = bitsToInt(inputs.slice(0, 2));
    const b = bitsToInt(inputs.slice(2, 4));
    const p = intToBits(a * b, 4);
    return { p0: p[0], p1: p[1], p2: p[2], p3: p[3] };
  },

  DIVIDER_2: (inputs) => {
    const a = bitsToInt(inputs.slice(0, 2));
    const b = bitsToInt(inputs.slice(2, 4));
    if (b === 0) return { q0: 0, q1: 0, r0: 0, r1: 0, div0: 1 };
    const q = intToBits(Math.floor(a / b), 2);
    const r = intToBits(a % b, 2);
    return { q0: q[0], q1: q[1], r0: r[0], r1: r[1], div0: 0 };
  },

  PARITY_GENERATOR_4: (inputs) => {
    const parity = inputs.slice(0, 4).reduce((acc, bit) => acc ^ (bit ? 1 : 0), 0);
    return { even: parity, odd: parity ? 0 : 1 };
  },

  PARITY_CHECKER_4: (inputs) => {
    const dParity = inputs.slice(0, 4).reduce((acc, bit) => acc ^ (bit ? 1 : 0), 0);
    const p = inputs[4] ?? 0;
    const ok = dParity === p ? 1 : 0;
    return { ok, err: ok ? 0 : 1 };
  },

  HALF_SUBTRACTOR: ([a = 0, b = 0]) => ({
    diff: a ^ b,
    borrow: (a ^ 1) & b,
  }),

  FULL_SUBTRACTOR: ([a = 0, b = 0, bin = 0]) => {
    const diff = a ^ b ^ bin;
    const borrow = ((a ^ 1) & (b | bin)) | (b & bin);
    return { diff, borrow };
  },
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

function naturalHandleCompare(a, b) {
  const ha = a.targetHandle || 'a';
  const hb = b.targetHandle || 'a';
  const ma = /^([a-zA-Z_]+)(\d+)?$/.exec(ha);
  const mb = /^([a-zA-Z_]+)(\d+)?$/.exec(hb);
  if (!ma || !mb) return ha.localeCompare(hb);
  const pa = ma[1];
  const pb = mb[1];
  if (pa !== pb) return pa.localeCompare(pb);
  const na = ma[2] !== undefined ? Number(ma[2]) : -1;
  const nb = mb[2] !== undefined ? Number(mb[2]) : -1;
  return na - nb;
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
    const gateType = node.data?.gateType?.toUpperCase() || type;

    if (type === 'INPUT' || type === 'INPUTNODE') {
      nodeOutputs[nodeId] = node.data.value ?? 0;
      return;
    }

    // Gather inputs, ordered by targetHandle (a, b, c, ...)
    const incoming = inEdges[nodeId];
    const sortedInputs = [...incoming].sort(naturalHandleCompare);

    // For IC nodes, input values may come from a multi-output source (object with pin names)
    const inputValues = sortedInputs.map(e => {
      const raw = nodeOutputs[e.sourceId];
      if (raw !== null && typeof raw === 'object') {
        // source is an IC — use the specified sourceHandle as pin name
        return raw[e.sourceHandle] ?? 0;
      }
      return raw ?? 0;
    });

    const fn = GATE_FUNCTIONS[gateType] || GATE_FUNCTIONS[type];
    if (fn) {
      nodeOutputs[nodeId] = fn(inputValues, node);
    } else {
      nodeOutputs[nodeId] = 0;
    }
  });

  return { nodeOutputs, error: null };
}

/**
 * Check if a given edge carries a high (1) signal.
 * Handles both scalar outputs and IC multi-output objects.
 */
export function getEdgeValue(edge, nodeOutputs) {
  const raw = nodeOutputs[edge.source];
  if (raw !== null && typeof raw === 'object') {
    return raw[edge.sourceHandle] ?? 0;
  }
  return raw ?? 0;
}
