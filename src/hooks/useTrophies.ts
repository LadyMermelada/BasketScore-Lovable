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

  // Persistencia y sistema de Cola (Queue)
  useEffect(() => {
    if (!sessions || sessions.length === 0) return;

    const unlockedIds = results.filter(r => r.unlocked).map(r => r.trophy.id);
    const stored = localStorage.getItem('notified_trophies');
    
    // Si no hay notificaciones guardadas, es la primera carga.
    // Marcamos los que ya se tienen como notificados para evitar spam
    if (!stored) {
      localStorage.setItem('notified_trophies', JSON.stringify(unlockedIds));
      return;
    }

    const notified: string[] = JSON.parse(stored);
    const notifiedSet = new Set(notified);
    const newlyUnlocked = unlockedIds.filter(id => !notifiedSet.has(id));

    if (newlyUnlocked.length > 0) {
      const newTrophies = newlyUnlocked.map(id => TROPHIES.find(t => t.id === id)!);
      
      // Añadir a la cola si no están ya ahí
      setUnlockQueue(prev => {
        const inQueue = new Set(prev.map(t => t.id));
        const filtered = newTrophies.filter(t => !inQueue.has(t.id));
        return [...prev, ...filtered];
      });

      // Guardar en persistencia para que no vuelvan a aparecer al recargar
      const updatedNotified = [...notified, ...newlyUnlocked];
      localStorage.setItem('notified_trophies', JSON.stringify(updatedNotified));
    }
  }, [results, sessions]);

  // Dismiss elimina de la cola, o cierra el replay
  const dismissOverlay = () => {
    if (unlockQueue.length > 0) {
      setUnlockQueue(prev => prev.slice(1));
    } else {
      setReplayedTrophy(null);
    }
  };
  
  const replayTrophy = (trophy: TrophyDef) => {
    setReplayedTrophy(trophy);
  };

  // Corrección de duplicidad de trofeos separando correctamente los arrays
  const unlocked = results.filter(r => r.unlocked && !r.trophy.esSecreto);
  const secretUnlocked = results.filter(r => r.unlocked && r.trophy.esSecreto);
  const inProgress = results.filter(r => !r.unlocked && !r.trophy.esSecreto).sort((a, b) => b.progress - a.progress);
  const secretLocked = results.filter(r => !r.unlocked && r.trophy.esSecreto);

  return {
    results,
    unlocked,
    inProgress,
    secretUnlocked,
    secretLocked,
    totalUnlocked: unlocked.length + secretUnlocked.length,
    totalTrophies: TROPHIES.length,
    activeOverlayTrophy: unlockQueue.length > 0 ? unlockQueue[0] : replayedTrophy,
    dismissOverlay,
    replayTrophy,
    featuredTrophies: [...unlocked, ...secretUnlocked].slice(-3).reverse(),
  };
}
