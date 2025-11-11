import React from 'react';
import type { VehicleMode, Faults } from '../types';
import Slider from './Slider';
import { IconBolt, IconFlame, IconGauge, IconHeartbeat, IconCar, IconAlertTriangle } from './Icon';

interface ControlsPanelProps {
  soc: number;
  setSoc: (value: number) => void;
  temperature: number;
  setTemperature: (value: number) => void;
  accessoryLoad: number;
  setAccessoryLoad: (value: number) => void;
  soh: number;
  setSoh: (value: number) => void;
  vehicleMode: VehicleMode;
  setVehicleMode: (mode: VehicleMode) => void;
  faults: Faults;
  setFaults: (faults: Faults) => void;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  soc, setSoc, temperature, setTemperature, accessoryLoad, setAccessoryLoad,
  soh, setSoh, vehicleMode, setVehicleMode, faults, setFaults
}) => {

  const handleFaultToggle = (fault: keyof Faults) => {
    setFaults({ ...faults, [fault]: !faults[fault] });
  };

  const vehicleModes: VehicleMode[] = ['OFF', 'ACC', 'PROPULSION'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4 text-slate-200">System Inputs</h2>
        <div className="space-y-4 rounded-lg bg-slate-900/70 border border-slate-700 p-4">
          <Slider label="State of Charge (SOC)" value={soc} onChange={e => setSoc(Number(e.target.value))} min={0} max={100} unit="%" Icon={IconBolt} />
          <Slider label="Temperature" value={temperature} onChange={e => setTemperature(Number(e.target.value))} min={-20} max={80} unit="°C" Icon={IconFlame} />
          <Slider label="Accessory Load" value={accessoryLoad} onChange={e => setAccessoryLoad(Number(e.target.value))} min={0} max={50} unit="A" Icon={IconGauge} />
          <Slider label="State of Health (SOH)" value={soh} onChange={e => setSoh(Number(e.target.value))} min={0} max={100} unit="%" Icon={IconHeartbeat} />
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold mb-4 text-slate-200">Operating Mode</h2>
        <div className="rounded-lg bg-slate-900/70 border border-slate-700 p-4 space-y-4">
          <div>
            <label className="flex items-center text-sm font-medium text-slate-300 mb-2">
              <IconCar className="w-5 h-5 mr-2 text-sky-400" />
              Vehicle Mode
            </label>
            <div className="grid grid-cols-3 gap-2 bg-slate-800 p-1 rounded-lg">
              {vehicleModes.map(mode => (
                <button
                  key={mode}
                  onClick={() => setVehicleMode(mode)}
                  className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                    vehicleMode === mode ? 'bg-sky-500 text-white shadow' : 'bg-slate-700/50 hover:bg-slate-700'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>


      <div>
        <h2 className="text-lg font-semibold mb-4 text-slate-200">Fault Injection</h2>
        <div className="space-y-3 rounded-lg bg-slate-900/70 border border-slate-700 p-4">
          <label className="flex items-center text-sm font-medium text-slate-300 mb-2">
              <IconAlertTriangle className="w-5 h-5 mr-2 text-red-400" />
              Inject Faults
          </label>
          {(Object.keys(faults) as Array<keyof Faults>).map(faultKey => (
            <label key={faultKey} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
              <span className="capitalize text-sm font-medium">{faultKey.replace(/([A-Z])/g, ' $1')} Fault</span>
              <div className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={faults[faultKey]} onChange={() => handleFaultToggle(faultKey)} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-focus-visible:ring-2 peer-focus-visible:ring-red-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ControlsPanel;