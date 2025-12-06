import React, { useState } from 'react';
import { Calendar, BarChart3, TrendingUp, Award } from 'lucide-react';
import { ChargingStats as StatsType } from '../types/charging';
import { getJakartaDate, getWeekStart, getWeekEnd, getMonthStart, getMonthEnd, getYearStart, formatDateRange, formatSingleDate } from '../utils/dateUtils';

interface ChargingStatsProps {
  stats: StatsType;
}

export const ChargingStats: React.FC<ChargingStatsProps> = ({ stats }) => {
  const now = getJakartaDate();
  const weekStart = getWeekStart(now);
  const weekEnd = getWeekEnd(now);
  const monthStart = getMonthStart(now);
  const monthEnd = getMonthEnd(now);
  const yearStart = getYearStart(now);

  const jakartaDate = new Date(now.toLocaleString("en-US", {timeZone: 'Asia/Jakarta'}));
  const currentYear = jakartaDate.getFullYear();
  const yearStartDate = new Date(currentYear, 0, 1);
  const yearEndDate = new Date(currentYear, 11, 31);

  const statItems = [
    {
      label: 'Hari Ini',
      value: stats.today,
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600',
      bgColor: 'bg-blue-50',
      dateRange: formatSingleDate(now),
    },
    {
      label: 'Minggu Ini',
      value: stats.thisWeek,
      icon: BarChart3,
      color: 'bg-green-100 text-green-600',
      bgColor: 'bg-green-50',
      dateRange: formatDateRange(weekStart, weekEnd),
    },
    {
      label: 'Bulan Ini',
      value: stats.thisMonth,
      icon: TrendingUp,
      color: 'bg-orange-100 text-orange-600',
      bgColor: 'bg-orange-50',
      dateRange: formatDateRange(monthStart, monthEnd),
    },
    {
      label: 'Tahun Ini',
      value: stats.thisYear,
      icon: Award,
      color: 'bg-purple-100 text-purple-600',
      bgColor: 'bg-purple-50',
      dateRange: `Rabu, 1 Januari – Rabu, 31 Desember ${currentYear}`,
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">Statistik Pengisian</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <div key={item.label}>
              <div className={`${item.bgColor} dark:bg-gray-800 rounded-lg p-3 sm:p-4 dark:border dark:border-gray-700`}>
                {/* Mobile Layout */}
                <div className="sm:hidden">
                  <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      <div className={`inline-flex p-1.5 rounded-lg ${item.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {item.label}
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {item.value}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {item.dateRange}
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:block text-center">
                  <div className={`inline-flex p-2 rounded-lg ${item.color} mb-2`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                    {item.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {item.dateRange}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};