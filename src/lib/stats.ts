import { Session } from './sessions';

export const formatDateLocal = (dateStr: string) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
};

export const filterLast30Days = (sessions: Session[] = []) => {
  if (!Array.isArray(sessions)) return [];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return sessions.filter(s => s && s.date && new Date(s.date) >= thirtyDaysAgo);
};

export const filterToday = (sessions: Session[] = []) => {
  if (!Array.isArray(sessions)) return [];
  const today = new Date().toLocaleDateString('en-CA'); 
  return sessions.filter(s => s && s.date && s.date.startsWith(today));
};

export const calculateProStats = (sessions: Session[] = []) => {
  const defaultStats = { eFG: "0.0", pps: "0.00", ftPct: "0.0", twoPct: "0.0", threePct: "0.0", totalPoints: 0 };
  
  if (!sessions || sessions.length === 0) return defaultStats;

  let acc = { made2p: 0, att2p: 0, made3p: 0, att3p: 0, madeFT: 0, attFT: 0, points: 0, attempts: 0 };

  sessions.forEach(s => {
    if (!s) return;
    if (s.zoneType === '2p') { acc.made2p += s.made; acc.att2p += s.total; }
    else if (s.zoneType === '3p') { acc.made3p += s.made; acc.att3p += s.total; }
    else if (s.zoneType === 'tl') { acc.madeFT += s.made; acc.attFT += s.total; }
  });

  acc.points = (acc.made3p * 3) + (acc.made2p * 2) + (acc.madeFT * 1);
  acc.attempts = acc.att2p + acc.att3p + acc.attFT;

  const fgAtt = acc.att2p + acc.att3p;
  const eFG = fgAtt > 0 ? ((acc.made2p + (1.5 * acc.made3p)) / fgAtt) * 100 : 0;
  const pps = acc.attempts > 0 ? acc.points / acc.attempts : 0;

  return {
    eFG: eFG.toFixed(1),
    pps: pps.toFixed(2),
    ftPct: acc.attFT > 0 ? ((acc.madeFT / acc.attFT) * 100).toFixed(1) : "0.0",
    twoPct: acc.att2p > 0 ? ((acc.made2p / acc.att2p) * 100).toFixed(1) : "0.0",
    threePct: acc.att3p > 0 ? ((acc.made3p / acc.att3p) * 100).toFixed(1) : "0.0",
    totalPoints: acc.points
  };
};
