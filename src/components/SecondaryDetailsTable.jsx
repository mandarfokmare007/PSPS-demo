import { useState } from 'react';

export default function SecondaryDetailsTable({
  line,
  selectedStructureId,
  onSelectStructure,
  onApplyOverride,
}) {
  const [openNotes, setOpenNotes] = useState({});

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
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white">
      {/* Secondary Details Header */}
      <div className="px-6 py-5 border-b-2 border-gray-300 bg-white">
        <h4 className="text-lg font-bold text-gray-900 mb-4">📍 {line.tline_name} - Detailed Breakdown</h4>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-l-blue-500">
            <span className="text-xs font-bold text-gray-600 uppercase">Max OA (pf):</span>
            <p className="font-bold text-lg text-gray-900">{line.max_oa_pf.toFixed(2)}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 border-l-4 border-l-amber-500">
            <span className="text-xs font-bold text-gray-600 uppercase">Min RH (2m):</span>
            <p className="font-bold text-lg text-gray-900">{line.min_rh_2m}%</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border-l-4 border-l-green-500">
            <span className="text-xs font-bold text-gray-600 uppercase">Min DFM (10hr):</span>
            <p className="font-bold text-lg text-gray-900">{line.min_dfm_10hr}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border-l-4 border-l-purple-500">
            <span className="text-xs font-bold text-gray-600 uppercase">Min NDVI:</span>
            <p className="font-bold text-lg text-gray-900">{line.min_ndvi.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Structures List */}
      <div className="flex-1 overflow-auto">
        {line.structures.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 text-sm font-medium">📭 No structures found for this transmission line</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 p-4 space-y-3">
            {line.structures.map((structure) => (
              <div
                key={structure.id}
                onClick={() => onSelectStructure(structure.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                  selectedStructureId === structure.id
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelectStructure(structure.id);
                  }
                }}
              >
                {/* Structure Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h5 className="font-bold text-base text-gray-900">{structure.name}</h5>
                    <p className="text-xs text-gray-500 font-mono">{structure.id}</p>
                  </div>
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ml-2 ${
                      structure.ignition_probability > 0.6
                        ? 'bg-red-100 text-red-800 border-2 border-red-300'
                        : structure.ignition_probability > 0.4
                          ? 'bg-amber-100 text-amber-800 border-2 border-amber-300'
                          : 'bg-green-100 text-green-800 border-2 border-green-300'
                    }`}
                  >
                    {(structure.ignition_probability * 100).toFixed(0)}% Ign Prob
                  </span>
                </div>

                {/* Structure Details Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-gray-600">OA (pf):</span>
                    <span className="font-bold text-gray-900">{structure.oa_pf.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-gray-600">Ign Prob:</span>
                    <span className="font-bold text-gray-900">{(structure.ignition_probability * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-gray-600">CFPt-Asset:</span>
                    <span className={`text-lg ${structure.cfpt_asset ? 'text-red-600' : 'text-gray-400'}`}>
                      {structure.cfpt_asset ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-gray-600">CFPt-Veg:</span>
                    <span className={`text-lg ${structure.cfpt_veg ? 'text-orange-600' : 'text-gray-400'}`}>
                      {structure.cfpt_veg ? '✓' : '✗'}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {(structure.open_a_tag || structure.hni_hnu_tags.length > 0) && (
                  <div className="mb-4 space-y-2">
                    <p className="text-xs font-bold text-gray-700 uppercase">Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {structure.open_a_tag && (
                        <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-900 px-3 py-1.5 rounded-full text-xs font-semibold border border-orange-300">
                          🏷️ A: {structure.open_a_tag}
                        </span>
                      )}
                      {structure.hni_hnu_tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 bg-green-100 text-green-900 px-3 py-1.5 rounded-full text-xs font-semibold border border-green-300"
                        >
                          🔧 {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* VM Tags */}
                {structure.vm_tags.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-gray-700 mb-2 uppercase">VM Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {structure.vm_tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-xs font-semibold border border-blue-300">
                          📌 {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes & Overrides Section */}
                {selectedStructureId === structure.id && (
                  <div className="mt-4 pt-4 border-t-2 border-gray-300 space-y-3">
                    {/* Override Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOverride(structure.id, 'D')}
                        className="flex-1 px-3 py-2 text-xs font-bold bg-blue-100 text-blue-700 border-2 border-blue-300 rounded-lg hover:bg-blue-200 transition-colors uppercase"
                        title="Mark this structure as Direct Impact"
                      >
                        ✓ Mark D
                      </button>
                      <button
                        onClick={() => handleOverride(structure.id, 'DINDR')}
                        className="flex-1 px-3 py-2 text-xs font-bold bg-purple-100 text-purple-700 border-2 border-purple-300 rounded-lg hover:bg-purple-200 transition-colors uppercase"
                        title="Mark this structure as Grounding Recommended"
                      >
                        ⚠️ Mark DINDR
                      </button>
                    </div>

                    {/* Audit Log */}
                    {structure.overrides.length > 0 && (
                      <div className="bg-gray-100 rounded-lg p-3 border-l-4 border-l-gray-400">
                        <p className="text-xs font-bold text-gray-700 mb-2 uppercase">📋 Audit Log:</p>
                        <div className="space-y-2 max-h-24 overflow-y-auto">
                          {structure.overrides.map((override, idx) => (
                            <div key={idx} className="text-xs bg-white p-2 rounded border border-gray-300">
                              <p className="font-bold text-gray-900">
                                {override.before} → {override.after} by <span className="text-blue-600">{override.user.split('@')[0]}</span>
                              </p>
                              <p className="text-gray-600 text-xs">{new Date(override.timestamp).toLocaleString()}</p>
                              <p className="text-gray-600 italic text-xs">{override.reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    <div>
                      <p className="text-xs font-bold text-gray-700 mb-2 uppercase">📝 Field Notes:</p>
                      <textarea
                        value={structure.notes}
                        onChange={(e) => {
                          // TODO: Implement note saving
                        }}
                        placeholder="Add field notes or observations..."
                        className="w-full px-3 py-2.5 text-xs border-2 border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none font-mono"
                        rows="3"
                        aria-label="Structure notes"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
