import { useState } from 'react';

export default function SecondaryDetailsTable({
  line,
  selectedStructureId,
  onSelectStructure,
  onApplyOverride, // This should handle the final save to the DB
  onClose 
}) {
  const [currentNote, setCurrentNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!line) return null;

  const handleAction = (structureId, actionType, currentStatus) => {
    // REQUIREMENT 5.3: Mandatory Note Check
    if (!currentNote.trim() || currentNote.length < 5) {
      alert("Requirement 5.3: A detailed justification note is mandatory before modifying scope.");
      return;
    }

    setIsProcessing(true);

    const overridePayload = {
      structureId,
      lanId: 'USER_LAN_ID', // In production, get from Auth context
      timestamp: new Date().toISOString(),
      note: currentNote,
      action: actionType, // 'REMOVE_FROM_SCOPE', 'CHANGE_TYPE_D', 'CHANGE_TYPE_DINDR'
      previousStatus: currentStatus,
    };

    // Call the parent function to update the global state/DB
    onApplyOverride(line.id, overridePayload);
    
    // Reset local state after action
    setCurrentNote("");
    setIsProcessing(false);
  };

  return (
<div className="relative w-full h-full bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header: Line Level Info (Req 5.1) */}
        <div className="bg-white border-b border-slate-100 px-8 py-6 sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-black uppercase">Line Review</span>
                <span className="text-slate-300">|</span>
                <h4 className="text-2xl font-black text-slate-800 tracking-tight">{line.tline_name}</h4>
              </div>
              <p className="text-sm text-slate-500 mt-1 font-medium">Review structures and validate risk thresholds for PSPS Scope.</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors text-2xl">✕</button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <MetricCard label="Max Wind Gust" value={`${line.max_wg} mph`} sub="Forecasted" />
            <MetricCard label="Min Humidity" value={`${line.min_rh_2m}%`} sub="2m Surface" />
            <MetricCard label="Fuel Moisture" value={`${line.min_dfm_10hr}%`} sub="10hr Dead Fuel" />
            <MetricCard label="Vegetation (NDVI)" value={line.min_ndvi} sub="Greenness Index" />
          </div>
        </div>

        {/* Scrollable Structure List */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {line.structures.map((structure) => {
              const isSelected = selectedStructureId === structure.id;
              
              return (
                <div
                  key={structure.id}
                  onClick={() => onSelectStructure(structure.id)}
                  className={`bg-white rounded-2xl border-2 transition-all cursor-pointer ${
                    isSelected ? 'border-indigo-500 shadow-xl' : 'border-transparent shadow-sm hover:border-slate-200'
                  }`}
                >
                  <div className="p-6">
                    {/* Structure Header */}
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          {structure.name.split('/')[1] || 'ST'}
                        </div>
                        <div>
                          <h5 className="font-black text-slate-800 text-lg uppercase tracking-tight">{structure.name}</h5>
                          <p className="text-xs font-mono text-slate-400">SAP ID: {structure.id}</p>
                        </div>
                      </div>

                      {/* Fire Risk Indicator (Req 5.5 Color Coding) */}
                      <div className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2 ${
                        structure.ignition_probability > 0.6 ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-slate-50 border-slate-100 text-slate-600'
                      }`}>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${structure.ignition_probability > 0.6 ? 'bg-rose-500' : 'bg-slate-400'}`} />
                        <span className="text-[11px] font-black uppercase tracking-widest">
                          {structure.ignition_probability > 0.6 ? 'Meeting Guidance' : 'Below Threshold'}
                        </span>
                      </div>
                    </div>

                    {/* Data Points Grid */}
                    <div className="grid grid-cols-4 gap-6 py-5 border-y border-slate-50">
                      <DetailData label="OA PF (Health)" value={structure.oa_pf.toFixed(2)} />
                      <DetailData label="Prob Cat" value={(structure.ignition_probability * 100).toFixed(1) + '%'} />
                      <StatusDot label="CFPt-Asset" active={structure.cfpt_asset} />
                      <StatusDot label="CFPt-Veg" active={structure.cfpt_veg} />
                    </div>

                    {/* Tags (A-Tags / HNI / HNU) */}
                    <div className="mt-5 flex flex-wrap gap-2">
                      {structure.open_a_tag && <Tag label={`A-TAG: ${structure.open_a_tag}`} type="asset" />}
                      {structure.hni_hnu_tags.map(tag => <Tag key={tag} label={tag} type="veg" />)}
                    </div>

                    {/* Expanded Override Section (Requirement 5.3) */}
                    {isSelected && (
                      <div className="mt-8 pt-8 border-t-2 border-slate-50 space-y-6 animate-in fade-in zoom-in-95">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Justification / Notes <span className="text-rose-500">*Required</span>
                          </label>
                          <textarea
                            value={currentNote}
                            onChange={(e) => setCurrentNote(e.target.value)}
                            placeholder="Enter reason for removing from scope or changing type (e.g. 'Structure replaced 2024', 'Verified via Sherlock')..."
                            className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-indigo-500 transition-all outline-none h-32 text-sm font-medium"
                          />
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <ActionButton 
                            label="Remove from Scope" 
                            color="bg-rose-600 text-white shadow-rose-200"
                            disabled={!currentNote.trim() || isProcessing}
                            onClick={() => handleAction(structure.id, 'REMOVE_FROM_SCOPE', 'In-Scope')}
                          />
                          <ActionButton 
                            label="Switch to DINDR" 
                            color="bg-amber-500 text-white shadow-amber-200"
                            disabled={!currentNote.trim() || isProcessing}
                            onClick={() => handleAction(structure.id, 'CHANGE_TYPE_DINDR', 'D')}
                          />
                          <div className="flex-1" />
                          <button className="text-xs font-bold text-slate-400 hover:text-indigo-600 uppercase px-4">
                            View in Sherlock ↗
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-10 py-6 border-t border-slate-100 flex justify-between items-center">
          <div className="flex gap-8">
             <div><p className="text-[10px] font-bold text-slate-400 uppercase">Total Structures</p><p className="font-black text-slate-800">{line.structures.length}</p></div>
             <div><p className="text-[10px] font-bold text-slate-400 uppercase">Impact Type</p><p className="font-black text-slate-800">{line.direct_type || 'Direct (D)'}</p></div>
          </div>
          <button 
            onClick={onClose}
            className="px-10 py-4 bg-slate-900 text-white text-xs font-black rounded-2xl hover:bg-indigo-600 transition-all uppercase tracking-widest shadow-xl"
          >
            Close Review
          </button>
        </div>
    </div>
  );
}

// Sub-components
const MetricCard = ({ label, value, sub }) => (
  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{label}</p>
    <p className="text-xl font-black text-slate-800">{value}</p>
    <p className="text-[10px] text-slate-400 font-medium">{sub}</p>
  </div>
);

const DetailData = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</p>
    <p className="font-black text-slate-800 tracking-tight">{value}</p>
  </div>
);

const StatusDot = ({ label, active }) => (
  <div className="flex flex-col items-start">
    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</p>
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-black ${active ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-400'}`}>
       <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-rose-500' : 'bg-slate-300'}`} />
       {active ? 'MEETS' : 'BELOW'}
    </div>
  </div>
);

const Tag = ({ label, type }) => (
  <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black border uppercase tracking-wider flex items-center gap-2 ${
    type === 'asset' ? 'bg-orange-50 border-orange-100 text-orange-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
  }`}>
    {type === 'asset' ? '🔧' : '🌲'} {label}
  </span>
);

const ActionButton = ({ label, color, onClick, disabled }) => (
  <button 
    disabled={disabled}
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={`px-6 py-3.5 text-[11px] font-black rounded-xl transition-all uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-30 disabled:grayscale disabled:pointer-events-none ${color}`}
  >
    {label}
  </button>
);