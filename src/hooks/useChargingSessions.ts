import { useState, useEffect } from 'react';
import { ChargingSession, ChargingStats } from '../types/charging';
import { getJakartaDate, isSameDay, getWeekStart, getMonthStart, getYearStart } from '../utils/dateUtils';
import { createClient } from '@supabase/supabase-js';

const STORAGE_KEY = 'polytron-fox-r-charging-sessions';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};

export const useChargingSessions = () => {
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChargingSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = getSupabaseClient();

  useEffect(() => {
    const loadSessions = async () => {
      try {
        setIsLoading(true);
        const storedSessions = localStorage.getItem(STORAGE_KEY);

        if (storedSessions) {
          const parsedSessions = JSON.parse(storedSessions).map((session: any) => ({
            ...session,
            startTime: new Date(session.startTime),
            endTime: session.endTime ? new Date(session.endTime) : undefined,
          }));
          setSessions(parsedSessions);

          const activeSession = parsedSessions.find((session: ChargingSession) => session.isActive);
          if (activeSession) {
            setCurrentSession(activeSession);
          }

          if (supabase) {
            try {
              for (const session of parsedSessions) {
                const existing = await supabase
                  .from('charging_sessions')
                  .select('id')
                  .eq('id', session.id)
                  .maybeSingle();

                if (!existing.data) {
                  await supabase.from('charging_sessions').insert({
                    id: session.id,
                    starttime: session.startTime.toISOString(),
                    startbattery: session.startBattery,
                    endtime: session.endTime ? session.endTime.toISOString() : null,
                    endbattery: session.endBattery || null,
                    isactive: session.isActive,
                    location: session.location || 'Rumah',
                  });
                }
              }
            } catch (error) {
              console.error('Error syncing to database:', error);
            }
          }
        }
      } finally {
        setIsLoading(false);
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const startCharging = async (batteryPercentage: number, location: string = 'Rumah', coordinates?: { latitude: number; longitude: number }) => {
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

    if (supabase) {
      try {
        await supabase.from('charging_sessions').insert({
          id: newSession.id,
          starttime: newSession.startTime.toISOString(),
          startbattery: newSession.startBattery,
          isactive: true,
          location: newSession.location,
        });
      } catch (error) {
        console.error('Error saving to database:', error);
      }
    }
  };

  const endCharging = async (batteryPercentage: number) => {
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

    if (supabase) {
      try {
        await supabase.from('charging_sessions').update({
          endtime: endTime.toISOString(),
          endbattery: batteryPercentage,
          isactive: false,
        }).eq('id', currentSession.id);
      } catch (error) {
        console.error('Error updating database:', error);
      }
    }
  };

  const deleteSession = async (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));

    if (supabase) {
      try {
        await supabase.from('charging_sessions').delete().eq('id', sessionId);
      } catch (error) {
        console.error('Error deleting from database:', error);
      }
    }
  };

  const updateSession = async (sessionId: string, updates: Partial<ChargingSession>) => {
    setSessions(prev =>
      prev.map(session =>
        session.id === sessionId ? { ...session, ...updates } : session
      )
    );

    if (supabase) {
      try {
        const dbUpdates: any = {};
        if (updates.startTime) dbUpdates.starttime = updates.startTime.toISOString();
        if (updates.endTime) dbUpdates.endtime = updates.endTime.toISOString();
        if (updates.startBattery !== undefined) dbUpdates.startbattery = updates.startBattery;
        if (updates.endBattery !== undefined) dbUpdates.endbattery = updates.endBattery;
        if (updates.isActive !== undefined) dbUpdates.isactive = updates.isActive;
        if (updates.location) dbUpdates.location = updates.location;

        await supabase.from('charging_sessions').update(dbUpdates).eq('id', sessionId);
      } catch (error) {
        console.error('Error updating database:', error);
      }
    }
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

  const restoreSessions = async (restoredSessions: ChargingSession[]) => {
    const existingIds = new Set(sessions.map(s => s.id));
    const newSessions = restoredSessions.filter(s => !existingIds.has(s.id));

    setSessions(prev => [...prev, ...newSessions]);

    if (supabase) {
      try {
        for (const session of newSessions) {
          await supabase.from('charging_sessions').insert({
            id: session.id,
            starttime: session.startTime.toISOString(),
            startbattery: session.startBattery,
            endtime: session.endTime ? session.endTime.toISOString() : null,
            endbattery: session.endBattery || null,
            isactive: session.isActive,
            location: session.location || 'Rumah',
          });
        }
      } catch (error) {
        console.error('Error restoring to database:', error);
      }
    }
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