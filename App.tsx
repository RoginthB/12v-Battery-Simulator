import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { VehicleMode, BMSMode, ContactorState, Faults, LoggerMessage, ChartDataPoint } from './types';
import {
  SOC_CHARGE_MANDATORY_THRESHOLD,
  SOC_CHARGE_MANDATORY_HYSTERESIS_STOP,
  TEMP_CHARGE_HIGH_THRESHOLD,
  TEMP_CHARGE_CRITICAL_THRESHOLD,
  TEMP_CHARGE_LOW_THRESHOLD,
  SOH_CHARGE_INHIBIT_THRESHOLD,
  DISCHARGE_LOAD_THRESHOLD,
  MAX_CHART_POINTS,
  VOLTAGE_CHARGING,
  VOLTAGE_DISCHARGING,
  VOLTAGE_NEUTRAL,
  BASE_CHARGE_RATE_SOC_PER_TICK,
} from './constants';
import ControlsPanel from './components/ControlsPanel';
import StatusDisplay from './components/StatusDisplay';
import ChartsPanel from './components/ChartsPanel';
import AIDiagnosticPanel from './components/AIDiagnosticPanel';
import { IconSparkles } from './components/Icon';

const App: React.FC = () => {
  // Input states
  const [soc, setSoc] = useState<number>(60);
  const [temperature, setTemperature] = useState<number>(25);
  const [accessoryLoad, setAccessoryLoad] = useState<number>(5);
  const [soh, setSoh] = useState<number>(98);
  const [vehicleMode, setVehicleMode] = useState<VehicleMode>('OFF');
  const [faults, setFaults] = useState<Faults>({
    overtemperature: false,
    overvoltage: false,
    undervoltage: false,
  });
  const [isMandatoryCharging, setIsMandatoryCharging] = useState<boolean>(soc < SOC_CHARGE_MANDATORY_THRESHOLD);

  // Output states
  const [bmsMode, setBmsMode] = useState<BMSMode>('NEUTRAL');
  const [contactorState, setContactorState] = useState<ContactorState>('CLOSED');
  const [loggerMessages, setLoggerMessages] = useState<LoggerMessage[]>([]);
  const [activeWarnings, setActiveWarnings] = useState<string[]>([]);

  // Chart data
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // AI Assistant State
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);


  const logIdCounter = useRef(0);

  const addLogMessage = useCallback((type: 'INFO' | 'WARN' | 'FAULT', text: string) => {
    setLoggerMessages(prev => [
      { id: logIdCounter.current++, type, text },
      ...prev
    ].slice(0, 5));
  }, []);

  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true);
    setAiError(null);
    setAiAnalysis(null);

    const prompt = `You are a concise, technical BMS expert AI. Analyze the following 12V battery system parameters.
Respond only in the following format, be direct, no conversation:
Status: [One-line summary of the battery's current state]
Reason: [Brief explanation for the current status]
Action: [Recommended action for the vehicle owner in simple, non-technical language. For example: "Consider driving the vehicle to charge the battery." or "No action needed at this time."]

- State of Charge (SOC): ${soc.toFixed(0)}%
- State of Health (SOH): ${soh.toFixed(0)}%
- Temperature: ${temperature.toFixed(0)}°C
- Accessory Load: ${accessoryLoad.toFixed(0)}A
- Vehicle Mode: ${vehicleMode}
- BMS Mode: ${bmsMode}
- Contactor State: ${contactorState}
- Active Faults: ${Object.entries(faults).filter(([, value]) => value).map(([key]) => key).join(', ') || 'None'}`;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      setAiAnalysis(response.text);
    } catch (error) {
      console.error("AI analysis failed:", error);
      setAiError("Failed to get analysis. Please check the API key and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [soc, soh, temperature, accessoryLoad, vehicleMode, faults, bmsMode, contactorState]);


  // Hysteresis management for mandatory charging
  useEffect(() => {
    if (!isMandatoryCharging && soc < SOC_CHARGE_MANDATORY_THRESHOLD) {
      setIsMandatoryCharging(true);
    } else if (isMandatoryCharging && soc >= SOC_CHARGE_MANDATORY_HYSTERESIS_STOP) {
      setIsMandatoryCharging(false);
    }
  }, [soc, isMandatoryCharging]);

  // Core Logic Engine
  useEffect(() => {
    let nextBmsMode: BMSMode = 'NEUTRAL';
    let nextContactorState: ContactorState = 'CLOSED';
    let nextLogType: 'INFO' | 'WARN' | 'FAULT' = 'INFO';
    let nextLogMessage: string = 'INFO: System in Neutral/Idle state.';
    let nextWarnings: string[] = [];

    // Fault handling first, as it has the highest priority.
    if (faults.overtemperature) nextWarnings.push("Overtemperature");
    if (faults.overvoltage) nextWarnings.push("Overvoltage");
    if (faults.undervoltage) nextWarnings.push("Undervoltage");

    const faultActive = nextWarnings.length > 0;

    if (faultActive) {
      nextBmsMode = 'NEUTRAL';
      nextContactorState = 'OPEN';
      nextLogType = 'FAULT';
      // Use the first detected fault for the log message of this tick. The "Active Faults" panel shows all.
      const firstFault = nextWarnings[0];
      nextLogMessage = `FAULT: ${firstFault} fault active. All charging/discharging disabled. Contactor Open.`;
    } else if (temperature > TEMP_CHARGE_CRITICAL_THRESHOLD) {
        nextBmsMode = 'NEUTRAL';
        nextContactorState = 'OPEN';
        nextLogType = 'WARN';
        nextLogMessage = `WARN: All activity inhibited. Battery temperature (${temperature}°C) is above the critical ${TEMP_CHARGE_CRITICAL_THRESHOLD}°C threshold.`;
        nextWarnings.push("Critical Temperature");
    } else if (temperature < TEMP_CHARGE_LOW_THRESHOLD) {
        nextBmsMode = 'NEUTRAL';
        nextContactorState = 'OPEN';
        nextLogType = 'WARN';
        nextLogMessage = `WARN: All activity inhibited. Battery temperature (${temperature}°C) is below the ${TEMP_CHARGE_LOW_THRESHOLD}°C safety threshold.`;
        nextWarnings.push("Low Temperature");
    } else if (vehicleMode === 'PROPULSION') {
        let canCharge = true;
        let inhibitReason = '';

        // Check for inhibit conditions, starting with highest priority (safety warnings)
        if (soh < SOH_CHARGE_INHIBIT_THRESHOLD && !isMandatoryCharging) {
            canCharge = false;
            inhibitReason = `WARN: Charging inhibited. Battery SOH (${soh}%) is below the ${SOH_CHARGE_INHIBIT_THRESHOLD}% threshold.`;
            nextLogType = 'WARN';
        } else if (temperature > TEMP_CHARGE_HIGH_THRESHOLD && !isMandatoryCharging) {
            canCharge = false;
            inhibitReason = `WARN: Charging inhibited. Battery temperature (${temperature}°C) is above the ${TEMP_CHARGE_HIGH_THRESHOLD}°C safety threshold.`;
            nextLogType = 'WARN';
        }

        if (canCharge) {
            nextBmsMode = 'CHARGING';
            nextContactorState = 'CLOSED';
            if (isMandatoryCharging) {
                nextLogMessage = `INFO: Mandatory charging initiated. SOC (${soc.toFixed(0)}%) is below ${SOC_CHARGE_MANDATORY_THRESHOLD}%.`;
            } else {
                nextLogMessage = `INFO: Charging enabled. Vehicle in PROPULSION mode and system checks are normal.`;
            }
        } else {
            nextBmsMode = 'NEUTRAL';
            nextLogMessage = inhibitReason;
            // When not charging in PROPULSION mode (due to safety or completion), open the contactor.
            nextContactorState = 'OPEN';
        }
    } else if (vehicleMode === 'ACC' || vehicleMode === 'OFF') {
      if (isMandatoryCharging) {
          nextBmsMode = 'CHARGING';
          nextContactorState = 'CLOSED';
          nextLogMessage = `INFO: Mandatory charging initiated. SOC (${soc.toFixed(0)}%) is below ${SOC_CHARGE_MANDATORY_THRESHOLD}%.`;
      } else {
          if (accessoryLoad > DISCHARGE_LOAD_THRESHOLD) {
              nextBmsMode = 'DISCHARGING';
              nextLogMessage = `INFO: Vehicle ${vehicleMode}, load active (${accessoryLoad}A). Discharging.`;
          } else {
              nextBmsMode = 'NEUTRAL';
              nextLogMessage = `INFO: System Idle. Load (${accessoryLoad}A) is minimal.`;
          }
      }
    }
    
    setBmsMode(nextBmsMode);
    setContactorState(nextContactorState);
    setActiveWarnings(nextWarnings);
    if (loggerMessages.length === 0 || loggerMessages[0].text !== nextLogMessage) {
        addLogMessage(nextLogType, nextLogMessage);
    }
  }, [soc, temperature, accessoryLoad, soh, vehicleMode, faults, addLogMessage, isMandatoryCharging, loggerMessages]);

  // Simulation Tick (for charts and SOC changes)
  useEffect(() => {
    const interval = setInterval(() => {
      let newSoc = soc;
      let newTemp = temperature;
      
      if (bmsMode === 'CHARGING') {
        // More realistic charging: rate slows down as SOC increases (tapering charge)
        const chargeFactor = 1 - (soc / 105); // Use >100 to ensure it still charges a bit near 100%
        newSoc += BASE_CHARGE_RATE_SOC_PER_TICK * Math.max(0, chargeFactor);
        newTemp += 0.02;
      } else if (bmsMode === 'DISCHARGING') {
        newSoc -= accessoryLoad * 0.001;
        newTemp += accessoryLoad * 0.001;
      }

      newSoc = Math.max(0, Math.min(100, newSoc));
      newTemp = Math.max(-20, Math.min(80, newTemp));

      setSoc(newSoc);

      // Simplified fixed voltage simulation
      let newVoltage = VOLTAGE_NEUTRAL;
      if (bmsMode === 'CHARGING') {
        newVoltage = VOLTAGE_CHARGING;
      } else if (bmsMode === 'DISCHARGING') {
        newVoltage = VOLTAGE_DISCHARGING;
      }
      
      const newTime = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      const newDataPoint: ChartDataPoint = {
        time: newTime,
        soc: newSoc,
        voltage: newVoltage,
        temperature: temperature,
      };

      setChartData(prev => [...prev, newDataPoint].slice(-MAX_CHART_POINTS));

    }, 1000);

    return () => clearInterval(interval);
  }, [soc, temperature, accessoryLoad, bmsMode]);


  return (
    <div className="min-h-screen bg-slate-900 text-slate-300">
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] lg:h-screen">
        <aside className="bg-slate-800/50 border-r border-slate-700 p-4 lg:p-6 lg:overflow-y-auto">
          <header className="mb-8">
             <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-sky-500/10 rounded-lg flex items-center justify-center border border-sky-500/20">
                 <IconSparkles className="w-7 h-7 text-sky-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-100">12V BMS Simulator</h1>
                <p className="text-sm text-slate-400">Automotive ECU Dashboard</p>
              </div>
             </div>
          </header>
          <ControlsPanel
            soc={soc}
            setSoc={setSoc}
            temperature={temperature}
            setTemperature={setTemperature}
            accessoryLoad={accessoryLoad}
            setAccessoryLoad={setAccessoryLoad}
            soh={soh}
            setSoh={setSoh}
            vehicleMode={vehicleMode}
            setVehicleMode={setVehicleMode}
            faults={faults}
            setFaults={setFaults}
          />
        </aside>

        <main className="p-4 lg:p-6 grid grid-cols-1 grid-rows-[auto_1fr] gap-6 lg:overflow-y-auto">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <AIDiagnosticPanel
              bmsMode={bmsMode}
              contactorState={contactorState}
              analysis={aiAnalysis}
              isLoading={isAnalyzing}
              error={aiError}
              onAnalyze={handleAnalyze}
            />
            <StatusDisplay
              activeWarnings={activeWarnings}
              loggerMessages={loggerMessages}
            />
          </div>
          <ChartsPanel data={chartData} />
        </main>
      </div>
    </div>
  );
};

export default App;