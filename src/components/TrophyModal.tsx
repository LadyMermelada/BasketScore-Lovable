import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Trophy, Star } from 'lucide-react';
import { TrophyResult } from '../hooks/useTrophies';
import { CUP_CONFIG, TrophyCup, TrophyDef } from '../lib/trophies';
import { Progress } from './ui/progress';

interface Props {
  open: boolean; onClose: () => void;
  unlocked: TrophyResult[]; inProgress: TrophyResult[];
  secretUnlocked: TrophyResult[]; secretLocked: TrophyResult[];
  totalUnlocked: number; totalTrophies: number;
  onReplayTrophy: (trophy: TrophyDef) => void;
}

function CupBadge({ copa }: { copa: TrophyCup }) {
  const cfg = CUP_CONFIG[copa];
  return (
    <span className="text-[0.55rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ background: `hsl(${cfg.bg}/0.15)`, color: `hsl(${cfg.color})`, border: `1px solid hsl(${cfg.bg}/0.3)` }}>
      {cfg.label}
    </span>
  );
}

function TrophyCard({ result, revealed = true, onReplay }: { result: TrophyResult, revealed?: boolean, onReplay?: () => void }) {
  const { trophy, unlocked, progress, current } = result;
  return (
    <div className={`glass-card p-3 flex gap-3 items-start transition-all ${unlocked ? 'border-primary/20 cursor-pointer hover:bg-primary/5 hover:border-primary/50' : 'opacity-70'}`}
         onClick={() => unlocked && onReplay && onReplay()}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
           style={{ background: unlocked ? `hsl(var(--primary)/0.15)` : 'hsl(var(--muted))', border: unlocked ? '1px solid hsl(var(--primary)/0.3)' : '1px solid hsl(var(--border))' }}>
        {revealed ? trophy.emoji : <Lock className="w-4 h-4 text-muted-foreground" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <span className="text-xs font-bold truncate">{revealed ? trophy.nombre : '???'}</span>
          <CupBadge copa={trophy.copa} />
          {trophy.esSecreto && (
            <span className="text-[0.55rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">Secreto</span>
          )}
        </div>
        <p className="text-[0.65rem] text-muted-foreground leading-tight mb-1.5">{revealed ? trophy.descripcion : 'Logro oculto — sigue jugando para descubrir el misterio.'}</p>
        {revealed && !unlocked && (
          <div className="flex items-center gap-2">
            <Progress value={progress * 100} className="h-1.5 flex-1" />
            <span className="text-[0.6rem] font-mono text-muted-foreground">{current}/{trophy.valorObjetivo}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrophyModal({ open, onClose, unlocked, inProgress, secretUnlocked, secretLocked, totalUnlocked, totalTrophies, onReplayTrophy }: Props) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />
        <motion.div className="relative z-10 w-full max-w-lg max-h-[85vh] bg-card border border-border rounded-t-2xl sm:rounded-2xl flex flex-col" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}>
          <div className="p-4 border-b border-border flex justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center"><Trophy className="w-5 h-5 text-primary" /></div>
              <div><h2 className="text-sm font-bold">Centro de Logros</h2><p className="text-[0.6rem] text-muted-foreground font-bold uppercase tracking-wider">{totalUnlocked}/{totalTrophies} desbloqueados</p></div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {(unlocked.length > 0 || secretUnlocked.length > 0) && (
              <section><h3 className="text-[0.6rem] font-bold text-primary mb-2">🏆 Ganados</h3><div className="space-y-2">{[...unlocked, ...secretUnlocked].map(r => <TrophyCard key={r.trophy.id} result={r} onReplay={() => onReplayTrophy(r.trophy)} />)}</div></section>
            )}
            {inProgress.length > 0 && (
              <section><h3 className="text-[0.6rem] font-bold text-muted-foreground mb-2">⏳ En Curso</h3><div className="space-y-2">{inProgress.map(r => <TrophyCard key={r.trophy.id} result={r} />)}</div></section>
            )}
            {secretLocked.length > 0 && (
              <section><h3 className="text-[0.6rem] font-bold text-muted-foreground mb-2">🔒 Secretos</h3><div className="space-y-2">{secretLocked.map(r => <TrophyCard key={r.trophy.id} result={r} revealed={false} />)}</div></section>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
