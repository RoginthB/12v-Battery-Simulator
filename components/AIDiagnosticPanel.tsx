import React from 'react';
import type { BMSMode, ContactorState } from '../types';
import { IconSparkles, IconAlertTriangle, IconCheckCircle, IconXCircle } from './Icon';

interface AIDiagnosticPanelProps {
  analysis: string | null;
  isLoading: boolean;
  error: string | null;
  onAnalyze: () => void;
  bmsMode: BMSMode;
  contactorState: ContactorState;
}

const StatusIndicator: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="flex-1 bg-slate-900/70 p-4 rounded-lg border border-slate-700/80 flex flex-col items-center justify-center text-center">
    <span className="text-sm text-slate-400 mb-1">{title}</span>
    {children}
  </div>
);

const AIDiagnosticPanel: React.FC<AIDiagnosticPanelProps> = ({ analysis, isLoading, error, onAnalyze, bmsMode, contactorState }) => {
  
  const modeColors: Record<BMSMode, string> = {
    CHARGING: 'text-green-400',
    DISCHARGING: 'text-yellow-400',
    NEUTRAL: 'text-slate-400',
  };

  const contactorColors: Record<ContactorState, string> = {
    OPEN: 'text-red-400',
    CLOSED: 'text-green-400',
  };

  const renderAnalysis = () => {
    if (!analysis) return null;

    return (
      <dl className="space-y-3">
        {analysis.split('\n').filter(line => line.includes(':')).map((line, index) => {
          const parts = line.split(/:(.*)/s);
          if (parts.length < 2) return null;
          const label = parts[0];
          const value = parts[1];
          return (
            <div key={index}>
              <dt className="font-semibold text-sky-400">{label}:</dt>
              <dd className="text-slate-300 leading-relaxed">{value.trim()}</dd>
            </div>
          );
        })}
      </dl>
    );
  };

  return (
    <div className="bg-slate-800/50 p-4 rounded-lg shadow-lg border border-slate-700 h-full flex flex-col">
      <h2 className="flex items-center text-lg font-semibold mb-4 text-slate-200">
        <IconSparkles className="w-5 h-5 mr-2 text-sky-400" />
        AI Diagnostic Assistant
      </h2>
      
      <div className="flex gap-4 mb-4">
        <StatusIndicator title="BMS Mode">
          <span className={`text-xl font-bold ${modeColors[bmsMode]}`}>{bmsMode}</span>
        </StatusIndicator>
        <StatusIndicator title="Contactor">
          <div className={`flex items-center text-xl font-bold ${contactorColors[contactorState]}`}>
            {contactorState === 'CLOSED' ? <IconCheckCircle className="w-6 h-6 mr-2" /> : <IconXCircle className="w-6 h-6 mr-2" />}
            {contactorState}
          </div>
        </StatusIndicator>
      </div>
      
      <button
        onClick={onAnalyze}
        disabled={isLoading}
        className="w-full px-4 py-2.5 mb-4 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 focus-visible:ring-sky-400 bg-sky-500 hover:bg-sky-400 text-white disabled:bg-slate-600 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgb(0,118,255,39%)] hover:shadow-[0_6px_20px_0_rgb(0,118,255,23%)]"
      >
        {isLoading ? 'Analyzing...' : 'Analyze Current Conditions'}
      </button>
      <div className="bg-slate-900 p-4 rounded-md border border-slate-700/80 flex-grow flex flex-col justify-center">
        {isLoading && <div className="text-slate-400 text-center">Running diagnostics...</div>}
        {error && (
          <div className="text-red-400 flex flex-col items-center text-center">
            <IconAlertTriangle className="w-8 h-8 mb-2" />
            <p className="font-semibold">Analysis Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        {analysis && (
          <div className="text-sm text-slate-300">
            {renderAnalysis()}
          </div>
        )}
        {!isLoading && !error && !analysis && (
            <div className="text-slate-500 text-center">
                <p className="font-semibold text-base">Welcome to the AI Assistant</p>
                <p className="text-xs mt-2 leading-snug">Adjust the system inputs in the sidebar, then click "Analyze" to generate an expert diagnostic summary.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default AIDiagnosticPanel;