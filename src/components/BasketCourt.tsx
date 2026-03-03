import { useMemo } from 'react';
import { ZONES } from '../lib/zones';
import { Session } from '../lib/sessions';

interface BasketCourtProps {
  sessions: Session[];
  onZoneClick: (zoneId: string) => void;
}

const BasketCourt = ({ sessions = [], onZoneClick }: BasketCourtProps) => {
  if (!ZONES || ZONES.length === 0) {
    return <div className="text-[#57ea9d] p-10 font-bold border border-slate-800 rounded-2xl">Zonas no cargadas</div>;
  }

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
    <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-[#020617] rounded-[2rem] overflow-hidden border border-slate-800/30">
      <svg 
        viewBox="0 0 400 300" 
        className="w-full h-full max-h-[450px]"
        preserveAspectRatio="xMidYMid meet"
      >
        {ZONES.map((zone) => {
          const stats = zoneStats[zone.id];
          const pct = stats && stats.total > 0 ? (stats.made / stats.total) * 100 : 0;
          
          const fillOpacity = stats ? Math.max(pct / 100, 0.2) : 0.08;

          return (
            <g key={zone.id} onClick={() => onZoneClick(zone.id)} className="cursor-pointer group">
              <path
                d={zone.path}
                fill="#57ea9d"
                fillOpacity={fillOpacity}
                stroke="#57ea9d"
                strokeWidth="1.2"
                strokeOpacity="0.3"
                className="transition-all duration-300 group-hover:stroke-white group-hover:stroke-2"
              />
              
              {/* LA PROTECCIÓN: Solo dibujamos el texto si 'labelPos' y 'x' existen realmente */}
              {stats && stats.total > 0 && zone.labelPos && zone.labelPos.x !== undefined && zone.labelPos.y !== undefined && (
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
