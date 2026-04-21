/**
 * Toolbar — top bar with undo/redo, clear, save/load, export
 */
import { useRef } from 'react';
import useCircuitStore from '../store/circuitStore.js';

const Toolbar = ({ onGoHome }) => {
  const {
    undo, redo, clearCanvas,
    saveCircuit, loadCircuit,
    history, future,
    nodes,
  } = useCircuitStore();

  const fileInputRef = useRef(null);

  const handleLoadFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => loadCircuit(ev.target.result);
    reader.readAsText(file);
    e.target.value = '';
  };

  const nodeCount = nodes.length;

  return (
    <div className="toolbar">
      {/* Brand */}
      <button
        id="btn-go-home"
        onClick={onGoHome}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#E5E7EB', fontFamily: 'Inter, sans-serif',
          fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
          padding: '0 8px 0 0',
          borderRight: '1px solid #1E1E1E',
          marginRight: 4,
        }}
      >
        <span style={{ fontSize: 18 }}>⚡</span>
        <span style={{ background: 'linear-gradient(135deg,#00FF88,#3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          LogicLab
        </span>
      </button>

      {/* Divider */}
      <div className="toolbar-divider" />

      {/* Edit group */}
      <button id="btn-undo" className="toolbar-btn" onClick={undo} disabled={history.length === 0} title="Undo (Ctrl+Z)">
        <UndoIcon /> Undo
      </button>
      <button id="btn-redo" className="toolbar-btn" onClick={redo} disabled={future.length === 0} title="Redo (Ctrl+Y)">
        <RedoIcon /> Redo
      </button>

      <div className="toolbar-divider" />

      {/* Circuit group */}
      <button id="btn-save" className="toolbar-btn" onClick={saveCircuit} disabled={nodeCount === 0} title="Save circuit as JSON">
        <SaveIcon /> Save
      </button>
      <button id="btn-load" className="toolbar-btn" onClick={() => fileInputRef.current?.click()} title="Load circuit from JSON">
        <LoadIcon /> Load
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleLoadFile}
      />

      <div className="toolbar-divider" />

      <button id="btn-clear" className="toolbar-btn danger" onClick={() => {
        if (nodeCount === 0 || confirm('Clear the canvas? This cannot be undone.')) {
          clearCanvas();
        }
      }} disabled={nodeCount === 0} title="Clear canvas">
        <TrashIcon /> Clear
      </button>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Status */}
      <div style={{ fontSize: 11, color: '#2D2D2D', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: nodeCount > 0 ? '#3D3D3D' : '#1E1E1E' }}>
          {nodeCount} node{nodeCount !== 1 ? 's' : ''}
        </span>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '3px 10px', borderRadius: 999,
          background: 'rgba(0,255,136,0.06)',
          border: '1px solid rgba(0,255,136,0.12)',
          fontSize: 11, color: '#00FF88', fontWeight: 600,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#00FF88',
            boxShadow: '0 0 6px #00FF88',
            display: 'inline-block',
          }} />
          LIVE
        </div>
      </div>
    </div>
  );
};

// Inline micro icons
const UndoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 6C2 3.8 3.8 2 6 2c2.2 0 4 1.8 4 4s-1.8 4-4 4H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M2 4l0 2 2 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const RedoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M12 6C12 3.8 10.2 2 8 2c-2.2 0-4 1.8-4 4s1.8 4 4 4h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 4l0 2-2 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const SaveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="2" y="2" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="4.5" y="2" width="5" height="3.5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M4 8h6M4 10h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);
const LoadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 9v2a1 1 0 001 1h8a1 1 0 001-1V9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M7 2v7M4.5 6.5L7 9l2.5-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2.5 4h9M5.5 4V3a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M4 4l.8 7h4.4L10 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default Toolbar;
