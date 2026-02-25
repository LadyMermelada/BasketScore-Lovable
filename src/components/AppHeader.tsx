import { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { Session, exportSessions, importSessions } from '@/lib/sessions';
import { toast } from 'sonner';

interface Props {
  sessions: Session[];
  onImport: (sessions: Session[]) => void;
}

export default function AppHeader({ sessions, onImport }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importSessions(file);
      onImport(data);
      toast.success('Datos importados correctamente');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al importar');
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="flex items-center justify-between w-full max-w-5xl mx-auto mb-4">
      <h1 className="text-xl font-bold tracking-tight">
        BASKET<span className="gradient-text">SCORE</span>
      </h1>
      <div className="flex gap-2">
        <button
          onClick={() => exportSessions(sessions)}
          className="p-2 rounded-lg border border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
          title="Exportar"
        >
          <Download size={14} />
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="p-2 rounded-lg border border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
          title="Importar"
        >
          <Upload size={14} />
        </button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
      </div>
    </div>
  );
}
