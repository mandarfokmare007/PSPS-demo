import { useState } from 'react';

export default function QuickActionModal({ type, lines, onClose }) {
  const [selectedLines, setSelectedLines] = useState([]);

  if (!type || !lines) return null;

  // Filter lines based on quick action type
  const getFilteredLines = () => {
    switch (type) {
      case 'CFPt-Asset':
        return lines.filter(l => l.cfpt_asset_count > 0);
      case 'CFPt-Veg':
        return lines.filter(l => l.cfpt_veg_count > 0);
      case 'CFB':
        return lines.filter(l => l.cfb_count > 0);
      case 'A-Tags':
        return lines.filter(l => l.open_a_tags > 0);
      case 'HNI/HNU':
        return lines.filter(l => l.open_hni_hnu > 0);
      case 'D vs DINDR':
        return lines.filter(l => l.direct_type === 'D' || l.direct_type === 'DINDR');
      default:
        return lines;
    }
  };

  const filteredLines = getFilteredLines();

  const toggleLineSelection = (lineId) => {
    setSelectedLines((prev) =>
      prev.includes(lineId) ? prev.filter(l => l !== lineId) : [...prev, lineId]
    );
  };
const getTitleAndDescription = () => {
  const titles = {
    'CFPt-Asset': 'Catastrophic Fire Probability - Asset',
    'CFPt-Veg': 'Catastrophic Fire Probability - Vegetation',
    'CFB': 'Catastrophic Fire Behavior',
    'A-Tags': 'Open A-Tags (Transmission Line Correction)',
    'HNI/HNU': 'Hazard Notification Immediate / Urgent',
    'D vs DINDR': 'Direct Impact vs Direct Induction',
  };

  const descriptions = {
    'CFPt-Asset': 'The product of Fire Potential Index (FPI) and Operability Assessment (OA) value, predicting asset failure leading to ignition.',
    'CFPt-Veg': 'Risk index for catastrophic fire potential associated with the likelihood of a tree falling on a transmission asset.',
    'CFB': 'Fire behavior criteria (flame length and rate of spread) from 8-hour forecast simulations using Technosylva technology[cite: 438, 439, 440].',
    'A-Tags': 'High-priority maintenance tags (Priority = A, Status = PEND) for electric assets that require attention before a weather event[cite: 443, 456, 457, 280].',
    'HNI/HNU': 'Vegetation management tags identifying immediate (HNI) or urgent (HNU) hazard trees near transmission lines[cite: 443, 289].',
    'D vs DINDR': 'Classification for de-energization: Direct (D) due to fire risk vs. Direct Induction (DINDR) due to induction risk[cite: 422, 96].',
  };


    return {
      title: titles[type] || type,
      description: descriptions[type] || '',
    };
  };

  const { title, description } = getTitleAndDescription();

  return (
<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity flex items-center justify-center z-50 p-6">
  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col border border-gray-100 animate-in zoom-in-95 duration-200">

        <div className="px-8 py-6 border-b-2 border-gray-200 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-3xl leading-none transition-colors"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-700 mb-2">{description}</p>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg border border-blue-300">
              📊 {filteredLines.length} matching lines
            </span>
            {selectedLines.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg border border-green-300">
                ✓ {selectedLines.length} selected
              </span>
            )}
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          {filteredLines.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-2xl mb-2">📭</p>
                <p className="text-gray-500 font-medium">No lines match this criteria.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredLines.map((line) => (
                <div
                  key={line.id}
                  onClick={() => toggleLineSelection(line.id)}
                  className={`p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                    selectedLines.includes(line.id)
                      ? 'border-blue-600 bg-blue-50 shadow-md ring-2 ring-blue-300'
                      : 'border-gray-300 bg-white hover:border-blue-400'
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      toggleLineSelection(line.id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">{line.tline_name}</h3>
                      <p className="text-sm text-gray-600 mt-1">TP: <span className="font-semibold">{line.tp_name}</span></p>
                      <p className="text-xs text-gray-500 font-mono">SAP: {line.sap_func_loc}</p>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-300">
                        {line.direct_type === 'DINDR' ? '⚠️ DINDR' : '⚡ D'}
                      </div>
                      {type === 'CFPt-Asset' && (
                        <div className="text-sm font-bold text-red-600 bg-red-50 px-2 py-1 rounded">{line.cfpt_asset_count} assets</div>
                      )}
                      {type === 'CFPt-Veg' && (
                        <div className="text-sm font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">{line.cfpt_veg_count} veg</div>
                      )}
                      {type === 'CFB' && (
                        <div className="text-sm font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded">{line.cfb_count} impacts</div>
                      )}
                      {type === 'A-Tags' && (
                        <div className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">{line.open_a_tags} tags</div>
                      )}
                      {type === 'HNI/HNU' && (
                        <div className="text-sm font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">{line.open_hni_hnu} tags</div>
                      )}
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-4 gap-3 mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <span className="text-xs font-bold text-gray-600 uppercase">Max WG:</span>
                      <p className="font-bold text-gray-900">{line.max_wg} mph</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-600 uppercase">Max OA:</span>
                      <p className="font-bold text-gray-900">{line.max_oa_pf}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-600 uppercase">FPC:</span>
                      <p className="font-bold text-gray-900">{line.fpc_count}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-600 uppercase">Structs:</span>
                      <p className="font-bold text-gray-900">{line.structures.length}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-5 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-700">
            {selectedLines.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-100 text-green-700 rounded-lg border border-green-300">
                ✓ {selectedLines.length} line{selectedLines.length !== 1 ? 's' : ''} selected for bulk action
              </span>
            )}
          </div>
          <div className="flex gap-3">
            {selectedLines.length > 0 && (
              <button className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg uppercase tracking-wide">
                ✓ Apply Action to {selectedLines.length} Lines
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-300 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-400 transition-colors shadow-md hover:shadow-lg uppercase tracking-wide"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
