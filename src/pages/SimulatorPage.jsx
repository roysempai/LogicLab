/**
 * Simulator Page — three-panel layout: Gate Library | Circuit Canvas | Output Panel
 */
import { useNavigate } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import GateLibrary from '../components/GateLibrary.jsx';
import CircuitCanvas from '../components/CircuitCanvas.jsx';
import TruthTablePanel from '../components/TruthTablePanel.jsx';
import ExpressionBuilder from '../components/ExpressionBuilder.jsx';
import SimplifierPanel from '../components/SimplifierPanel.jsx';
import Toolbar from '../components/Toolbar.jsx';
import useCircuitStore from '../store/circuitStore.js';

const SimulatorPage = () => {
  const navigate = useNavigate();
  const engineError = useCircuitStore(s => s.engineError);

  return (
    <ReactFlowProvider>
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0A0A0A',
        overflow: 'hidden',
      }}>
        {/* Toolbar */}
        <Toolbar onGoHome={() => navigate('/')} />

        {/* Error bar */}
        {engineError && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            borderBottom: '1px solid rgba(239,68,68,0.2)',
            color: '#EF4444',
            fontSize: 12,
            padding: '6px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexShrink: 0,
          }}>
            <span>⚠️</span>
            {engineError}
          </div>
        )}

        {/* Three-panel layout */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left: Gate Library */}
          <GateLibrary />

          {/* Center: Canvas */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <CircuitCanvas />
          </div>

          {/* Right: Output Panel */}
          <div className="output-panel" style={{ width: 310, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Boolean Expression Builder (tabbed: Build | Derive) */}
            <ExpressionBuilder />

            {/* Simplifier */}
            <SimplifierPanel />

            {/* Divider */}
            <div style={{ height: 1, background: '#1A1A1A', margin: '0 14px', flexShrink: 0 }} />

            {/* Truth Table */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <TruthTablePanel />
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div style={{
          height: 24,
          background: '#0A0A0A',
          borderTop: '1px solid #111111',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 16,
          flexShrink: 0,
        }}>
          <StatusItem label="Simulation" value="Real-time" color="#00FF88" />
          <StatusItem label="ICs" value="4 types" color="#06B6D4" />
          <StatusItem label="Phase" value="2 — IC + Simplifier" color="#8B5CF6" />
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: '#1E1E1E' }}>
            LogicLab v2.0 — Digital Logic Circuit Simulator
          </span>
        </div>
      </div>
    </ReactFlowProvider>
  );
};

const StatusItem = ({ label, value, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#2D2D2D' }}>
    <span style={{ color: '#1E1E1E' }}>{label}:</span>
    <span style={{ color: color || '#3D3D3D', fontWeight: 600 }}>{value}</span>
  </div>
);

export default SimulatorPage;
