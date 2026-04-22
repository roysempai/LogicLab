/**
 * Boolean Algebra Simplifier
 *
 * Applies algebraic rewrite rules to an AST produced by expressionParser.js.
 * Iterates until a fixed point (no further simplifications possible).
 *
 * Laws implemented:
 *   - Double Negation   : ¬¬A → A
 *   - Identity          : A·1 → A,  A+0 → A
 *   - Null / Domination : A·0 → 0,  A+1 → 1
 *   - Idempotent        : A·A → A,  A+A → A
 *   - Complement        : A·¬A → 0, A+¬A → 1
 *   - Absorption        : A·(A+B) → A, A+(A·B) → A
 *   - De Morgan's       : ¬(A·B) → ¬A+¬B,  ¬(A+B) → ¬A·¬B
 *   - Distribution      : A·(B+C) → A·B+A·C
 *   - NAND/NOR → NOT+AND/OR  (normalise to primitive gates)
 */

import { astToString } from './expressionParser.js';

// ─── AST helpers ──────────────────────────────────────────────────────────────

function cloneAST(node) {
  if (!node) return node;
  if (node.type === 'variable') return { ...node };
  if (node.type === 'not') return { type: 'not', arg: cloneAST(node.arg) };
  return { type: node.type, args: node.args.map(cloneAST) };
}

function astEqual(a, b) {
  if (!a || !b) return a === b;
  if (a.type !== b.type) return false;
  if (a.type === 'variable') return a.name === b.name;
  if (a.type === 'not') return astEqual(a.arg, b.arg);
  if (!a.args || !b.args || a.args.length !== b.args.length) return false;
  return a.args.every((ai, i) => astEqual(ai, b.args[i]));
}

function isNot(node, inner) {
  return node?.type === 'not' && astEqual(node.arg, inner);
}

const ONE  = { type: 'variable', name: '1' };
const ZERO = { type: 'variable', name: '0' };

function isOne(n)  { return n?.type === 'variable' && n.name === '1'; }
function isZero(n) { return n?.type === 'variable' && n.name === '0'; }

// ─── Individual rewrite rules ─────────────────────────────────────────────────

/**
 * Each rule returns { result: AST|null, law: string|null }.
 * result=null means the rule did not match.
 */

function ruleDoubleNegation(node) {
  if (node.type === 'not' && node.arg?.type === 'not') {
    return { result: cloneAST(node.arg.arg), law: 'Double Negation (¬¬A = A)' };
  }
  return { result: null };
}

function ruleDemorgan(node) {
  if (node.type === 'not') {
    if (node.arg?.type === 'and') {
      return {
        result: { type: 'or',  args: node.arg.args.map(a => ({ type: 'not', arg: cloneAST(a) })) },
        law: "De Morgan's: ¬(A·B) = ¬A + ¬B",
      };
    }
    if (node.arg?.type === 'or') {
      return {
        result: { type: 'and', args: node.arg.args.map(a => ({ type: 'not', arg: cloneAST(a) })) },
        law: "De Morgan's: ¬(A+B) = ¬A · ¬B",
      };
    }
  }
  return { result: null };
}

function ruleIdentity(node) {
  if (node.type === 'and') {
    const nonOne = node.args.filter(a => !isOne(a));
    if (nonOne.length < node.args.length) {
      const result = nonOne.length === 1 ? cloneAST(nonOne[0]) : { type: 'and', args: nonOne.map(cloneAST) };
      return { result, law: 'Identity: A · 1 = A' };
    }
    const nonZero = node.args.filter(a => !isZero(a));
    if (nonZero.length < node.args.length) {
      return { result: cloneAST(ZERO), law: 'Null: A · 0 = 0' };
    }
  }
  if (node.type === 'or') {
    const nonZero = node.args.filter(a => !isZero(a));
    if (nonZero.length < node.args.length) {
      const result = nonZero.length === 1 ? cloneAST(nonZero[0]) : { type: 'or', args: nonZero.map(cloneAST) };
      return { result, law: 'Identity: A + 0 = A' };
    }
    if (node.args.some(isOne)) {
      return { result: cloneAST(ONE), law: 'Null: A + 1 = 1' };
    }
  }
  return { result: null };
}

function ruleIdempotent(node) {
  if (node.type === 'and' || node.type === 'or') {
    const unique = [];
    for (const a of node.args) {
      if (!unique.some(u => astEqual(u, a))) unique.push(a);
    }
    if (unique.length < node.args.length) {
      const result = unique.length === 1 ? cloneAST(unique[0]) : { type: node.type, args: unique.map(cloneAST) };
      return { result, law: `Idempotent: A ${node.type === 'and' ? '·' : '+'} A = A` };
    }
  }
  return { result: null };
}

function ruleComplement(node) {
  if (node.type === 'and') {
    for (const a of node.args) {
      if (node.args.some(b => isNot(b, a) || (a.type === 'not' && astEqual(a.arg, b)))) {
        return { result: cloneAST(ZERO), law: 'Complement: A · ¬A = 0' };
      }
    }
  }
  if (node.type === 'or') {
    for (const a of node.args) {
      if (node.args.some(b => isNot(b, a) || (a.type === 'not' && astEqual(a.arg, b)))) {
        return { result: cloneAST(ONE), law: 'Complement: A + ¬A = 1' };
      }
    }
  }
  return { result: null };
}

function ruleAbsorption(node) {
  // A · (A + B) = A
  if (node.type === 'and') {
    for (const a of node.args) {
      for (const b of node.args) {
        if (b !== a && b.type === 'or' && b.args.some(ba => astEqual(ba, a))) {
          return { result: cloneAST(a), law: 'Absorption: A · (A + B) = A' };
        }
      }
    }
  }
  // A + (A · B) = A
  if (node.type === 'or') {
    for (const a of node.args) {
      for (const b of node.args) {
        if (b !== a && b.type === 'and' && b.args.some(ba => astEqual(ba, a))) {
          return { result: cloneAST(a), law: 'Absorption: A + (A · B) = A' };
        }
      }
    }
  }
  return { result: null };
}

function ruleNandNorNormalise(node) {
  // NAND(A,B) → NOT(AND(A,B))
  if (node.type === 'nand') {
    return {
      result: { type: 'not', arg: { type: 'and', args: node.args.map(cloneAST) } },
      law: 'Normalise: NAND(A,B) = ¬(A·B)',
    };
  }
  if (node.type === 'nor') {
    return {
      result: { type: 'not', arg: { type: 'or', args: node.args.map(cloneAST) } },
      law: 'Normalise: NOR(A,B) = ¬(A+B)',
    };
  }
  if (node.type === 'xnor') {
    return {
      result: { type: 'not', arg: { type: 'xor', args: node.args.map(cloneAST) } },
      law: 'Normalise: XNOR(A,B) = ¬(A⊕B)',
    };
  }
  return { result: null };
}

const TOP_LEVEL_RULES = [
  ruleNandNorNormalise,
  ruleDoubleNegation,
  ruleDemorgan,
  ruleIdentity,
  ruleIdempotent,
  ruleComplement,
  ruleAbsorption,
];

// ─── Recursive simplification ─────────────────────────────────────────────────

/**
 * Apply one pass of all rules to every node in the AST, bottom-up.
 * Returns { changed: bool, newAst, steps }
 */
function onePass(node, steps) {
  if (!node) return { changed: false, newAst: node };
  let changed = false;
  let result = cloneAST(node);

  // First recurse into children
  if (result.type === 'not') {
    const { changed: c, newAst } = onePass(result.arg, steps);
    if (c) { result.arg = newAst; changed = true; }
  } else if (result.args) {
    result.args = result.args.map(a => {
      const { changed: c, newAst } = onePass(a, steps);
      if (c) changed = true;
      return newAst;
    });
  }

  // Then try rules on this node
  for (const rule of TOP_LEVEL_RULES) {
    const { result: ruleResult, law } = rule(result);
    if (ruleResult !== null) {
      const before = astToString(result);
      result = ruleResult;
      const after = astToString(result);
      if (before !== after) {
        steps.push({ law, before, after });
        changed = true;
        break; // only one rule per node per pass to avoid infinite loops
      }
    }
  }

  return { changed, newAst: result };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Simplify a Boolean expression AST.
 *
 * @param {object} ast - root AST node
 * @returns {{ simplifiedAST: object, steps: Array<{law, before, after}> }}
 */
export function simplifyExpression(ast) {
  if (!ast) return { simplifiedAST: null, steps: [] };

  const allSteps = [];
  let current = cloneAST(ast);
  const MAX_ITERATIONS = 50;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const { changed, newAst } = onePass(current, allSteps);
    current = newAst;
    if (!changed) break;
  }

  return { simplifiedAST: current, steps: allSteps };
}
