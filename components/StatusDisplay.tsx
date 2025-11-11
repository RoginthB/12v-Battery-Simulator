import React from 'react';
import type { LoggerMessage } from '../types';
import { IconAlertTriangle } from './Icon';

interface StatusDisplayProps {
  activeWarnings: string[];
  loggerMessages: LoggerMessage[];
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({ activeWarnings, loggerMessages }) => {
  const logTypeClasses: Record<LoggerMessage['type'], string> = {
    INFO: 'text-sky-400',
    WARN: 'text-yellow-400',
    FAULT: 'text-red-400',
  };

  return (
    <div className="bg-slate-800/50 p-4 rounded-lg shadow-lg border border-slate-700 flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-4 text-slate-200">System Status & Events</h2>
      
      {activeWarnings.length > 0 && (
        <div className="mb-4 bg-red-900/30 border border-red-700/50 p-3 rounded-lg">
          <h3 className="flex items-center font-semibold text-red-400"><IconAlertTriangle className="w-5 h-5 mr-2" /> Active Faults</h3>
          <ul className="list-disc list-inside pl-2 mt-1 text-red-300/90 text-sm">
            {activeWarnings.map((warn, i) => <li key={i}>{warn}</li>)}
          </ul>
        </div>
      )}

      <div className="flex flex-col flex-grow mt-2">
        <h3 className="text-md font-semibold text-slate-300 mb-2">ECU Logic Logger</h3>
        <div className="bg-slate-900 p-3 rounded-md overflow-y-auto h-40 border border-slate-700/80 flex-grow">
          <div className="space-y-2 font-mono text-xs">
            {loggerMessages.map(msg => (
              <div key={msg.id} className="leading-tight">
                <span className={`font-bold mr-2 ${logTypeClasses[msg.type]}`}>{msg.type.padEnd(5, ' ')}</span>
                <span className="text-slate-400">{msg.text.substring(msg.text.indexOf(':') + 2)}</span>
              </div>
            ))}
             {loggerMessages.length === 0 && (
                <div className="text-slate-500">No events logged...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusDisplay;