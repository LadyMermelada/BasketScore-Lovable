import { useMemo } from 'react';
import { ZONES } from '../lib/zones';
import { Session } from '../lib/sessions';

interface BasketCourtProps {
  sessions: Session[];
  onZoneClick: (zoneId: string) => void;
}

const BasketCourt = ({ sessions = [], onZoneClick }: BasketCourtProps) => {
  // Verificación de emergencia: Si ZONES no carga, mostramos aviso
  if (!ZONES || ZONES.length === 0) {
    return <div className="text-primary p-10 font-bold">Error: No se detectan las zonas de la cancha.</div>;
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
    <div className="w-full h-full flex items-center justify-center bg-[#020617] rounded-[2rem] overflow-hidden">
      <svg 
        viewBox="0 0 400 300" 
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-auto max-h-full"
      >
        {ZONES.map((zone) => {
          const stats = zoneStats[zone.id];
          const pct = stats && stats.total > 0 ? (stats.made / stats.total) * 100 : 0;
          
          // Heatmap: Color cian con opacidad según éxito (mínimo 10% para ver la zona)
          const fillOpacity = stats ? Math.max(pct / 100, 0.2) : 0.08;

          return (
            <g key={zone.id} onClick={() => onZoneClick(zone.id)} className="cursor-pointer group">
              <path
                d={zone.path}
                fill="#57ea9d"
                fillOpacity={fillOpacity}
                stroke="#57ea9d"
                strokeWidth="1.5"
                strokeOpacity="0.3"
                className="transition-all duration-300 group-hover:stroke-white group-hover:stroke-2"
              />
              {stats && stats.total > 0 && (
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
