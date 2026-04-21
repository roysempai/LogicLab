/**
 * Landing Page — Hero section with animated background and feature highlights
 */
import { useNavigate } from 'react-router-dom';
import { GateIcon } from '../components/gates/GateIcons.jsx';

const FLOATING_GATES = [
  { type: 'AND', x: '8%',  y: '20%', size: 52, delay: '0s',   dur: '7s'  },
  { type: 'OR',  x: '88%', y: '15%', size: 44, delay: '1s',   dur: '9s'  },
  { type: 'NOT', x: '15%', y: '72%', size: 40, delay: '2s',   dur: '8s'  },
  { type: 'XOR', x: '82%', y: '65%', size: 48, delay: '0.5s', dur: '10s' },
  { type: 'NAND',x: '5%',  y: '48%', size: 36, delay: '1.5s', dur: '6s'  },
  { type: 'NOR', x: '90%', y: '42%', size: 38, delay: '2.5s', dur: '11s' },
  { type: 'XNOR',x: '50%', y: '82%', size: 42, delay: '3s',   dur: '8.5s'},
];

const FEATURES = [
  {
    icon: '🔌',
    title: 'Drag & Drop Circuits',
    desc: 'Intuitively place logic gates on an infinite canvas. Connect them with animated wires that show real signal flow.',
    color: '#00FF88',
  },
  {
    icon: '⚡',
    title: 'Real-Time Simulation',
    desc: 'Toggle inputs and watch your circuit respond instantly. Every gate updates live as you build.',
    color: '#3B82F6',
  },
  {
    icon: '📊',
    title: 'Auto Truth Tables',
    desc: 'Generate complete truth tables with a single click. Supports up to 5 inputs with active row highlighting.',
    color: '#8B5CF6',
  },
  {
    icon: '🧮',
    title: 'Boolean Expressions',
    desc: 'Automatically derive the boolean expression for your circuit. Copy and use in your assignments.',
    color: '#F59E0B',
  },
  {
    icon: '💾',
    title: 'Save & Load',
    desc: 'Save your circuits as JSON files and reload them anytime. Export truth tables as CSV.',
    color: '#EC4899',
  },
  {
    icon: '↩️',
    title: 'Undo / Redo',
    desc: 'Full undo and redo support so you can experiment freely without fear of losing work.',
    color: '#10B981',
  },
];

