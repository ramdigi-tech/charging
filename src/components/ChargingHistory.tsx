import React from 'react';
import { Battery, Clock, Zap, Calendar, Trash2, ChevronDown, ChevronRight, MapPin } from 'lucide-react';
import { ChargingSession } from '../types/charging';
import { formatJakartaDate, formatJakartaTimeOnly, getTimezone } from '../utils/dateUtils';

interface ChargingHistoryProps {
  sessions: ChargingSession[];
  onDeleteSession: (sessionId: string) => void;
  onUpdateSession: (sessionId: string, updates: Partial<ChargingSession>) => void;
}

interface GroupedSessions {
  [monthKey: string]: {
    [weekKey: string]: ChargingSession[];
  };
}

export const ChargingHistory: React.FC<ChargingHistoryProps> = ({ 
  sessions, 
  onDeleteSession
}) => {
  const [expandedMonths, setExpandedMonths] = React.useState<Set<string>>(new Set());
  const [expandedWeeks, setExpandedWeeks] = React.useState<Set<string>>(new Set());

  const getBatteryColor = (percentage: number) => {
    if (percentage <= 20) return 'text-red-500';
    if (percentage <= 50) return 'text-orange-500';
    return 'text-green-500';
  };

  const getChargeGain = (session: ChargingSession) => {
    if (!session.endBattery) return 0;
    return session.endBattery - session.startBattery;
  };

  const getChargingDuration = (session: ChargingSession) => {
    if (!session.endTime) return 'Berlangsung...';
    
    const diffMs = session.endTime.getTime() - session.startTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      if (diffMinutes > 0) {
        return `${diffHours} jam ${diffMinutes} menit`;
      }
      return `${diffHours} jam`;
    }
    if (diffMinutes === 0) {
      return 'Kurang dari 1 menit';
    }
    return `${diffMinutes} menit`;
  };

  const getMonthKey = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: 'long'
    }).format(date);
  };

  const getWeekKey = (date: Date) => {
    const jakartaDate = new Date(date.toLocaleString("en-US", {timeZone: 'Asia/Jakarta'}));
    const startOfWeek = new Date(jakartaDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    // Format tanggal dengan hari, koma, dan em dash
    const startDay = startOfWeek.getDate();
    const endDay = endOfWeek.getDate();
    const startDayName = new Intl.DateTimeFormat('id-ID', { 
      timeZone: 'Asia/Jakarta',
      weekday: 'long' 
    }).format(startOfWeek);
    const endDayName = new Intl.DateTimeFormat('id-ID', { 
      timeZone: 'Asia/Jakarta',
      weekday: 'long' 
    }).format(endOfWeek);
    const startMonth = new Intl.DateTimeFormat('id-ID', { 
      timeZone: 'Asia/Jakarta',
      month: 'long' 
    }).format(startOfWeek);
    const endMonth = new Intl.DateTimeFormat('id-ID', { 
      timeZone: 'Asia/Jakarta',
      month: 'long' 
    }).format(endOfWeek);
    const startYear = startOfWeek.getFullYear();
    const endYear = endOfWeek.getFullYear();
    
    // Jika dalam bulan dan tahun yang sama
    if (startOfWeek.getMonth() === endOfWeek.getMonth() && startYear === endYear) {
      return `${startDayName}, ${startDay} – ${endDayName}, ${endDay} ${startMonth} ${startYear}`;
    }
    // Jika bulan berbeda tapi tahun sama
    if (startYear === endYear) {
      return `${startDayName}, ${startDay} ${startMonth} – ${endDayName}, ${endDay} ${endMonth} ${startYear}`;
    }
    // Jika tahun berbeda
    return `${startDayName}, ${startDay} ${startMonth} ${startYear} – ${endDayName}, ${endDay} ${endMonth} ${endYear}`;
  };

  const handleDelete = (sessionId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus sesi pengisian ini?')) {
      onDeleteSession(sessionId);
    }
  };

  const toggleMonth = (monthKey: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(monthKey)) {
      newExpanded.delete(monthKey);
    } else {
      newExpanded.add(monthKey);
    }
    setExpandedMonths(newExpanded);
  };

  const toggleWeek = (weekKey: string) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekKey)) {
      newExpanded.delete(weekKey);
    } else {
      newExpanded.add(weekKey);
    }
    setExpandedWeeks(newExpanded);
  };

  // Group sessions by month and week
  const groupedSessions: GroupedSessions = sessions.reduce((groups, session) => {
    const monthKey = getMonthKey(session.startTime);
    const weekKey = getWeekKey(session.startTime);
    
    if (!groups[monthKey]) {
      groups[monthKey] = {};
    }
    if (!groups[monthKey][weekKey]) {
      groups[monthKey][weekKey] = [];
    }
    
    groups[monthKey][weekKey].push(session);
    return groups;
  }, {} as GroupedSessions);

  // Sort months and weeks
  const sortedMonths = Object.keys(groupedSessions).sort((a, b) => {
    const dateA = new Date(groupedSessions[a][Object.keys(groupedSessions[a])[0]][0].startTime);
    const dateB = new Date(groupedSessions[b][Object.keys(groupedSessions[b])[0]][0].startTime);
    return dateB.getTime() - dateA.getTime();
  });

  if (sessions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">Riwayat Pengisian</h3>
        <div className="text-center py-8">
          <Battery className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">Belum ada sesi pengisian yang tercatat</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Mulai sesi pengisian pertama untuk melihat riwayat di sini</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800 mb-8">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Riwayat Pengisian</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {sessions.length} sesi
        </span>
      </div>

      <div className="space-y-3">
        {sortedMonths.map((monthKey) => {
          const monthSessions = groupedSessions[monthKey];
          const monthSessionCount = Object.values(monthSessions).flat().length;
          const isMonthExpanded = expandedMonths.has(monthKey);
          
          return (
            <div key={monthKey} className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
              {/* Month Header */}
              <button
                onClick={() => toggleMonth(monthKey)}
                className="w-full flex items-center justify-between p-3 sm:p-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600 transition-colors duration-150"
              >
                <div className="flex items-center gap-2">
                  {isMonthExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  )}
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{monthKey}</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{monthSessionCount} sesi</span>
              </button>

              {/* Month Content */}
              {isMonthExpanded && (
                <div className="bg-gray-50 dark:bg-gray-850">
                  {Object.keys(monthSessions)
                    .sort((a, b) => {
                      const dateA = monthSessions[a][0].startTime;
                      const dateB = monthSessions[b][0].startTime;
                      return dateB.getTime() - dateA.getTime();
                    })
                    .map((weekKey) => {
                      const weekSessions = monthSessions[weekKey];
                      const isWeekExpanded = expandedWeeks.has(`${monthKey}-${weekKey}`);
                      
                      return (
                        <div key={weekKey} className="border-t border-gray-300 dark:border-gray-700">
                          {/* Week Header */}
                          <button
                            onClick={() => toggleWeek(`${monthKey}-${weekKey}`)}
                            className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 active:bg-gray-200 dark:active:bg-gray-700 transition-colors duration-150 pl-6 sm:pl-8"
                          >
                            <div className="flex items-center gap-2">
                              {isWeekExpanded ? (
                                <ChevronDown className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                              ) : (
                                <ChevronRight className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                              )}
                              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 leading-tight">{weekKey}</span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{weekSessions.length} sesi</span>
                          </button>

                          {/* Week Sessions */}
                          {isWeekExpanded && (
                            <div className="bg-white dark:bg-gray-900">
                              {weekSessions
                                .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
                                .map((session) => (
                                <div
                                  key={session.id}
                                  className="border-t border-gray-200 dark:border-gray-800 p-3 sm:p-4 pl-6 sm:pl-12"
                                >
                                  {/* Compact Session Display */}
                                  <div className="flex items-start gap-2">
                                    {/* Content Wrapper */}
                                    <div className="flex-1 min-w-0">
                                      <div className="space-y-2">
                                        {/* Row 1: Hari dan Tanggal */}
                                        <div className="flex items-center gap-1.5">
                                          <Calendar className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                          <div className="flex flex-col gap-0.5">
                                            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                              {new Intl.DateTimeFormat('id-ID', {
                                                timeZone: 'Asia/Jakarta',
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                              }).format(session.startTime)}
                                              {/* Show cross-day indicator inline */}
                                              {session.endTime && session.startTime.toDateString() !== session.endTime.toDateString() && (
                                                <span className="text-orange-600 ml-1">
                                                  – {new Intl.DateTimeFormat('id-ID', {
                                                    timeZone: 'Asia/Jakarta',
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                  }).format(session.endTime)}
                                                </span>
                                              )}
                                            </span>
                                          </div>
                                        </div>

                                        {/* Row 2: Waktu */}
                                        <div className="flex items-center gap-1.5">
                                          <Clock className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                          <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                            {formatJakartaTimeOnly(session.startTime)}
                                            {session.endTime && (
                                              <>
                                                <span className="text-gray-400 dark:text-gray-500 mx-1">–</span>
                                                <span className="text-gray-700 dark:text-gray-300">
                                                  {formatJakartaTimeOnly(session.endTime)}
                                                </span>
                                              </>
                                            )}
                                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                              {getTimezone()}
                                            </span>
                                          </span>
                                        </div>

                                        {/* Row 3: Location */}
                                        {session.location && (
                                          <div className="flex items-center gap-1.5">
                                            <MapPin className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                            <div className="flex items-center gap-1.5 flex-1">
                                              {session.coordinates ? (
                                                <a
                                                  href={`https://www.google.com/maps?q=${session.coordinates.latitude},${session.coordinates.longitude}`}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
                                                  title="Buka di Google Maps"
                                                >
                                                  {session.location}
                                                </a>
                                              ) : (
                                                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                                  {session.location}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        )}

                                        {/* Row 4: Battery Progress */}
                                        <div className="flex items-center gap-2 text-sm sm:text-base">
                                          <Battery className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                          <div className="flex items-center gap-2">
                                            <span className={getBatteryColor(session.startBattery)}>
                                              {session.startBattery}%
                                            </span>
                                            <span className="text-gray-400 dark:text-gray-500">→</span>
                                            <span className={session.endBattery ? getBatteryColor(session.endBattery) : 'text-gray-400 dark:text-gray-500'}>
                                              {session.endBattery ? `${session.endBattery}%` : '...'}
                                            </span>
                                          </div>
                                        </div>

                                        {/* Row 4: Stats */}
                                        {session.endBattery && (
                                          <div className="flex items-center gap-1.5">
                                            <Zap className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                            <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                              <span className="font-medium text-green-600 dark:text-green-400">+{getChargeGain(session)}%</span>
                                              <span className="text-gray-400 dark:text-gray-500">•</span>
                                              <span>{getChargingDuration(session)}</span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Delete Button - Aligned to top right */}
                                    <button
                                      onClick={() => handleDelete(session.id)}
                                      className="p-1.5 text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 active:bg-red-100 dark:active:bg-red-900 rounded-md transition-colors duration-150 flex-shrink-0"
                                      title="Hapus"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};