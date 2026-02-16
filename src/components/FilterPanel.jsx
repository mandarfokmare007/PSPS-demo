import { useEffect, useRef, useState } from 'react';

export default function FilterPopover({ filters, onFiltersChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const popoverRef = useRef(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApply = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const resetFilters = {
      region: null,
      psps_mfpc: 'All',
      guidance_type: [],
      open_a_tags: false,
      open_hni_hnu: false,
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const handleGuidanceToggle = (type) => {
    setLocalFilters((prev) => {
      const current = prev.guidance_type || [];
      const next = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type];
      return { ...prev, guidance_type: next };
    });
  };

  // Shared classes
  const labelClass = "block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider";
  const sectionClass = "p-4 border-b border-slate-100 last:border-0";

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm font-bold mx-2 shadow-sm ${
          isOpen 
            ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-100' 
            : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
        Filters
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
      </button>

      {/* Popover Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in duration-150 origin-top-left">
        
          {/* Scrollable Content */}
          <div className="max-h-[380px] overflow-y-auto">
            {/* Region Selector */}
            <div className={sectionClass}>
              <label className={labelClass}>Location</label>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="e.g. Northern CA"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                  value={localFilters.region || ''}
                  onChange={(e) => setLocalFilters({ ...localFilters, region: e.target.value })}
                />
              </div>
            </div>

            {/* mFPC Level - Compact Segmented */}
            <div className={sectionClass}>
              <label className={labelClass}>mFPC Level</label>
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                {['All', 'Minimum', 'Near'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setLocalFilters({ ...localFilters, psps_mfpc: option })}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                      localFilters.psps_mfpc === option
                        ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {option === 'Minimum' ? 'Min' : option}
                  </button>
                ))}
              </div>
            </div>

            {/* Guidance Categories - Grid Layout */}
            <div className={sectionClass}>
              <label className={labelClass}>Guidance Categories</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'CFPt-Asset', icon: '⚡', label: 'Asset' },
                  { id: 'CFPt-Veg', icon: '🌿', label: 'Veg' },
                  { id: 'CFB', icon: '❄️', label: 'CFB' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleGuidanceToggle(item.id)}
                    className={`px-2 py-1.5 text-[10px] font-bold rounded-lg border transition-all flex items-center gap-2 ${
                      localFilters.guidance_type.includes(item.id)
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <span>{item.icon}</span> {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tag Status - Switch Toggles */}
            <div className={sectionClass}>
              <label className={labelClass}>Tag Status</label>
              <div className="space-y-3">
                {[
                  { id: 'open_a_tags', label: 'Open A Tags' },
                  { id: 'open_hni_hnu', label: 'HNI/HNU Tags' }
                ].map((tag) => (
                  <label key={tag.id} className="flex items-center justify-between cursor-pointer group">
                    <span className="text-[11px] font-semibold text-slate-600 group-hover:text-indigo-600 transition-colors">
                      {tag.label}
                    </span>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localFilters[tag.id]}
                        onChange={(e) => setLocalFilters({ ...localFilters, [tag.id]: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-slate-200 rounded-full peer peer-checked:bg-indigo-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
        <div className="flex items-center gap-3 p-4 bg-slate-50 border-t border-slate-200">
  <button
    onClick={handleReset}
    className="flex-1 py-2.5 text-[10px] font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl transition-all uppercase tracking-wider"
  >
    Reset
  </button>
  <button
    onClick={handleApply}
    className="flex-[2] py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95 transition-all uppercase tracking-widest"
  >
    Apply Filters
  </button>
</div>
        </div>
      )}
    </div>
  );
}