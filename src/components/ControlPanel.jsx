import { useMemo, useState } from 'react';
import MainSummaryTable from './MainSummaryTable';
import QuickActionsBar from './QuickActionsBar';
import SecondaryDetailsTable from './SecondaryDetailsTable';

export default function ControlPanel({
  transmissionLines,
  selectedLineId,
  selectedStructureId,
  selectedLine,
  selectedStructure,
  appState,
  filtersOpen,
  onFiltersToggle,
  onSelectLine,
  onSelectStructure,
  onApplyOverride,
  onSendToMET,
  onApplyFilters,
  onToggleMap,
  isMapOpen
}) {
  const [sortConfig, setSortConfig] = useState({ key: 'tline_name', direction: 'asc' });
  const [visibleColumns, setVisibleColumns] = useState({
    tp_name: true,
    tline_name: true,
    sap_func_loc: true,
    max_ws: true,
    max_wg: true,
    fpc_count: true,
    cfpt_asset_count: true,
    cfpt_veg_count: true,
    cfb_count: true,
    open_a_tags: true,
    open_hni_hnu: true,
    direct_type: true,
  });

  // Filter and sort transmission lines
  const filteredLines = useMemo(() => {
    let filtered = [...transmissionLines];

    // Apply view mode filter
    if (appState.viewMode === 'DirectScope') {
      filtered = filtered.filter((line) => line.flags.hasDirectImpact);
    }

    // Apply PSPS mFPC filter
    if (appState.filters.psps_mfpc !== 'All') {
      if (appState.filters.psps_mfpc === 'Minimum') {
        filtered = filtered.filter((line) => line.fpc_count > 0);
      } else if (appState.filters.psps_mfpc === 'Near') {
        filtered = filtered.filter((line) => line.flags.isNearGuidance);
      }
    }

    // Apply guidance type filter
    if (appState.filters.guidance_type.length > 0) {
      filtered = filtered.filter((line) => {
        return appState.filters.guidance_type.some((type) => {
          if (type === 'CFPt-Asset') return line.cfpt_asset_count > 0;
          if (type === 'CFPt-Veg') return line.cfpt_veg_count > 0;
          if (type === 'CFB') return line.cfb_count > 0;
          return false;
        });
      });
    }

    // Apply open tags filter
    if (appState.filters.open_a_tags) {
      filtered = filtered.filter((line) => line.open_a_tags > 0);
    }
    if (appState.filters.open_hni_hnu) {
      filtered = filtered.filter((line) => line.open_hni_hnu > 0);
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [transmissionLines, appState.viewMode, appState.filters, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleColumnToggle = (column) => {
    setVisibleColumns((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  return (
    <div className="bg-white border-l border-gray-300 flex flex-col overflow-hidden">
    

      {/* Quick Actions Bar */}
      <QuickActionsBar
        onSendToMET={onSendToMET}
        selectedLineId={selectedLineId}
        transmissionLines={transmissionLines}
        snapshots={appState.snapshots}
        onToggleMap={onToggleMap}
        isMapOpen={isMapOpen}
      />
  {/* Filter Panel */}


      {/* Main Summary Table */}
      <div className="flex-1 overflow-auto border-b border-gray-200">
        <MainSummaryTable
          lines={filteredLines}
          selectedLineId={selectedLineId}
          visibleColumns={visibleColumns}
          sortConfig={sortConfig}
          onSelectLine={onSelectLine}
          onSort={handleSort}
          onColumnToggle={handleColumnToggle}
          filters={appState.filters}
    onFiltersChange={onApplyFilters}
    onToggleFilters={onFiltersToggle}
        />
      </div>

      {/* Secondary Details Table (if line selected) */}
      {selectedLine && (
        <div className="flex-1 overflow-auto border-t border-gray-200 bg-gray-50">
          <SecondaryDetailsTable
            line={selectedLine}
            selectedStructureId={selectedStructureId}
            onSelectStructure={onSelectStructure}
            onApplyOverride={onApplyOverride}
            onClose={() => onSelectLine(null)}
          />
        </div>
      )}
    </div>
  );
}
