import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";

export default function MapSection({
  lines = [],
  selectedLineId,
  appState,
  onSelectLine,
  onLayerToggle,
  tpPolygons = [],
  aTagPoints = [],
  vmTagPoints = [],
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [basemap, setBasemap] = useState("liberty");

  const layerIdMap = {
    transmissionLines: "tlines-layer",
    structures: "structures-layer",
    tpPolygons: "tp-polygons-layer",
    vmTags: "vm-tags-layer",
    aTags: "a-tags-layer",
  };

const getStyleUrl = (styleId) => {
  const styles = {
    liberty: "https://tiles.openfreemap.org/styles/liberty",
    dark: "https://tiles.openfreemap.org/styles/dark",
    bright: "https://tiles.openfreemap.org/styles/bright",
    gray: "https://tiles.openfreemap.org/styles/positron", // or gray equivalent
  };
  // Return the selected style or default to liberty
  return styles[styleId] || styles.liberty;
};

  // ----------------------------
  // ADD / UPDATE LAYERS
  // ----------------------------
  const addLayers = useCallback(() => {
    const mapInstance = map.current;
    if (!mapInstance || !mapInstance.isStyleLoaded()) return;

    // ----------------------------
    // FILTER LOGIC
    // ----------------------------
    const filteredLines = lines.filter((line) => {
      if (appState?.filters?.open_a_tags && line.open_a_tags === 0)
        return false;
      if (appState?.filters?.open_hni_hnu && line.open_hni_hnu === 0)
        return false;
      return true;
    });

    // ----------------------------
    // T-LINES
    // ----------------------------
    const tLineGeojson = {
      type: "FeatureCollection",
      features: filteredLines.map((line) => ({
        type: "Feature",
        properties: {
          id: line.id,
          direct_type: line.direct_type,
          is_selected: line.id === selectedLineId,
        },
        geometry: {
          type: "LineString",
          coordinates: [
            [line.geoPoint.lng, line.geoPoint.lat],
            [line.geoPoint.lng + 0.1, line.geoPoint.lat + 0.1],
          ],
        },
      })),
    };

    if (!mapInstance.getSource("tlines")) {
      mapInstance.addSource("tlines", {
        type: "geojson",
        data: tLineGeojson,
      });

      mapInstance.addLayer({
        id: "tlines-layer",
        type: "line",
        source: "tlines",
        paint: {
          "line-color": [
            "case",
            ["==", ["get", "is_selected"], true],
            "#2563eb",
            ["==", ["get", "direct_type"], "DINDR"],
            "#8b5cf6",
            "#ef4444",
          ],
          "line-width": [
            "case",
            ["==", ["get", "is_selected"], true],
            6,
            3,
          ],
        },
        layout: {
          visibility:
            appState?.layerVisibility?.transmissionLines !== false
              ? "visible"
              : "none",
        },
      });
    } else {
      mapInstance.getSource("tlines").setData(tLineGeojson);
    }

    // ----------------------------
    // STRUCTURES
    // ----------------------------
    const structureGeojson = {
      type: "FeatureCollection",
      features: filteredLines.flatMap((line) =>
        (line.structures || []).map((s) => ({
          type: "Feature",
          properties: { ...s },
          geometry: {
            type: "Point",
            coordinates: [
              line.geoPoint.lng + Math.random() * 0.02,
              line.geoPoint.lat + Math.random() * 0.02,
            ],
          },
        }))
      ),
    };

    if (!mapInstance.getSource("structures")) {
      mapInstance.addSource("structures", {
        type: "geojson",
        data: structureGeojson,
      });

      mapInstance.addLayer({
        id: "structures-layer",
        type: "circle",
        source: "structures",
        paint: {
          "circle-radius": 6,
          "circle-color": "#ffffff",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ef4444",
        },
        layout: {
          visibility:
            appState?.layerVisibility?.structures !== false
              ? "visible"
              : "none",
        },
      });
    } else {
      mapInstance.getSource("structures").setData(structureGeojson);
    }

    // ----------------------------
    // POLYGONS
    // ----------------------------
    const polygonGeojson = {
      type: "FeatureCollection",
      features: tpPolygons.map((tp) => ({
        type: "Feature",
        properties: { id: tp.id, name: tp.name },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [tp.bounds.west, tp.bounds.south],
            [tp.bounds.east, tp.bounds.south],
            [tp.bounds.east, tp.bounds.north],
            [tp.bounds.west, tp.bounds.north],
            [tp.bounds.west, tp.bounds.south],
          ]],
        },
      })),
    };

    if (!mapInstance.getSource("tpPolygons")) {
      mapInstance.addSource("tpPolygons", {
        type: "geojson",
        data: polygonGeojson,
      });

      mapInstance.addLayer({
        id: "tp-polygons-layer",
        type: "fill",
        source: "tpPolygons",
        paint: {
          "fill-color": "#3b82f6",
          "fill-opacity": 0.15,
        },
        layout: {
          visibility:
            appState?.layerVisibility?.tpPolygons !== false
              ? "visible"
              : "none",
        },
      });
    }

    // ----------------------------
    // A TAGS
    // ----------------------------
    const aTagGeojson = {
      type: "FeatureCollection",
      features: aTagPoints.map((tag) => ({
        type: "Feature",
        properties: tag,
        geometry: {
          type: "Point",
          coordinates: [tag.lng, tag.lat],
        },
      })),
    };

    if (!mapInstance.getSource("aTags")) {
      mapInstance.addSource("aTags", {
        type: "geojson",
        data: aTagGeojson,
      });

      mapInstance.addLayer({
        id: "a-tags-layer",
        type: "circle",
        source: "aTags",
        paint: {
          "circle-radius": 7,
          "circle-color": "#f97316",
        },
        layout: {
          visibility:
            appState?.layerVisibility?.aTags !== false
              ? "visible"
              : "none",
        },
      });
    } else {
      mapInstance.getSource("aTags").setData(aTagGeojson);
    }

    // ----------------------------
    // VM TAGS
    // ----------------------------
    const vmTagGeojson = {
      type: "FeatureCollection",
      features: vmTagPoints.map((tag) => ({
        type: "Feature",
        properties: tag,
        geometry: {
          type: "Point",
          coordinates: [tag.lng, tag.lat],
        },
      })),
    };

    if (!mapInstance.getSource("vmTags")) {
      mapInstance.addSource("vmTags", {
        type: "geojson",
        data: vmTagGeojson,
      });

      mapInstance.addLayer({
        id: "vm-tags-layer",
        type: "circle",
        source: "vmTags",
        paint: {
          "circle-radius": 6,
          "circle-color": "#8b5cf6",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#6d28d9",
        },
        layout: {
          visibility:
            appState?.layerVisibility?.vmTags !== false
              ? "visible"
              : "none",
        },
      });
    } else {
      mapInstance.getSource("vmTags").setData(vmTagGeojson);
    }
  }, [lines, selectedLineId, appState, tpPolygons, aTagPoints, vmTagPoints]);

  // ----------------------------
  // INIT MAP
  // ----------------------------
  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: getStyleUrl(basemap),
        center: [-119.4, 36.5],
        zoom: 6,
      });

      map.current.on("load", () => {
        console.log("✅ Map loaded successfully");
        addLayers();
      });

      map.current.on("error", (e) => {
        console.error("❌ Map error:", e.error);
      });

      map.current.on("click", "tlines-layer", (e) => {
        if (e.features?.length > 0) {
          onSelectLine?.(e.features[0].properties.id);
        }
      });

      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (error) {
      console.error("❌ Error initializing map:", error);
    }
  }, []);

  // ----------------------------
  // STYLE CHANGE SAFE
  // ----------------------------
