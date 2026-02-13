// Export utilities for PSPS Summary Page

export const generateCSV = (lines) => {
  const headers = [
    'TP Name',
    'T-Line Name',
    'SAP Func Loc',
    'Max WS (mph)',
    'Max WG (mph)',
    'FPC Count',
    'CFPt-Asset',
    'CFPt-Veg',
    'CFB',
    'Open A-Tags',
    'Open HNI/HNU',
    'Direct Type',
    'Max OA (pf)',
    'Min RH 2m',
    'Min DFM 10hr',
    'Min NDVI',
  ];

  const rows = lines.map(line => [
    line.tp_name,
    line.tline_name,
    line.sap_func_loc,
    line.max_ws,
    line.max_wg,
    line.fpc_count,
    line.cfpt_asset_count,
    line.cfpt_veg_count,
    line.cfb_count,
    line.open_a_tags,
    line.open_hni_hnu,
    line.direct_type,
    line.max_oa_pf.toFixed(2),
    line.min_rh_2m,
    line.min_dfm_10hr,
    line.min_ndvi.toFixed(2),
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csv;
};

export const generateETECDirectImpact = (lines) => {
  const directImpactLines = lines.filter(l => l.flags.hasDirectImpact);

  const headers = [
    'SAP Functional Location',
    'T-Line Name',
    'TP Name',
    'Direct Type',
    'Max WG (mph)',
    'CFPt-Asset Count',
    'CFPt-Veg Count',
    'Structure ID',
    'Structure OA (pf)',
    'Ignition Probability',
  ];

  const rows = [];
  directImpactLines.forEach(line => {
    line.structures.forEach(structure => {
      rows.push([
        line.sap_func_loc,
        line.tline_name,
        line.tp_name,
        line.direct_type,
        line.max_wg,
        line.cfpt_asset_count,
        line.cfpt_veg_count,
        structure.id,
        structure.oa_pf.toFixed(2),
        (structure.ignition_probability * 100).toFixed(1),
      ]);
    });
  });

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csv;
};

export const downloadFile = (content, fileName, mimeType = 'text/csv') => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const downloadSnapshot = (snapshot) => {
  const content = JSON.stringify(snapshot, null, 2);
  const timestamp = new Date(snapshot.timestamp).toISOString().split('T')[0];
  const fileName = `PSPS_Snapshot_${snapshot.version}_${timestamp}_${snapshot.id}.json`;
  downloadFile(content, fileName, 'application/json');
};

export const downloadArtifacts = (snapshot) => {
  const timestamp = new Date(snapshot.timestamp);
  const dateStr = timestamp.toISOString().split('T')[0];
  const artifacts = snapshot.artifacts;

  // Download comprehensive report
  const reportContent = JSON.stringify(artifacts.comprehensiveReport, null, 2);
  downloadFile(reportContent, `PSPS_ComprehensiveReport_${snapshot.version}_${dateStr}.json`, 'application/json');

  // Download direct impact list
  const directImpactContent = JSON.stringify(artifacts.directImpactList, null, 2);
  downloadFile(directImpactContent, `PSPS_DirectImpact_ETEC_${snapshot.version}_${dateStr}.json`, 'application/json');

  // Download adjustment history
  const historyContent = JSON.stringify(artifacts.adjustmentHistory, null, 2);
  downloadFile(historyContent, `PSPS_AdjustmentHistory_${snapshot.version}_${dateStr}.json`, 'application/json');
};
