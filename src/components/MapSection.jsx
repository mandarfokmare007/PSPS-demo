import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useRef, useState } from 'react';

export default function MapSection({ lines, selectedLineId, appState, onSelectLine, onLayerToggle }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [basemap, setBasemap] = useState('liberty');

  const layerIdMap = {
    transmissionLines: 'tlines-layer',
    structures: 'structures-layer',
    tpPolygons: 'tp-polygons-layer',
    vmTags: 'vm-tags-layer',
    aTags: 'a-tags-layer',
  };

  const layerOptions = [
    { key: 'transmissionLines', label: 'T-Lines', icon: '━' },
    { key: 'structures', label: 'Structures', icon: '●' },
    { key: 'tpPolygons', label: 'Polygons', icon: '■' },
    { key: 'vmTags', label: 'VM Tags', icon: '▲' },
    { key: 'aTags', label: 'A-Tags', icon: '▼' },
  ];

  const getStyleUrl = (styleId) => {
    const styles = {
      'liberty': 'https://tiles.openfreemap.org/styles/liberty',
      'dark': 'https://tiles.openfreemap.org/styles/dark',
      'bright': 'https://tiles.openfreemap.org/styles/bright',
      'gray': 'https://tiles.versatiles.org/assets/styles/gray.json',
    };
    return styles[styleId] || styles['liberty'];
  };

  const addLayers = useCallback(() => {
    const mapInstance = map.current;
    if (!mapInstance || !mapInstance.isStyleLoaded()) return;

    console.log("Adding Data Layers to Map...");

    // 1. Transmission Lines
    const tLineGeojson = {
      type: 'FeatureCollection',
      features: (lines || []).map((line) => ({
        type: 'Feature',
        properties: { 
          id: line.id, 
          direct_type: line.direct_type, 
          is_selected: line.id === selectedLineId 
        },
        geometry: { 
          type: 'LineString', 
          coordinates: line.coordinates || [
            [line.geoPoint.lng, line.geoPoint.lat],
            [line.geoPoint.lng + 0.01, line.geoPoint.lat + 0.01]
          ]
        },
      })),
    };

    // 2. Structures
    const structureGeojson = {
      type: 'FeatureCollection',
      features: (lines || []).flatMap(line => (line.structures || []).map(s => ({
        type: 'Feature',
        properties: { ...s, parentLineId: line.id },
        geometry: { 
          type: 'Point', 
          coordinates: [line.geoPoint.lng + (Math.random() * 0.005), line.geoPoint.lat + (Math.random() * 0.005)] 
        }
      })))
    };

    // UPDATE OR ADD SOURCES
    if (!mapInstance.getSource('tlines')) {
      mapInstance.addSource('tlines', { type: 'geojson', data: tLineGeojson });
      mapInstance.addLayer({
        id: 'tlines-layer',
        type: 'line',
        source: 'tlines',
        paint: {
          'line-color': ['case', 
            ['==', ['get', 'direct_type'], 'DINDR'], '#8b5cf6', 
            ['==', ['get', 'direct_type'], 'D'], '#ef4444', 
            ['==', ['get', 'is_selected'], true], '#2563eb', 
            '#94a3b8'
          ],
          'line-width': ['case', ['==', ['get', 'is_selected'], true], 6, 3],
        },
        layout: { 'visibility': appState?.layerVisibility?.transmissionLines !== false ? 'visible' : 'none' }
      });
    } else {
      mapInstance.getSource('tlines').setData(tLineGeojson);
    }

    if (!mapInstance.getSource('structures')) {
      mapInstance.addSource('structures', { type: 'geojson', data: structureGeojson });
      mapInstance.addLayer({
        id: 'structures-layer',
        type: 'circle',
        source: 'structures',
        paint: {
          'circle-radius': 6,
          'circle-color': '#ffffff',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ef4444'
        },
        layout: { 'visibility': appState?.layerVisibility?.structures !== false ? 'visible' : 'none' }
      });
    } else {
      mapInstance.getSource('structures').setData(structureGeojson);
    }
  }, [lines, selectedLineId, appState.layerVisibility]);

  // Handle Layer Toggle
  const toggleLayer = (key) => {
    onLayerToggle(key);
    const layerId = layerIdMap[key];
    if (map.current && map.current.getLayer(layerId)) {
      const isVisible = map.current.getLayoutProperty(layerId, 'visibility') === 'visible';
      map.current.setLayoutProperty(layerId, 'visibility', isVisible ? 'none' : 'visible');
    }
  };

  // INITIALIZE MAP
  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: getStyleUrl(basemap),
      center: [-119.4, 36.5], // Center of CA Mock Data
      zoom: 6,
    });

    // Resize handling for Tailwind layouts
    const observer = new ResizeObserver(() => map.current?.resize());
    if (mapContainer.current) observer.observe(mapContainer.current);

    map.current.on('load', () => {
        addLayers();
    });

    // Interaction Events
    map.current.on('click', 'tlines-layer', (e) => {
      if (e.features.length > 0) onSelectLine(e.features[0].properties.id);
    });

    map.current.on('mouseenter', 'tlines-layer', () => map.current.getCanvas().style.cursor = 'pointer');
    map.current.on('mouseleave', 'tlines-layer', () => map.current.getCanvas().style.cursor = '');

    return () => {
      observer.disconnect();
      if (map.current) map.current.remove();
    };
  }, []);

  // UPDATE STYLE ON BASEMAP CHANGE
  useEffect(() => {
    if (map.current) {
        // When style changes, wait for it to load then re-add our data layers
        map.current.setStyle(getStyleUrl(basemap));
        const handleStyleData = () => {
            if (map.current.isStyleLoaded()) {
                addLayers();
                map.current.off('styledata', handleStyleData);
            }
        };
        map.current.on('styledata', handleStyleData);
    }
  }, [basemap, addLayers]);

  return (
    <div className="flex-1 relative h-full min-h-[400px] bg-slate-200">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

      {/* Control UI */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="bg-white/90 backdrop-blur p-1 rounded-xl shadow-lg border border-slate-200 flex flex-col">
          <button onClick={() => map.current?.zoomIn()} className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">＋</button>
          <button onClick={() => map.current?.zoomOut()} className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">－</button>
        </div>
        
        <select 
          value={basemap} 
          onChange={(e) => setBasemap(e.target.value)}
          className="bg-white/90 backdrop-blur border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold uppercase shadow-lg outline-none cursor-pointer hover:bg-white transition-colors"
        >
          <option value="liberty">Liberty</option>
          <option value="dark">Dark</option>
          <option value="bright">Bright</option>
          <option value="gray">Gray</option>
        </select>
      </div>

      <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-slate-200 w-48">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Map Layers</h4>
        <div className="space-y-1">
          {layerOptions.map(layer => (
            <label key={layer.key} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-all group">
              <input 
                type="checkbox" 
                className="w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 transition-all cursor-pointer"
                checked={appState?.layerVisibility?.[layer.key] !== false}
                onChange={() => toggleLayer(layer.key)}
              />
              <span className="text-[11px] text-slate-600 font-bold group-hover:text-blue-700 transition-colors">
                {layer.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}