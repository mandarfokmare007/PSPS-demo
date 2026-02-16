import { useCallback, useEffect, useState } from 'react';
import ControlPanel from '../components/ControlPanel';
import Footer from '../components/Footer';
import MapSection from '../components/MapSection';
import TopBar from '../components/TopBar';
import { mockAppState, mockATagPoints, mockMETModels, mockTPPolygons, mockTransmissionLines, mockVMTagPoints } from '../mockData';
import { useKeyboardShortcuts } from '../utils/keyboardShortcuts';

export default function MainPage() {

  const [appState, setAppState] = useState(mockAppState);
  const [transmissionLines, setTransmissionLines] = useState(mockTransmissionLines);
  const [selectedLineId, setSelectedLineId] = useState(null);
  const [selectedStructureId, setSelectedStructureId] = useState(appState.selectedStructureId);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [lastMETSendTime, setLastMETSendTime] = useState(new Date());
  const [timeUntilNextMETSend, setTimeUntilNextMETSend] = useState(15);

  // NEW — drawer state (does not affect logic)
  const [isMapOpen, setIsMapOpen] = useState(true);

  const selectedLine = transmissionLines.find((line) => line.id === selectedLineId);
  const selectedStructure = selectedLine?.structures?.find((s) => s.id === selectedStructureId);

  // Automatic 15-minute batch push to MET
  useEffect(() => {
    const batchInterval = setInterval(() => {
      setTimeUntilNextMETSend((prev) => {
        if (prev <= 1) {

          const overridesToSend = transmissionLines.flatMap(line =>
            line.structures.flatMap(s => s.overrides)
          );

          console.log('🔄 [Auto] Batch push to MET triggered:', {
            timestamp: new Date().toISOString(),
            overridesToSend: overridesToSend.length,
            linesModified: transmissionLines.filter(l =>
              l.structures.some(s => s.overrides.length > 0)
            ).length,
          });

          setLastMETSendTime(new Date());
          return 15;
        }
        return prev - 1;
      });
    }, 60000);

    return () => clearInterval(batchInterval);
  }, [transmissionLines]);

  const handleViewModeChange = useCallback((mode) => {
    setAppState((prev) => ({ ...prev, viewMode: mode }));
  }, []);

  const handleModelChange = useCallback((modelId) => {
    const model = mockMETModels.find((m) => m.id === modelId);
    setAppState((prev) => ({
      ...prev,
      currentMETModel: modelId,
      currentMETTimestamp: new Date(model.timestamp),
    }));
  }, []);

  const generateArtifacts = useCallback(() => {

    const now = new Date();
    const timestamp = now.toISOString();
    const modelInfo = mockMETModels.find(m => m.id === appState.currentMETModel);

    const comprehensiveReport = {
      title: `PSPS Summary Report - ${modelInfo.version} Run`,
      generatedAt: timestamp,
      eventVersion: '2',
      meetModel: appState.currentMETModel,
      totalLines: transmissionLines.length,
      directImpactLines: transmissionLines.filter(l => l.flags.hasDirectImpact).length,
      dindirLines: transmissionLines.filter(l => l.flags.isDINDR).length,
      nearGuidanceLines: transmissionLines.filter(l => l.flags.isNearGuidance).length,
      summaryLines: transmissionLines.map(line => ({
        id: line.id,
        tp_name: line.tp_name,
        tline_name: line.tline_name,
        max_ws: line.max_ws,
        max_wg: line.max_wg,
        direct_type: line.direct_type,
        cfpt_asset_count: line.cfpt_asset_count,
        cfpt_veg_count: line.cfpt_veg_count,
        cfb_count: line.cfb_count,
      })),
    };

    const directImpactLines = transmissionLines.filter(l => l.flags.hasDirectImpact);

    const directImpactList = {
      title: 'Direct Impact Lines (ETEC Format)',
      generatedAt: timestamp,
      exportFormat: 'ETEC',
      lines: directImpactLines.map(line => ({
        sap_func_loc: line.sap_func_loc,
        tline_name: line.tline_name,
        tp_name: line.tp_name,
        direct_type: line.direct_type,
        max_wg: line.max_wg,
        cfpt_asset_count: line.cfpt_asset_count,
        cfpt_veg_count: line.cfpt_veg_count,
        structures: line.structures.map(s => ({
          structure_id: s.id,
          oa_pf: s.oa_pf,
          ignition_probability: s.ignition_probability,
        })),
      })),
      count: directImpactLines.length,
    };

    const adjustmentHistory = {
      title: 'Adjustments & Overrides History',
      generatedAt: timestamp,
      adjustments: transmissionLines.flatMap(line =>
        line.structures.flatMap(structure =>
          structure.overrides.map(override => ({
            lineId: line.id,
            lineName: line.tline_name,
            structureId: structure.id,
            structureName: structure.name,
            ...override,
          }))
        )
      ),
    };

    return {
      timestamp,
      fileName: `PSPS_Report_${modelInfo.version}_${now.toISOString().split('T')[0]}_${now.getTime()}`,
      artifacts: {
        comprehensiveReport,
        directImpactList,
        adjustmentHistory,
      },
    };

  }, [transmissionLines, appState.currentMETModel]);

  const handleSave = useCallback(() => {

    const artifacts = generateArtifacts();

    const newSnapshot = {
      id: `snap-${Date.now()}`,
      timestamp: artifacts.timestamp,
      version: appState.currentMETModel,
      name: `Snapshot - ${new Date(artifacts.timestamp).toLocaleString()}`,
      lineCount: transmissionLines.length,
      directImpactCount: transmissionLines.filter(l => l.flags.hasDirectImpact).length,
      dindirCount: transmissionLines.filter(l => l.flags.isDINDR).length,
      artifacts: artifacts.artifacts,
    };

    setAppState((prev) => ({
      ...prev,
      snapshots: [newSnapshot, ...prev.snapshots],
      lastSaveTime: new Date(artifacts.timestamp),
    }));

  }, [transmissionLines, appState.currentMETModel, generateArtifacts]);

  const handleSendToMET = useCallback(() => {

    const overridesToSend = transmissionLines.flatMap(line =>
      line.structures.flatMap(s => s.overrides)
    );

    console.log('✓ Manual send to MET triggered:', {
      timestamp: new Date().toISOString(),
      overridesToSend: overridesToSend.length,
    });

    setLastMETSendTime(new Date());
    setTimeUntilNextMETSend(15);

  }, [transmissionLines]);

  const handleSelectLine = useCallback((lineId) => {
    setSelectedLineId(lineId);
    const line = transmissionLines.find((l) => l.id === lineId);
    if (line && line.structures.length > 0) {
      setSelectedStructureId(line.structures[0].id);
    }
  }, [transmissionLines]);

  const handleSelectStructure = useCallback((structureId) => {
    setSelectedStructureId(structureId);
  }, []);

  const handleApplyOverride = useCallback((lineId, override) => {
    setTransmissionLines((prev) =>
      prev.map((line) => {
        if (line.id === lineId) {
          return {
            ...line,
            direct_type: override.type,
            flags: { ...line.flags, isDINDR: override.type === 'DINDR' },
            structures: line.structures.map((s) => ({
              ...s,
              overrides: [...s.overrides, override],
            })),
          };
        }
        return line;
      })
    );
  }, []);

  const handleFiletered = useCallback((filters) => {
    setAppState((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...filters },
    }));
  }, []);

  const handleLayerToggle = useCallback((layerName) => {
    setAppState((prev) => ({
      ...prev,
      layerVisibility: {
        ...prev.layerVisibility,
        [layerName]: !prev.layerVisibility[layerName],
      },
    }));
  }, []);

  useKeyboardShortcuts({
    onSave: handleSave,
    onSendToMET: handleSendToMET,
    onToggleFilters: () => setFiltersOpen(!filtersOpen),
  });

  return (
    <div className="flex flex-col h-screen bg-gray-50">

      <TopBar
        currentModel={appState.currentMETModel}
        availableModels={mockMETModels}
        viewMode={appState.viewMode}
        timestamp={appState.currentMETTimestamp}
        isStale={appState.isRefreshStale}
        timeUntilNextMETSend={timeUntilNextMETSend}
        lastMETSendTime={lastMETSendTime}
        onViewModeChange={handleViewModeChange}
        onModelChange={handleModelChange}
        onSave={handleSave}
        onSendToMET={handleSendToMET}
       
      />

<div className="relative flex flex-1 overflow-hidden">

  {/* CONTROL PANEL (MAIN CONTENT) */}
  <div
    className={`
      h-full transition-all duration-300
      ${isMapOpen ? "pr-[40%]" : "pr-0"}
      w-full
    `}
  >
    <ControlPanel
      transmissionLines={transmissionLines}
      selectedLineId={selectedLineId}
      selectedStructureId={selectedStructureId}
      selectedLine={selectedLine}
      selectedStructure={selectedStructure}
      appState={appState}
      filtersOpen={filtersOpen}
      onFiltersToggle={() => setFiltersOpen(!filtersOpen)}
      onSelectLine={handleSelectLine}
      onSelectStructure={handleSelectStructure}
      onApplyOverride={handleApplyOverride}
      onSendToMET={handleSendToMET}
      onApplyFilters={handleFiletered}
       onToggleMap={() => setIsMapOpen(prev => !prev)}
       isMapOpen = {isMapOpen}
    />
  </div>

  {/* MAP DRAWER */}
  <div
    className={`
      absolute top-0 right-0 h-full
      w-[40%]
      transition-transform duration-300
      ${isMapOpen ? "translate-x-0" : "translate-x-full"}
    `}
  >
    <MapSection
      lines={transmissionLines}
      selectedLineId={selectedLineId}
      appState={appState}
      onSelectLine={handleSelectLine}
      onLayerToggle={handleLayerToggle}
      tpPolygons={mockTPPolygons}
      aTagPoints={mockATagPoints}
      vmTagPoints={mockVMTagPoints}
    />
  </div>

</div>



      <Footer userInfo={appState.userInfo} metadata={{ lastMETRunTime: appState.currentMETTimestamp }} />

    </div>
  );
}
