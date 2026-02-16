import { useCallback, useEffect, useState } from 'react';
import ControlPanel from '../components/ControlPanel';
import Footer from '../components/Footer';
import MapSection from '../components/MapSection';
import SecondaryDetailsTable from '../components/SecondaryDetailsTable'; // Ensure imported
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
  const [isMapOpen, setIsMapOpen] = useState(true);

  const selectedLine = transmissionLines.find((line) => line.id === selectedLineId);

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

  const handleSave = useCallback(() => {
    // ... logic for generation
    setAppState((prev) => ({
      ...prev,
      lastSaveTime: new Date(),
    }));
  }, []);

  const handleSendToMET = useCallback(() => {
    setLastMETSendTime(new Date());
    setTimeUntilNextMETSend(15);
  }, []);

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
            direct_type: override.action === 'CHANGE_TYPE_DINDR' ? 'DINDR' : line.direct_type,
            structures: line.structures.map((s) => 
              s.id === override.structureId 
                ? { ...s, overrides: [...s.overrides, override] }
                : s
            ),
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
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <TopBar
        currentModel={appState.currentMETModel}
        availableModels={mockMETModels}
        viewMode={appState.viewMode}
        timestamp={appState.currentMETTimestamp}
        timeUntilNextMETSend={timeUntilNextMETSend}
        lastMETSendTime={lastMETSendTime}
        onViewModeChange={handleViewModeChange}
        onModelChange={handleModelChange}
        onSave={handleSave}
        onSendToMET={handleSendToMET}
      />

      <div className="relative flex flex-1 overflow-hidden">
        
        {/* 1. WRAPPER FOR CONTROL PANEL & POPOVER (The 60% Zone) */}
        <div
          className={`
            relative h-full transition-all duration-300 ease-in-out
            ${isMapOpen ? "w-[60%]" : "w-full"}
          `}
        >
          <ControlPanel
            transmissionLines={transmissionLines}
            selectedLineId={selectedLineId}
            appState={appState}
            filtersOpen={filtersOpen}
            onFiltersToggle={() => setFiltersOpen(!filtersOpen)}
            onSelectLine={handleSelectLine}
            onApplyFilters={handleFiletered}
            onToggleMap={() => setIsMapOpen(prev => !prev)}
            isMapOpen={isMapOpen}
            onSendToMET={handleSendToMET}
          />

          {/* 2. THE POPOVER (Constrained to the 60% parent) */}
          {selectedLine && (
            <>
              {/* Internal Backdrop (Dims the table, but not the map) */}
              <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-40 animate-in fade-in duration-200"
                onClick={() => setSelectedLineId(null)}
              />
              
              {/* Floating Card */}
              <div className="absolute inset-6 z-50 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                <SecondaryDetailsTable
                  line={selectedLine}
                  selectedStructureId={selectedStructureId}
                  onSelectStructure={handleSelectStructure}
                  onApplyOverride={handleApplyOverride}
                  onClose={() => setSelectedLineId(null)}
                />
              </div>
            </>
          )}
        </div>

        {/* 3. MAP DRAWER (The 40% Zone) */}
        <div
          className={`
            absolute top-0 right-0 h-full
            w-[40%] border-l border-gray-300 bg-white
            transition-transform duration-300 ease-in-out
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