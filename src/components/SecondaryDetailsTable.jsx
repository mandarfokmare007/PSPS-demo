import { useState } from 'react';

export default function SecondaryDetailsTable({
  line,
  selectedStructureId,
  onSelectStructure,
  onApplyOverride,
  onClose 
}) {
  const [openNotes, setOpenNotes] = useState({});

  if (!line) return null;

  const handleOverride = (structureId, direction) => {
    const override = {
      type: direction,
      user: 'current.user@utilities.ca',
      timestamp: new Date().toISOString(),
      action: direction === 'DINDR' ? 'changed_to_dindr' : 'changed_to_d',
      before: line.direct_type,
      after: direction,
      reason: direction === 'DINDR' ? 'Grounding recommended' : 'Reverting to standard',
    };
    onApplyOverride(line.id, override);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      {/* 1. Backdrop Blur */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* 2. Modal Container */}
      <div className="relative w-full max-w-6xl h-full max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header - Sticky Metrics Bar */}
        <div className="bg-white border-b-2 border-slate-100 px-6 py-5 shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <span className="text-indigo-600">⚡</span> {line.tline_name}
              </h4>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                Detailed Structure Breakdown
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors group"
            >
              <span className="text-2xl text-slate-300 group-hover:text-slate-600">✕</span>
            </button>
          </div>

          {/* Metric Grid - Compact & Stylish */}
     <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
  {[
    { label: 'Max OA (pf)', val: line.max_oa_pf, color: 'blue' },
    { label: 'Min RH (2m)', val: `${line.min_rh_2m}%`, color: 'amber' },
    { label: 'Min DFM (10hr)', val: line.min_dfm_10hr, color: 'green' },
    { label: 'Min NDVI', val: line.min_ndvi, color: 'purple' }
  ].map((m) => {
    // Mapping object to ensure Tailwind picks up the full class names
    const colorStyles = {
      blue:   "bg-blue-50/50 border-blue-100 border-l-blue-500 text-blue-600",
      amber:  "bg-amber-50/50 border-amber-100 border-l-amber-500 text-amber-600",
      green:  "bg-green-50/50 border-green-100 border-l-green-500 text-green-600",
      purple: "bg-purple-50/50 border-purple-100 border-l-purple-500 text-purple-600",
    }[m.color];

    return (
      <div 
        key={m.label} 
        className={`border border-l-4 rounded-2xl p-3 shadow-sm transition-all ${colorStyles}`}
      >
        <span className="text-[10px] font-black uppercase tracking-wider opacity-80">
          {m.label}
        </span>
        <p className="text-xl font-black text-slate-800 leading-none mt-1">
          {m.val}
        </p>
      </div>
    );
  })}
</div>
        </div>

        {/* 3. Scrollable Structure List */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 custom-scrollbar">
          {line.structures.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-40">
              <span className="text-6xl mb-4">📭</span>
              <p className="text-lg font-bold">No structures found</p>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {line.structures.map((structure) => {
                const isSelected = selectedStructureId === structure.id;
                
                return (
                  <div
                    key={structure.id}
                    onClick={() => onSelectStructure(structure.id)}
                    className={`group bg-white rounded-2xl border-2 transition-all duration-200 cursor-pointer overflow-hidden ${
                      isSelected 
                        ? 'border-indigo-500 ring-4 ring-indigo-500/10 shadow-xl' 
                        : 'border-white hover:border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="p-5">
                      {/* Structure Title Row */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-400'
                          }`}>
                            ST
                          </div>
                          <div>
                            <h5 className="font-black text-slate-800 leading-none">{structure.name}</h5>
                            <span className="text-[10px] font-mono text-slate-400 uppercase">{structure.id}</span>
                          </div>
                        </div>
                        
                        <div className={`px-4 py-2 rounded-xl text-xs font-black shadow-sm border ${
                          structure.ignition_probability > 0.6 ? 'bg-rose-50 border-rose-100 text-rose-600' : 
                          structure.ignition_probability > 0.4 ? 'bg-amber-50 border-amber-100 text-amber-600' : 
                          'bg-emerald-50 border-emerald-100 text-emerald-600'
                        }`}>
                          {(structure.ignition_probability * 100).toFixed(0)}% IGNITION PROB
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-4 gap-4 py-4 border-y border-slate-50">
                        <DetailItem label="OA (pf)" value={structure.oa_pf.toFixed(2)} />
                        <DetailItem label="Ign Prob" value={`${(structure.ignition_probability * 100).toFixed(0)}%`} />
                        <StatusItem label="CFPt-Asset" active={structure.cfpt_asset} activeColor="text-rose-500" />
                        <StatusItem label="CFPt-Veg" active={structure.cfpt_veg} activeColor="text-orange-500" />
                      </div>

                      {/* Tag Section */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {structure.open_a_tag && (
                          <Tag label={`A-TAG: ${structure.open_a_tag}`} color="bg-orange-100 text-orange-700 border-orange-200" icon="🏷️" />
                        )}
                        {structure.hni_hnu_tags.map(tag => (
                          <Tag key={tag} label={tag} color="bg-emerald-100 text-emerald-700 border-emerald-200" icon="🔧" />
                        ))}
                      </div>

                      {/* Expanded Section (Overrides & Notes) */}
                      {isSelected && (
                        <div className="mt-6 pt-6 border-t-2 border-slate-100 space-y-5 animate-in slide-in-from-top-2 duration-300">
                          <div className="flex gap-3">
                            <ActionButton 
                              label="Mark Direct (D)" 
                              color="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-600 hover:text-white"
                              onClick={() => handleOverride(structure.id, 'D')}
                            />
                            <ActionButton 
                              label="Mark Grounding (DINDR)" 
                              color="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-600 hover:text-white"
                              onClick={() => handleOverride(structure.id, 'DINDR')}
                            />
                          </div>

                          {/* Notes Textarea */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Field Observations</label>
                            <textarea
                              placeholder="Type field notes here..."
                              className="w-full p-4 text-sm bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none resize-none font-medium h-28"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-white px-8 py-4 border-t border-slate-100 flex justify-between items-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">
             Total structures: <span className="text-slate-800">{line.structures.length}</span>
          </p>
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-slate-900 text-white text-xs font-black rounded-2xl hover:bg-indigo-600 transition-all uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95"
          >
            Finished Review
          </button>
        </div>
      </div>
    </div>
  );
}

// Sub-components for cleaner code
const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">{label}</p>
    <p className="font-black text-slate-800">{value}</p>
  </div>
);

const StatusItem = ({ label, active, activeColor }) => (
  <div>
    <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">{label}</p>
    <span className={`text-xl ${active ? activeColor : 'text-slate-200'}`}>
      {active ? '●' : '○'}
    </span>
  </div>
);

const Tag = ({ label, color, icon }) => (
  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black border ${color}`}>
    <span>{icon}</span> {label}
  </span>
);

const ActionButton = ({ label, color, onClick }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={`flex-1 py-3 text-[10px] font-black rounded-xl border-2 transition-all uppercase tracking-wider ${color}`}
  >
    {label}
  </button>
);