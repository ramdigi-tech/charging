export interface ChargingCostConfig {
  costPerKwh: number;
  chargerEfficiency: number;
}

export interface CostCalculation {
  energyUsed: number;
  estimatedCost: number;
  batteryIncrease: number;
}

const DEFAULT_CONFIG: ChargingCostConfig = {
  costPerKwh: 1500,
  chargerEfficiency: 0.92,
};

export function getChargingCostConfig(): ChargingCostConfig {
  const saved = localStorage.getItem('chargingCostConfig');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return DEFAULT_CONFIG;
    }
  }
  return DEFAULT_CONFIG;
}

export function saveChargingCostConfig(config: ChargingCostConfig): void {
  localStorage.setItem('chargingCostConfig', JSON.stringify(config));
}

export function calculateChargingCost(
  batteryIncrease: number,
  evBatteryCapacity: number = 60,
  config?: ChargingCostConfig
): CostCalculation {
  const finalConfig = config || getChargingCostConfig();

  if (evBatteryCapacity === 0) {
    return {
      energyUsed: 0,
      estimatedCost: 0,
      batteryIncrease,
    };
  }

  const energyRequired = (batteryIncrease / 100) * evBatteryCapacity;
  const energyDrawn = energyRequired / finalConfig.chargerEfficiency;
  const estimatedCost = energyDrawn * finalConfig.costPerKwh;

  return {
    energyUsed: energyDrawn,
    estimatedCost: Math.round(estimatedCost),
    batteryIncrease,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatEnergy(value: number): string {
  return value.toFixed(2);
}
