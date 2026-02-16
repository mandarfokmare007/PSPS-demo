import { useEffect, useState } from 'react';
import logo from '../assets/pge-logo.jpeg';




export default function TopBar({
  currentModel,
  availableModels,
  viewMode,
  timestamp,
  isStale,
  timeUntilNextMETSend = 15,
  // lastMETSendTime = new Date(),
  onViewModeChange,
  onModelChange,
  onSave,
  onSendToMET,
}) {
  const [displayedSendTimer, setDisplayedSendTimer] = useState(timeUntilNextMETSend);

  useEffect(() => {
    setDisplayedSendTimer(timeUntilNextMETSend);
  }, [timeUntilNextMETSend]);

  const formatTime = (date) => 
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="px-6 py-3 flex items-center justify-between gap-6">
        
        {/* Left: Branding & Model Selector */}
        <div className="flex items-center gap-6 flex-1">
          <div className="flex flex-col gap-0.5 min-w-fit">
            <div className="flex items-center gap-2">
              <img height={40} width={40} src={logo} />
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
                PSPS <span className="text-blue-600">Summary</span>
              </h1>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-10">
              Safety Portal
            </p>
          </div>

          <div className="h-10 w-px bg-slate-200" />

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">MET Model</label>
            <div className="relative">
              <select
                value={currentModel}
                onChange={(e) => onModelChange(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 px-3 py-1.5 pr-8 text-xs font-bold text-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
              >
                {availableModels.map((model) => (
                  <option key={model.id} value={model.id}>{model.label}</option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Center: View Mode Segmented Control */}
        <div className="hidden lg:flex flex-col gap-1.5 items-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Perspective</span>
          <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200">
            {['All', 'DirectScope', 'Removed'].map((mode) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`px-5 py-1.5 text-xs font-bold rounded-full transition-all duration-300 ${
                  viewMode === mode
                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {mode === 'DirectScope' ? 'Direct' : mode === 'Removed' ? 'Removed' : 'All Lines'}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Status & Action Buttons */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          {/* Professional Status Pill */}
          <div className="hidden xl:flex items-center gap-4 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl">
            <div className="flex flex-col border-r border-slate-200 pr-4">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Refresh Status</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isStale ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span className={`text-xs font-bold ${isStale ? 'text-red-600' : 'text-emerald-600'}`}>
                  {formatTime(timestamp)}
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Next Sync</span>
              <span className="text-xs font-bold text-slate-700">{displayedSendTimer}m remaining</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSave}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-full hover:bg-slate-50 hover:border-blue-400 transition-all shadow-sm active:scale-95"
            >
              <span>💾</span> Save
            </button>

            <button
              onClick={onSendToMET}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-full hover:bg-blue-700 transition-all shadow-md shadow-blue-100 active:scale-95"
            >
              <span>📤</span> Push to MET
            </button>

            <a
              href="#weather-map"
              className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-600 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-200"
              title="Weather Map"
            >
              🌤️
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}