/**
 * Custom Edge — renders wires between gates with active/inactive signal coloring
 */
import { BaseEdge, getSmoothStepPath } from '@xyflow/react';

const CustomEdge = ({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  data, style,
  markerEnd,
}) => {
  const [edgePath] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    borderRadius: 8,
  });

  const isActive = data?.isActive;

  return (
    <>
      {/* Glow layer for active wires */}
      {isActive && (
        <path
          d={edgePath}
          fill="none"
          stroke="rgba(0,255,136,0.2)"
          strokeWidth={8}
          strokeLinecap="round"
        />
      )}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }}
        markerEnd={markerEnd}
      />
      {/* Animated flow dots on active wires */}
      {isActive && (
        <circle r="3" fill="#00FF88" style={{ filter: 'drop-shadow(0 0 4px #00FF88)' }}>
          <animateMotion dur="1.2s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}
    </>
  );
};

export default CustomEdge;
