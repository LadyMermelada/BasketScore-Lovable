import { Session } from './sessions';
import { ZONES } from './zones';

export type TrophyCup = 'bronce' | 'plata' | 'oro' | 'secreto';
export type TrophyGoalType = 'cantidad' | 'porcentaje' | 'racha' | 'hito';

export interface TrophyDef {
  id: string;
  nombre: string;
  saga: string;
  copa: TrophyCup;
  descripcion: string;
  esSecreto: boolean;
  valorObjetivo: number;
  tipoMeta: TrophyGoalType;
  emoji: string;
  evaluate: (sessions: Session[]) => { unlocked: boolean; progress: number; current: number };
}

// --- Helpers ---
function totalShots(sessions: Session[]) {
  return sessions.reduce((a, s) => a + s.total, 0);
}
function totalMade(sessions: Session[]) {
  return sessions.reduce((a, s) => a + s.made, 0);
}
function uniqueDays(sessions: Session[]) {
  return new Set(sessions.map(s => s.date.split('T')[0])).size;
}
function getUniqueDaysSorted(sessions: Session[]) {
  const days = [...new Set(sessions.map(s => s.date.split('T')[0]))].sort();
  return days;
}
function longestStreak(sessions: Session[]) {
  const days = getUniqueDaysSorted(sessions);
  if (days.length === 0) return 0;
  let max = 1, cur = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const next = new Date(days[i]);
    const diff = (next.getTime() - prev.getTime()) / 86400000;
    if (diff === 1) { cur++; max = Math.max(max, cur); }
    else { cur = 1; }
  }
  return max;
}
function daysInCurrentMonth(sessions: Session[]) {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  const days = new Set(
    sessions
      .filter(s => { const d = new Date(s.date); return d.getFullYear() === y && d.getMonth() === m; })
      .map(s => s.date.split('T')[0])
  );
  return days.size;
}
function uniqueZones(sessions: Session[]) {
  return new Set(sessions.map(s => s.zoneId)).size;
}
function sessionsByType(sessions: Session[], type: string) {
  return sessions.filter(s => s.zoneType === type);
}

