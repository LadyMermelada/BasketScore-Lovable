import { useMemo } from 'react';
import { ZONES } from '../lib/zones';
import { Session } from '../lib/sessions';

interface BasketCourtProps {
  sessions: Session[];
  onZoneClick: (zoneId: string) => void;
}

const BasketCourt = ({ sessions = [], onZoneClick }: BasketCourtProps) => {
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

  if (!ZONES) return null;

  return (
    <div className="w-full h-full min-h-[350px] flex items-center justify-center bg-[#020617] rounded-[2rem] overflow-hidden border border-slate-800/50 shadow-2xl">
      <svg 
        viewBox="0 0 400 300" 
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {ZONES.map((zone) => {
          // Si no hay stats, forzamos valores a 0 para que no sea undefined
          const stats = zoneStats[zone.id] || { made: 0, total: 0 };
          const pct = stats.total > 0 ? (stats.made / stats.total) * 100 : 0;
          
          // LA CLAVE: Opacidad mínima de 0.2 (20%) para que la cancha SIEMPRE se vea.
          // Si hay tiros, sube hasta 1.0 (100%).
          const fillOpacity = stats.total > 0 ? Math.max(pct / 100, 0.3) : 0.2;

          return (
            <g key={zone.id} onClick={() => onZoneClick(zone.id)} className="cursor-pointer group">
              <path
                d={zone.path}
                fill="#57ea9d"
                fillOpacity={fillOpacity}
                stroke="#57ea9d"
                strokeWidth="1.5"
                strokeOpacity="0.5"
                className="transition-all duration-300 group-hover:fillOpacity-50 group-hover:stroke-white group-hover:stroke-2"
              />
              {/* SIEMPRE mostramos el texto, incluso si es 0% */}
              <text
                x={zone.labelPos.x}
                y={zone.labelPos.y}
                textAnchor="middle"
                fill="white"
                className="font-black pointer-events-none select-none transition-all duration-300 group-hover:fill-[#57ea9d]"
                style={{ fontSize: '18px', filter: 'drop-shadow(0px 3px 6px rgba(0,0,0,0.9))' }}
              >
                {pct.toFixed(0)}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default BasketCourt;
