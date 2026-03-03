import { useMemo } from 'react';
import { ZONES } from '../lib/zones';
import { Session } from '../lib/sessions';

interface BasketCourtProps {
  sessions: Session[];
  onZoneClick: (zoneId: string) => void;
}

const BasketCourt = ({ sessions, onZoneClick }: BasketCourtProps) => {
  const zoneStats = useMemo(() => {
    const stats: Record<string, { made: number; total: number }> = {};
    if (sessions) {
      sessions.forEach(s => {
        if (!stats[s.zoneId]) stats[s.zoneId] = { made: 0, total: 0 };
        stats[s.zoneId].made += s.made;
        stats[s.zoneId].total += s.total;
      });
    }
    return stats;
  }, [sessions]);

  return (
    <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
      <svg viewBox="0 0 400 300" className="w-full h-full">
        {ZONES.map((zone) => {
          const stats = zoneStats[zone.id];
          const pct = stats ? (stats.made / stats.total) * 100 : 0;
          const fillOpacity = stats ? Math.max(pct / 100, 0.1) : 0.05;

          return (
            <g key={zone.id} onClick={() => onZoneClick(zone.id)} className="cursor-pointer group">
              <path
                d={zone.path}
                fill="#57ea9d"
                fillOpacity={fillOpacity}
                stroke="#57ea9d"
                strokeWidth="1"
                className="transition-all duration-300 group-hover:stroke-2"
              />
              {stats && (
                <text
                  x={zone.labelPos.x}
                  y={zone.labelPos.y}
                  textAnchor="middle"
                  fill="white"
                  className="font-black pointer-events-none drop-shadow-md"
                  style={{ fontSize: '10px' }}
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
