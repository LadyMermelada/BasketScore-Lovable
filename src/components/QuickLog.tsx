import { motion } from 'framer-motion';
import { Session, getPercentage } from '@/lib/sessions';
import { Settings, Trash2 } from 'lucide-react';

interface Props {
  sessions: Session[];
  onEdit: (session: Session) => void;
  onDelete: (id: number) => void;
}

export default function QuickLog({ sessions, onEdit, onDelete }: Props) {
  const last5 = [...sessions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  if (last5.length === 0) {
    return (
      <div className="glass-card p-4 text-center text-sm text-muted-foreground">
        Aún no hay sesiones registradas. ¡Toca una zona de la cancha para empezar!
      </div>
    );
  }

  return (
    <motion.div
      className="glass-card overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="p-3 border-b border-border">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Últimas 5 Sesiones
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 text-[0.6rem] font-medium uppercase tracking-wider text-muted-foreground">Fecha</th>
              <th className="text-left p-3 text-[0.6rem] font-medium uppercase tracking-wider text-muted-foreground">Zona</th>
              <th className="text-left p-3 text-[0.6rem] font-medium uppercase tracking-wider text-muted-foreground">Ratio</th>
              <th className="text-left p-3 text-[0.6rem] font-medium uppercase tracking-wider text-muted-foreground">%</th>
              <th className="p-3 text-[0.6rem]"></th>
            </tr>
          </thead>
          <tbody>
            {last5.map((s) => {
              const pct = getPercentage(s.made, s.total);
              return (
                <tr key={s.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="p-3 font-mono text-xs text-muted-foreground">{s.date.slice(5)}</td>
                  <td className="p-3 text-xs font-semibold text-foreground">{s.zoneLabel}</td>
                  <td className="p-3 font-mono text-xs text-muted-foreground">{s.made}/{s.total}</td>
                  <td className={`p-3 font-mono text-xs font-bold ${pct >= 50 ? 'text-primary' : 'text-muted-foreground'}`}>
                    {pct}%
                  </td>
                  <td className="p-3 flex gap-1">
                    <button
                      onClick={() => onEdit(s)}
                      className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Settings size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(s.id)}
                      className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
