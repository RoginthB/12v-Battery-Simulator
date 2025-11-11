import React from 'react';
import type { ChartDataPoint } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartsPanelProps {
  data: ChartDataPoint[];
}

const ChartWrapper: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-slate-800/50 p-4 rounded-lg shadow-lg border border-slate-700 h-64 flex flex-col">
    <h3 className="text-md font-semibold text-slate-200 mb-4">{title}</h3>
    <div className="flex-grow">
     {children}
    </div>
  </div>
);

const ChartsPanel: React.FC<ChartsPanelProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <ChartWrapper title="SOC vs. Time">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.5rem' }} />
            <Legend wrapperStyle={{fontSize: "14px"}} />
            <Line type="monotone" dataKey="soc" name="SOC" stroke="#22c55e" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>

      <ChartWrapper title="Voltage vs. Time">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" domain={[11, 15]} tick={{ fontSize: 12 }} unit="V" />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.5rem' }} />
            <Legend wrapperStyle={{fontSize: "14px"}} />
            <Line type="monotone" dataKey="voltage" name="Voltage" stroke="#38bdf8" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>

      <ChartWrapper title="Temperature vs. Time">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" domain={[-20, 80]} tick={{ fontSize: 12 }} unit="°C" />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.5rem' }} />
            <Legend wrapperStyle={{fontSize: "14px"}} />
            <Line type="monotone" dataKey="temperature" name="Temperature" stroke="#f43f5e" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </div>
  );
};

export default ChartsPanel;