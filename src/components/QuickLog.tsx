import { Session } from '../lib/sessions';
import { formatDateLocal } from '../lib/stats';
import { Trash2 } from 'lucide-react';

interface QuickLogProps {
  sessions: Session[];
  onEdit: (session: Session) => void;
  onDelete: (id: string | number) => void;
}

const QuickLog = ({ sessions, onDelete }: QuickLogProps) => {
  return (
    <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
      <div className="max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/10">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-[10px] uppercase font-bold text-muted-foreground sticky top-0 z-10 border-b border-border">
            <tr>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Zona</th>
              <th className="px-6 py-4">Ratio</th>
              <th className="px-6 py-4">%</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sessions.map((session) => (
              <tr key={session.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 opacity-70">
                   {formatDateLocal(session.date)}
                </td>
                <td className="px-6 py-4 font-bold capitalize">
                  {session.zoneId.replace('_', ' ')}
                </td>
                <td className="px-6 py-4 font-mono text-xs opacity-60">
                  {session.made}/{session.total}
                </td>
                <td className="px-6 py-4 font-black text-primary">
                  {((session.made / session.total) * 100).toFixed(0)}%
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => onDelete(session.id)} 
                    className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors"
                  >
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
