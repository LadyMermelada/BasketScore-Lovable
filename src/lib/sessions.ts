export interface Session {
  id: number;
  zoneId: string;
  date: string;
  total: number;
  made: number;
  zoneType: string; // 'tl' | '2p' | '3p'
  zoneLabel: string;
  note: string;
}

const STORAGE_KEY = 'basketscore_sessions';

export function loadSessions(): Session[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSessions(sessions: Session[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function exportSessions(sessions: Session[]) {
  const blob = new Blob([JSON.stringify(sessions, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `basketscore_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function importSessions(file: File): Promise<Session[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!Array.isArray(data)) throw new Error('Invalid format');
        resolve(data);
      } catch {
        reject(new Error('El archivo no tiene un formato válido'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsText(file);
  });
}

export function getPercentage(made: number, total: number): number {
  return total > 0 ? Math.round((made / total) * 100) : 0;
}

export function getSessionsInDays(sessions: Session[], days: number): Session[] {
  const limit = new Date();
  limit.setDate(limit.getDate() - days);
  return sessions.filter(s => new Date(s.date) >= limit);
}

export function getZoneTypeAverage(sessions: Session[], zoneType: string): number {
  const filtered = sessions.filter(s => s.zoneType === zoneType);
  const totalMade = filtered.reduce((a, b) => a + b.made, 0);
  const totalShots = filtered.reduce((a, b) => a + b.total, 0);
  return getPercentage(totalMade, totalShots);
}

export function getGlobalAverage(sessions: Session[]): number {
  const totalMade = sessions.reduce((a, b) => a + b.made, 0);
  const totalShots = sessions.reduce((a, b) => a + b.total, 0);
  return getPercentage(totalMade, totalShots);
}
