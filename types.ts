
export type VehicleMode = 'OFF' | 'ACC' | 'PROPULSION';
export type BMSMode = 'CHARGING' | 'DISCHARGING' | 'NEUTRAL';
export type ContactorState = 'OPEN' | 'CLOSED';

export interface Faults {
  overtemperature: boolean;
  overvoltage: boolean;
  undervoltage: boolean;
}

export interface LoggerMessage {
  id: number;
  type: 'INFO' | 'WARN' | 'FAULT';
  text: string;
}

export interface ChartDataPoint {
  time: string;
  soc: number;
  voltage: number;
  temperature: number;
}