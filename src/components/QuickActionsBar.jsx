import { useState } from 'react';
import { downloadArtifacts, downloadFile, generateCSV, generateETECDirectImpact } from '../utils/exportUtils';
import QuickActionModal from './QuickActionModal';

export default function QuickActionsBar({ onSendToMET, selectedLineId, transmissionLines, snapshots }) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [activeQuickAction, setActiveQuickAction] = useState(null);

  const handleExportCSV = () => {
    const csv = generateCSV(transmissionLines);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(csv, `PSPS_Summary_${timestamp}.csv`);
    setShowExportMenu(false);
  };

  const handleExportDirectImpact = () => {
    const csv = generateETECDirectImpact(transmissionLines);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(csv, `PSPS_DirectImpact_ETEC_${timestamp}.csv`);
    setShowExportMenu(false);
  };

  return (
    <>
      <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-6 py-4 flex items-center gap-3 flex-wrap sticky top-0 z-20">
        {/* Divider */}
        <div className="h-8 w-px bg-gray-300"></div>

        {/* Quick Action Buttons Title */}
        <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Quick Actions:</span>

        {/* Quick Action Buttons */}
        <button
          onClick={() => setActiveQuickAction('CFPt-Asset')}
          className="px-3 py-1.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors border border-blue-200 hover:border-blue-300"
          title="Review Cold Front Potential - Asset impacts"
        >
          ⚡ CFPt Asset
        </button>
        <button
          onClick={() => setActiveQuickAction('CFPt-Veg')}
          className="px-3 py-1.5 text-xs font-semibold bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors border border-orange-200 hover:border-orange-300"
          title="Review Cold Front Potential - Vegetation impacts"
        >
          🌿 CFPt Veg
        </button>
        <button
          onClick={() => setActiveQuickAction('CFB')}
          className="px-3 py-1.5 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors border border-yellow-200 hover:border-yellow-300"
          title="Review Cold Front Boundary zones"
        >
          ❄️ CFB
        </button>
        <button
          onClick={() => setActiveQuickAction('A-Tags')}
          className="px-3 py-1.5 text-xs font-semibold bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors border border-green-200 hover:border-green-300"
          title="Review open A-Tags (SAP tickets)"
        >
          🏷️ A-Tags
        </button>
        <button
          onClick={() => setActiveQuickAction('HNI/HNU')}
          className="px-3 py-1.5 text-xs font-semibold bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors border border-purple-200 hover:border-purple-300"
          title="Review HNI/HNU maintenance tags"
        >
          🔧 HNI/HNU
        </button>
        <button
          onClick={() => setActiveQuickAction('D vs DINDR')}
          className="px-3 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors border border-red-200 hover:border-red-300"
          title="Review Direct Impact vs Grounding Recommended"
        >
          ⚠️ D vs DINDR
        </button>

        <div className="flex-grow"></div>

        {/* Send to MET Button */}
        <button
          onClick={onSendToMET}
          className="px-4 py-2 text-xs font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow-md"
          title="Send all overrides to MET system"
        >
          📤 Send to MET Now
        </button>

        {/* Export / Reports Menu */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="px-3 py-2 text-xs font-semibold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300 hover:border-gray-400"
            title="Export data and reports"
          >
            📊 Export
          </button>
          {showExportMenu && (
            <div className="absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-30 min-w-56">
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <p className="text-xs font-bold text-gray-600 uppercase">Export Options</p>
              </div>
              <button
                onClick={handleExportCSV}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 border-b border-gray-100 font-semibold transition-colors"
              >
                📊 Export CSV Summary
              </button>
              <button
                onClick={handleExportDirectImpact}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 border-b border-gray-100 font-semibold transition-colors"
              >
                📋 Direct Impact (ETEC Format)
              </button>
              {snapshots && snapshots.length > 0 && (
                <div className="border-t border-gray-200">
                  <p className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-50 uppercase">Recent Snapshots:</p>
                  {snapshots.slice(0, 5).map(snapshot => (
                    <button
                      key={snapshot.id}
                      onClick={() => {
                        downloadArtifacts(snapshot);
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-purple-50 border-b border-gray-100 font-medium transition-colors hover:text-purple-900"
                    >
                      🕐 {snapshot.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Modal */}
      {activeQuickAction && (
        <QuickActionModal
          type={activeQuickAction}
          lines={transmissionLines}
          onClose={() => setActiveQuickAction(null)}
        />
      )}
    </>
  );
}
