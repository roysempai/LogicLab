/**
 * SVG Gate Icons — renders compact gate symbols for each logic gate type
 */
import { IC_CONFIGS } from './icCatalog.js';

export const GateIcon = ({ type, size = 36, color = '#9CA3AF' }) => {
  const props = { width: size, height: size, viewBox: '0 0 36 36', fill: 'none' };

  switch (type) {
    case 'AND':
      return (
        <svg {...props}>
          <path d="M6 10 H18 Q30 10 30 18 Q30 26 18 26 H6 Z" stroke={color} strokeWidth="1.8" fill="none"/>
          <line x1="6" y1="14" x2="2" y2="14" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="6" y1="22" x2="2" y2="22" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="30" y1="18" x2="34" y2="18" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      );
    case 'OR':
      return (
        <svg {...props}>
          <path d="M6 10 Q12 10 18 18 Q12 26 6 26 Q10 18 6 10 Z" stroke={color} strokeWidth="1.8" fill="none"/>
          <path d="M6 10 Q20 10 30 18 Q20 26 6 26" stroke={color} strokeWidth="1.8" fill="none"/>
          <line x1="9" y1="14" x2="2" y2="14" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="9" y1="22" x2="2" y2="22" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="30" y1="18" x2="34" y2="18" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      );
    case 'NOT':
      return (
        <svg {...props}>
          <polygon points="6,10 28,18 6,26" stroke={color} strokeWidth="1.8" fill="none"/>
          <circle cx="30" cy="18" r="2" stroke={color} strokeWidth="1.8" fill="none"/>
          <line x1="6" y1="18" x2="2" y2="18" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="32" y1="18" x2="34" y2="18" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      );
    case 'NAND':
      return (
        <svg {...props}>
          <path d="M6 10 H16 Q27 10 27 18 Q27 26 16 26 H6 Z" stroke={color} strokeWidth="1.8" fill="none"/>
          <circle cx="29.5" cy="18" r="2.5" stroke={color} strokeWidth="1.8" fill="none"/>
          <line x1="6" y1="14" x2="2" y2="14" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="6" y1="22" x2="2" y2="22" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="32" y1="18" x2="34" y2="18" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      );
    case 'NOR':
      return (
        <svg {...props}>
          <path d="M6 10 Q11 10 17 18 Q11 26 6 26 Q9 18 6 10 Z" stroke={color} strokeWidth="1.8" fill="none"/>
          <path d="M6 10 Q18 10 27 18 Q18 26 6 26" stroke={color} strokeWidth="1.8" fill="none"/>
          <circle cx="29.5" cy="18" r="2.5" stroke={color} strokeWidth="1.8" fill="none"/>
          <line x1="9" y1="14" x2="2" y2="14" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="9" y1="22" x2="2" y2="22" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="32" y1="18" x2="34" y2="18" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      );
    case 'XOR':
      return (
        <svg {...props}>
          <path d="M8 10 Q14 10 20 18 Q14 26 8 26 Q12 18 8 10 Z" stroke={color} strokeWidth="1.8" fill="none"/>
          <path d="M8 10 Q22 10 30 18 Q22 26 8 26" stroke={color} strokeWidth="1.8" fill="none"/>
          <path d="M5 10 Q9 18 5 26" stroke={color} strokeWidth="1.8" fill="none"/>
          <line x1="10" y1="14" x2="2" y2="14" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="10" y1="22" x2="2" y2="22" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="30" y1="18" x2="34" y2="18" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      );
    case 'XNOR':
      return (
        <svg {...props}>
          <path d="M8 10 Q13 10 18 18 Q13 26 8 26 Q12 18 8 10 Z" stroke={color} strokeWidth="1.8" fill="none"/>
          <path d="M8 10 Q20 10 27 18 Q20 26 8 26" stroke={color} strokeWidth="1.8" fill="none"/>
          <path d="M5 10 Q9 18 5 26" stroke={color} strokeWidth="1.8" fill="none"/>
          <circle cx="29.5" cy="18" r="2.5" stroke={color} strokeWidth="1.8" fill="none"/>
          <line x1="10" y1="14" x2="2" y2="14" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="10" y1="22" x2="2" y2="22" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="32" y1="18" x2="34" y2="18" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      );
    case 'INPUT':
      return (
        <svg {...props}>
          <rect x="4" y="10" width="20" height="16" rx="4" stroke={color} strokeWidth="1.8" fill="none"/>
          <circle cx="28" cy="18" r="3" fill={color} opacity="0.5"/>
          <text x="14" y="23" fontSize="10" fontWeight="700" fill={color} textAnchor="middle" fontFamily="monospace">SW</text>
        </svg>
      );
    case 'OUTPUT':
      return (
        <svg {...props}>
          <circle cx="18" cy="18" r="10" stroke={color} strokeWidth="1.8" fill="none"/>
          <circle cx="18" cy="18" r="5" fill={color} opacity="0.4"/>
          <line x1="4" y1="18" x2="8" y2="18" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <rect x="6" y="10" width="24" height="16" rx="3" stroke={color} strokeWidth="1.8" fill="none"/>
          <text x="18" y="22" fontSize="9" fill={color} textAnchor="middle" fontFamily="monospace">{type}</text>
        </svg>
      );
    case 'HALF_ADDER':
      return (
        <svg {...props}>
          <rect x="4" y="8" width="28" height="20" rx="3" stroke={color} strokeWidth="1.8" fill="none"/>
          <text x="18" y="21" fontSize="8" fontWeight="700" fill={color} textAnchor="middle" fontFamily="monospace">HA</text>
          <line x1="4" y1="13" x2="1" y2="13" stroke={color} strokeWidth="1.5"/>
          <line x1="4" y1="23" x2="1" y2="23" stroke={color} strokeWidth="1.5"/>
          <line x1="32" y1="13" x2="35" y2="13" stroke={color} strokeWidth="1.5"/>
          <line x1="32" y1="23" x2="35" y2="23" stroke={color} strokeWidth="1.5"/>
        </svg>
      );
    case 'FULL_ADDER':
      return (
        <svg {...props}>
          <rect x="4" y="8" width="28" height="20" rx="3" stroke={color} strokeWidth="1.8" fill="none"/>
          <text x="18" y="21" fontSize="8" fontWeight="700" fill={color} textAnchor="middle" fontFamily="monospace">FA</text>
          <line x1="4" y1="12" x2="1" y2="12" stroke={color} strokeWidth="1.5"/>
          <line x1="4" y1="18" x2="1" y2="18" stroke={color} strokeWidth="1.5"/>
          <line x1="4" y1="24" x2="1" y2="24" stroke={color} strokeWidth="1.5"/>
          <line x1="32" y1="13" x2="35" y2="13" stroke={color} strokeWidth="1.5"/>
          <line x1="32" y1="23" x2="35" y2="23" stroke={color} strokeWidth="1.5"/>
        </svg>
      );
    case 'MUX_2_1':
      return (
        <svg {...props}>
          <polygon points="4,8 4,28 32,24 32,12" stroke={color} strokeWidth="1.8" fill="none"/>
          <text x="16" y="21" fontSize="8" fontWeight="700" fill={color} textAnchor="middle" fontFamily="monospace">MUX</text>
          <line x1="4" y1="13" x2="1" y2="13" stroke={color} strokeWidth="1.5"/>
          <line x1="4" y1="23" x2="1" y2="23" stroke={color} strokeWidth="1.5"/>
          <line x1="32" y1="18" x2="35" y2="18" stroke={color} strokeWidth="1.5"/>
        </svg>
      );
    case 'D_FLIPFLOP':
      return (
        <svg {...props}>
          <rect x="4" y="8" width="28" height="20" rx="3" stroke={color} strokeWidth="1.8" fill="none"/>
          <text x="18" y="19" fontSize="7" fontWeight="700" fill={color} textAnchor="middle" fontFamily="monospace">DFF</text>
          <polygon points="4,21 8,24 4,27" stroke={color} strokeWidth="1.2" fill={color} opacity="0.5"/>
          <line x1="4" y1="13" x2="1" y2="13" stroke={color} strokeWidth="1.5"/>
          <line x1="32" y1="13" x2="35" y2="13" stroke={color} strokeWidth="1.5"/>
          <line x1="32" y1="23" x2="35" y2="23" stroke={color} strokeWidth="1.5"/>
        </svg>
      );
  }
};

