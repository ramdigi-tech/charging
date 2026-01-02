import React, { useState, useEffect } from 'react';
import { Battery, Zap, Clock, Bike, MapPin, Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { ChargingSession } from '../types/charging';
import { formatJakartaTime, formatJakartaTimeOnly, getJakartaDate, getTimezone } from '../utils/dateUtils';
import { RealtimeClock } from './RealtimeClock';
import { detectLocation, LocationData } from '../utils/locationUtils';

interface ChargingStatusProps {
  currentSession: ChargingSession | null;
  onStartCharging: (batteryPercentage: number, location: string, coordinates?: { latitude: number; longitude: number }) => void;
  onEndCharging: (batteryPercentage: number) => void;
}

const CHARGE_RATE = 1 / 3;

export const ChargingStatus: React.FC<ChargingStatusProps> = ({
  currentSession,
  onStartCharging,
  onEndCharging,
}) => {
  const [batteryInput, setBatteryInput] = useState<string>('');
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string>('');
  const [hasDetectedOnce, setHasDetectedOnce] = useState<boolean>(false);
  const [estimatedProgress, setEstimatedProgress] = useState<number>(0);
  const [estimatedCompletionTime, setEstimatedCompletionTime] = useState<string>('');

  useEffect(() => {
    if (!currentSession) {
      setBatteryInput('');
      setLocationData(null);
      setLocationError('');
      setHasDetectedOnce(false);
      setEstimatedProgress(0);
      setEstimatedCompletionTime('');
    }
  }, [currentSession]);

  useEffect(() => {
    if (!currentSession) return;

    const updateProgress = () => {
      const now = new Date();
      const startTime = new Date(currentSession.startTime);
      const elapsedMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60);

      const estimatedBattery = Math.min(
        currentSession.startBattery + (elapsedMinutes * CHARGE_RATE),
        100
      );

      setEstimatedProgress(estimatedBattery);

      const remainingPercentage = 100 - currentSession.startBattery;
      const remainingMinutes = remainingPercentage / CHARGE_RATE;
      const completionTime = new Date(startTime.getTime() + remainingMinutes * 60 * 1000);

      const hours = completionTime.getHours().toString().padStart(2, '0');
      const minutes = completionTime.getMinutes().toString().padStart(2, '0');
      setEstimatedCompletionTime(`${hours}:${minutes}`);
    };

    updateProgress();
    const interval = setInterval(updateProgress, 1000);

    return () => clearInterval(interval);
  }, [currentSession]);

  const handleBatteryInputChange = (value: string, isEndCharging: boolean = false) => {
    const numericValue = value.replace(/[^0-9]/g, '');

    if (numericValue === '') {
      setBatteryInput('');
      return;
    }

    const numValue = parseInt(numericValue);

    if (isEndCharging && currentSession) {
      if (numericValue === '0') {
        setBatteryInput('0');
        return;
      }

      if (numericValue.startsWith('0')) {
        return;
      }

      if (numericValue.length > 3) {
        return;
      }

      if (numValue > 100) {
        return;
      }

      setBatteryInput(numericValue);
      return;
    }

    if (numericValue === '0') {
      setBatteryInput('0');
      return;
    }

    if (numericValue.startsWith('0')) {
      return;
    }

    if (numericValue.length > 3) {
      return;
    }

    if (numValue > 100) {
      return;
    }

    if (numValue >= 100) {
      return;
    }

    setBatteryInput(numericValue);
  };

  const handleDetectLocation = async () => {
    if (hasDetectedOnce) return;

    setIsDetectingLocation(true);
    setLocationError('');
    try {
      const data = await detectLocation();
      setLocationData(data);
      setHasDetectedOnce(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal mendeteksi lokasi';
      setLocationError(errorMessage);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleStartCharging = () => {
    const percentage = parseInt(batteryInput);
    if (percentage >= 0 && percentage < 100 && !isNaN(percentage) && locationData) {
      onStartCharging(percentage, locationData.address, locationData.coordinates);
      setBatteryInput('');
      setLocationData(null);
      setLocationError('');
    }
  };

  const getGoogleMapsUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  };

  const handleEndCharging = () => {
    const percentage = parseInt(batteryInput);
    if (currentSession && percentage > currentSession.startBattery && percentage >= 0 && percentage <= 100 && !isNaN(percentage)) {
      onEndCharging(percentage);
      setBatteryInput('');
    }
  };

  const getBatteryColor = (percentage: number) => {
    if (percentage <= 20) return 'text-red-500';
    if (percentage <= 50) return 'text-orange-500';
    return 'text-green-500';
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 sm:p-6 mb-6 border border-gray-200 dark:border-gray-800">
      <div className="text-center mb-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Status Pengisian</h3>
      </div>

      {currentSession ? (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"></div>
              <span className="font-medium text-blue-700 dark:text-blue-300">Sedang Mengisi</span>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Progres Pengisian</span>
                <span className={`text-xs font-semibold ${estimatedProgress >= 100 ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>{Math.round(estimatedProgress)}% {estimatedProgress >= 100 ? '✓' : '(Perkiraan)'}</span>
              </div>
              <div className="relative w-full h-4 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                <div
                  className={`h-full rounded-full ${estimatedProgress >= 100 ? 'bg-gradient-to-r from-green-400 to-green-600 dark:from-green-500 dark:to-green-700 shadow-lg shadow-green-500/50' : 'animate-charging transition-all duration-300 ease-out'}`}
                  style={{
                    width: `${Math.max(estimatedProgress, 0)}%`,
                    minWidth: estimatedProgress > 0 ? '8px' : '0px'
                  }}
                ></div>
              </div>

              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <p className="font-medium">Estimasi waktu selesai: <span className="font-semibold">{estimatedCompletionTime}</span></p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Perkiraan berdasarkan (0-100% = 5 jam). Waktu sebenarnya bisa berbeda tergantung kondisi kendaraan Anda.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Dimulai pada</p>
                  <div className="font-medium text-gray-900 dark:text-white">
                    <RealtimeClock startTime={currentSession.startTime} />
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{getTimezone()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Battery className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Baterai awal</p>
                  <p className={`font-medium ${getBatteryColor(currentSession.startBattery)}`}>
                    {currentSession.startBattery}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="number"
              value={batteryInput}
              onChange={(e) => handleBatteryInputChange(e.target.value, true)}
              placeholder="Persentase baterai saat ini"
              className="flex-1 px-4 py-4 sm:py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400 text-lg sm:text-base transition-all duration-200"
            />
            <button
              onClick={handleEndCharging}
              disabled={!currentSession || parseInt(batteryInput) <= currentSession.startBattery || parseInt(batteryInput) > 100 || isNaN(parseInt(batteryInput)) || currentSession.startBattery >= 100}
              className="px-6 py-4 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-lg sm:text-base min-h-[56px] sm:min-h-[auto]"
            >
              Selesai Mengisi
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center">
            <Battery className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">Tidak ada sesi pengisian aktif</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Persentase Baterai Saat Ini
              </label>
              <input
                type="number"
                value={batteryInput}
                onChange={(e) => handleBatteryInputChange(e.target.value)}
                placeholder="Masukkan persentase baterai"
                className="w-full px-4 py-4 sm:py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400 text-lg sm:text-base transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lokasi Pengisian
              </label>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation || hasDetectedOnce}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  title={hasDetectedOnce ? 'Lokasi sudah terdeteksi. Refresh halaman untuk mendeteksi lokasi baru.' : 'Deteksi lokasi Anda saat ini'}
                >
                  {isDetectingLocation ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Mendeteksi Lokasi...
                    </>
                  ) : hasDetectedOnce ? (
                    <>
                      <MapPin className="h-4 w-4" />
                      Lokasi Sudah Terdeteksi
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4" />
                      Deteksi Lokasi Otomatis
                    </>
                  )}
                </button>

                {locationData && (
                  <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 rounded-lg">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">Lokasi Terdeteksi:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{locationData.address}</p>
                        <a
                          href={getGoogleMapsUrl(locationData.coordinates.latitude, locationData.coordinates.longitude)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
                        >
                          <span>Buka di Google Maps</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {locationError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-300">{locationError}</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleStartCharging}
              disabled={parseInt(batteryInput) < 0 || parseInt(batteryInput) >= 100 || isNaN(parseInt(batteryInput)) || !locationData}
              className="w-full px-6 py-4 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg sm:text-base"
            >
              <Zap className="h-4 w-4" />
              Mulai Mengisi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};