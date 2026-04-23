# Digital Logic Simulator

A web-based digital logic circuit simulator built with React, Vite, and Tailwind CSS. This application allows users to build and test digital logic circuits in a visual, interactive environment. It features a drag-and-drop interface, real-time simulation, automatic generation of truth tables and Boolean expressions, and advanced tools for expression simplification and circuit generation.

## Features

*   **Interactive Circuit Canvas**: Build circuits by dragging gates from the library and connecting them.
*   **Gate Library**: A selection of standard logic gates, inputs, outputs, and Integrated Circuits (ICs).
*   **Real-time Simulation**: Circuit outputs update instantly as you build and modify the circuit.
*   **Expression to Circuit**: Automatically generate a logic circuit from a Boolean expression.
*   **Boolean Expression Derivation**: Automatically derive and display the Boolean expression for each output.
*   **Boolean Algebra Simplifier**: Simplify complex expressions with a step-by-step breakdown of the laws applied.
*   **Truth Table Generation**: Automatically generate and display a truth table for your circuit.
*   **Integrated Circuits**: Use pre-built ICs like Half Adders and Full Adders, with the ability to expand them to see their internal logic.
*   **Export to CSV**: Export the generated truth table as a CSV file.
*   **Modern UI**: A clean and modern user interface built with Tailwind CSS.

## Technologies Used

*   **Frontend**: [React](https://reactjs.org/) with [Vite](https://vitejs.dev/)
*   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
*   **Circuit Canvas**: [React Flow](https://reactflow.dev/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Routing**: [React Router](https://reactrouter.com/)

## Getting Started

### Prerequisites

*   Node.js (v18.x or later)
*   npm or yarn

### Installation & Setup

1.  Clone the repository:
    ```bash
    git clone https://github.com/roysempai/LogicLab
    ```
2.  Navigate to the project directory:
    ```bash
    cd digital-logic-simulator
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

### Running the Application

To start the development server, run:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Usage

1.  **Add Gates**: Drag logic gates, ICs, input nodes, and output nodes from the library on the left onto the canvas.
2.  **Connect Nodes**: Click and drag from the output handle of one node to the input handle of another to create a connection.
3.  **Build from Expression**: Type a Boolean expression (e.g., `A AND B OR NOT C`) in the "Build" tab and click "Build Circuit" to automatically generate the circuit.
4.  **Simplify Expressions**: Enter an expression and click "Simplify Expression" to see the simplified version and the steps involved. You can then view the simplified circuit or stamp it onto the canvas.
5.  **Derive Expression**: Build a circuit and click "Derive Expression" in the "Derive" tab to see the resulting Boolean logic.
6.  **Generate Truth Table**: Click the "Generate" button in the Truth Table panel to see the complete truth table for your circuit.

## Project Structure

```
/src
├── assets/         # Static assets
├── components/     # Reusable React components
│   ├── gates/      # Components for logic gates and ICs
│   ├── BooleanExpressionPanel.jsx
│   ├── CircuitCanvas.jsx
│   ├── CustomEdge.jsx
│   ├── ExpressionBuilder.jsx
│   ├── GateLibrary.jsx
│   ├── SimplifierPanel.jsx
│   ├── Toolbar.jsx
│   └── TruthTablePanel.jsx
├── engine/         # Core logic for simulation
│   ├── astToCircuit.js
│   ├── booleanExpression.js
│   ├── booleanSimplifier.js
│   ├── expressionParser.js
│   ├── logicEngine.js
│   └── truthTableGenerator.js
├── pages/          # Page components
│   ├── LandingPage.jsx
│   └── SimulatorPage.jsx
└── store/          # Zustand store for state management
    └── circuitStore.js
```

## Core Engine

The `engine` directory contains the core logic for the simulator. Here's a brief overview of each module:

*   `expressionParser.js`: Parses Boolean expressions into an Abstract Syntax Tree (AST).
*   `astToCircuit.js`: Converts the AST into a circuit graph compatible with React Flow.
*   `booleanExpression.js`: Derives Boolean expressions from the circuit graph.
*   `logicEngine.js`: Simulates the circuit and computes the output values.
*   `truthTableGenerator.js`: Generates a truth table for the circuit.
*   `booleanSimplifier.js`: Simplifies Boolean expressions using algebraic laws.

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
