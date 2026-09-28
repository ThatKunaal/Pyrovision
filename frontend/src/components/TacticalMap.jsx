import React, { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Circle, ZoomControl, useMap, WMSTileLayer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair, Layers, Radio } from 'lucide-react';
import { CATEGORY_COLORS } from '../constants/categories';

// Basemaps - Premium MapTiler Dataviz Dark
const RAW_MAPTILER_KEY = (import.meta.env.VITE_MAPTILER_API_KEY || '').trim();
const MAPTILER_KEY = /^[A-Za-z0-9]{20}$/.test(RAW_MAPTILER_KEY) ? RAW_MAPTILER_KEY : '7S7lUtWnfER9El1v16yE';
const DARK_MATTER_URL = `https://api.maptiler.com/maps/dataviz-dark/256/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`;
const SATELLITE_TILE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const SATELLITE_LABELS_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';

// ESA WorldCover 10m
const WORLDCOVER_WMS_URL = 'https://services.terrascope.be/wms/v2';
const WORLDCOVER_LAYER = 'WORLDCOVER_2021_MAP';

// Auto-fits the map to all current anomaly points once on initial data load
function FitBoundsOnData({ anomalies }) {
  const map = useMap();
  const fittedOnceRef = useRef(false);

  useEffect(() => {
    if (!anomalies || anomalies.length === 0) return;
    if (fittedOnceRef.current) return;

    const bounds = anomalies
      .filter((a) => a && a.latitude != null && a.longitude != null && !isNaN(Number(a.latitude)) && !isNaN(Number(a.longitude)))
      .map((a) => [Number(a.latitude), Number(a.longitude)]);
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 9 });
      fittedOnceRef.current = true;
    }
  }, [anomalies, map]);

  return null;
}

// Flies to searched location
function FlyToSearchLocation({ searchLocation }) {
  const map = useMap();

  useEffect(() => {
    if (searchLocation && searchLocation.lat && searchLocation.lon) {
      map.flyTo([searchLocation.lat, searchLocation.lon], 11, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  }, [searchLocation, map]);

  return null;
}


let searchPinIconInstance = null;
function searchPinIcon() {
  if (!searchPinIconInstance) {
    searchPinIconInstance = L.divIcon({
      className: 'tactical-custom-icon',
      html: `
        <div style="
          width:16px;height:16px;
          border-radius:50% 50% 50% 0;
          background:#00F0FF;
          border:2px solid #0F172A;
          box-shadow:0 0 10px #00F0FFcc;
          transform:rotate(-45deg);
        "></div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 16],
    });
  }
  return searchPinIconInstance;
}

const MapLegend = React.memo(function MapLegend({ counts = {} }) {
  const items = [
    { label: 'WILD FIRE', color: CATEGORY_COLORS['Wild Fire'] || '#15803D', count: counts['Wild Fire'] || 0 },
    { label: 'INDUSTRIAL FIRE', color: '#F59E0B', count: counts['Industrial Fire'] || 0 },
    { label: 'GAS FLARE', color: '#00F0FF', count: counts['Gas Flare'] || 0 },
    { label: 'AGRICULTURE FIRE', color: '#22C55E', count: counts['Agriculture Fire'] || 0 },
    { label: 'MINING ACTIVITY', color: '#A855F7', count: counts['Mining Activity'] || 0 },
  ];

  return (
    <div className="absolute bottom-3 right-3 z-[1000] bg-[#181C26]/95 border border-cyan-500/30 rounded px-3 py-2 text-[9px] font-mono text-slate-300 space-y-1.5 shadow-2xl backdrop-blur-sm pointer-events-none select-none">
      <div className="text-[8px] text-cyan-400 font-bold uppercase tracking-wider border-b border-slate-700/60 pb-1">
        FIRE CLASSIFICATION MATRIX
      </div>
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}` }}
            />
            <span className="font-semibold text-slate-200">{item.label}</span>
          </div>
          <span className="font-mono text-slate-400 text-[8.5px]">{item.count}</span>
        </div>
      ))}
    </div>
  );
});

function getIconSizePx(anomaly) {
  const frp = Number(anomaly.frp_radiance || anomaly.max_frp || 0);
  if (frp > 2000) return 36;
  if (frp > 500) return 28;
  return 22;
}

// Global cache for tactical category markers to avoid recreation
const TACTICAL_MARKER_CACHE = new Map();

