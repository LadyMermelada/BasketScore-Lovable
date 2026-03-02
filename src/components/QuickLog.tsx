import { Session } from '../lib/sessions';
import { formatDateLocal } from '../lib/stats';
import { Settings, Trash2 } from 'lucide-react';

interface QuickLogProps {
  sessions: Session[];
  onEdit: (session: Session) => void;
  onDelete: (id: string | number) => void;
}

const QuickLog = ({ sessions, onEdit, onDelete }: QuickLogProps) => {
  return (
    <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-[10px] uppercase font-bold text-muted-foreground tracking-widest border-b border-border">
            <tr>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Zona</th>
              <th className="px-6 py-4">Ratio</th>
              <th className="px-6 py-4">%</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sessions.map((session) => (
              <tr key={session.id} className="hover:bg-muted/30 transition-colors group">
                <td className="px-6 py-4 font-medium text-muted-foreground">
                  {formatDateLocal(session.date)}
                </td>
                <td className="px-6 py-4 font-bold">{session.zoneId.replace(/_/g, ' ')}</td>
                <td className="px-6 py-4 font-mono text-xs opacity-70">{session.made}/{session.total}</td>
                <td className="px-6 py-4 font-black text-primary">
                  {((session.made / session.total) * 100).toFixed(0)}%
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button onClick={() => onEdit(session)} className="p-2 hover:bg-primary/10 rounded-lg text-muted-foreground hover:text-primary transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(session.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
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
