
export const SOC_CHARGE_COMPLETE_THRESHOLD = 95;
export const SOC_CHARGE_MANDATORY_THRESHOLD = 65;
export const SOC_CHARGE_MANDATORY_HYSTERESIS_STOP = 78; // Stop mandatory charge when SOC reaches this level
export const TEMP_CHARGE_HIGH_THRESHOLD = 45;
export const TEMP_CHARGE_CRITICAL_THRESHOLD = 60;
export const TEMP_CHARGE_LOW_THRESHOLD = 0;
export const SOH_CHARGE_INHIBIT_THRESHOLD = 70;
export const DISCHARGE_LOAD_THRESHOLD = 2;
export const MAX_CHART_POINTS = 60; // Keep last 60 seconds of data

// Fixed voltage values for simplified simulation
export const VOLTAGE_CHARGING = 14.4;
export const VOLTAGE_DISCHARGING = 12.2;
export const VOLTAGE_NEUTRAL = 12.8;

// Constant for the new realistic charging curve
export const BASE_CHARGE_RATE_SOC_PER_TICK = 0.1; // Base SOC increase per second at 0% SOC