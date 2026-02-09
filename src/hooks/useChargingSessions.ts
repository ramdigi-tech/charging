import { useState, useEffect } from 'react';
import { ChargingSession, ChargingStats } from '../types/charging';
import { getJakartaDate, isSameDay, getWeekStart, getMonthStart, getYearStart } from '../utils/dateUtils';

const STORAGE_KEY = 'polytron-fox-r-charging-sessions';

export const useChargingSessions = () => {
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChargingSession | null>(null);

  // Load sessions from localStorage on mount and when visibility changes
  useEffect(() => {
    const loadSessions = () => {
      const storedSessions = localStorage.getItem(STORAGE_KEY);
      if (storedSessions) {
        const parsedSessions = JSON.parse(storedSessions).map((session: any) => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : undefined,
        }));
        setSessions(parsedSessions);

        // Check if there's an active session
        const activeSession = parsedSessions.find((session: ChargingSession) => session.isActive);
        if (activeSession) {
          setCurrentSession(activeSession);
        }
      }
    };

    loadSessions();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadSessions();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Save sessions to localStorage whenever sessions change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const startCharging = (batteryPercentage: number, location: string = 'Rumah', coordinates?: { latitude: number; longitude: number }) => {
    const newSession: ChargingSession = {
      id: Date.now().toString(),
      startTime: getJakartaDate(),
      startBattery: batteryPercentage,
      isActive: true,
      location,
      coordinates,
    };

    setSessions(prev => [...prev, newSession]);
    setCurrentSession(newSession);
  };

  const endCharging = (batteryPercentage: number) => {
    if (!currentSession) return;

    const endTime = getJakartaDate();
    const updatedSession: ChargingSession = {
      ...currentSession,
      endTime,
      endBattery: batteryPercentage,
      isActive: false,
    };

    setSessions(prev => 
      prev.map(session => 
        session.id === currentSession.id ? updatedSession : session
      )
    );
    setCurrentSession(null);
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
  };

  const updateSession = (sessionId: string, updates: Partial<ChargingSession>) => {
    setSessions(prev => 
      prev.map(session => 
        session.id === sessionId ? { ...session, ...updates } : session
      )
    );
  };

  const getStats = (): ChargingStats => {
    const now = getJakartaDate();
    const weekStart = getWeekStart(now);
    const monthStart = getMonthStart(now);
    const yearStart = getYearStart(now);

    const completedSessions = sessions.filter(session => !session.isActive);

    const today = completedSessions.filter(session =>
      isSameDay(session.startTime, now)
    ).length;

    const thisWeek = completedSessions.filter(session =>
      session.startTime >= weekStart
    ).length;

    const thisMonth = completedSessions.filter(session =>
      session.startTime >= monthStart
    ).length;

    const thisYear = completedSessions.filter(session =>
      session.startTime >= yearStart
    ).length;

    return { today, thisWeek, thisMonth, thisYear };
  };

  const completedSessions = sessions.filter(session => !session.isActive);

  const restoreSessions = (restoredSessions: ChargingSession[]) => {
    const existingIds = new Set(sessions.map(s => s.id));
    const newSessions = restoredSessions.filter(s => !existingIds.has(s.id));

    setSessions(prev => [...prev, ...newSessions]);
  };

  return {
    sessions: completedSessions,
    currentSession,
    startCharging,
    endCharging,
    deleteSession,
    updateSession,
    getStats,
    restoreSessions,
  };
};