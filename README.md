# ⚡ LogicLab — Digital Logic Circuit Simulator

> An interactive, browser-based digital logic simulator for building, testing, and analyzing combinational circuits in real time.

## 🚀 Features

| Feature | Description |
|---|---|
| 🎛️ **Drag-and-Drop Canvas** | Place gates and nodes on an infinite canvas powered by React Flow |
| 🔌 **Gate Library** | AND, OR, NOT, NAND, NOR, XOR, XNOR, plus INPUT and OUTPUT nodes |
| ⚡ **Real-Time Simulation** | Circuit state propagates instantly on every change |
| 📊 **Truth Table Generator** | Auto-generates complete truth tables for any valid circuit |
| 🔢 **Boolean Expression Derivation** | Derives the Boolean expression for each output automatically |
| 📥 **CSV Export** | Download the truth table as a `.csv` file |
| 🌙 **Dark-Themed UI** | A sleek, modern dark interface built with Tailwind CSS |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/) |
| **Circuit Canvas** | [@xyflow/react (React Flow)](https://reactflow.dev/) |
| **State Management** | [Zustand 5](https://github.com/pmndrs/zustand) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) |
| **Routing** | [React Router v7](https://reactrouter.com/) |

---

## 📦 Getting Started

### Prerequisites

- **Node.js** v18.x or later
- **npm** (comes with Node.js)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/digital-logic-simulator.git

# 2. Navigate into the project directory
cd digital-logic-simulator

# 3. Install dependencies
npm install
```

### Running Locally

```bash
npm run dev
```

Open your browser and go to **`http://localhost:5173`**.

### Other Scripts

```bash
npm run build    # Production build
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

---

## 🧭 Usage Guide

1. **Landing Page** — Start from the landing page and click **Launch Simulator**.
2. **Add Components** — Drag logic gates, input nodes (`INPUT`), and output nodes (`OUTPUT`) from the **Gate Library** on the left onto the canvas.
3. **Wire Components** — Click and drag from an output handle (right side of a node) to an input handle (left side of another node) to create a connection.
4. **Toggle Inputs** — Click any `INPUT` node to toggle its value between `0` and `1`. The circuit re-evaluates instantly.
5. **View Live State** — Wires and nodes are color-coded to reflect live logic levels (`HIGH` / `LOW`).
6. **Truth Table** — Open the **Truth Table** panel and click **Generate** to compute the complete truth table for all input combinations.
7. **Boolean Expression** — Open the **Boolean Expression** panel and click **Derive Expression** to view the simplified logic formula for each output.
8. **Export** — Use the **Export CSV** button to download the truth table.

---

## 🗂️ Project Structure

```
digital-logic-simulator/
├── public/                     # Static public assets
├── src/
│   ├── assets/                 # Images and other static assets
│   ├── components/
│   │   ├── gates/
│   │   │   ├── GateIcons.jsx       # SVG icon renderers for each gate type
│   │   │   ├── GateNode.jsx        # React Flow node for logic gates
│   │   │   ├── InputNode.jsx       # Toggleable binary input node
│   │   │   └── OutputNode.jsx      # Output display node
│   │   ├── BooleanExpressionPanel.jsx  # Derives & displays Boolean expressions
│   │   ├── CircuitCanvas.jsx           # Main React Flow canvas & wiring logic
│   │   ├── CustomEdge.jsx              # Styled animated wire edges
│   │   ├── GateLibrary.jsx             # Sidebar with draggable gate palette
│   │   ├── Toolbar.jsx                 # Top toolbar (clear, export, etc.)
│   │   └── TruthTablePanel.jsx         # Generates & renders the truth table
│   ├── engine/
│   │   ├── booleanExpression.js    # Boolean expression derivation algorithm
│   │   ├── logicEngine.js          # Pure-JS circuit evaluator (topological sort)
│   │   └── truthTableGenerator.js  # Truth table computation logic
│   ├── pages/
│   │   ├── LandingPage.jsx         # Marketing / intro landing page
│   │   └── SimulatorPage.jsx       # Main simulator layout & panel arrangement
│   ├── store/
│   │   └── circuitStore.js         # Zustand global state (nodes, edges, sim state)
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
└── package.json
```

---

## ⚙️ How the Logic Engine Works

The core simulation runs entirely in the browser with no backend:

1. **Graph Representation** — The circuit is stored as a directed graph of nodes (gates) and edges (wires) in the Zustand store.
2. **Topological Sort** — `logicEngine.js` traverses the graph in topological order, ensuring each gate is evaluated only after all its inputs are resolved.
3. **Gate Evaluation** — Each gate applies its Boolean function to its inputs and propagates the result downstream.
4. **Boolean Expression** — `booleanExpression.js` walks the graph backwards from each output node, recursively building a human-readable expression string.
5. **Truth Table** — `truthTableGenerator.js` iterates over all `2ⁿ` input combinations, runs the logic engine for each, and collects the results.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
