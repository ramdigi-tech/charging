import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import { getTimezone, setTimezone, getCurrentTimezoneString, TIMEZONE_LABELS, type TimezoneType } from '../utils/dateUtils';

export const MainClock: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [timezone, setTimezoneState] = useState<TimezoneType>(getTimezone());
  const [showTimezoneMenu, setShowTimezoneMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowTimezoneMenu(false);
      }
    };

    if (showTimezoneMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTimezoneMenu]);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('id-ID', {
      timeZone: getCurrentTimezoneString(),
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('id-ID', {
      timeZone: getCurrentTimezoneString(),
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleTimezoneChange = (newTimezone: TimezoneType) => {
    setTimezone(newTimezone);
    setTimezoneState(newTimezone);
    setShowTimezoneMenu(false);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-800">
      <div className="text-center">
        <div className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-1 tabular-nums">
          {formatTime(currentTime)}
        </div>
        <div className="relative inline-block" ref={menuRef}>
          <button
            onClick={() => setShowTimezoneMenu(!showTimezoneMenu)}
            className="inline-flex items-center gap-1 text-xs sm:text-sm text-gray-500 dark:text-gray-500 mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            title="Rubah zona waktu"
          >
            <Clock className="h-3 w-3" />
            {TIMEZONE_LABELS[timezone]} ({timezone})
          </button>

          {showTimezoneMenu && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-10 min-w-[200px]">
              {(['WIB', 'WITA', 'WIT'] as TimezoneType[]).map((tz) => (
                <button
                  key={tz}
                  onClick={() => handleTimezoneChange(tz)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    timezone === tz ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {TIMEZONE_LABELS[tz]} ({tz})
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          {formatDate(currentTime)}
        </div>
      </div>
    </div>
  );
};
