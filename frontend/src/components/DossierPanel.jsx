import { useState } from 'react';
import { AlertTriangle, Download, Crosshair, CheckSquare, Square, ChevronDown } from 'lucide-react';

export default function DossierPanel({ anomalies = [], selectedTarget, setSelectedTarget, stats = {}, layers = {}, toggleLayer = () => {} }) {
  const totalCount = stats.total || anomalies.length || 0;
  const categories = stats.categories || {};

  const wildfireCount = categories['Wild Fire'] || 0;
  const industrialCount = categories['Industrial Fire'] || 0;
  const flareCount = categories['Gas Flare'] || 0;
  const agricultureCount = categories['Agriculture Fire'] || 0;
  const miningCount = categories['Mining Activity'] || 0;

  const wildfirePct = totalCount ? ((wildfireCount / totalCount) * 100).toFixed(1) : '0.0';
  const industrialPct = totalCount ? ((industrialCount / totalCount) * 100).toFixed(1) : '0.0';
  const flarePct = totalCount ? ((flareCount / totalCount) * 100).toFixed(1) : '0.0';
  const agriculturePct = totalCount ? ((agricultureCount / totalCount) * 100).toFixed(1) : '0.0';
  const miningPct = totalCount ? ((miningCount / totalCount) * 100).toFixed(1) : '0.0';

  const [taskingEngaged, setTaskingEngaged] = useState(false);
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);

  const engagedCount = Object.values(layers).filter(Boolean).length;

  const currentIndex = anomalies.findIndex((a) => a.id === selectedTarget?.id);
  const handlePrevTarget = () => {
    if (anomalies.length === 0) return;
    const newIndex = currentIndex <= 0 ? anomalies.length - 1 : currentIndex - 1;
    setSelectedTarget(anomalies[newIndex]);
  };
  const handleNextTarget = () => {
    if (anomalies.length === 0) return;
    const newIndex = currentIndex >= anomalies.length - 1 || currentIndex === -1 ? 0 : currentIndex + 1;
    setSelectedTarget(anomalies[newIndex]);
  };

  const handleExportCSV = () => {
    if (!selectedTarget) return;
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Name,Latitude,Longitude,Category,FRP_MW,Confidence,Severity,Region\n" +
      `${selectedTarget.id},"${selectedTarget.name}",${selectedTarget.latitude},${selectedTarget.longitude},"${selectedTarget.category}",${selectedTarget.frp_radiance},${selectedTarget.confidence},"${selectedTarget.severity_status}","${selectedTarget.region || ''}"`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DOSSIER_${selectedTarget.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyCoordinates = () => {
    if (selectedTarget) {
      navigator.clipboard.writeText(`${selectedTarget.latitude}, ${selectedTarget.longitude}`);
      setTaskingEngaged(true);
      setTimeout(() => setTaskingEngaged(false), 2000);
    }
  };

  const wriCount = anomalies.filter(a => a.wri_verified).length || 861;

  return (
    <div className="w-[320px] min-w-[320px] max-w-[320px] h-full bg-[#12151C] border-l border-cyan-500/20 overflow-y-auto flex flex-col font-mono select-none text-slate-200">
      
      {/* 1. LAYER MATRIX CONTROL DROPDOWN */}
      <div className="p-2.5 border-b border-cyan-500/10">
        {/* Dropdown Header / Trigger Button */}
        <button
          type="button"
          onClick={() => setIsLayerMenuOpen((prev) => !prev)}
          className={`w-full flex items-center justify-between p-2 rounded bg-slate-900/80 border transition-all text-left ${
            isLayerMenuOpen
              ? 'border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.15)] bg-slate-800/80'
              : 'border-cyan-500/30 hover:border-cyan-400/60 hover:bg-slate-800/50'
          }`}
          title="Click to toggle Layer Matrix dropdown"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <span className="text-cyan-400 text-[9px]">◆</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wider truncate">
                LAYER MATRIX CONTROL
              </span>
              <span className="text-[7.5px] text-slate-400 truncate font-mono">
                {engagedCount} OF 7 ACTIVE LAYERS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 text-[8px] px-1.5 py-0.5 rounded font-mono font-bold">
              {engagedCount}/7 ENGAGED
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-cyan-400 transition-transform duration-200 ${
                isLayerMenuOpen ? 'rotate-180 text-cyan-300' : ''
              }`}
            />
          </div>
        </button>
        
        {/* Dropdown Menu List */}
        {isLayerMenuOpen && (
          <div className="mt-2 space-y-1 bg-[#0A0F1A] border border-cyan-500/30 rounded p-1.5 shadow-2xl">
            {/* FIRMS Thermal Hotspots */}
            <div 
              onClick={() => toggleLayer('firms')}
              className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-slate-800/60 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                {layers.firms ? (
                  <CheckSquare className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                )}
                <span className={`text-[10px] ${layers.firms ? 'text-slate-200 font-semibold' : 'text-slate-400'}`}>
                  FIRMS Thermal Hotspots
                </span>
              </div>
              <span className="text-cyan-400 text-[10px] font-bold font-mono">{totalCount}</span>
            </div>

            {/* Industrial Facilities */}
            <div 
              onClick={() => toggleLayer('industrial')}
              className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-slate-800/60 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                {layers.industrial ? (
                  <CheckSquare className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                )}
                <span className={`text-[10px] ${layers.industrial ? 'text-slate-200 font-semibold' : 'text-slate-400'}`}>
                  Industrial Facilities
                </span>
              </div>
              <span className="text-amber-400 text-[10px] font-mono">{industrialCount}</span>
            </div>

            {/* Priority Risk Shading */}
            <div 
              onClick={() => toggleLayer('risk')}
              className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-slate-800/60 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                {layers.risk ? (
                  <CheckSquare className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                )}
                <span className={`text-[10px] ${layers.risk ? 'text-slate-200 font-semibold' : 'text-slate-400'}`}>
                  Priority Risk Shading
                </span>
              </div>
              <span className="bg-red-500/20 text-[#FF003C] border border-red-500/40 px-1 py-0.2 text-[8px] font-bold rounded">
                {stats.criticalCount || 0} CRITICAL
              </span>
            </div>

            {/* ESA WorldCover 10m */}
            <div 
              onClick={() => toggleLayer('worldcover')}
              className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-slate-800/60 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                {layers.worldcover ? (
                  <CheckSquare className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                )}
                <span className={`text-[10px] ${layers.worldcover ? 'text-slate-200 font-semibold' : 'text-slate-400'}`}>
                  ESA WorldCover 10m
                </span>
              </div>
              <span className={`border px-1 py-0.2 text-[8px] font-bold rounded ${
                layers.worldcover
                  ? 'bg-green-500/20 text-[#22C55E] border-green-500/40'
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}>
                {layers.worldcover ? 'ACTIVE' : 'OFF'}
              </span>
            </div>

            {/* Population Density Buffer */}
            <div 
              onClick={() => toggleLayer('buffer')}
              className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-slate-800/60 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                {layers.buffer ? (
                  <CheckSquare className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                )}
                <span className={`text-[10px] ${layers.buffer ? 'text-slate-200 font-semibold' : 'text-slate-400'}`}>
                  Population Density Buffer
                </span>
              </div>
              <span className="text-slate-400 text-[10px] font-mono">5 KM</span>
            </div>

            {/* Cloud Mask Filter */}
            <div 
              onClick={() => toggleLayer('cloudmask')}
              className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-slate-800/60 cursor-pointer transition-colors opacity-75"
            >
              <div className="flex items-center gap-2">
                {layers.cloudmask ? (
                  <CheckSquare className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                )}
                <span className={`text-[10px] ${layers.cloudmask ? 'text-slate-200' : 'text-slate-400'}`}>
                  Cloud Mask Filter (S2 L2A)
                </span>
              </div>
              <span className="text-slate-500 text-[10px] font-mono">
                {layers.cloudmask ? 'ENGAGED' : 'OFF'}
              </span>
            </div>

            {/* WRI Power Plants (India) */}
            <div 
              onClick={() => toggleLayer('wriPlants')}
              className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-slate-800/60 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                {layers.wriPlants ? (
                  <CheckSquare className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                )}
                <span className={`text-[10px] ${layers.wriPlants ? 'text-slate-200 font-semibold' : 'text-slate-400'}`}>
                  WRI Power Plants (India)
                </span>
              </div>
              <span className="text-amber-400 text-[10px] font-bold font-mono">{wriCount}</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. CLASSIFICATION MIX (100% Dynamic from real backend) */}
      <div className="p-3 border-b border-cyan-500/10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CLASSIFICATION MIX</h3>
          <span className="text-cyan-400 text-[10px] font-bold font-mono">{totalCount} DETECTIONS</span>
        </div>

        {/* Dynamic 5-category stacked progress bar from PPT */}
        <div className="w-full h-1.5 bg-slate-800 rounded-sm overflow-hidden flex my-2 border border-slate-700/50">
          <div style={{ width: `${wildfirePct}%` }} className="bg-[#15803D] h-full transition-all" title={`Wild Fire (${wildfirePct}%)`} />
          <div style={{ width: `${industrialPct}%` }} className="bg-[#F59E0B] h-full transition-all" title={`Industrial Fire (${industrialPct}%)`} />
          <div style={{ width: `${flarePct}%` }} className="bg-[#00F0FF] h-full transition-all" title={`Gas Flare (${flarePct}%)`} />
          <div style={{ width: `${agriculturePct}%` }} className="bg-[#22C55E] h-full transition-all" title={`Agriculture Fire (${agriculturePct}%)`} />
          <div style={{ width: `${miningPct}%` }} className="bg-[#A855F7] h-full transition-all" title={`Mining Activity (${miningPct}%)`} />
        </div>
        
        <div className="space-y-1.5 mt-2.5">
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#15803D] shrink-0" />
              <span className="text-slate-300">Wild Fire</span>
            </div>
            <span className="text-slate-300 font-mono">{wildfireCount} ({wildfirePct}%)</span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#F59E0B] shrink-0" />
              <span className="text-slate-300">Industrial Fire</span>
            </div>
            <span className="text-slate-300 font-mono">{industrialCount} ({industrialPct}%)</span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#00F0FF] shrink-0" />
              <span className="text-slate-300">Gas Flare</span>
            </div>
            <span className="text-slate-300 font-mono">{flareCount} ({flarePct}%)</span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#22C55E] shrink-0" />
              <span className="text-slate-300">Agriculture Fire</span>
            </div>
            <span className="text-slate-300 font-mono">{agricultureCount} ({agriculturePct}%)</span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#A855F7] shrink-0" />
              <span className="text-slate-300">Mining Activity</span>
            </div>
            <span className="text-slate-300 font-mono">{miningCount} ({miningPct}%)</span>
          </div>
        </div>
      </div>

      {/* 3. ACTIVE TARGET DOSSIER (100% Dynamic from selectedTarget) */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Dossier Header */}
          <div className="flex items-center justify-between pb-2 border-b border-cyan-500/10">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#00F0FF] inline-block" />
              <h3 className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">ACTIVE TARGET DOSSIER</h3>
            </div>
            <span className={`text-white text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider ${
              selectedTarget?.severity_status?.includes('CRITICAL') ? 'bg-[#FF003C]' : 'bg-amber-600'
            }`}>
              {selectedTarget?.severity_status || 'STANDBY'}
            </span>
          </div>

          {/* Quick Target Switcher & Selector */}
          <div className="mt-2 flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevTarget}
              title="Previous Hotspot"
              className="px-2 py-1 bg-[#181C26] hover:bg-slate-800 active:bg-cyan-950 border border-slate-700 hover:border-cyan-500/50 rounded text-slate-400 hover:text-cyan-400 text-[8.5px] font-bold shrink-0 transition-colors cursor-pointer"
            >
              ◀ PREV
            </button>
            <select
              value={selectedTarget?.id || ''}
              onChange={(e) => {
                const found = anomalies.find((a) => a.id === e.target.value);
                if (found) setSelectedTarget(found);
              }}
              aria-label="Select Hotspot Target"
              className="flex-1 min-w-0 bg-[#0A0F1A] border border-cyan-500/30 rounded px-1.5 py-1 text-[9px] text-cyan-300 font-mono focus:outline-none focus:border-cyan-400 truncate cursor-pointer"
            >
              {!selectedTarget && <option value="">SELECT HOTSPOT ({anomalies.length})...</option>}
              {anomalies.slice(0, 200).map((a) => (
                <option key={a.id} value={a.id} className="bg-[#12151C] text-slate-200">
                  #{a.id} {a.name || a.category} ({a.frp_radiance} MW)
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleNextTarget}
              title="Next Hotspot"
              className="px-2 py-1 bg-[#181C26] hover:bg-slate-800 active:bg-cyan-950 border border-slate-700 hover:border-cyan-500/50 rounded text-slate-400 hover:text-cyan-400 text-[8.5px] font-bold shrink-0 transition-colors cursor-pointer"
            >
              NEXT ▶
            </button>
          </div>
          
          {selectedTarget ? (
            <div className="mt-2.5 space-y-2.5">
              {/* Target Name & Coords */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-white tracking-wide">{selectedTarget.name}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">
                    LAT {selectedTarget.latitude?.toFixed(4)}°N, LON {selectedTarget.longitude?.toFixed(4)}°E | {selectedTarget.region}
                  </div>
                </div>
                <div className="text-amber-400 text-[10px] font-bold font-mono">#{selectedTarget.id}</div>
              </div>

              {/* Government Data Cross-Validation Badge */}
              {(selectedTarget.wri_verified || selectedTarget.coal_verified || selectedTarget.cea_validated) && (
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/40 px-2 py-1.5 rounded">
                  <CheckSquare size={12} className="text-amber-400 shrink-0" />
                  <div className="flex-1">
                    <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                      {selectedTarget.coal_verified ? 'Coal Mine Verified' : selectedTarget.wri_verified ? 'WRI Verified' : 'CEA Verified'}
                    </span>
                    <span className="text-[9px] text-slate-300 ml-1.5">
                      {selectedTarget.coal_verified
                        ? `${selectedTarget.coal_type || ''} · ${selectedTarget.coal_owner || ''}`
                        : selectedTarget.wri_verified
                        ? `${selectedTarget.wri_fuel_type || ''} · ${selectedTarget.wri_capacity_mw?.toLocaleString() || ''} MW`
                        : `${selectedTarget.cea_fuel_type || ''} · ${selectedTarget.cea_capacity_mw?.toLocaleString() || ''} MW`}
                    </span>
                  </div>
                </div>
              )}

              {/* FRP & SWIR B12 Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#181C26]/70 border border-blue-900/50 p-2 rounded">
                  <div className="text-[8px] text-slate-400 uppercase tracking-wider">FRP RADIATIVE:</div>
                  <div className="text-xs text-cyan-400 font-bold mt-0.5 font-mono">
                    {selectedTarget.frp_radiance?.toLocaleString()} MW
                  </div>
                </div>
                <div className="bg-[#181C26]/70 border border-blue-900/50 p-2 rounded">
                  <div className="text-[8px] text-slate-400 uppercase tracking-wider">
                    {selectedTarget.avg_brightness ? 'AVG BRIGHTNESS:' : 'CONFIDENCE:'}
                  </div>
                  <div className="text-xs text-[#22C55E] font-bold mt-0.5 font-mono">
                    {selectedTarget.avg_brightness ? `${selectedTarget.avg_brightness} K` : `${selectedTarget.confidence}%`}
                  </div>
                </div>
              </div>

              {/* Persistence History */}
              <div className="bg-[#181C26]/40 border border-slate-800 p-2 rounded">
                <div className="text-[8px] text-slate-400 uppercase tracking-wider mb-1">PERSISTENCE HISTORY:</div>
                <div className="text-[9px] text-slate-300 leading-tight">
                  {selectedTarget.threat_summary}
                </div>
              </div>

              {/* Proximity Threat Buffer Alert */}
              <div className="bg-red-950/20 border border-[#FF003C]/40 p-2.5 rounded">
                <div className="flex items-center gap-1.5 mb-1 text-[#FF003C]">
                  <AlertTriangle size={12} className="animate-pulse" />
                  <span className="text-[9px] font-bold tracking-wider uppercase">PROXIMITY THREAT BUFFER:</span>
                </div>
                <p className="text-[8.5px] text-slate-300 leading-relaxed">
                  Perimeter thermal envelope of {selectedTarget.name || `#${selectedTarget.id}`} is actively monitored.
                  {selectedTarget.ai_prediction ? ` AI indicates: ${selectedTarget.ai_prediction}.` : ' Early warning mitigation flag active.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-[10px]">
              CLICK A HOTSPOT ON THE MAP CANVAS TO LOAD TARGET DOSSIER
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-cyan-500/10 flex gap-2">
          <button 
            onClick={handleCopyCoordinates}
            className={`flex-1 py-1.5 px-2 text-[10px] font-bold uppercase transition-all border flex items-center justify-center gap-1.5 ${
              taskingEngaged
                ? 'bg-green-500/20 border-green-500 text-green-400'
                : 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20'
            }`}
          >
            <Crosshair size={12} />
            {taskingEngaged ? 'COPIED' : 'COPY COORDINATES'}
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex-1 py-1.5 px-2 text-[10px] font-bold uppercase border border-slate-700 hover:border-slate-500 bg-[#181C26] text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5"
          >
            <Download size={12} />
            EXPORT RAW CSV
          </button>
        </div>

      </div>

    </div>
  );
}