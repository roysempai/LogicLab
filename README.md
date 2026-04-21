# Digital Logic Simulator

A web-based digital logic circuit simulator built with React, Vite, and Tailwind CSS. This application allows users to build and test digital logic circuits in a visual, interactive environment. It features a drag-and-drop interface, real-time simulation, and automatic generation of truth tables and Boolean expressions.

![Digital Logic Simulator Screenshot](https://i.imgur.com/your-screenshot.png)  <!-- It's recommended to replace this with an actual screenshot -->

## Features

*   **Interactive Circuit Canvas**: Build circuits by dragging gates from the library and connecting them.
*   **Gate Library**: A selection of standard logic gates including AND, OR, NOT, NAND, NOR, XOR, and XNOR, as well as input and output nodes.
*   **Real-time Simulation**: Circuit outputs update instantly as you build and modify the circuit.
*   **Truth Table Generation**: Automatically generate and display a truth table for your circuit.
*   **Boolean Expression Derivation**: Automatically derive and display the Boolean expression for each output.
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

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/digital-logic-simulator.git
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

1.  **Open the Simulator**: Navigate to the simulator page.
2.  **Add Gates**: Drag logic gates, input nodes, and output nodes from the library on the left onto the canvas.
3.  **Connect Nodes**: Click and drag from the output handle of one node to the input handle of another to create a connection.
4.  **Toggle Inputs**: Click on the input nodes to toggle their values between 0 and 1.
5.  **View Outputs**: Observe the real-time output changes on the output nodes and in the connected parts of the circuit.
6.  **Generate Truth Table**: Click the "Generate" button in the Truth Table panel to see the complete truth table for your circuit.
7.  **Derive Boolean Expression**: Click the "Derive Expression" button in the Boolean Expression panel to see the logic formula.

## Project Structure

```
/src
├── assets/         # Static assets
├── components/     # Reusable React components
│   ├── gates/      # Components for logic gates
│   ├── BooleanExpressionPanel.jsx
│   ├── CircuitCanvas.jsx
│   ├── GateLibrary.jsx
│   ├── Toolbar.jsx
│   └── TruthTablePanel.jsx
├── engine/         # Core logic for simulation
│   ├── booleanExpression.js
│   ├── logicEngine.js
│   └── truthTableGenerator.js
├── pages/          # Page components
│   ├── LandingPage.jsx
│   └── SimulatorPage.jsx
└── store/          # Zustand store for state management
    └── circuitStore.js
```

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