const GATE_TYPES = ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      overflowY: 'auto',
      overflowX: 'hidden',
      position: 'relative',
    }}>
      {/* Background grid */}
      <div className="grid-bg" style={{
        position: 'fixed', inset: 0, zIndex: 0,
        opacity: 0.4,
        pointerEvents: 'none',
      }} />

      {/* Hero gradient glow */}
      <div style={{
        position: 'fixed',
        top: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        height: '60vh',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(0,255,136,0.08) 0%, transparent 65%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Floating gate symbols */}
      {FLOATING_GATES.map((g, i) => (
        <div key={i} style={{
          position: 'fixed',
          left: g.x, top: g.y,
          opacity: 0.04,
          pointerEvents: 'none',
          zIndex: 0,
          animation: `float ${g.dur} ease-in-out ${g.delay} infinite`,
        }}>
          <GateIcon type={g.type} size={g.size} color="#00FF88" />
        </div>
      ))}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Nav */}
        <nav style={{
          padding: '20px 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          <div style={{
            fontSize: 20, fontWeight: 800,
            background: 'linear-gradient(135deg,#00FF88,#3B82F6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ WebkitTextFillColor: 'initial', fontSize: 22 }}>⚡</span>
            LogicLab
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 12, color: '#3D3D3D', padding: '3px 10px', borderRadius: 999, border: '1px solid #1E1E1E' }}>
              Phase 1
            </span>
            <button
              id="btn-nav-simulator"
              onClick={() => navigate('/simulator')}
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                border: '1px solid rgba(0,255,136,0.3)',
                background: 'rgba(0,255,136,0.08)',
                color: '#00FF88',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.target.style.background = 'rgba(0,255,136,0.16)'; e.target.style.boxShadow = '0 0 20px rgba(0,255,136,0.2)'; }}
              onMouseLeave={e => { e.target.style.background = 'rgba(0,255,136,0.08)'; e.target.style.boxShadow = 'none'; }}
            >
              Open Simulator →
            </button>
          </div>
        </nav>

        {/* Hero */}
        <div style={{
          textAlign: 'center',
          padding: '80px 24px 60px',
          animation: 'slideUp 0.7s ease-out',
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 999,
            background: 'rgba(0,255,136,0.06)',
            border: '1px solid rgba(0,255,136,0.15)',
            fontSize: 12,
            color: '#00FF88',
            fontWeight: 600,
            letterSpacing: '0.04em',
            marginBottom: 28,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#00FF88',
              boxShadow: '0 0 6px #00FF88',
              display: 'inline-block',
              animation: 'pulseGlow 2s infinite',
            }} />
            Interactive Digital Logic Simulator
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(40px, 7vw, 84px)',
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            marginBottom: 24,
            color: '#FFFFFF',
          }}>
            Build Logic.{' '}
            <span className="text-gradient">See Truth.</span>
          </h1>

          {/* Sub */}
          <p style={{
            fontSize: 'clamp(15px, 2vw, 19px)',
            color: '#6B7280',
            maxWidth: 560,
            margin: '0 auto 44px',
            lineHeight: 1.7,
            fontWeight: 400,
          }}>
            Design digital circuits visually, simulate logic gates in real time,
            and auto-generate truth tables and boolean expressions — all in one tool.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              id="btn-start-building"
              onClick={() => navigate('/simulator')}
              style={{
                padding: '14px 36px',
                borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(135deg, #00FF88, #00CC6A)',
                color: '#0A0A0A',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                boxShadow: '0 0 30px rgba(0,255,136,0.35)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 0 40px rgba(0,255,136,0.5)'; }}
              onMouseLeave={e => { e.target.style.transform = 'none'; e.target.style.boxShadow = '0 0 30px rgba(0,255,136,0.35)'; }}
            >
              Start Building →
            </button>
            <button
              id="btn-learn-more"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                padding: '14px 36px',
                borderRadius: 10,
                border: '1px solid #2A2A2A',
                background: 'transparent',
                color: '#9CA3AF',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.target.style.borderColor = '#444'; e.target.style.color = '#FFF'; }}
              onMouseLeave={e => { e.target.style.borderColor = '#2A2A2A'; e.target.style.color = '#9CA3AF'; }}
            >
              See Features
            </button>
          </div>

          {/* Gate preview strip */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
            marginTop: 64,
            flexWrap: 'wrap',
          }}>
            {GATE_TYPES.map((type) => (
              <div key={type} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '12px 14px',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.2s',
                cursor: 'default',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,255,136,0.04)'; e.currentTarget.style.borderColor = 'rgba(0,255,136,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
              >
                <GateIcon type={type} size={32} color="#4B5563" />
                <span style={{ fontSize: 10, color: '#2D2D2D', fontWeight: 700, letterSpacing: '0.06em' }}>{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features grid */}
        <div id="features" style={{ padding: '60px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 800, color: '#E5E7EB', letterSpacing: '-0.02em' }}>
              Everything you need to learn digital logic
            </h2>
            <p style={{ fontSize: 15, color: '#4B5563', marginTop: 12 }}>
              Built for ECE students, powered by real simulation
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="card-glass"
                style={{
                  borderRadius: 14,
                  padding: '24px',
                  transition: 'all 0.25s ease',
                  animation: `slideUp 0.5s ease-out ${i * 0.08}s both`,
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = `${f.color}22`;
                  e.currentTarget.style.boxShadow = `0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px ${f.color}11`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#E5E7EB', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Bottom */}
        <div style={{
          textAlign: 'center',
          padding: '40px 24px 80px',
          borderTop: '1px solid rgba(255,255,255,0.04)',
        }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#E5E7EB', marginBottom: 12 }}>
            Ready to simulate?
          </h2>
          <p style={{ fontSize: 14, color: '#4B5563', marginBottom: 24 }}>
            No installation required. 100% browser-based.
          </p>
          <button
            id="btn-start-building-2"
            onClick={() => navigate('/simulator')}
            style={{
              padding: '14px 40px',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #00FF88, #00CC6A)',
              color: '#0A0A0A',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 0 30px rgba(0,255,136,0.3)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.target.style.transform = 'none'; }}
          >
            Open Simulator →
          </button>
          <p style={{ fontSize: 11, color: '#1E1E1E', marginTop: 16 }}>
            Built for Digital Logic Design (DLD) learners
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
