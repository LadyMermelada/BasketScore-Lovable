import { Session } from './sessions';

export const filterLast30Days = (sessions: Session[]) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return sessions.filter(s => new Date(s.date) >= thirtyDaysAgo);
};

export const filterToday = (sessions: Session[]) => {
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local
  return sessions.filter(s => s.date.startsWith(today));
};

// Nueva función de Rangos según PPS
export const getPlayerRank = (pps: number) => {
  const val = parseFloat(pps.toString());
  if (val === 0) return { label: "Novato", color: "text-muted-foreground", bg: "bg-muted" };
  if (val < 0.8) return { label: "Rookie", color: "text-blue-400", bg: "bg-blue-400/10" };
  if (val < 1.0) return { label: "Sexto Hombre", color: "text-green-400", bg: "bg-green-400/10" };
  if (val < 1.2) return { label: "Titular", color: "text-yellow-500", bg: "bg-yellow-500/10" };
  if (val < 1.4) return { label: "All-Star", color: "text-orange-500", bg: "bg-orange-500/10" };
  return { label: "MVP / Leyenda", color: "text-primary", bg: "bg-primary/20" };
};

// Formateador de fecha simple y local
export const formatDateLocal = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
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
    if (s.zoneType === '2p') { stats.made2p += s.made; stats.att2p += s.total; }
    else if (s.zoneType === '3p') { stats.made3p += s.made; stats.att3p += s.total; }
    else if (s.zoneType === 'tl') { stats.madeFT += s.made; stats.attFT += s.total; }
  });

  stats.totalPoints = (stats.made3p * 3) + (stats.made2p * 2) + (stats.madeFT * 1);
  stats.totalAttempts = stats.att2p + stats.att3p + stats.attFT;

  const fgAttempts = stats.att2p + stats.att3p;
  const eFG = fgAttempts > 0 ? ((stats.made2p + (1.5 * stats.made3p)) / fgAttempts) * 100 : 0;
  const pps = stats.totalAttempts > 0 ? stats.totalPoints / stats.totalAttempts : 0;
  
  return {
    eFG: eFG.toFixed(1),
    pps: pps.toFixed(2),
    ftPct: stats.attFT > 0 ? (stats.madeFT / stats.attFT * 100).toFixed(1) : "0.0",
    twoPct: stats.att2p > 0 ? (stats.made2p / stats.att2p * 100).toFixed(1) : "0.0",
    threePct: stats.att3p > 0 ? (stats.made3p / stats.att3p * 100).toFixed(1) : "0.0",
    totalPoints: stats.totalPoints
  };
};
