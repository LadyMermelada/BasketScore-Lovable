import { useMemo } from 'react';
import { ZONES } from '../lib/zones';
import { Session } from '../lib/sessions';

interface BasketCourtProps {
  sessions: Session[];
  onZoneClick: (zoneId: string) => void;
}

const BasketCourt = ({ sessions = [], onZoneClick }: BasketCourtProps) => {
  // 1. Verificación de seguridad de ZONES
  if (!ZONES || !Array.isArray(ZONES)) {
    return <div className="p-4 text-red-500 bg-white">Error crítico: No se encuentran las Zonas.</div>;
  }

  const zoneStats = useMemo(() => {
    const stats: Record<string, { made: number; total: number }> = {};
    // Nos aseguramos de que sessions sea un array antes de iterar
    const safeSessions = Array.isArray(sessions) ? sessions : [];
    
    safeSessions.forEach(s => {
      if (!s || !s.zoneId) return; // Ignoramos sesiones corruptas
      if (!stats[s.zoneId]) stats[s.zoneId] = { made: 0, total: 0 };
      stats[s.zoneId].made += (s.made || 0);
      stats[s.zoneId].total += (s.total || 0);
    });
    return stats;
  }, [sessions]);

  return (
    <div className="relative w-full aspect-[4/3] bg-[#0f172a] rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden">
      <svg viewBox="0 0 400 300" className="w-full h-full drop-shadow-xl">
        {ZONES.map((zone) => {
          const stats = zoneStats[zone.id];
          const pct = stats && stats.total > 0 ? (stats.made / stats.total) * 100 : 0;
          
          // Heatmap monocromo: Si no hay tiros, opacidad mínima (0.05). 
          // Si hay, escala desde 0.2 hasta 1.0.
          const fillOpacity = stats && stats.total > 0 ? Math.max(pct / 100, 0.2) : 0.05;

          return (
            <g 
              key={zone.id} 
              onClick={() => onZoneClick(zone.id)} 
              className="cursor-pointer group outline-none"
            >
              <path
                d={zone.path}
                fill="#57ea9d"
                fillOpacity={fillOpacity}
                stroke="#57ea9d"
                strokeWidth="1.5"
                strokeOpacity="0.4"
                className="transition-all duration-300 group-hover:stroke-white group-hover:stroke-2"
              />
              {stats && stats.total > 0 && (
                <text
                  x={zone.labelPos.x}
                  y={zone.labelPos.y}
                  textAnchor="middle"
                  fill="white"
                  className="font-black pointer-events-none select-none"
                  style={{ fontSize: '18px', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.9))' }}
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
