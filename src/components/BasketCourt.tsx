import { useMemo } from 'react';
import { ZONES } from '../lib/zones';
import { Session } from '../lib/sessions';

interface BasketCourtProps {
  sessions: Session[];
  onZoneClick: (zoneId: string) => void;
}

const BasketCourt = ({ sessions = [], onZoneClick }: BasketCourtProps) => {
  if (!ZONES || ZONES.length === 0) return null;

  const zoneStats = useMemo(() => {
    const stats: Record<string, { made: number; total: number }> = {};
    const safeSessions = Array.isArray(sessions) ? sessions : [];
    
    safeSessions.forEach(s => {
      if (!s || !s.zoneId) return;
      if (!stats[s.zoneId]) stats[s.zoneId] = { made: 0, total: 0 };
      stats[s.zoneId].made += s.made;
      stats[s.zoneId].total += s.total;
    });
    return stats;
  }, [sessions]);

  return (
    <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-[#020617] rounded-[2rem] overflow-hidden">
      <svg 
        viewBox="0 0 400 300" 
        className="w-full h-full max-h-[450px]"
        preserveAspectRatio="xMidYMid meet"
      >
        {ZONES.map((zone) => {
          const stats = zoneStats[zone.id];
          const hasData = stats && stats.total > 0;
          const pct = hasData ? (stats.made / stats.total) * 100 : 0;
          
          // EL RELLENO: Si no hay datos, transparencia total (0). Si hay, opacidad según %
          const fillOpacity = hasData ? Math.max(pct / 100, 0.1) : 0;

          return (
            <g key={zone.id} onClick={() => onZoneClick(zone.id)} className="cursor-pointer group">
              <path
                d={zone.path}
                fill="#57ea9d"
                fillOpacity={fillOpacity}
                stroke="#57ea9d" // LAS LÍNEAS DE LA CANCHA (Siempre visibles)
                strokeWidth="1.5"
                strokeOpacity="0.4" // Siempre al 40% de brillo para dibujar la pista
                className="transition-all duration-300 group-hover:stroke-white group-hover:stroke-2"
              />
              
              {/* Solo mostramos número si hay datos y si las coordenadas X/Y existen */}
              {hasData && zone.labelPos?.x !== undefined && zone.labelPos?.y !== undefined && (
                <text
                  x={zone.labelPos.x}
                  y={zone.labelPos.y}
                  textAnchor="middle"
                  fill="white"
                  className="font-black pointer-events-none select-none"
                  style={{ fontSize: '18px', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.8))' }}
                >
                  {pct.toFixed(0)}%
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default BasketCourt;
