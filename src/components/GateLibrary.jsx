/**
 * Gate Library — left panel with draggable gate cards
 * Now includes IC Components section (Half Adder, Full Adder, MUX, D Flip-Flop)
 */
import { useState } from 'react';
import { GateIcon, GATE_COLORS } from './gates/GateIcons.jsx';
import { IC_CATEGORIES, IC_CONFIGS } from './gates/icCatalog.js';

const GATES = [
  { type: 'AND',  label: 'AND Gate',  desc: '2 inputs' },
  { type: 'OR',   label: 'OR Gate',   desc: '2 inputs' },
  { type: 'NOT',  label: 'NOT Gate',  desc: '1 input'  },
  { type: 'NAND', label: 'NAND Gate', desc: '2 inputs' },
  { type: 'NOR',  label: 'NOR Gate',  desc: '2 inputs' },
  { type: 'XOR',  label: 'XOR Gate',  desc: '2 inputs' },
  { type: 'XNOR', label: 'XNOR Gate', desc: '2 inputs' },
];

const IO_NODES = [
  { type: 'INPUT',  label: 'Input Switch', desc: 'Toggle 0/1' },
  { type: 'OUTPUT', label: 'Output LED',   desc: 'Reads signal' },
];

const SectionHeader = ({ children }) => (
  <div style={{
    padding: '6px 16px 4px',
    fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
    color: '#374151', textTransform: 'uppercase',
  }}>
    {children}
  </div>
);

const Divider = () => (
  <div style={{ margin: '8px 16px', height: 1, background: '#1A1A1A' }} />
);

const DraggableItem = ({ type, label, desc, isIC = false }) => {
  const colors = GATE_COLORS[type] || GATE_COLORS.AND;

  const onDragStart = (e) => {
    e.dataTransfer.setData('application/reactflow-type', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="gate-library-item"
      draggable
      onDragStart={onDragStart}
      title={`Drag to add ${label}`}
      style={{
        cursor: 'grab',
        borderLeft: isIC ? `2px solid ${colors.accent}44` : 'none',
      }}
    >
      {/* Icon box */}
      <div
        className="gate-icon-wrap"
        style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
      >
        <GateIcon type={type} size={24} color={colors.icon} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: isIC ? colors.accent : '#E5E7EB', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {label}
        </div>
        <div style={{ fontSize: 11, color: '#4B5563', marginTop: 1 }}>
          {desc}
        </div>
      </div>

      {/* Drag handle */}
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, opacity: 0.3 }}>
        <circle cx="4" cy="3" r="1" fill="white"/>
        <circle cx="8" cy="3" r="1" fill="white"/>
        <circle cx="4" cy="6" r="1" fill="white"/>
        <circle cx="8" cy="6" r="1" fill="white"/>
        <circle cx="4" cy="9" r="1" fill="white"/>
        <circle cx="8" cy="9" r="1" fill="white"/>
      </svg>
    </div>
  );
};

const GateLibrary = () => {
  const [expandedSections, setExpandedSections] = useState(
    IC_CATEGORIES.reduce((acc, c) => ({ ...acc, [c.title]: true }), {})
  );

  const toggleSection = (title) => {
    setExpandedSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <div className="side-panel" style={{ width: 220, flexShrink: 0 }}>
      {/* Header */}
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Gate Library</span>
        <span style={{ fontSize: 10, color: '#2A2A2A', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
          drag to canvas
        </span>
      </div>

      <div style={{ overflowY: 'auto', flex: 1 }}>
        {/* I/O Section */}
        <SectionHeader>I/O Nodes</SectionHeader>
        {IO_NODES.map(g => <DraggableItem key={g.type} {...g} />)}

        <Divider />

        {/* Gates Section */}
        <SectionHeader>Logic Gates</SectionHeader>
        {GATES.map(g => <DraggableItem key={g.type} {...g} />)}

        <Divider />

        {/* IC Sections */}
        {IC_CATEGORIES.map((category) => {
          const isOpen = expandedSections[category.title];
          return (
            <div key={category.title}>
              <div
                style={{
                  padding: '6px 16px 4px',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: '#06B6D4',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onClick={() => toggleSection(category.title)}
              >
                <span>{category.title}</span>
                <span style={{ fontSize: 10, opacity: 0.7 }}>{isOpen ? '▾' : '▸'}</span>
              </div>

              {isOpen && category.items.map((type) => {
                const cfg = IC_CONFIGS[type];
                if (!cfg) return null;
                return (
                  <DraggableItem
                    key={type}
                    type={type}
                    label={cfg.label}
                    desc={cfg.desc}
                    isIC
                  />
                );
              })}
            </div>
          );
        })}

        {/* Footer hint */}
        <div style={{ padding: '16px', borderTop: '1px solid #111111', marginTop: 8 }}>
          <div style={{ fontSize: 11, color: '#2D2D2D', lineHeight: 1.6, textAlign: 'center' }}>
            💡 Connect nodes by dragging from a pin handle<br/>
            <span style={{ color: '#06B6D444', fontSize: 10 }}>ICs expose labeled input and output pins</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GateLibrary;
