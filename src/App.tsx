import React, { useState, useEffect } from 'react';
import { Zap, Moon, Sun, FileDown, Download } from 'lucide-react';
import { useChargingSessions } from './hooks/useChargingSessions';
import { ChargingStatus } from './components/ChargingStatus';
import { ChargingStats } from './components/ChargingStats';
import { ChargingHistory } from './components/ChargingHistory';
import { MainClock } from './components/MainClock';
import { BackupRestore } from './components/BackupRestore';
import { exportToPDF } from './utils/pdfExport';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const [showQRPopup, setShowQRPopup] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  const {
    sessions,
    currentSession,
    startCharging,
    endCharging,
    deleteSession,
    updateSession,
    getStats,
    restoreSessions,
  } = useChargingSessions();

  const stats = getStats();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const installDismissed = localStorage.getItem('installPromptDismissed');
      if (!installDismissed) {
        setShowInstallPrompt(true);
      }
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const handleSWUpdate = (event: any) => {
      const registration = event.detail;
      setWaitingWorker(registration.waiting);
      setShowUpdatePrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('swUpdated', handleSWUpdate);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('swUpdated', handleSWUpdate);
    };
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const closeWelcomePopup = () => {
    setShowWelcomePopup(false);
  };

  const handleExportPDF = () => {
    exportToPDF(sessions, stats);
  };

  const openQRPopup = () => {
    setShowQRPopup(true);
  };

  const closeQRPopup = () => {
    setShowQRPopup(false);
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  const handleUpdateClick = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setShowUpdatePrompt(false);
    }
  };

  const dismissUpdatePrompt = () => {
    setShowUpdatePrompt(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black pb-8 relative overflow-hidden">
      {/* Tech Pattern Background */}
      <div className="fixed inset-0 pointer-events-none opacity-30 dark:opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px),
            linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)
          `
        }}></div>
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="circuit-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="2" fill="currentColor" className="text-blue-400 dark:text-blue-600" opacity="0.3"/>
              <circle cx="150" cy="50" r="2" fill="currentColor" className="text-green-400 dark:text-green-600" opacity="0.3"/>
              <circle cx="50" cy="150" r="2" fill="currentColor" className="text-purple-400 dark:text-purple-600" opacity="0.3"/>
              <circle cx="150" cy="150" r="2" fill="currentColor" className="text-blue-400 dark:text-blue-600" opacity="0.3"/>
              <line x1="50" y1="50" x2="150" y2="50" stroke="currentColor" className="text-blue-300 dark:text-blue-700" strokeWidth="0.5" opacity="0.2"/>
              <line x1="50" y1="50" x2="50" y2="150" stroke="currentColor" className="text-green-300 dark:text-green-700" strokeWidth="0.5" opacity="0.2"/>
              <line x1="150" y1="50" x2="150" y2="150" stroke="currentColor" className="text-purple-300 dark:text-purple-700" strokeWidth="0.5" opacity="0.2"/>
              <line x1="50" y1="150" x2="150" y2="150" stroke="currentColor" className="text-blue-300 dark:text-blue-700" strokeWidth="0.5" opacity="0.2"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit-pattern)"/>
        </svg>
      </div>

      <div className="relative z-10">
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 text-sm z-50 shadow-lg">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Anda sedang offline
          </div>
        </div>
      )}

      {/* Update Prompt */}
      {showUpdatePrompt && (
        <div className="fixed top-4 left-4 right-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl shadow-2xl p-4 z-50 animate-fade-in max-w-md mx-auto">
          <button
            onClick={dismissUpdatePrompt}
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-blue-700 hover:bg-blue-800 transition-colors text-white text-lg"
            aria-label="Close"
          >
            ×
          </button>
          <div className="flex items-start gap-3 pr-6">
            <div className="flex-shrink-0 w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm mb-1">Update Tersedia</h3>
              <p className="text-xs text-blue-100 mb-3">Versi baru aplikasi sudah tersedia dengan fitur dan perbaikan terbaru</p>
              <button
                onClick={handleUpdateClick}
                className="w-full bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-blue-50 transition-colors"
              >
                Update Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Install Prompt */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 left-4 right-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl shadow-2xl p-4 z-50 animate-fade-in max-w-md mx-auto">
          <button
            onClick={dismissInstallPrompt}
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-blue-700 hover:bg-blue-800 transition-colors text-white text-lg"
            aria-label="Close"
          >
            ×
          </button>
          <div className="flex items-start gap-3 pr-6">
            <div className="flex-shrink-0 w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm mb-1">Install Aplikasi</h3>
              <p className="text-xs text-blue-100 mb-3">Pasang CLA di home screen untuk akses lebih cepat</p>
              <button
                onClick={handleInstallClick}
                className="w-full bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-blue-50 transition-colors"
              >
                Install Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl" style={{ marginTop: isOnline ? '0' : '40px' }}>
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 relative pt-4 px-4 sm:px-0">
          {/* Icon di tengah atas dengan Dark Mode Toggle */}
          <div className="mb-3 flex justify-center">
            <button
              onClick={toggleDarkMode}
              className="inline-flex p-5 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 relative group"
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            >
              <Zap className="h-9 w-9 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-300" />
              {/* Indicator kecil untuk dark mode */}
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 flex items-center justify-center">
                {isDarkMode ? (
                  <Moon className="h-3 w-3 text-gray-700 dark:text-yellow-400" />
                ) : (
                  <Sun className="h-3 w-3 text-yellow-500" />
                )}
              </div>
            </button>
          </div>

          <div className="flex flex-col items-center px-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center leading-tight tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.15em' }}>CHARGE & RIDE</h1>
            <a
              href="https://s.id/ChargingLogApplication"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 hover:underline mt-1"
            >
              To update: back up your data, clear cookies, then restore.
            </a>
          </div>
        </div>

        {/* Main Clock */}
        <MainClock />

        {/* Charging Status */}
        <ChargingStatus
          currentSession={currentSession}
          onStartCharging={startCharging}
          onEndCharging={endCharging}
        />

        {/* Statistics */}
        <ChargingStats stats={stats} />

        {/* Charging History */}
        <div className="mb-6">
          <ChargingHistory
            sessions={sessions}
            onDeleteSession={deleteSession}
          />
        </div>

        {/* Export Button */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <FileDown className="h-5 w-5" />
            Ekspor ke PDF
          </button>
        </div>

        {/* Backup & Restore */}
        <BackupRestore
          sessions={sessions}
          onRestore={restoreSessions}
        />

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="text-center space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              CLA 
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Version 2.13 by{' '}
              <a
                href="https://instagram.com/ramnuari"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200 hover:underline"
              >
                Ram Digi Tech
              </a>
            </p>
            <button
              onClick={openQRPopup}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 hover:underline"
            >
              Support this app to keep improving
            </button>
          </div>
        </footer>
      </div>
      </div>

      {/* QR Code Popup */}
      {showQRPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={closeQRPopup}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full p-4 animate-fade-in relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeQRPopup}
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300"
              aria-label="Close"
            >
              ×
            </button>
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Support This App
              </h2>
            </div>
            <div className="flex justify-center mb-4">
              <img
                src="/Scan QRIS.jpeg"
                alt="QR Code Support"
                className="w-full h-auto rounded-lg shadow-lg object-contain"
                style={{ maxHeight: '400px' }}
              />
            </div>
            <a
              href="/Scan QRIS.jpeg"
              download="QRIS-Support.jpeg"
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 hover:shadow-lg"
            >
              <Download className="h-4 w-4" />
              Download QRIS
            </a>
          </div>
        </div>
      )}

      {/* Welcome Popup */}
      {showWelcomePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-fade-in">
            <div className="text-center mb-6">
              <div className="inline-flex p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl mb-4">
                <Zap className="h-10 w-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                Charging Log Application
              </h2>
              <div className="flex justify-center mt-3">
                <img
                  src="/Logo DIGI RAM.png"
                  alt="Ram Digi Tech"
                  className="h-12 object-contain"
                />
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-gray-700 text-center leading-relaxed">
                For logging electric car or motorcycle charging
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 text-center font-medium">
                  Your data is local. Back up regularly. Use one browser per vehicle. 
                </p>
              </div>
            </div>

            <button
              onClick={closeWelcomePopup}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-lg"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;