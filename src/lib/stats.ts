import { Session } from './sessions';

export const formatDateLocal = (dateStr: string) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
};

export const filterLast30Days = (sessions: Session[] = []) => {
  const safeSessions = Array.isArray(sessions) ? sessions : [];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return safeSessions.filter(s => s && s.date && new Date(s.date) >= thirtyDaysAgo);
};

export const filterToday = (sessions: Session[] = []) => {
  const safeSessions = Array.isArray(sessions) ? sessions : [];
  const today = new Date().toLocaleDateString('en-CA'); 
  return safeSessions.filter(s => s && s.date && s.date.startsWith(today));
};

export const calculateProStats = (sessions: Session[] = []) => {
  const defaults = { eFG: "0.0", pps: "0.00", ftPct: "0.0", twoPct: "0.0", threePct: "0.0", totalPoints: 0 };
  if (!Array.isArray(sessions) || sessions.length === 0) return defaults;

  let acc = { m2: 0, a2: 0, m3: 0, a3: 0, mFT: 0, aFT: 0, pts: 0, att: 0 };

  sessions.forEach(s => {
    if (!s) return;
    if (s.zoneType === '2p') { acc.m2 += s.made; acc.a2 += s.total; }
    else if (s.zoneType === '3p') { acc.m3 += s.made; acc.a3 += s.total; }
    else if (s.zoneType === 'tl') { acc.mFT += s.made; acc.aFT += s.total; }
  });

  acc.pts = (acc.m3 * 3) + (acc.m2 * 2) + (acc.mFT * 1);
  acc.att = acc.a2 + acc.a3 + acc.aFT;

  const fgA = acc.a2 + acc.a3;
  const eFG = fgA > 0 ? ((acc.m2 + (1.5 * acc.m3)) / fgA) * 100 : 0;
  const pps = acc.att > 0 ? acc.pts / acc.att : 0;

  return {
    eFG: eFG.toFixed(1),
    pps: pps.toFixed(2),
    ftPct: acc.aFT > 0 ? ((acc.mFT / acc.aFT) * 100).toFixed(1) : "0.0",
    twoPct: acc.a2 > 0 ? ((acc.m2 / acc.a2) * 100).toFixed(1) : "0.0",
    threePct: acc.a3 > 0 ? ((acc.m3 / acc.a3) * 100).toFixed(1) : "0.0",
    totalPoints: acc.pts
  };
};
