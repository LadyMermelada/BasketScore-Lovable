import { useMemo, useEffect, useState } from 'react';
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

  // Evaluamos el estado de los trofeos en cada cambio de sesiones
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

  // Lógica Anti-Refresh y Cola de Notificaciones
  useEffect(() => {
    // 1. Leemos lo que ya está guardado (si está vacío, iniciamos un array vacío)
    const stored = localStorage.getItem('notified_trophies');
    const notifiedIds: string[] = stored ? JSON.parse(stored) : [];
    const notifiedSet = new Set(notifiedIds);

    // 2. Extraemos los IDs de los trofeos que actualmente están ganados
    const currentUnlockedIds = results.filter(r => r.unlocked).map(r => r.trophy.id);

    // 3. Comparamos para encontrar SOLO los que de verdad son nuevos
    const newlyUnlockedIds = currentUnlockedIds.filter(id => !notifiedSet.has(id));

    if (newlyUnlockedIds.length > 0) {
      const newTrophies = newlyUnlockedIds.map(id => TROPHIES.find(t => t.id === id)!);
      
      // Los añadimos a la cola visual
      setUnlockQueue(prev => {
        const inQueue = new Set(prev.map(t => t.id));
        const toAdd = newTrophies.filter(t => !inQueue.has(t.id));
        return [...prev, ...toAdd];
      });

      // IMPORTANTE: Guardamos sumando lo viejo con lo nuevo. NUNCA sobreescribimos borrando.
      const updatedNotified = [...notifiedIds, ...newlyUnlockedIds];
      localStorage.setItem('notified_trophies', JSON.stringify(updatedNotified));
    }
  }, [results]);

  // Funciones para manejar los modales visuales
  const dismissOverlay = () => {
    if (unlockQueue.length > 0) {
      setUnlockQueue(prev => prev.slice(1));
    } else {
      setReplayedTrophy(null);
    }
  };
  
  const replayTrophy = (trophy: TrophyDef) => setReplayedTrophy(trophy);

  // Clasificamos para mandarlos al Profile y al Modal
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
