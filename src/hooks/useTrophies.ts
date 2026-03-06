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
  const [unlockQueue, setUnlockQueue] = useState<TrophyDef[]>([]);
  const [replayedTrophy, setReplayedTrophy] = useState<TrophyDef | null>(null);

  const results: TrophyResult[] = useMemo(() => {
    return TROPHIES.map(trophy => {
      if (trophy.id === 'goat') {
        const otherUnlocked = TROPHIES.filter(t => t.id !== 'goat').filter(t => t.evaluate(sessions).unlocked).length;
        return {
          trophy,
          unlocked: otherUnlocked >= 20,
          progress: Math.min(otherUnlocked / 20, 1),
          current: otherUnlocked,
        };
      }
      return { trophy, ...trophy.evaluate(sessions) };
    });
  }, [sessions]);

  // Cola y persistencia anti-refresh
  useEffect(() => {
    if (!sessions || sessions.length === 0) return;

    const unlockedIds = results.filter(r => r.unlocked).map(r => r.trophy.id);
    const stored = localStorage.getItem('notified_trophies');
    
    if (!stored) {
      localStorage.setItem('notified_trophies', JSON.stringify(unlockedIds));
      return;
    }

    const notified: string[] = JSON.parse(stored);
    const notifiedSet = new Set(notified);
    const newlyUnlocked = unlockedIds.filter(id => !notifiedSet.has(id));

    if (newlyUnlocked.length > 0) {
      const newTrophies = newlyUnlocked.map(id => TROPHIES.find(t => t.id === id)!);
      setUnlockQueue(prev => {
        const inQueue = new Set(prev.map(t => t.id));
        return [...prev, ...newTrophies.filter(t => !inQueue.has(t.id))];
      });
      localStorage.setItem('notified_trophies', JSON.stringify([...notified, ...newlyUnlocked]));
    }
  }, [results, sessions]);

  const dismissOverlay = () => {
    if (unlockQueue.length > 0) setUnlockQueue(prev => prev.slice(1));
    else setReplayedTrophy(null);
  };
  
  const replayTrophy = (trophy: TrophyDef) => setReplayedTrophy(trophy);

  const unlocked = results.filter(r => r.unlocked && !r.trophy.esSecreto);
  const secretUnlocked = results.filter(r => r.unlocked && r.trophy.esSecreto);
  const inProgress = results.filter(r => !r.unlocked && !r.trophy.esSecreto).sort((a, b) => b.progress - a.progress);
  const secretLocked = results.filter(r => !r.unlocked && r.trophy.esSecreto);

  return {
    results, unlocked, inProgress, secretUnlocked, secretLocked,
    totalUnlocked: unlocked.length + secretUnlocked.length,
    totalTrophies: TROPHIES.length,
    activeOverlayTrophy: unlockQueue.length > 0 ? unlockQueue[0] : replayedTrophy,
    dismissOverlay, replayTrophy,
    featuredTrophies: [...unlocked, ...secretUnlocked].slice(-3).reverse(),
  };
}
