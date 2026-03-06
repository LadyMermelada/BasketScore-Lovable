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
  
  // Usamos useRef para saber exactamente qué trofeos teníamos antes del último cambio
  const prevUnlockedRef = useRef<Set<string> | null>(null);

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

  // Detector de trofeos nuevos y sistema de Cola (Queue)
  useEffect(() => {
    const currentUnlockedIds = results.filter(r => r.unlocked).map(r => r.trophy.id);

    // Si es la primera carga (F5 o entrar a la app), inicializamos el estado silenciosamente
    if (prevUnlockedRef.current === null) {
      prevUnlockedRef.current = new Set(currentUnlockedIds);
      localStorage.setItem('notified_trophies', JSON.stringify(currentUnlockedIds));
      return; 
    }

    // Comparamos los actuales con los que teníamos antes del renderizado
    const prevUnlocked = prevUnlockedRef.current;
    const newlyUnlocked = currentUnlockedIds.filter(id => !prevUnlocked.has(id));

    if (newlyUnlocked.length > 0) {
      const newTrophies = newlyUnlocked.map(id => TROPHIES.find(t => t.id === id)!);
      
      // Añadimos a la cola de notificaciones
      setUnlockQueue(prev => {
        const inQueue = new Set(prev.map(t => t.id));
        const toAdd = newTrophies.filter(t => !inQueue.has(t.id));
        return [...prev, ...toAdd];
      });

      // Actualizamos referencias para que no vuelva a saltar
      prevUnlockedRef.current = new Set(currentUnlockedIds);
      localStorage.setItem('notified_trophies', JSON.stringify(currentUnlockedIds));
    } else {
      // Por si se borra una sesión y se pierde un trofeo, mantenemos la lista actualizada
      prevUnlockedRef.current = new Set(currentUnlockedIds);
    }
  }, [results]);

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
