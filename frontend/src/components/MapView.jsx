import { useState, useMemo, useEffect } from 'react';
import TacticalMap from './TacticalMap';
import DossierPanel from './DossierPanel';
import { Clock } from 'lucide-react';

export default function MapView({
  anomalies = [],
  selectedTarget,
  setSelectedTarget,
  stats = {},
  searchLocation,
  layers = {
    firms: true,
    industrial: true,
    risk: true,
    worldcover: true,
    buffer: true,
    cloudmask: false,
    wriPlants: true,
  },
  toggleLayer = () => {},
}) {
  const [dayFilter, setDayFilter] = useState(24); // default 24 hours
  const [filterBaseTime] = useState(() => Date.now());

  // Filter anomalies based on selected time window (24h, 3 days, 5 days, All)
  const filteredAnomalies = useMemo(() => {
    if (!anomalies?.length) return [];
    if (dayFilter === 'ALL') return anomalies;

    const validTimes = anomalies
      .map((a) => {
        const raw = a.timestamp || a.acq_date || a.last_detected || a.created_at || a.date;
        if (!raw) return null;
        const t = new Date(raw).getTime();
        return isNaN(t) ? null : t;
      })
      .filter((t) => t !== null);

    if (validTimes.length === 0) return anomalies;

    const maxTime = Math.max(...validTimes);
    const referenceTime = filterBaseTime - maxTime < 30 * 24 * 60 * 60 * 1000 && filterBaseTime >= maxTime ? filterBaseTime : maxTime;

    const cutoff = referenceTime - dayFilter * 60 * 60 * 1000;
    const result = anomalies.filter((a) => {
      const raw = a.timestamp || a.acq_date || a.last_detected || a.created_at || a.date;
      if (!raw) return true;
      const t = new Date(raw).getTime();
      return isNaN(t) ? true : t >= cutoff;
    });

    return result.length > 0 ? result : anomalies;
  }, [anomalies, dayFilter, filterBaseTime]);

  // Synchronize selected target with currently filtered anomalies
  useEffect(() => {
    if (filteredAnomalies.length > 0) {
      if (!selectedTarget || !filteredAnomalies.some((a) => a.id === selectedTarget.id)) {
        setSelectedTarget(filteredAnomalies[0]);
      }
    }
  }, [filteredAnomalies, selectedTarget, setSelectedTarget]);

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#12151C] font-mono">
      {/* Left side: Map Viewport with floating Time Filter */}
      <div className="flex-1 flex flex-col relative h-full">
        {/* Floating Time Filter at top-left of map */}
        <div className="absolute top-2 left-2 z-[1000] flex items-center gap-1.5 bg-[#181C26]/90 border border-cyan-500/40 rounded px-2.5 py-1 shadow-xl backdrop-blur-sm select-none">
          <Clock size={11} className="text-cyan-400" />
          <span className="text-cyan-400 font-bold tracking-wider text-[9px]">TIME:</span>
          <select
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="bg-transparent text-slate-200 text-[10px] font-mono font-semibold focus:outline-none cursor-pointer"
          >
            <option value={24} className="bg-[#181C26] text-slate-200">24h</option>
            <option value={72} className="bg-[#181C26] text-slate-200">3 Days</option>
            <option value={120} className="bg-[#181C26] text-slate-200">5 Days</option>
            <option value="ALL" className="bg-[#181C26] text-slate-200">All</option>
          </select>
          <span className="text-cyan-400/80 font-mono text-[9px] border-l border-slate-700 pl-1.5 ml-0.5">
            {filteredAnomalies.length}
          </span>
        </div>

        {/* Viewport: Full Tactical Leaflet Map without top telemetry bar */}
        <div className="flex-1 w-full h-full">
          <TacticalMap
            anomalies={filteredAnomalies}
            selectedTarget={selectedTarget}
            setSelectedTarget={setSelectedTarget}
            searchLocation={searchLocation}
            layers={layers}
            showPowerPlants={layers.wriPlants}
          />
        </div>
      </div>

      {/* Right side: Dossier Panel */}
      <DossierPanel
        anomalies={filteredAnomalies}
        selectedTarget={selectedTarget}
        setSelectedTarget={setSelectedTarget}
        stats={stats}
        layers={layers}
        toggleLayer={toggleLayer}
      />
    </div>
  );
}