function buildTacticalMarker(anomaly) {
  const cat = anomaly.category || 'Wild Fire';
  const color = CATEGORY_COLORS[cat] || '#15803D';
  const isCritical = Number(anomaly.frp_radiance || 0) > 2000;
  const baseSize = getIconSizePx(anomaly);
  const cacheKey = `${cat}_${baseSize}_${isCritical ? 'crit' : 'norm'}`;

  if (TACTICAL_MARKER_CACHE.has(cacheKey)) {
    return TACTICAL_MARKER_CACHE.get(cacheKey);
  }

  const outerSize = Math.round(baseSize * 1.5);
  const iconSize = Math.round(outerSize * 0.52);

  let innerGraphic;
  if (cat === 'Wild Fire') {
    innerGraphic = `
      <svg viewBox="0 0 24 24" width="${iconSize}" height="${iconSize}" fill="none" stroke="#15803D" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none;">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
      </svg>
    `;
  } else if (cat === 'Gas Flare') {
    innerGraphic = `
      <svg viewBox="0 0 24 24" width="${iconSize}" height="${iconSize}" fill="none" stroke="#00F0FF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none;">
        <path d="M8 21h8M9 15h6l-1 6h-4z"/>
        <path d="M12 2c2.6 3 3.6 5.2 3.6 7.2a3.6 3.6 0 0 1-7.2 0c0-2 1-4.2 3.6-7.2z"/>
        <path d="M12 6.5c1 1.2 1.5 2 1.5 2.8a1.5 1.5 0 0 1-3 0c0-.8.5-1.6 1.5-2.8z"/>
      </svg>
    `;
  } else if (cat === 'Agriculture Fire') {
    innerGraphic = `
      <svg viewBox="0 0 24 24" width="${iconSize}" height="${iconSize}" fill="none" stroke="#22C55E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none;">
        <path d="M12 21V10"/>
        <path d="M12 10c0-3.5 3-6 7-6-1 4-3.5 6-7 6z"/>
        <path d="M12 14c0-3-2.5-5-6-5 .8 3.5 3 5 6 5z"/>
        <path d="M5 21h14"/>
      </svg>
    `;
  } else if (cat === 'Mining Activity') {
    innerGraphic = `
      <svg viewBox="0 0 24 24" width="${iconSize}" height="${iconSize}" fill="none" stroke="#A855F7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none;">
        <path d="m14 10 7-7m-3 0 3 3M3 21l8-8m-4-1 5 5M2 5l3-3 6 6-3 3z"/>
      </svg>
    `;
  } else {
    innerGraphic = `
      <svg viewBox="0 0 24 24" width="${iconSize}" height="${iconSize}" fill="none" stroke="#F59E0B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none;">
        <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4H2z"/>
      </svg>
    `;
  }

  const icon = L.divIcon({
    className: 'tactical-custom-icon',
    html: `
      <div style="position:relative;width:${outerSize}px;height:${outerSize}px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
        <!-- Pulsing aura ring with pointer-events:none to completely prevent hover flicker -->
        <div class="animate-pulse-ring" style="
          position:absolute;inset:0;border-radius:50%;
          background:${color};opacity:0.4;pointer-events:none;
        "></div>
        <!-- High-tech dark circle badge with category colored glowing border -->
        <div style="
          position:absolute;inset:2px;border-radius:50%;
          background:#12151C;
          border:2px solid ${color};
          box-shadow:0 0 12px ${color}bb, inset 0 0 6px ${color}44;
          display:flex;align-items:center;justify-content:center;
          pointer-events:auto;
        ">
          ${innerGraphic}
        </div>
      </div>
    `,
    iconSize: [outerSize, outerSize],
    iconAnchor: [outerSize / 2, outerSize / 2],
    popupAnchor: [0, -outerSize / 2],
  });

  TACTICAL_MARKER_CACHE.set(cacheKey, icon);
  return icon;
}

// Color-coded cluster bubble reflecting the dominant fire category in that group
function createClusterIcon(cluster) {
  const markers = cluster.getAllChildMarkers();
  const count = markers.length;
  const size = count > 50 ? 46 : count > 15 ? 38 : 30;

  const catCounts = {};
  let hasCritical = false;
  markers.forEach((m) => {
    const a = m.options?.__anomaly;
    if (a) {
      const cat = a.category || 'Wild Fire';
      catCounts[cat] = (catCounts[cat] || 0) + 1;
      if (Number(a.frp_radiance || 0) > 2000) hasCritical = true;
    }
  });

  let dominantCat = 'Wild Fire';
  let maxCatCount = 0;
  Object.entries(catCounts).forEach(([cat, cnt]) => {
    if (cnt > maxCatCount) {
      maxCatCount = cnt;
      dominantCat = cat;
    }
  });

  const catColor = CATEGORY_COLORS[dominantCat] || '#15803D';
  const ringColor = hasCritical ? '#FF003C' : catColor;

  return L.divIcon({
    html: `
      <div style="
        width:${size}px;height:${size}px;
        display:flex;align-items:center;justify-content:center;
        background:rgba(18,21,28,0.95);
        border:2.5px solid ${ringColor};
        border-radius:50%;
        color:${ringColor};
        font-family:'IBM Plex Mono', monospace;
        font-weight:700;
        font-size:${count > 50 ? 13 : 11}px;
        box-shadow:0 0 12px ${ringColor}99, inset 0 0 6px ${ringColor}44;
        cursor:pointer;
      ">${count}</div>
    `,
    className: 'tactical-custom-icon',
    iconSize: [size, size],
  });
}

