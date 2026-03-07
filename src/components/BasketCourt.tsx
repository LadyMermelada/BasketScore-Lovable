import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Session } from '../lib/sessions';
import { ZONES } from '../lib/zones';

interface Props {
  sessions: Session[];
  onZoneClick: (zoneId: string) => void;
}

const ZONE_PATHS: Record<string, { d?: string; rect?: { x: number; y: number; w: number; h: number } }> = {
  Triple_Izq: { d: "M183.25,275.82v74.18H0v-164.96h71.82c24.9,42.18,64.34,74.74,111.43,90.78Z" },
  Triple_Der: { d: "M500,185.04v164.96h-183.25v-74.21c47.09-16.04,86.55-48.59,111.44-90.75h71.81Z" },
  Triple_Frontal: { d: "M316.75,275.79v74.21h-133.5v-74.18c20.92,7.13,43.36,11,66.7,11s45.84-3.88,66.8-11.03Z" },
  Pintura_Baja: { rect: { x: 183.25, y: 0, w: 133.5, h: 110.04 } },
  Pintura_Alta: { rect: { x: 183.25, y: 110.04, w: 133.5, h: 110.04 } },
  Triple_Esquina_Der: { rect: { x: 428.13, y: 0, w: 71.87, h: 185.03 } },
  Doble_Lateral_Der: { rect: { x: 316.75, y: 0, w: 111.44, h: 110.04 } },
  Doble_Ala_Der: { d: "M428.19,110.04v75c-35.94,60.87-102.25,101.72-178.06,101.78,36.8-.07,66.62-29.93,66.62-66.75v-110.03h111.44Z" },
  TiroLibre: { d: "M316.75,220.07c0,36.86-29.89,66.75-66.75,66.75s-66.75-29.89-66.75-66.75h133.5Z" },
  Triple_Esquina_Izq: { rect: { x: 0, y: 0, w: 71.87, h: 185.03 } },
  Doble_Lateral_Izq: { rect: { x: 71.82, y: 0, w: 111.43, h: 110.04 } },
  Doble_Ala_Izq: { d: "M249.95,286.82c-75.88,0-142.16-40.86-178.13-101.78v-75h111.43v110.03c0,36.84,29.85,66.72,66.7,66.75Z" },
};

const ZONE_CENTERS: Record<string, { x: number; y: number }> = {
  Triple_Izq: { x: 85, y: 270 },
  Triple_Der: { x: 415, y: 270 },
  Triple_Frontal: { x: 250, y: 310 },
  Pintura_Baja: { x: 250, y: 55 },
  Pintura_Alta: { x: 250, y: 165 },
  Triple_Esquina_Der: { x: 464, y: 92 },
  Doble_Lateral_Der: { x: 372, y: 55 },
  Doble_Ala_Der: { x: 380, y: 175 },
  TiroLibre: { x: 250, y: 250 },
  Triple_Esquina_Izq: { x: 36, y: 92 },
  Doble_Lateral_Izq: { x: 128, y: 55 },
  Doble_Ala_Izq: { x: 120, y: 175 },
};

// Rim position — roughly where the basket is on a half-court
const RIM = { x: 250, y: 47 };

export default function BasketCourt({ sessions, onZoneClick }: Props) {
  const zoneStats = useMemo(() => {
    const stats: Record<string, number> = {};
    ZONES.forEach(z => {
      const zSessions = (sessions || []).filter(s => s && s.zoneId === z.id);
      if (zSessions.length > 0) {
        const made = zSessions.reduce((a, b) => a + (b.made || 0), 0);
        const total = zSessions.reduce((a, b) => a + (b.total || 0), 0);
        stats[z.id] = total > 0 ? (made / total) * 100 : 0;
      } else {
        stats[z.id] = -1;
      }
    });
    return stats;
  }, [sessions]);

  return (
    <div className="relative w-full" style={{ aspectRatio: '500/350' }}>
      <svg viewBox="0 0 500 350" className="w-full h-full">
        <defs>
          {/* Radial gradient per zone — origin at rim, intensity based on % */}
          {ZONES.map(zone => {
            const pct = zoneStats[zone.id] ?? -1;
            const intensity = pct <= 0 ? 0.04 : Math.max(pct / 100, 0.12);
            return (
              <radialGradient
                key={`grad-${zone.id}`}
                id={`grad-${zone.id}`}
                cx={RIM.x}
                cy={RIM.y}
                r="320"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={Math.min(intensity * 1.8, 0.9)} />
                <stop offset="40%" stopColor="hsl(var(--primary))" stopOpacity={intensity * 0.6} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={intensity * 0.1} />
              </radialGradient>
            );
          })}
        </defs>

        {ZONES.map((zone, i) => {
          const path = ZONE_PATHS[zone.id];
          const center = ZONE_CENTERS[zone.id];
          const pct = zoneStats[zone.id];

          if (!path) return null;

          return (
            <motion.g
              key={zone.id}
              className="cursor-pointer group"
              onClick={() => onZoneClick(zone.id)}
              whileHover={{ scale: 1.015 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
            >
              {path.d ? (
                <path
                  d={path.d}
                  fill={`url(#grad-${zone.id})`}
                  stroke="hsl(var(--primary))"
                  strokeWidth="0.8"
                  strokeOpacity="0.25"
                  className="transition-all duration-300 group-hover:stroke-opacity-60 group-hover:stroke-[1.2px]"
                />
              ) : path.rect ? (
                <rect
                  x={path.rect.x}
                  y={path.rect.y}
                  width={path.rect.w}
                  height={path.rect.h}
                  fill={`url(#grad-${zone.id})`}
                  stroke="hsl(var(--primary))"
                  strokeWidth="0.8"
                  strokeOpacity="0.25"
                  className="transition-all duration-300 group-hover:stroke-opacity-60 group-hover:stroke-[1.2px]"
                />
              ) : null}

              {center && pct >= 0 && (
                <text
                  x={center.x}
                  y={center.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  className="pointer-events-none select-none font-mono font-bold"
                  style={{
                    fontSize: '18px',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {pct.toFixed(0)}%
                </text>
              )}
            </motion.g>
          );
        })}

        {/* Vectorial Rim */}
        <g
          className="cursor-pointer"
          onClick={() => onZoneClick('Pintura_Baja')}
        >
          <title>Aro / Rim</title>
          {/* Rim circle */}
          <circle
            cx={RIM.x}
            cy={RIM.y}
            r="11"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            opacity="0.7"
          />
          {/* Net lines — simple 3-line suggestion */}
          <line x1={RIM.x - 8} y1={RIM.y + 5} x2={RIM.x - 4} y2={RIM.y + 16} stroke="hsl(var(--primary))" strokeWidth="0.8" opacity="0.35" />
          <line x1={RIM.x} y1={RIM.y + 11} x2={RIM.x} y2={RIM.y + 18} stroke="hsl(var(--primary))" strokeWidth="0.8" opacity="0.35" />
          <line x1={RIM.x + 8} y1={RIM.y + 5} x2={RIM.x + 4} y2={RIM.y + 16} stroke="hsl(var(--primary))" strokeWidth="0.8" opacity="0.35" />
          {/* Backboard */}
          <line x1={RIM.x - 22} y1={RIM.y - 14} x2={RIM.x + 22} y2={RIM.y - 14} stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.5" />
          {/* Connector rim to board */}
          <line x1={RIM.x} y1={RIM.y - 11} x2={RIM.x} y2={RIM.y - 14} stroke="hsl(var(--primary))" strokeWidth="1.2" opacity="0.5" />
        </g>
      </svg>
    </div>
  );
}
