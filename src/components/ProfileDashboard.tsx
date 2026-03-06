import { motion } from 'framer-motion';
import { Trophy, User } from 'lucide-react';
import { TrophyResult } from '../hooks/useTrophies';
import { useAuth } from '../hooks/useAuth';

interface Props {
  totalUnlocked: number;
  featuredTrophies: TrophyResult[];
  onOpenTrophies: () => void;
}

export default function ProfileDashboard({ totalUnlocked, featuredTrophies, onOpenTrophies }: Props) {
  const { user } = useAuth();
  const displayName = user?.email?.split('@')[0] || 'Jugador';

  return (
    <motion.div
      className="glass-card p-3 mb-4 cursor-pointer hover:border-primary/30 transition-all"
      onClick={onOpenTrophies}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.005 }}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-primary" />
        </div>

        {/* Name + club */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold truncate">{displayName}</p>
          <p className="text-[0.6rem] text-muted-foreground font-bold uppercase tracking-wider">BasketScore</p>
        </div>

        {/* Featured trophies */}
        <div className="flex items-center gap-1">
          {featuredTrophies.map(r => (
            <span
              key={r.trophy.id}
              className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-sm"
              title={r.trophy.nombre}
            >
              {r.trophy.emoji}
            </span>
          ))}
        </div>

        {/* Badge total */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
          <Trophy className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-mono font-bold text-primary">{totalUnlocked}</span>
        </div>
      </div>
    </motion.div>
  );
}
