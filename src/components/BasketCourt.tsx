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
    if (Array.isArray(sessions)) {
      sessions.forEach(s => {
        if (!s) return;
        if (!stats[s.zoneId]) stats[s.zoneId] = { made: 0, total: 0 };
        stats[s.zoneId].made += s.made;
        stats[s.zoneId].total += s.total;
      });
    }
    return stats;
  }, [sessions]);

  return (
    <div className="relative w-full aspect-[4/3] bg-[#020617] rounded-3xl border border-slate-800/50 overflow-hidden shadow-inner">
      <svg viewBox="0 0 400 300" className="w-full h-full drop-shadow-2xl">
        {ZONES.map((zone) => {
          const stats = zoneStats[zone.id];
          const pct = stats && stats.total > 0 ? (stats.made / stats.total) * 100 : 0;
          
          // Heatmap: Opacidad basada en acierto (mínimo 0.05 para que se vea el área vacía)
          const fillOpacity = stats ? Math.max(pct / 100, 0.15) : 0.05;

          return (
            <g key={zone.id} onClick={() => onZoneClick(zone.id)} className="cursor-pointer group">
              <path
                d={zone.path}
                fill="#57ea9d"
                fillOpacity={fillOpacity}
                stroke="#57ea9d"
                strokeWidth="1"
                strokeOpacity="0.3"
                className="transition-all duration-300 group-hover:stroke-primary group-hover:stroke-2"
              />
              {stats && stats.total > 0 && (
                <text
                  x={zone.labelPos.x}
                  y={zone.labelPos.y}
                  textAnchor="middle"
                  fill="white"
                  className="font-black pointer-events-none select-none"
                  style={{ fontSize: '18px', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))' }}
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