// --- Trophy Definitions ---
export const TROPHIES: TrophyDef[] = [
  // BRONCE (12)
  {
    id: 'rookie', nombre: 'Rookie', saga: 'Primeros pasos', copa: 'bronce',
    descripcion: 'Alcanza 100 tiros totales', esSecreto: false, valorObjetivo: 100, tipoMeta: 'cantidad', emoji: '🎯',
    evaluate: (s) => { const c = totalShots(s); return { unlocked: c >= 100, progress: Math.min(c / 100, 1), current: c }; }
  },
  {
    id: 'primer_sudor', nombre: 'Primer Sudor', saga: 'Primeros pasos', copa: 'bronce',
    descripcion: 'Registra tu primera sesión', esSecreto: false, valorObjetivo: 1, tipoMeta: 'hito', emoji: '💦',
    evaluate: (s) => ({ unlocked: s.length >= 1, progress: s.length >= 1 ? 1 : 0, current: s.length })
  },
  {
    id: 'mano_caliente', nombre: 'Mano Caliente', saga: 'Precisión', copa: 'bronce',
    descripcion: '50% acierto en sesión de ≥50 tiros', esSecreto: false, valorObjetivo: 50, tipoMeta: 'hito', emoji: '🔥',
    evaluate: (s) => {
      const hit = s.some(x => x.total >= 50 && (x.made / x.total) >= 0.5);
      return { unlocked: hit, progress: hit ? 1 : 0, current: hit ? 1 : 0 };
    }
  },
  {
    id: 'no_es_tan_facil', nombre: 'No es tan fácil', saga: 'Tiros Libres', copa: 'bronce',
    descripcion: 'Meter 10 tiros libres', esSecreto: false, valorObjetivo: 10, tipoMeta: 'cantidad', emoji: '🏋️',
    evaluate: (s) => { const c = totalMade(sessionsByType(s, 'tl')); return { unlocked: c >= 10, progress: Math.min(c / 10, 1), current: c }; }
  },
  {
    id: 'primer_triplazo', nombre: 'Primer Triplazo', saga: 'Triples', copa: 'bronce',
    descripcion: 'Mete tu primer triple', esSecreto: false, valorObjetivo: 1, tipoMeta: 'hito', emoji: '🎆',
    evaluate: (s) => { const c = totalMade(sessionsByType(s, '3p')); return { unlocked: c >= 1, progress: c >= 1 ? 1 : 0, current: c }; }
  },
  {
    id: 'semana_santa', nombre: 'Semana Santa', saga: 'Constancia', copa: 'bronce',
    descripcion: '3 días seguidos entrenando', esSecreto: false, valorObjetivo: 3, tipoMeta: 'racha', emoji: '📅',
    evaluate: (s) => { const c = longestStreak(s); return { unlocked: c >= 3, progress: Math.min(c / 3, 1), current: c }; }
  },
  {
    id: 'explorador', nombre: 'Explorador', saga: 'Versatilidad', copa: 'bronce',
    descripcion: 'Registra tiros en 3 zonas distintas', esSecreto: false, valorObjetivo: 3, tipoMeta: 'hito', emoji: '🗺️',
    evaluate: (s) => { const c = uniqueZones(s); return { unlocked: c >= 3, progress: Math.min(c / 3, 1), current: c }; }
  },
  {
    id: 'sesion_relampago', nombre: 'Sesión Relámpago', saga: 'Velocidad', copa: 'bronce',
    descripcion: '50 tiros en una sola sesión', esSecreto: false, valorObjetivo: 50, tipoMeta: 'hito', emoji: '⚡',
    evaluate: (s) => {
      const hit = s.some(x => x.total >= 50);
      return { unlocked: hit, progress: hit ? 1 : 0, current: hit ? 1 : 0 };
    }
  },
  {
    id: 'estudiante', nombre: 'Estudiante', saga: 'Disciplina', copa: 'bronce',
    descripcion: 'Registra 5 sesiones de entrenamiento', esSecreto: false, valorObjetivo: 5, tipoMeta: 'cantidad', emoji: '📚',
    evaluate: (s) => { const c = s.length; return { unlocked: c >= 5, progress: Math.min(c / 5, 1), current: c }; }
  },
  {
    id: 'tirador_matematico', nombre: 'Tirador Matemático', saga: 'Precisión', copa: 'bronce',
    descripcion: '50% eFG en sesión de ≥30 tiros', esSecreto: false, valorObjetivo: 50, tipoMeta: 'hito', emoji: '🧮',
    evaluate: (s) => {
      const hit = s.some(x => x.total >= 30 && (x.made / x.total) >= 0.5);
      return { unlocked: hit, progress: hit ? 1 : 0, current: hit ? 1 : 0 };
    }
  },
  {
    id: 'valor_inicial', nombre: 'Valor Inicial', saga: 'Eficiencia', copa: 'bronce',
    descripcion: 'Alcanza 1.0 PPS en una sesión (mín. 50 tiros)', esSecreto: false, valorObjetivo: 1, tipoMeta: 'hito', emoji: '📈',
    evaluate: (s) => {
      const hit = s.some(x => {
        const pts = x.zoneType === '3p' ? x.made * 3 : x.zoneType === '2p' ? x.made * 2 : x.made;
        return x.total >= 50 && (pts / x.total) >= 1.0;
      });
      return { unlocked: hit, progress: hit ? 1 : 0, current: hit ? 1 : 0 };
    }
  },
  {
    id: 'cachorro', nombre: 'Cachorro de Cancha', saga: 'Volumen', copa: 'bronce',
    descripcion: '1,000 tiros totales', esSecreto: false, valorObjetivo: 1000, tipoMeta: 'cantidad', emoji: '🐶',
    evaluate: (s) => { const c = totalShots(s); return { unlocked: c >= 1000, progress: Math.min(c / 1000, 1), current: c }; }
  },

  // PLATA (8)
  {
    id: 'brazo_hierro', nombre: 'Brazo de Hierro', saga: 'Volumen', copa: 'plata',
    descripcion: '2,500 tiros totales', esSecreto: false, valorObjetivo: 2500, tipoMeta: 'cantidad', emoji: '💪',
    evaluate: (s) => { const c = totalShots(s); return { unlocked: c >= 2500, progress: Math.min(c / 2500, 1), current: c }; }
  },
  {
    id: 'cirujano', nombre: 'Cirujano', saga: 'Precisión', copa: 'plata',
    descripcion: '70% acierto en sesión de ≥100 tiros', esSecreto: false, valorObjetivo: 70, tipoMeta: 'hito', emoji: '🔬',
    evaluate: (s) => {
      const hit = s.some(x => x.total >= 100 && (x.made / x.total) >= 0.7);
      return { unlocked: hit, progress: hit ? 1 : 0, current: hit ? 1 : 0 };
    }
  },
  {
    id: 'especialista', nombre: 'Especialista', saga: 'Tiros Libres', copa: 'plata',
    descripcion: '80% en Libres (mín. 100 tiros)', esSecreto: false, valorObjetivo: 80, tipoMeta: 'hito', emoji: '🎯',
    evaluate: (s) => {
      const ft = sessionsByType(s, 'tl');
      const t = totalShots(ft), m = totalMade(ft);
      const hit = t >= 100 && (m / t) >= 0.8;
      return { unlocked: hit, progress: hit ? 1 : 0, current: t >= 100 ? Math.round((m / t) * 100) : 0 };
    }
  },
  {
    id: 'lluvia_fuego', nombre: 'Lluvia de Fuego', saga: 'Triples', copa: 'plata',
    descripcion: '25 triples metidos en una sesión', esSecreto: false, valorObjetivo: 25, tipoMeta: 'hito', emoji: '🌧️',
    evaluate: (s) => {
      const hit = sessionsByType(s, '3p').some(x => x.made >= 25);
      return { unlocked: hit, progress: hit ? 1 : 0, current: hit ? 1 : 0 };
    }
  },
  {
    id: 'mes_trabajador', nombre: 'Mes del Trabajador', saga: 'Constancia', copa: 'plata',
    descripcion: '22 días entrenando en un mes', esSecreto: false, valorObjetivo: 22, tipoMeta: 'cantidad', emoji: '🏗️',
    evaluate: (s) => { const c = daysInCurrentMonth(s); return { unlocked: c >= 22, progress: Math.min(c / 22, 1), current: c }; }
  },
  {
    id: 'mapa_completo', nombre: 'Mapa Completo', saga: 'Versatilidad', copa: 'plata',
    descripcion: 'Registra tiros en las 12 zonas', esSecreto: false, valorObjetivo: 12, tipoMeta: 'cantidad', emoji: '🗺️',
    evaluate: (s) => { const c = uniqueZones(s); return { unlocked: c >= 12, progress: Math.min(c / 12, 1), current: c }; }
  },
  {
    id: 'valor_seguro', nombre: 'Valor Seguro', saga: 'Eficiencia', copa: 'plata',
    descripcion: 'Promedio 1.1 PPS últimos 30 días (mín. 10 días)', esSecreto: false, valorObjetivo: 1.1, tipoMeta: 'hito', emoji: '💎',
    evaluate: (s) => {
      const limit = new Date(); limit.setDate(limit.getDate() - 30);
      const recent = s.filter(x => new Date(x.date) >= limit);
      const uniqueDays = new Set(recent.map(r => r.date.split('T')[0])).size;
      const pts = recent.reduce((a, x) => a + (x.zoneType === '3p' ? x.made * 3 : x.zoneType === '2p' ? x.made * 2 : x.made), 0);
      const att = recent.reduce((a, x) => a + x.total, 0);
      const pps = att > 0 ? pts / att : 0;
      const hit = pps >= 1.1 && uniqueDays >= 10;
      return { unlocked: hit, progress: hit ? 1 : 0, current: Math.round(pps * 100) / 100 };
    }
  },
  {
    id: 'quincena_hierro', nombre: 'Quincena de Hierro', saga: 'Constancia', copa: 'plata',
    descripcion: '15 días de racha', esSecreto: false, valorObjetivo: 15, tipoMeta: 'racha', emoji: '🔗',
    evaluate: (s) => { const c = longestStreak(s); return { unlocked: c >= 15, progress: Math.min(c / 15, 1), current: c }; }
  },

  // ORO (5)
  {
    id: 'metralleta', nombre: 'Metralleta', saga: 'Volumen', copa: 'oro',
    descripcion: '10,000 tiros totales', esSecreto: false, valorObjetivo: 10000, tipoMeta: 'cantidad', emoji: '🔫',
    evaluate: (s) => { const c = totalShots(s); return { unlocked: c >= 10000, progress: Math.min(c / 10000, 1), current: c }; }
  },
  {
    id: 'mamba', nombre: 'Mamba Mentality', saga: 'Constancia', copa: 'oro',
    descripcion: '30 días de racha consecutiva', esSecreto: false, valorObjetivo: 30, tipoMeta: 'racha', emoji: '🐍',
    evaluate: (s) => { const c = longestStreak(s); return { unlocked: c >= 30, progress: Math.min(c / 30, 1), current: c }; }
  },
  {
    id: 'gran_capitan', nombre: 'El Gran Capitán', saga: 'Tiros Libres', copa: 'oro',
    descripcion: '100 tiros libres consecutivos sin fallar', esSecreto: false, valorObjetivo: 100, tipoMeta: 'hito', emoji: '👑',
    evaluate: (s) => {
      const ft = sessionsByType(s, 'tl');
      const hit = ft.some(x => x.total >= 100 && x.made === x.total);
      return { unlocked: hit, progress: hit ? 1 : 0, current: hit ? 1 : 0 };
    }
  },
  {
    id: 'curry_mode', nombre: 'Curry Mode', saga: 'Triples', copa: 'oro',
    descripcion: '50% en Triples (mín. 200 tiros/mes)', esSecreto: false, valorObjetivo: 50, tipoMeta: 'hito', emoji: '🍛',
    evaluate: (s) => {
      const limit = new Date(); limit.setDate(limit.getDate() - 30);
      const recent3 = sessionsByType(s, '3p').filter(x => new Date(x.date) >= limit);
      const t = totalShots(recent3), m = totalMade(recent3);
      const hit = t >= 200 && (m / t) >= 0.5;
      return { unlocked: hit, progress: hit ? 1 : 0, current: t >= 200 ? Math.round((m / t) * 100) : 0 };
    }
  },
  {
    id: 'goat', nombre: 'GOAT', saga: 'Leyenda', copa: 'oro',
    descripcion: 'Desbloquea 20 trofeos', esSecreto: false, valorObjetivo: 20, tipoMeta: 'cantidad', emoji: '🐐',
    evaluate: (s) => {
      return { unlocked: false, progress: 0, current: 0 };
    }
  },

  // SECRETOS (10)
  {
    id: 'buho_nocturno', nombre: 'Búho Nocturno', saga: 'Horarios', copa: 'bronce',
    descripcion: 'Registra una sesión después de medianoche', esSecreto: true, valorObjetivo: 1, tipoMeta: 'hito', emoji: '🦉',
    evaluate: (s) => {
      const hit = s.some(x => { 
        if (!x.date.includes('T')) return false; 
        const h = new Date(x.date).getHours(); 
        return h >= 0 && h < 5; 
      });
      return { unlocked: hit, progress: hit ? 1 : 0, current: hit ? 1 : 0 };
    }
  },
  {
    id: 'madrugador', nombre: 'Madrugador', saga: 'Horarios', copa: 'bronce',
    descripcion: 'Registra una sesión antes de las 7am', esSecreto: true, valorObjetivo: 1, tipoMeta: 'hito', emoji: '🌅',
    evaluate: (s) => {
      const hit = s.some(x => { 
        if (!x.date.includes('T')) return false; 
        const h = new Date(x.date).getHours(); 
        return h >= 5 && h < 7; 
      });
      return { unlocked: hit, progress: hit ? 1 : 0, current: hit ? 1 : 0 };
    }
  },
  {
    id: 'hielo_venas', nombre: 'Hielo en las Venas', saga: 'Precisión', copa: 'oro',
    descripcion: '100% acierto en sesión de ≥20 tiros', esSecreto: true, valorObjetivo: 1, tipoMeta: 'hito', emoji: '🧊',
    evaluate: (s) => {
      const hit = s.some(x => x.total >= 20 && x.made === x.total);
      return { unlocked: hit, progress: hit ? 1 : 0, current: hit ? 1 : 0 };
    }
  },
  {
    id: 'centenario', nombre: 'Centenario', saga: 'Volumen', copa: 'oro',
    descripcion: 'Registra 100 sesiones', esSecreto: true, valorObjetivo: 100, tipoMeta: 'cantidad', emoji: '💯',
    evaluate: (s) => { const c = s.length; return { unlocked: c >= 100, progress: Math.min(c / 100, 1), current: c }; }
  },
  {
    id: 'perfeccionista', nombre: 'Perfeccionista', saga: 'Precisión', copa: 'oro',
    descripcion: '90% en cualquier zona (mín. 50 tiros)', esSecreto: true, valorObjetivo: 90, tipoMeta: 'hito', emoji: '✨',
    evaluate: (s) => {
      const byZone: Record<string, { m: number; t: number }> = {};
      s.forEach(x => {
        if (!byZone[x.zoneId]) byZone[x.zoneId] = { m: 0, t: 0 };
        byZone[x.zoneId].m += x.made;
        byZone[x.zoneId].t += x.total;
      });
      const hit = Object.values(byZone).some(z => z.t >= 50 && (z.m / z.t) >= 0.9);
      return { unlocked: hit, progress: hit ? 1 : 0, current: hit ? 1 : 0 };
    }
  },
  {
    id: 'doble_doble', nombre: 'Doble-Doble', saga: 'Versatilidad', copa: 'plata',
    descripcion: '50%+ en 2P y 3P el mismo día (mín. 20 c/u)', esSecreto: true, valorObjetivo: 1, tipoMeta: 'hito', emoji: '✌️',
    evaluate: (s) => {
      const byDay: Record<string, { m2: number; t2: number; m3: number; t3: number }> = {};
      s.forEach(x => {
        const d = x.date.split('T')[0];
        if (!byDay[d]) byDay[d] = { m2: 0, t2: 0, m3: 0, t3: 0 };
        if (x.zoneType === '2p') { byDay[d].m2 += x.made; byDay[d].t2 += x.total; }
        if (x.zoneType === '3p') { byDay[d].m3 += x.made; byDay[d].t3 += x.total; }
      });
      const hit = Object.values(byDay).some(d => d.t2 >= 20 && d.t3 >= 20 && (d.m2 / d.t2) >= 0.5 && (d.m3 / d.t3) >= 0.5);
      return { unlocked:
