import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ZONES } from '@/lib/zones';
import { Session } from '@/lib/sessions';

interface Props {
  open: boolean;
  onClose: () => void;
  zoneId: string | null;
  editSession: Session | null;
  onSave: (data: { zoneId: string; date: string; total: number; made: number; note: string }) => void;
}

export default function ShotModal({ open, onClose, zoneId, editSession, onSave }: Props) {
  const [date, setDate] = useState('');
  const [total, setTotal] = useState('');
  const [made, setMade] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const zone = ZONES.find(z => z.id === zoneId);

  useEffect(() => {
    if (open) {
      if (editSession) {
        setDate(editSession.date);
        setTotal(String(editSession.total));
        setMade(String(editSession.made));
        setNote(editSession.note || '');
      } else {
        setDate(new Date().toISOString().split('T')[0]);
        setTotal('');
        setMade('');
        setNote('');
      }
      setError('');
    }
  }, [open, editSession]);

  const handleSave = () => {
    const t = parseInt(total);
    const m = parseInt(made);
    if (isNaN(t) || isNaN(m) || t <= 0 || m < 0 || m > t) {
      setError('⚠️ Verifica los datos ingresados');
      return;
    }
    if (!zoneId) return;
    onSave({ zoneId, date, total: t, made: m, note });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="glass-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm uppercase tracking-wider text-primary">
            {zone?.label || zoneId}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Fecha</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Total Lanzados</Label>
            <Input type="number" min={1} value={total} onChange={e => setTotal(e.target.value)} placeholder="0" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Total Encestados</Label>
            <Input type="number" min={0} value={made} onChange={e => setMade(e.target.value)} placeholder="0" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Nota (opcional)</Label>
            <Textarea value={note} onChange={e => setNote(e.target.value)} maxLength={50} className="resize-none h-16" placeholder="Notas sobre la sesión..." />
          </div>
          {error && <p className="text-xs font-bold text-destructive text-center">{error}</p>}
          <Button onClick={handleSave} className="w-full font-bold uppercase tracking-wider">
            Confirmar ✓
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
