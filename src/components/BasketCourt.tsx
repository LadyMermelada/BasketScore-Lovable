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

  return (
    <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      <svg viewBox="0 0 400 300" className="w-full h-full">
        {(ZONES || []).map((zone) => {
          const stats = zoneStats[zone.id];
          const pct = stats && stats.total > 0 ? (stats.made / stats.total) * 100 : 0;
          
          // TU LÓGICA ORIGINAL: Monocromático a #57ea9d.
          // Si hay stats, opacidad es el %. Si no, 0.05 para el borde oscuro.
          const fillOpacity = stats ? Math.max(pct / 100, 0.1) : 0.05;

          // GUARDIA ABSOLUTA: Solo dibuja el texto si las coordenadas X e Y existen de verdad.
          const hasValidLabel = zone.labelPos && typeof zone.labelPos.x !== 'undefined' && typeof zone.labelPos.y !== 'undefined';

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
              {stats && hasValidLabel && (
                <text
                  x={zone.labelPos.x}
                  y={zone.labelPos.y}
                  textAnchor="middle"
                  fill="white"
                  // Usamos Tailwind para el tamaño (text-[14px]) de forma segura
                  className="font-black pointer-events-none drop-shadow-md text-[14px]"
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