useEffect(() => {
  if (!map.current) return;

  const styleUrl = getStyleUrl(basemap);
  map.current.setStyle(styleUrl);

  // Use 'idle' or 'style.load' to ensure the map is ready for GeoJSON sources
  const handleStyleLoad = () => {
    console.log("🎨 New style loaded, re-adding layers...");
    addLayers();
  };

  map.current.once("style.load", handleStyleLoad);
  
  return () => {
    map.current?.off("style.load", handleStyleLoad);
  };
}, [basemap, addLayers]);

  // ----------------------------
  // UPDATE ON DATA CHANGE
  // ----------------------------
  useEffect(() => {
    addLayers();
  }, [addLayers]);

  // ----------------------------
  // UPDATE LAYER VISIBILITY
  // ----------------------------
  useEffect(() => {
    if (!map.current) return;

    const layerUpdates = [
      { id: 'tlines-layer', key: 'transmissionLines' },
      { id: 'structures-layer', key: 'structures' },
      { id: 'tp-polygons-layer', key: 'tpPolygons' },
      { id: 'vm-tags-layer', key: 'vmTags' },
      { id: 'a-tags-layer', key: 'aTags' },
    ];

    layerUpdates.forEach(({ id, key }) => {
      if (map.current.getLayer(id)) {
        const visibility = appState?.layerVisibility?.[key] !== false ? 'visible' : 'none';
        map.current.setLayoutProperty(id, 'visibility', visibility);
      }
    });
  }, [appState?.layerVisibility]);

  return (
    <div className="relative h-full bg-slate-200">
      <div 
        ref={mapContainer} 
        className="absolute inset-0 w-full h-full bg-blue-100" 
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />

      {/* Basemap Selector */}
      <div className="absolute top-4 left-4 z-10 bg-white p-2 rounded shadow">
        <select
          value={basemap}
          onChange={(e) => setBasemap(e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-sm"
        >
          <option value="liberty">Liberty</option>
          <option value="dark">Dark</option>
          <option value="bright">Bright</option>
          <option value="gray">Gray</option>
        </select>
      </div>

      {/* Map Layers Control Panel */}
      <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-slate-200 w-48">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Map Layers</h4>
        <div className="space-y-1">
          {[
            { key: 'transmissionLines', label: 'T-Lines', icon: '━' },
            { key: 'structures', label: 'Structures', icon: '●' },
            { key: 'tpPolygons', label: 'Polygons', icon: '■' },
            { key: 'vmTags', label: 'VM Tags', icon: '▲' },
            { key: 'aTags', label: 'A-Tags', icon: '▼' },
          ].map(layer => (
            <label key={layer.key} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-all group">
              <input 
                type="checkbox" 
                className="w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 transition-all cursor-pointer"
                checked={appState?.layerVisibility?.[layer.key] !== false}
                onChange={() => onLayerToggle(layer.key)}
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
