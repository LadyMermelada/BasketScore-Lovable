import { Session } from './sessions';

export const formatDateLocal = (dateStr: string) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
};

export const filterLast30Days = (sessions: Session[] = []) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return (sessions || []).filter(s => s && new Date(s.date) >= thirtyDaysAgo);
};

export const filterToday = (sessions: Session[] = []) => {
  const today = new Date().toISOString().split('T')[0];
  return (sessions || []).filter(s => s && s.date.startsWith(today));
};

export const calculateProStats = (sessions: Session[] = []) => {
  let stats = { m2: 0, a2: 0, m3: 0, a3: 0, mFT: 0, aFT: 0, pts: 0, att: 0 };
  const safeSessions = Array.isArray(sessions) ? sessions : [];

  safeSessions.forEach(s => {
    if (s.zoneType === '2p') { stats.m2 += s.made; stats.a2 += s.total; }
    else if (s.zoneType === '3p') { stats.m3 += s.made; stats.a3 += s.total; }
    else if (s.zoneType === 'tl') { stats.mFT += s.made; stats.aFT += s.total; }
  });

  stats.pts = (stats.m3 * 3) + (stats.m2 * 2) + (stats.mFT * 1);
  stats.att = stats.a2 + stats.a3 + stats.aFT;

  const fgA = stats.a2 + stats.a3;
  const eFG = fgA > 0 ? ((stats.m2 + (1.5 * stats.m3)) / fgA) * 100 : 0;
  const pps = stats.att > 0 ? stats.pts / stats.att : 0;

  return {
    eFG: eFG.toFixed(1),
    pps: pps.toFixed(2),
    ftPct: stats.aFT > 0 ? ((stats.mFT / stats.aFT) * 100).toFixed(1) : "0.0",
    twoPct: stats.a2 > 0 ? ((stats.m2 / stats.a2) * 100).toFixed(1) : "0.0",
    threePct: stats.a3 > 0 ? ((stats.m3 / stats.a3) * 100).toFixed(1) : "0.0",
    totalPoints: stats.pts
  };
};
