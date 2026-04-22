/**
 * Boolean Expression Parser — Recursive Descent
 *
 * Supported syntax:
 *   Variables : A, B, Cin, A1  (any identifier)
 *   NOT       : NOT A  |  !A  |  ~A  |  ¬A
 *   AND       : A AND B  |  A · B  |  A & B  |  A * B
 *   OR        : A OR B   |  A + B  |  A | B
 *   XOR       : A XOR B  |  A ⊕ B  |  A ^ B
 *   NAND      : A NAND B
 *   NOR       : A NOR B
 *   XNOR      : A XNOR B
 *   Parens    : ( A AND B )
 *
 * Precedence (high → low): NOT > NAND/NOR/XNOR > AND > XOR > OR
 *
 * AST node shapes:
 *   { type: 'variable', name: 'A' }
 *   { type: 'not',  arg: <node> }
 *   { type: 'and',  args: [<node>, <node>] }
 *   { type: 'or',   args: [<node>, <node>] }
 *   { type: 'xor',  args: [<node>, <node>] }
 *   { type: 'nand', args: [<node>, <node>] }
 *   { type: 'nor',  args: [<node>, <node>] }
 *   { type: 'xnor', args: [<node>, <node>] }
 */

// ─── Tokeniser ────────────────────────────────────────────────────────────────

const TK = {
  VAR:    'VAR',
  NOT:    'NOT',
  AND:    'AND',
  OR:     'OR',
  XOR:    'XOR',
  NAND:   'NAND',
  NOR:    'NOR',
  XNOR:   'XNOR',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  EOF:    'EOF',
};

const KEYWORDS = {
  AND: TK.AND, OR: TK.OR, NOT: TK.NOT,
  XOR: TK.XOR, NAND: TK.NAND, NOR: TK.NOR, XNOR: TK.XNOR,
  // common aliases
  AND_: TK.AND, OR_: TK.OR, NOT_: TK.NOT,
};

function tokenise(src) {
  const tokens = [];
  let i = 0;

  while (i < src.length) {
    // skip whitespace
    if (/\s/.test(src[i])) { i++; continue; }

    // symbols
    if (src[i] === '(') { tokens.push({ type: TK.LPAREN }); i++; continue; }
    if (src[i] === ')') { tokens.push({ type: TK.RPAREN }); i++; continue; }

    // NOT aliases
    if (src[i] === '!' || src[i] === '~' || src[i] === '¬') {
      tokens.push({ type: TK.NOT }); i++; continue;
    }
    // AND aliases
    if (src[i] === '·' || src[i] === '&' || src[i] === '*') {
      tokens.push({ type: TK.AND }); i++; continue;
    }
    // OR aliases
    if (src[i] === '+' || src[i] === '|') {
      tokens.push({ type: TK.OR }); i++; continue;
    }
    // XOR alias
    if (src[i] === '⊕' || src[i] === '^') {
      tokens.push({ type: TK.XOR }); i++; continue;
    }

    // keyword or identifier
    if (/[A-Za-z_]/.test(src[i])) {
      let start = i;
      while (i < src.length && /[A-Za-z0-9_]/.test(src[i])) i++;
      const word = src.slice(start, i).toUpperCase();
      const kwType = KEYWORDS[word] || KEYWORDS[word + '_'];
      if (kwType) {
        tokens.push({ type: kwType });
      } else {
        // treat as variable — preserve original casing
        tokens.push({ type: TK.VAR, name: src.slice(start, i) });
      }
      continue;
    }

    throw new Error(`Unexpected character: '${src[i]}' at position ${i}`);
  }

  tokens.push({ type: TK.EOF });
  return tokens;
}

