import React, { useState, useEffect } from 'react';
import { formatJakartaTime, formatJakartaTimeOnly } from '../utils/dateUtils';

interface RealtimeClockProps {
  startTime?: Date;
  showFullTime?: boolean;
}

export const RealtimeClock: React.FC<RealtimeClockProps> = ({ startTime, showFullTime = false }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (startTime && !showFullTime) {
    // Mode untuk menampilkan waktu mulai
    return (
      <div className="text-gray-900 dark:text-white text-sm">
        {formatJakartaTimeOnly(startTime)}
      </div>
    );
  }

  return (
    <div className="text-blue-600 font-mono text-sm sm:text-base">
      {showFullTime ? formatJakartaTime(currentTime) : formatJakartaTimeOnly(currentTime)}
    </div>
  );
};