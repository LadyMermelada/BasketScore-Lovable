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
function getUniqueDaysSorted(sessions: Session[]) {
  return [...new Set(sessions.map(s => s.date.split('T')[0]))].sort();
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
      const uDays = new Set(recent.map(r => r.date.split('T')[0])).size;
      const pts = recent.reduce((a, x) => a + (x.zoneType === '3p' ? x.made * 3 : x.zoneType === '2p' ? x.made * 2 : x.made), 0);
      const att = recent.reduce((a, x) => a + x.total, 0);
      const pps = att > 0 ? pts / att : 0;
      const hit = pps >= 1.1 && uDays >= 10;
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
    evaluate: (s) => { const c = totalShots(s); return { unlocked: c >= 10000, progress: Math