// ─── Recursive-descent parser ─────────────────────────────────────────────────

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }

  peek() { return this.tokens[this.pos]; }
  consume() { return this.tokens[this.pos++]; }

  expect(type) {
    const t = this.consume();
    if (t.type !== type) throw new Error(`Expected ${type}, got ${t.type}`);
    return t;
  }

  // expr = orExpr
  parseExpr() {
    return this.parseOr();
  }

  // orExpr = xorExpr (OR xorExpr)*
  parseOr() {
    let left = this.parseXor();
    while (this.peek().type === TK.OR) {
      this.consume();
      const right = this.parseXor();
      left = { type: 'or', args: [left, right] };
    }
    return left;
  }

  // xorExpr = andExpr (XOR andExpr)*
  parseXor() {
    let left = this.parseAnd();
    while (this.peek().type === TK.XOR) {
      this.consume();
      const right = this.parseAnd();
      left = { type: 'xor', args: [left, right] };
    }
    return left;
  }

  // andExpr = nandExpr (AND nandExpr)*
  parseAnd() {
    let left = this.parseNandNorXnor();
    while (this.peek().type === TK.AND) {
      this.consume();
      const right = this.parseNandNorXnor();
      left = { type: 'and', args: [left, right] };
    }
    return left;
  }

  // nandNorXnor = notExpr (NAND|NOR|XNOR notExpr)?
  parseNandNorXnor() {
    let left = this.parseNot();
    const t = this.peek().type;
    if (t === TK.NAND || t === TK.NOR || t === TK.XNOR) {
      this.consume();
      const right = this.parseNot();
      const opType = t.toLowerCase(); // 'nand', 'nor', 'xnor'
      return { type: opType, args: [left, right] };
    }
    return left;
  }

  // notExpr = NOT notExpr | primary
  parseNot() {
    if (this.peek().type === TK.NOT) {
      this.consume();
      const arg = this.parseNot();
      return { type: 'not', arg };
    }
    return this.parsePrimary();
  }

  // primary = VAR | '(' expr ')'
  parsePrimary() {
    const t = this.peek();
    if (t.type === TK.VAR) {
      this.consume();
      return { type: 'variable', name: t.name };
    }
    if (t.type === TK.LPAREN) {
      this.consume();
      const expr = this.parseExpr();
      this.expect(TK.RPAREN);
      return expr;
    }
    throw new Error(`Unexpected token: ${t.type} at position ${this.pos}`);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Parse a Boolean expression string into an AST.
 * @param {string} src
 * @returns {{ ast: object, error: string|null }}
 */
export function parseExpression(src) {
  try {
    if (!src || src.trim() === '') {
      return { ast: null, error: 'Empty expression.' };
    }
    const tokens = tokenise(src.trim());
    const parser = new Parser(tokens);
    const ast = parser.parseExpr();
    if (parser.peek().type !== TK.EOF) {
      throw new Error(`Unexpected token after expression: ${parser.peek().type}`);
    }
    return { ast, error: null };
  } catch (e) {
    return { ast: null, error: e.message };
  }
}

/**
 * Collect unique variable names from an AST (in order of first appearance).
 * @param {object} ast
 * @returns {string[]}
 */
export function getVariables(ast) {
  const seen = new Set();
  const vars = [];
  function walk(node) {
    if (!node) return;
    if (node.type === 'variable') {
      if (!seen.has(node.name)) { seen.add(node.name); vars.push(node.name); }
      return;
    }
    if (node.arg) walk(node.arg);
    if (node.args) node.args.forEach(walk);
  }
  walk(ast);
  return vars;
}

/**
 * Convert an AST back to a human-readable string.
 * @param {object} ast
 * @returns {string}
 */
export function astToString(ast) {
  if (!ast) return '';
  switch (ast.type) {
    case 'variable': return ast.name;
    case 'not':  return `¬(${astToString(ast.arg)})`;
    case 'and':  return `(${ast.args.map(astToString).join(' · ')})`;
    case 'or':   return `(${ast.args.map(astToString).join(' + ')})`;
    case 'xor':  return `(${ast.args.map(astToString).join(' ⊕ ')})`;
    case 'nand': return `¬(${ast.args.map(astToString).join(' · ')})`;
    case 'nor':  return `¬(${ast.args.map(astToString).join(' + ')})`;
    case 'xnor': return `¬(${ast.args.map(astToString).join(' ⊕ ')})`;
    default:     return '?';
  }
}
