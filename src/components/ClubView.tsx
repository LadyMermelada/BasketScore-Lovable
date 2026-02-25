import { motion } from 'framer-motion';

const MOCK_STATS = {
  tl: [{ n: "Luis F.", v: 92 }, { n: "Tú", v: 88 }, { n: "Carlos", v: 81 }, { n: "Marcos", v: 75 }, { n: "Juan", v: 70 }],
  '2p': [{ n: "Pedro R.", v: 68 }, { n: "Marcos", v: 62 }, { n: "Tú", v: 58 }, { n: "Luis", v: 55 }, { n: "Juan", v: 50 }],
  '3p': [{ n: "Tú", v: 42 }, { n: "Carlos", v: 40 }, { n: "Marcos", v: 38 }, { n: "Juan", v: 35 }, { n: "Luis", v: 30 }],
  sess: [{ n: "Marcos", v: 24 }, { n: "Tú", v: 18 }, { n: "Pedro", v: 15 }, { n: "Luis", v: 12 }, { n: "Juan", v: 8 }],
};

const MOCK_FEED = [
  { user: "Marcos G.", text: "completó 50 tiros de 3P", pct: 40, time: "2h" },
  { user: "Luis F.", text: "practicó Tiros Libres (100)", pct: 92, time: "5h" },
  { user: "Carlos M.", text: "tuvo un mal día en media distancia", pct: 28, time: "8h" },
  { user: "Tú", text: "registró una sesión en Pintura Alta", pct: 60, time: "1d" },
];

const CATEGORIES = [
  { id: 'tl', title: '🎯 Especialista Libres', format: '%' },
  { id: '2p', title: '🔥 Middy (2 Pts)', format: '%' },
  { id: '3p', title: '💦 Triplista (3 Pts)', format: '%' },
  { id: 'sess', title: '👑 Rey del Entreno', format: ' ses.' },
];

export default function ClubView() {
  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Club header */}
      <motion.div
        className="glass-card p-4 flex items-center justify-between"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-xl">🏀</div>
          <div>
            <h2 className="text-base font-bold text-primary">Goga Basket Club</h2>
            <span className="text-[0.65rem] text-muted-foreground">12 Miembros</span>
          </div>
        </div>
        <button className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
          ⇄
        </button>
      </motion.div>

      {/* Leaderboard */}
      <div>
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground border-b border-border pb-1 mb-3">
          🏆 Leaderboard (30 Días)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CATEGORIES.map((cat, i) => {
            const data = MOCK_STATS[cat.id as keyof typeof MOCK_STATS];
            return (
              <motion.div
                key={cat.id}
                className="glass-card p-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <h4 className="text-xs text-muted-foreground uppercase border-b border-border pb-1 mb-2">{cat.title}</h4>
                <div className="flex justify-between items-baseline mb-2 pb-2 border-b border-dashed border-border">
                  <span className="text-sm font-bold">🥇 {data[0].n}</span>
                  <span className="font-mono text-lg font-bold text-primary">{data[0].v}{cat.format}</span>
                </div>
                <ul className="space-y-1">
                  {data.slice(1).map((x, j) => (
                    <li key={j} className="flex justify-between text-[0.7rem] text-muted-foreground">
                      <span>{j + 2}. {x.n}</span>
                      <span className="font-mono font-bold text-foreground">{x.v}{cat.format}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Feed */}
      <div>
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground border-b border-border pb-1 mb-3">
          ⚡ Actividad Reciente
        </h3>
        <div className="glass-card divide-y divide-border/50">
          {MOCK_FEED.map((f, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-3 p-3 text-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
            >
              <span className="text-[0.6rem] text-muted-foreground min-w-[30px]">{f.time}</span>
              <span className="text-base">{f.pct >= 50 ? '🔥' : '🧊'}</span>
              <div className="text-xs">
                <strong>{f.user}</strong> {f.text} <span className="text-primary font-bold">({f.pct}%)</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="glass-card-accent p-4 text-center text-xs text-muted-foreground">
        <p>💡 El club usa datos de ejemplo. Próximamente: clubs reales con multi-usuario.</p>
      </div>
    </div>
  );
}
