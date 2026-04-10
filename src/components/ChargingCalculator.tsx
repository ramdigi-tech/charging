import React, { useState, useEffect } from 'react';
import { Calculator, Settings, X, ChevronUp, ChevronDown } from 'lucide-react';
import {
  calculateChargingCost,
  formatCurrency,
  formatEnergy,
  getChargingCostConfig,
  saveChargingCostConfig,
  type ChargingCostConfig,
} from '../utils/chargingCost';

interface ChargingCalculatorProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function ChargingCalculator({ isOpen, onToggle }: ChargingCalculatorProps) {
  const [batteryIncrease, setBatteryIncrease] = useState(20);
  const [evCapacity, setEvCapacity] = useState(3.75);
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState<ChargingCostConfig>(getChargingCostConfig());
  const [costPerKwhInput, setCostPerKwhInput] = useState(config.costPerKwh.toString());
  const [efficiencyInput, setEfficiencyInput] = useState((config.chargerEfficiency * 100).toString());

  useEffect(() => {
    setConfig(getChargingCostConfig());
  }, []);

  const calculation = calculateChargingCost(batteryIncrease, evCapacity, config);

  const handleSaveSettings = () => {
    const costPerKwh = parseFloat(costPerKwhInput) || config.costPerKwh;
    const chargerEfficiency = (parseFloat(efficiencyInput) || config.chargerEfficiency * 100) / 100;

    const newConfig: ChargingCostConfig = {
      costPerKwh: Math.max(0, costPerKwh),
      chargerEfficiency: Math.max(0.8, Math.min(0.98, chargerEfficiency)),
    };

    setConfig(newConfig);
    saveChargingCostConfig(newConfig);
    setShowSettings(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 left-6 bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 z-40"
        aria-label="Buka kalkulator"
      >
        <Zap className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-40">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
            <Calculator className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="font-semibold text-gray-900 dark:text-white">Kalkulator Biaya Charging</h2>
        </div>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {!showSettings ? (
          <>
            {/* Battery Increase Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Peningkatan Baterai: <span className="text-blue-600 dark:text-blue-400 font-bold">{batteryIncrease}%</span>
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={batteryIncrease}
                onChange={(e) => setBatteryIncrease(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setBatteryIncrease(Math.max(1, batteryIncrease - 10))}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded transition-colors"
                >
                  <ChevronDown className="h-4 w-4 mx-auto" />
                </button>
                <button
                  onClick={() => setBatteryIncrease(Math.min(100, batteryIncrease + 10))}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded transition-colors"
                >
                  <ChevronUp className="h-4 w-4 mx-auto" />
                </button>
              </div>
            </div>

            {/* Battery Capacity Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kapasitas Baterai (kWh)
              </label>
              <input
                type="number"
                min="0.1"
                max="200"
                step="0.1"
                value={evCapacity || ''}
                onChange={(e) => setEvCapacity(e.target.value ? Math.max(0.1, Number(e.target.value)) : 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Misal: 3.75 kWh (motor), 60 kWh (mobil)</p>
            </div>

            {/* Results */}
            <div className="space-y-3 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Energi Digunakan</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatEnergy(calculation.energyUsed)} kWh
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Efisiensi Charger</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {(config.chargerEfficiency * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
                <p className="text-xs text-gray-600 dark:text-gray-400">Estimasi Biaya Charging</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {formatCurrency(calculation.estimatedCost)}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {batteryIncrease}% dari {evCapacity} kWh
                </p>
              </div>
            </div>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Pengaturan Tarif
            </button>
          </>
        ) : (
          <>
            {/* Settings Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tarif per kWh (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  value={costPerKwhInput}
                  onChange={(e) => setCostPerKwhInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Default: Rp 1.500 (Indonesia)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Efisiensi Charger (%)
                </label>
                <input
                  type="number"
                  min="80"
                  max="98"
                  step="1"
                  value={efficiencyInput}
                  onChange={(e) => setEfficiencyInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Range: 80-98% (default: 92%)</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors font-medium"
                >
                  Simpan
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
