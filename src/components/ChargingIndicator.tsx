import React from 'react';

export const ChargingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-16 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-2 border-blue-500 dark:border-blue-400 rounded-md overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-500 to-blue-400 dark:from-blue-600 dark:to-blue-500 charge-fill origin-bottom"></div>

        <div className="absolute inset-0 opacity-60 charge-wave bg-gradient-to-r from-transparent via-white to-transparent dark:via-blue-300"></div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 charge-wave origin-left"></div>
        </div>
        <span className="text-sm font-medium text-blue-600 dark:text-blue-400 charge-pulse-glow">
          Sedang Mengisi
        </span>
      </div>
    </div>
  );
};
