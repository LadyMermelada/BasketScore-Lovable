import { useMemo, useEffect, useRef, useState } from 'react';
import { Session } from '../lib/sessions';
import { TROPHIES, TrophyDef } from '../lib/trophies';

export interface TrophyResult {
  trophy: TrophyDef;
  unlocked: boolean;
  progress: number;
  current: number;
}

export function useTrophies(sessions: Session[]) {
  const [newlyUnlocked, setNewlyUnlocked] = useState<TrophyDef | null>(null);
  const prevUnlockedRef = useRef<Set<string>>(new Set());
  const initialized = useRef(false);

  const results: TrophyResult[] = useMemo(() => {
    const evaluated = TROPHIES.map(trophy => {
      if (trophy.id === 'goat') {
        // Special: count other unlocked trophies
        const otherUnlocked = TROPHIES.filter(t => t.id !== 'goat').filter(t => t.evaluate(sessions).unlocked).length;
        return {
          trophy,
          unlocked: otherUnlocked >= 20,
          progress: Math.min(otherUnlocked / 20, 1),
          current: otherUnlocked,
        };
      }
      const result = trophy.evaluate(sessions);
      return { trophy, ...result };
    });
    return evaluated;
  }, [sessions]);

  // Detect newly unlocked trophies
  useEffect(() => {
    const currentUnlocked = new Set(results.filter(r => r.unlocked).map(r => r.trophy.id));
    
    if (initialized.current) {
      for (const id of currentUnlocked) {
        if (!prevUnlockedRef.current.has(id)) {
          const trophy = TROPHIES.find(t => t.id === id);
          if (trophy) {
            setNewlyUnlocked(trophy);
            break;
          }
        }
      }
    }
    
    prevUnlockedRef.current = currentUnlocked;
    initialized.current = true;
  }, [results]);

  const dismissUnlock = () => setNewlyUnlocked(null);

  const unlocked = results.filter(r => r.unlocked);
  const inProgress = results.filter(r => !r.unlocked && !r.trophy.esSecreto).sort((a, b) => b.progress - a.progress);
  const secret = results.filter(r => r.trophy.esSecreto);
  const secretUnlocked = secret.filter(r => r.unlocked);
  const secretLocked = secret.filter(r => !r.unlocked);

  return {
    results,
    unlocked,
    inProgress,
    secretUnlocked,
    secretLocked,
    totalUnlocked: unlocked.length + secretUnlocked.length,
    totalTrophies: TROPHIES.length,
    newlyUnlocked,
    dismissUnlock,
    featuredTrophies: unlocked.slice(-3).reverse(),
  };
}
