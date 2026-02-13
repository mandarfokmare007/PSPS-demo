import { useState } from 'react';

export default function MainSummaryTable({
  lines,
  selectedLineId,
  visibleColumns,
  sortConfig,
  onSelectLine,
  onSort,
  onColumnToggle,
}) {
  const [showColumnChooser, setShowColumnChooser] = useState(false);

  const columnDefs = [
    { key: 'tp_name', label: 'TP Name', sortable: true, width: '12%' },
    { key: 'tline_name', label: 'T-Line Name', sortable: true, width: '14%' },
    { key: 'sap_func_loc', label: 'SAP Func Loc', sortable: true, width: '12%' },
    { key: 'max_ws', label: 'Max WS (mph)', sortable: true, width: '10%' },
    { key: 'max_wg', label: 'Max WG (mph)', sortable: true, width: '10%' },
    { key: 'fpc_count', label: 'FPC', sortable: true, width: '7%' },
    { key: 'cfpt_asset_count', label: 'CFPt-A', sortable: true, width: '8%' },
    { key: 'cfpt_veg_count', label: 'CFPt-V', sortable: true, width: '8%' },
    { key: 'cfb_count', label: 'CFB', sortable: true, width: '7%' },
    { key: 'open_a_tags', label: 'A-Tags', sortable: true, width: '7%' },
    { key: 'open_hni_hnu', label: 'HNI/HNU', sortable: true, width: '8%' },
    { key: 'direct_type', label: 'Type', sortable: true, width: '8%' },
  ];

  const visibleDefs = columnDefs.filter((col) => visibleColumns[col.key]);

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  const getRowHighlight = (line) => {
    if (line.id === selectedLineId) return 'bg-blue-50 border-l-4 border-l-blue-600';
    if (line.flags.hasDirectImpact) return 'bg-red-50 border-l-4 border-l-red-500 hover:bg-red-100';
    if (line.flags.isDINDR) return 'bg-purple-50 border-l-4 border-l-purple-500 hover:bg-purple-100';
    if (line.flags.isNearGuidance) return 'bg-amber-50 border-l-4 border-l-amber-500 hover:bg-amber-100';
    return 'hover:bg-gray-100 border-l-4 border-l-gray-200';
  };

  const getTypeColor = (type) => {
    if (type === 'DINDR') return 'badge badge-danger';
    if (type === 'D') return 'badge badge-primary';
    return 'badge badge-warning';
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Table Toolbar */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-gray-700">{lines.length} Transmission Lines</span>
          {lines.length > 0 && (
            <div className="flex items-center gap-3 text-xs font-medium text-gray-600">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-900 rounded">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Direct: {lines.filter((l) => l.flags.hasDirectImpact).length}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 text-purple-900 rounded">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                DINDR: {lines.filter((l) => l.flags.isDINDR).length}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-900 rounded">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                Near: {lines.filter((l) => l.flags.isNearGuidance).length}
              </span>
            </div>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowColumnChooser(!showColumnChooser)}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded transition-colors"
            aria-label="Column visibility"
          >
            🎨 Columns
          </button>
          {showColumnChooser && (
            <div className="absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-20 min-w-48">
              <div className="p-3 border-b border-gray-200">
                <p className="text-xs font-bold text-gray-600 uppercase">Visible Columns</p>
              </div>
              <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                {columnDefs.map((col) => (
                  <label key={col.key} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleColumns[col.key]}
                      onChange={() => onColumnToggle(col.key)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{col.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-sm bg-white">
          <thead className="sticky top-0 bg-gray-100 border-b-2 border-gray-300 z-10">
            <tr>
              {visibleDefs.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className="px-4 py-3 text-left font-bold text-gray-700 border-r border-gray-200 last:border-r-0 bg-gray-100"
                >
                  {col.sortable ? (
                    <button
                      onClick={() => onSort(col.key)}
                      className="hover:text-gray-900 inline-flex items-center gap-2 whitespace-nowrap transition-colors hover:bg-gray-200 px-1 py-0.5 rounded"
                      aria-sort={
                        sortConfig.key === col.key
                          ? sortConfig.direction === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                      }
                    >
                      {col.label}
                      {getSortIndicator(col.key) && <span className="text-blue-600 font-bold">{getSortIndicator(col.key)}</span>}
                    </button>
                  ) : (
                    <span className="whitespace-nowrap">{col.label}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {lines.length === 0 ? (
              <tr>
                <td colSpan={visibleDefs.length} className="px-6 py-8 text-center text-gray-500 font-medium">
                  📭 No transmission lines match the selected filters.
                </td>
              </tr>
            ) : (
              lines.map((line) => (
                <tr
                  key={line.id}
                  onClick={() => onSelectLine(line.id)}
                  className={`cursor-pointer transition-all duration-150 ${getRowHighlight(line)}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onSelectLine(line.id);
                    }
                  }}
                >
                  {visibleDefs.map((col) => {
                    let cellContent = line[col.key];

                    // Format cell content
                    if (col.key === 'direct_type') {
                      return (
                        <td key={col.key} className="px-4 py-3 border-r border-gray-200 last:border-r-0">
                          <span className={getTypeColor(cellContent)}>
                            {cellContent}
                          </span>
                        </td>
                      );
                    }

                    if (col.key === 'tline_name' || col.key === 'tp_name') {
                      return (
                        <td key={col.key} className="px-4 py-3 border-r border-gray-200 last:border-r-0 font-semibold text-gray-900 truncate">
                          {cellContent}
                        </td>
                      );
                    }

                    if (col.key === 'sap_func_loc') {
                      return (
                        <td key={col.key} className="px-4 py-3 border-r border-gray-200 last:border-r-0 text-gray-600 font-medium">
                          {cellContent}
                        </td>
                      );
                    }

                    return (
                      <td key={col.key} className="px-4 py-3 border-r border-gray-200 last:border-r-0 text-center text-gray-700 font-medium">
                        {cellContent}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
