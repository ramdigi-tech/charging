export interface ChargingSession {
  id: string;
  startTime: Date;
  startBattery: number;
  endTime?: Date;
  endBattery?: number;
  isActive: boolean;
  location?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface ChargingStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  thisYear: number;
}