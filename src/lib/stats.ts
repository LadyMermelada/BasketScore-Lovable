import { Session } from './sessions';

export const filterLast30Days = (sessions: Session[]) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return sessions.filter(s => new Date(s.date) >= thirtyDaysAgo);
};

export const filterToday = (sessions: Session[]) => {
  const today = new Date().toISOString().split('T')[0];
  return sessions.filter(s => s.date.startsWith(today));
};

export const calculateProStats = (sessions: Session[]) => {
  let stats = {
    made2p: 0, att2p: 0,
    made3p: 0, att3p: 0,
    madeFT: 0, attFT: 0,
    totalPoints: 0,
    totalAttempts: 0
  };

  sessions.forEach(s => {
    if (s.zoneType === '2p') {
      stats.made2p += s.made;
      stats.att2p += s.total;
    } else if (s.zoneType === '3p') {
      stats.made3p += s.made;
      stats.att3p += s.total;
    } else if (s.zoneType === 'tl') {
      stats.madeFT += s.made;
      stats.attFT += s.total;
    }
  });

  stats.totalPoints = (stats.made3p * 3) + (stats.made2p * 2) + (stats.madeFT * 1);
  stats.totalAttempts = stats.att2p + stats.att3p + stats.attFT;

  // eFG% = (FGM + 0.5 * 3PM) / FGA  (Excluye Tiros Libres)
  const fgAttempts = stats.att2p + stats.att3p;
  const eFG = fgAttempts > 0 
    ? ((stats.made2p + (1.5 * stats.made3p)) / fgAttempts) * 100 
    : 0;

  // PPS = Puntos Totales / Intentos Totales
  const pps = stats.totalAttempts > 0 
    ? stats.totalPoints / stats.totalAttempts 
    : 0;

  // FT% independiente
  const ftPct = stats.attFT > 0 ? (stats.madeFT / stats.attFT) * 100 : 0;

  return {
    eFG: eFG.toFixed(1),
    pps: pps.toFixed(2),
    ftPct: ftPct.toFixed(1),
    totalPoints: stats.totalPoints
  };
};
