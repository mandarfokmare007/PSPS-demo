import { useState } from 'react';

export default function FilterPanel({ filters, onFiltersChange, onToggleFilters }) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onFiltersChange(localFilters);
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
      if (current.includes(type)) {
        return { ...prev, guidance_type: current.filter((t) => t !== type) };
      }
      return { ...prev, guidance_type: [...current, type] };
    });
  };

  // Shared classes for consistent styling
  const labelClass = "block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-widest";
  const cardClass = "bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300";

  return (
    <div className="bg-slate-50/80 backdrop-blur-md border-b border-slate-200 p-8 space-y-8 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">Filters</h3>
          <p className="text-xs text-slate-500">Narrow down your map view data</p>
        </div>
        <button
          onClick={onToggleFilters}
          className="p-2 hover:bg-slate-200/50 rounded-full text-slate-400 hover:text-slate-600 transition-all"
          title="Close panel"
        >
          <span className="text-xl">✕</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Region Selector */}
        <div className={cardClass}>
          <label className={labelClass}>Region / Location</label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. Northern California"
              className="w-full pl-4 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              value={localFilters.region || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, region: e.target.value })}
            />
          </div>
        </div>

        {/* PSPS mFPC Filter */}
        <div className={cardClass}>
          <label className={labelClass}>mFPC Level</label>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {['All', 'Minimum', 'Near'].map((option) => (
              <button
                key={option}
                onClick={() => setLocalFilters({ ...localFilters, psps_mfpc: option })}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                  localFilters.psps_mfpc === option
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Guidance Type Toggles */}
        <div className={cardClass}>
          <label className={labelClass}>Guidance Categories</label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'CFPt-Asset', icon: '⚡' },
              { id: 'CFPt-Veg', icon: '🌿' },
              { id: 'CFB', icon: '❄️' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleGuidanceToggle(item.id)}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-full border transition-all ${
                  localFilters.guidance_type.includes(item.id)
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                }`}
              >
                {item.icon} {item.id}
              </button>
            ))}
          </div>
        </div>

        {/* Tag Filters */}
        <div className={cardClass}>
          <label className={labelClass}>Tag Status</label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: 'open_a_tags', label: 'Open A Tags', color: 'bg-amber-500' },
              { id: 'open_hni_hnu', label: 'HNI/HNU Tags', color: 'bg-emerald-500' }
            ].map((tag) => (
              <label key={tag.id} className="flex items-center group cursor-pointer">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={localFilters[tag.id]}
                    onChange={(e) => setLocalFilters({ ...localFilters, [tag.id]: e.target.checked })}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 checked:bg-indigo-600 transition-all"
                  />
                  <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                </div>
                <span className="ml-3 text-xs font-semibold text-slate-600 group-hover:text-indigo-600 transition-colors">
                  {tag.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
        <button
          onClick={handleReset}
          className="px-6 py-2.5 text-xs font-bold text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all uppercase tracking-widest"
        >
          Reset All
        </button>
        <button
          onClick={handleApply}
          className="px-8 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 hover:shadow-indigo-200 active:scale-95 transition-all uppercase tracking-widest"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}