function TacticalMap({
  anomalies = [],
  setSelectedTarget,
  searchLocation,
  layers = {},
  showPowerPlants,
}) {
  const [powerPlants, setPowerPlants] = useState([]);
  const [basemapMode, setBasemapMode] = useState('dark');

  useEffect(() => {
    fetch('/data/wri_power_plants.json')
      .then((res) => res.json())
      .then((data) => setPowerPlants(data))
      .catch((err) => console.error('Failed to load power plants:', err));
  }, []);

  const wriRenderer = useMemo(() => L.canvas({ padding: 0.5, tolerance: 18 }), []);

  const showFirms = layers.firms !== false;
  const showWorldcover = Boolean(layers.worldcover);
  const showBuffer = Boolean(layers.buffer);
  const showRisk = layers.risk !== false;

  const validAnomalies = useMemo(() => {
    return (anomalies || []).filter(
      (a) => a && a.latitude != null && a.longitude != null && !isNaN(Number(a.latitude)) && !isNaN(Number(a.longitude))
    );
  }, [anomalies]);

  const hasData = validAnomalies.length > 0;

  // Compute category counts for live legend
  const categoryCounts = useMemo(() => {
    const counts = {};
    validAnomalies.forEach((a) => {
      const cat = a.category || 'Wild Fire';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [validAnomalies]);

  return (
    <div className="h-full w-full relative z-0">
      {/* Tactical Basemap Switcher */}
      <div className="absolute top-2 right-2 z-[1000] flex items-center bg-[#181C26]/90 border border-cyan-500/30 rounded p-0.5 shadow-xl backdrop-blur-sm select-none">
        <button
          type="button"
          onClick={() => setBasemapMode('dark')}
          className={`flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold rounded transition-colors ${
            basemapMode === 'dark'
              ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Radio size={10} />
          DARK OPS
        </button>
        <button
          type="button"
          onClick={() => setBasemapMode('satellite')}
          className={`flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold rounded transition-colors ${
            basemapMode === 'satellite'
              ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers size={10} />
          SATELLITE
        </button>
      </div>

      <MapContainer
        center={[20.5, 82.0]}
        zoom={6}
        className="h-full w-full bg-[#12151C]"
        zoomControl={false}
        attributionControl={false}
      >
        {/* Dynamic Basemap selection */}
        {basemapMode === 'dark' ? (
          <TileLayer url={DARK_MATTER_URL} />
        ) : (
          <>
            <TileLayer url={SATELLITE_TILE_URL} />
            <TileLayer url={SATELLITE_LABELS_URL} />
          </>
        )}

        <ZoomControl position="bottomleft" />

        {hasData && <FitBoundsOnData anomalies={validAnomalies} />}
        <FlyToSearchLocation searchLocation={searchLocation} />

        {searchLocation && searchLocation.lat && searchLocation.lon && (
          <Marker position={[searchLocation.lat, searchLocation.lon]} icon={searchPinIcon()}>
            <Popup className="tactical-popup font-mono text-[10px]">
              <div className="bg-[#181C26] p-2 border border-slate-700 text-slate-300 max-w-[200px]">
                {searchLocation.label}
              </div>
            </Popup>
          </Marker>
        )}

        {/* ESA WorldCover 10m Overlay */}
        {showWorldcover && (
          <WMSTileLayer
            url={WORLDCOVER_WMS_URL}
            layers={WORLDCOVER_LAYER}
            format="image/png"
            transparent
            opacity={0.5}
          />
        )}

        {/* Priority Risk Shading for critical hotspots - Clean vector layer outside cluster group */}
        {showRisk &&
          validAnomalies
            .filter((a) => Number(a.frp_radiance || 0) > 2000)
            .map((anomaly) => {
              const cat = anomaly.category || 'Wild Fire';
              const catColor = CATEGORY_COLORS[cat] || '#15803D';
              return (
                <CircleMarker
                  key={`risk-${anomaly.id}`}
                  center={[Number(anomaly.latitude), Number(anomaly.longitude)]}
                  radius={26}
                  interactive={false}
                  pathOptions={{
                    color: catColor,
                    fillColor: catColor,
                    fillOpacity: 0.15,
                    weight: 1.5,
                    dashArray: '3,4',
                  }}
                />
              );
            })}

        {/* Clustered Color-Coded Hotspot Markers (All 5 Categories) */}
        {showFirms && (
          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createClusterIcon}
            maxClusterRadius={38}
            spiderfyOnMaxZoom
            showCoverageOnHover={false}
            onClick={(e) => {
              if (e?.layer?.getAllChildMarkers) {
                const children = e.layer.getAllChildMarkers();
                if (children && children.length > 0) {
                  let top = children[0]?.options?.__anomaly;
                  for (const m of children) {
                    const a = m?.options?.__anomaly;
                    if (a && (!top || (Number(a.frp_radiance) || 0) > (Number(top.frp_radiance) || 0))) {
                      top = a;
                    }
                  }
                  if (top) setSelectedTarget(top);
                }
              }
            }}
          >
            {validAnomalies.map((anomaly) => {
              const isCritical = Number(anomaly.frp_radiance || 0) > 2000;
              const cat = anomaly.category || 'Wild Fire';
              const catColor = CATEGORY_COLORS[cat] || '#15803D';

              return (
                <Marker
                  key={anomaly.id}
                  position={[Number(anomaly.latitude), Number(anomaly.longitude)]}
                  icon={buildTacticalMarker(anomaly)}
                  eventHandlers={{
                    click: () => {
                      setSelectedTarget(anomaly);
                    },
                  }}
                  __anomaly={anomaly}
                  __isCritical={isCritical}
                >
                  <Popup className="tactical-popup font-mono text-[10px]">
                    <div className="bg-[#181C26] p-2.5 border border-slate-700 text-slate-300 min-w-[220px]">
                      <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-700/60">
                        <span
                          className="text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
                          style={{ backgroundColor: `${catColor}25`, color: catColor, border: `1px solid ${catColor}60` }}
                        >
                          {cat}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 font-mono">
                          #{anomaly.id}
                        </span>
                      </div>

                      <div className="font-bold text-white text-[11px] mb-1 leading-snug">
                        {anomaly.name || anomaly.facility_name || 'THERMAL ANOMALY'}
                      </div>

                      <div className="text-slate-400 text-[9px] mb-1 font-mono">
                        LAT {Number(anomaly.latitude).toFixed(4)}°, LON {Number(anomaly.longitude).toFixed(4)}°
                      </div>

                      <div className="text-slate-300 text-[9.5px]">
                        FRP RADIANCE: <span className="font-bold font-mono" style={{ color: catColor }}>{anomaly.frp_radiance} MW</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTarget(anomaly);
                        }}
                        className="w-full mt-2.5 py-1 px-2 hover:brightness-125 text-white border text-[9px] font-bold rounded flex items-center justify-center gap-1.5 transition-all uppercase cursor-pointer"
                        style={{
                          backgroundColor: `${catColor}30`,
                          borderColor: `${catColor}70`,
                        }}
                      >
                        <Crosshair size={11} style={{ color: catColor }} />
                        <span>LOAD INTO DOSSIER</span>
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        )}

        {/* Population Density 5km Hazard Buffer */}
        {showBuffer &&
          hasData &&
          validAnomalies
            .filter((a) => Number(a.frp_radiance || 0) > 2000)
            .map((a) => (
              <Circle
                key={`buffer-${a.id}`}
                center={[Number(a.latitude), Number(a.longitude)]}
                radius={5000}
                interactive={false}
                pathOptions={{
                  color: '#F59E0B',
                  fillColor: '#F59E0B',
                  fillOpacity: 0.05,
                  weight: 1,
                  dashArray: '6,6',
                }}
              />
            ))}

        {/* WRI Power Plants Overlay */}
        {showPowerPlants &&
          powerPlants.map((plant, idx) => (
            <CircleMarker
              key={`wri-${idx}`}
              center={[plant.latitude, plant.longitude]}
              radius={4}
              pathOptions={{
                color: '#F59E0B',
                fillColor: '#FCD34D',
                fillOpacity: 0.45,
                opacity: 0.6,
                weight: 1,
                renderer: wriRenderer,
              }}
            >
              <Popup className="wri-popup font-mono">
                <div>
                  <div style={{ background: '#F59E0B', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px' }}>⚡</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase' }}>
                      Power Plant
                    </span>
                  </div>
                  <div style={{ background: '#181C26', padding: '10px', fontSize: '11px', color: '#fff' }}>
                    <div style={{ fontWeight: 700, marginBottom: '6px' }}>{plant.name}</div>
                    <div style={{ color: '#94A3B8', fontSize: '9.5px' }}>
                      FUEL: <span style={{ color: '#FCD34D' }}>{plant.primary_fuel || 'Thermal'}</span> | CAPACITY: {plant.capacity_mw || 0} MW
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
      </MapContainer>

      {/* Live Map Legend */}
      <MapLegend counts={categoryCounts} />
    </div>
  );
}

export { CATEGORY_COLORS };
export default React.memo(TacticalMap);