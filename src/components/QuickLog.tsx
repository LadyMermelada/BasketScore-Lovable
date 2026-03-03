import { Session } from '../lib/sessions';
import { formatDateLocal } from '../lib/stats';
import { Trash2, Edit2, MessageSquare } from 'lucide-react';

interface QuickLogProps {
  sessions: Session[];
  onEdit: (session: Session) => void;
  onDelete: (id: number) => void;
}

const QuickLog = ({ sessions, onEdit, onDelete }: QuickLogProps) => {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center p-8 glass-card border-dashed text-muted-foreground uppercase tracking-widest text-[0.6rem] font-bold">
        No hay registros hoy
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="max-h-[400px] overflow-y-auto relative">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-20 bg-card border-b border-border">
            <tr>
              <th className="px-4 py-3 text-[0.6rem] font-bold text-muted-foreground uppercase tracking-wider">Fecha</th>
              <th className="px-4 py-3 text-[0.6rem] font-bold text-muted-foreground uppercase tracking-wider">Zona</th>
              <th className="px-4 py-3 text-[0.6rem] font-bold text-muted-foreground uppercase tracking-wider text-center">Ratio</th>
              <th className="px-4 py-3 text-[0.6rem] font-bold text-primary uppercase tracking-wider text-center">%</th>
              <th className="px-4 py-3 text-[0.6rem] font-bold text-muted-foreground uppercase tracking-wider">Notas</th>
              <th className="px-4 py-3 text-right text-[0.6rem] font-bold text-muted-foreground uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-border/40">
            {sessions.map((session) => (
              <tr key={session.id} className="hover:bg-muted/10 transition-colors">
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatDateLocal(session.date)}
                </td>
                <td className="px-4 py-3 text-xs font-bold tracking-tight">
                  {session.zoneLabel}
                </td>
                <td className="px-4 py-3 text-xs font-mono text-center text-muted-foreground">
                  {session.made}/{session.total}
                </td>
                <td className="px-4 py-3 text-xs font-mono font-bold text-center text-primary">
                  {((session.made / (session.total || 1)) * 100).toFixed(0)}%
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[150px] truncate italic">
                  {session.note ? (
                    <span className="flex items-center gap-1">
                      <MessageSquare size={10} className="shrink-0" />
                      {session.note}
                    </span>
                  ) : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => onEdit(session)}
                      className="p-2 bg-primary/5 hover:bg-primary/15 rounded-lg text-primary transition-colors border border-primary/10"
                      title="Editar"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => onDelete(session.id!)}
                      className="p-2 bg-destructive/5 hover:bg-destructive/15 rounded-lg text-destructive transition-colors border border-destructive/10"
                      title="Borrar"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuickLog;
