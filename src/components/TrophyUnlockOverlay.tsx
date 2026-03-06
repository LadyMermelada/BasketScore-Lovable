import { motion, AnimatePresence } from 'framer-motion';
import { TrophyDef, CUP_CONFIG } from '../lib/trophies';

interface Props {
  trophy: TrophyDef | null;
  onDismiss: () => void;
}

export default function TrophyUnlockOverlay({ trophy, onDismiss }: Props) {
  if (!trophy) return null;
  const cup = CUP_CONFIG[trophy.copa];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-background/90 backdrop-blur-xl" onClick={onDismiss} />
        
        {/* Stars background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/40"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1.5, 0.5],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <motion.div
          className="relative z-10 text-center max-w-sm w-full"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        >
          {/* Glow ring */}
          <motion.div
            className="mx-auto w-28 h-28 rounded-full flex items-center justify-center mb-6 relative"
            style={{
              background: `radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 70%)`,
              boxShadow: `0 0 60px hsl(var(--primary) / 0.3), 0 0 120px hsl(var(--primary) / 0.1)`,
            }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <motion.div
              className="absolute inset-2 rounded-full border-2 border-primary/20"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-5xl relative z-10">{trophy.emoji}</span>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-primary mb-2">
              🏆 Trofeo Desbloqueado
            </p>
            <h2 className="text-2xl font-bold mb-1">{trophy.nombre}</h2>
            <p className="text-xs text-muted-foreground mb-1">{trophy.saga}</p>
            <span
              className="inline-block text-[0.6rem] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4"
              style={{
                background: `hsl(${cup.bg} / 0.15)`,
                color: `hsl(${cup.color})`,
                border: `1px solid hsl(${cup.bg} / 0.3)`,
              }}
            >
              Copa {cup.label}
            </span>
            <p className="text-xs text-muted-foreground mb-6">{trophy.descripcion}</p>
          </motion.div>

          <motion.button
            className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider"
            onClick={onDismiss}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Continuar
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
