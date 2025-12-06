import React, { useRef, useState } from 'react';
import { Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { ChargingSession } from '../types/charging';
import { createBackup, restoreBackup } from '../utils/backupRestore';

interface BackupRestoreProps {
  sessions: ChargingSession[];
  onRestore: (sessions: ChargingSession[]) => void;
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({ sessions, onRestore }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleBackup = () => {
    try {
      createBackup(sessions);
      setMessage({ type: 'success', text: 'Backup berhasil dibuat' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal membuat backup' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const restoredSessions = await restoreBackup(file);

      if (sessions.length > 0) {
        const confirmRestore = window.confirm(
          `Anda akan memulihkan ${restoredSessions.length} sesi pengisian. Data yang ada sekarang akan digabungkan dengan data backup. Lanjutkan?`
        );

        if (!confirmRestore) {
          e.target.value = '';
          return;
        }
      }

      onRestore(restoredSessions);
      setMessage({ type: 'success', text: `Berhasil memulihkan ${restoredSessions.length} sesi pengisian` });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Gagal memulihkan data' });
      setTimeout(() => setMessage(null), 3000);
    }

    e.target.value = '';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Backup & Restore
      </h2>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleBackup}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <Download className="h-5 w-5" />
            Backup Data
          </button>

          <button
            onClick={handleRestoreClick}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <Upload className="h-5 w-5" />
            Restore Data
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {message && (
          <div
            className={`flex items-center gap-2 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Backup:</strong> Simpan data ke file Excel (.xlsx)
          </p>
          <p className="text-sm text-blue-800 dark:text-blue-200 mt-2">
            <strong>Restore:</strong> Pulihkan data dari file backup Excel
          </p>
        </div>
      </div>
    </div>
  );
};
