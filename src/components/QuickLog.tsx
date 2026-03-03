import { Session } from '../lib/sessions';
import { formatDateLocal } from '../lib/stats';
import { Trash2, Edit2 } from 'lucide-react';

interface QuickLogProps {
  sessions: Session[];
  onEdit: (session: Session) => void;
  onDelete: (id: number) => void;
}

const QuickLog = ({ sessions, onEdit, onDelete }: QuickLogProps) => {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center p-8 bg-card rounded-2xl border border-border border-dashed text-muted-foreground uppercase tracking-widest text-[10px]">
        No hay registros hoy
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      {/* Contenedor con Scroll para la tabla */}
      <div className="max-h-[400px] overflow-y-auto relative">
        <table className="w-full text-left border-collapse">
          {/* ENCABEZADO: Sticky, Fondo Sólido y Opacidad 100% */}
          <thead className="sticky top-0 z-20 bg-card opacity-100 shadow-sm">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Fecha</th>
              <th className="px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Zona</th>
              <th className="px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Ratio</th>
              <th className="px-4 py-3 text-[10px] font-black text-primary uppercase tracking-widest text-center">%</th>
              <th className="px-4 py-3 text-right"></th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-border/40">
            {sessions.map((session) => (
              <tr 
                key={session.id} 
                className="group hover:bg-muted/20 transition-colors"
              >
                <td className="px-4 py-4 text-xs font-medium text-muted-foreground">
                  {formatDateLocal(session.date)}
                </td>
                <td className="px-4 py-4 text-sm font-bold tracking-tight">
                  {session.zoneLabel}
                </td>
                <td className="px-4 py-4 text-sm font-mono text-center text-muted-foreground">
                  {session.made}/{session.total}
                </td>
                <td className="px-4 py-4 text-sm font-black text-center text-primary">
                  {((session.made / session.total) * 100).toFixed(0)}%
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(session)}
                      className="p-2 hover:bg-primary/20 rounded-lg text-primary transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(session.id!)}
                      className="p-2 hover:bg-destructive/20 rounded-lg text-destructive transition-colors"
                      title="Borrar"
                    >
                      <Trash2 size={16} />
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