export const GATE_COLORS = {
  AND:         { bg: '#1A2A1A', border: '#2D4A2D', icon: '#4ADE80', accent: '#00FF88' },
  OR:          { bg: '#1A1A2A', border: '#2D2D4A', icon: '#60A5FA', accent: '#3B82F6' },
  NOT:         { bg: '#2A1A2A', border: '#4A2D4A', icon: '#C084FC', accent: '#8B5CF6' },
  NAND:        { bg: '#2A2A1A', border: '#4A4A2D', icon: '#FCD34D', accent: '#F59E0B' },
  NOR:         { bg: '#2A1A1A', border: '#4A2D2D', icon: '#F87171', accent: '#EF4444' },
  XOR:         { bg: '#1A2A2A', border: '#2D4A4A', icon: '#34D399', accent: '#10B981' },
  XNOR:        { bg: '#2A1A2A', border: '#3A2D3A', icon: '#F472B6', accent: '#EC4899' },
  INPUT:       { bg: '#1E1E12', border: '#3A3A22', icon: '#FACC15', accent: '#EAB308' },
  OUTPUT:      { bg: '#12201E', border: '#223A36', icon: '#00FF88', accent: '#00FF88' },
  ...Object.fromEntries(
    Object.entries(IC_CONFIGS).map(([type, cfg]) => [
      type,
      { bg: cfg.bg, border: cfg.border, icon: cfg.color, accent: cfg.color },
    ])
  ),
};
