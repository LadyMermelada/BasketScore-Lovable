import { useState, useCallback } from 'react';
import { Session, loadSessions, saveSessions } from '@/lib/sessions';

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>(loadSessions);

  const save = useCallback((updated: Session[]) => {
    setSessions(updated);
    saveSessions(updated);
  }, []);

  const addSession = useCallback((session: Omit<Session, 'id'>) => {
    const newSession = { ...session, id: Date.now() };
    save([...sessions, newSession]);
  }, [sessions, save]);

  const updateSession = useCallback((id: number, data: Omit<Session, 'id'>) => {
    save(sessions.map(s => s.id === id ? { ...data, id } : s));
  }, [sessions, save]);

  const deleteSession = useCallback((id: number) => {
    save(sessions.filter(s => s.id !== id));
  }, [sessions, save]);

  const importAll = useCallback((imported: Session[]) => {
    save(imported);
  }, [save]);

  return { sessions, addSession, updateSession, deleteSession, importAll };
}
