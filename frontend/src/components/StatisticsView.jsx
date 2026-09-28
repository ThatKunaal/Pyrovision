import { useState, useMemo } from 'react';
import { RefreshCw, Filter, Download } from 'lucide-react';

export default function StatisticsView({ anomalies = [], stats = {}, setSelectedTarget, setActiveTab, refetch }) {
  const [filterText, setFilterText] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Dynamic DEFCON Level based on criticalCount
  const criticalCount = stats.criticalCount || 0;
  const defconLevel = criticalCount >= 5 ? 'DEFCON-1' : criticalCount >= 1 ? 'DEFCON-2' : (stats.total || 0) > 0 ? 'DEFCON-3' : 'DEFCON-4';
  const defconNum = criticalCount >= 5 ? 1 : criticalCount >= 1 ? 2 : (stats.total || 0) > 0 ? 3 : 4;
  const defconColor = defconNum === 1 ? 'text-[#FF003C] border-[#FF003C]/50 bg-[#FF003C]/20' :
                      defconNum === 2 ? 'text-red-400 border-red-500/50 bg-red-500/20' :
                      defconNum === 3 ? 'text-amber-400 border-amber-500/50 bg-amber-500/20' :
                      'text-green-400 border-green-500/50 bg-green-500/20';

  // Dynamic Radiative Load % (relative to national 25,000 MW operational ceiling)
  const totalFrp = stats.totalFrp || 0;
  const loadPercentage = Math.min(100, Math.max(5, Math.round((totalFrp / 25000) * 100)));
  const loadPeakLabel = loadPercentage > 75 ? 'PEAK' : loadPercentage > 45 ? 'ELEVATED' : 'NOMINAL';

  // Real 5-bin FRP distribution histogram computed from anomalies
  const frpBins = useMemo(() => {
    const bins = [
      { label: '0-500', count: 0 },
      { label: '500-1k', count: 0 },
      { label: '1k-2.5k', count: 0 },
      { label: '2.5k-5k', count: 0 },
      { label: '>5k', count: 0 },
    ];
    anomalies.forEach((a) => {
      const frp = Number(a.frp_radiance ?? a.max_frp ?? a.avg_frp ?? 0);
      if (frp <= 500) bins[0].count++;
      else if (frp <= 1000) bins[1].count++;
      else if (frp <= 2500) bins[2].count++;
      else if (frp <= 5000) bins[3].count++;
      else bins[4].count++;
    });
    const max = Math.max(...bins.map((b) => b.count), 1);
    return bins.map((b) => ({
      ...b,
      heightPct: Math.max(8, Math.round((b.count / max) * 100)),
    }));
  }, [anomalies]);

  // Find top regional sector from data
  const topRegion = useMemo(() => {
    if (!anomalies.length) return 'NATIONAL SECTOR';
    const counts = {};
    anomalies.forEach((a) => {
      const r = a.region || 'CENTRAL BASIN';
      counts[r] = (counts[r] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? sorted[0][0].toUpperCase() : 'NATIONAL SECTOR';
  }, [anomalies]);

  // Filter anomalies for data table
  const filteredAnomalies = useMemo(() => {
    if (!filterText.trim()) return anomalies;
    const q = filterText.toLowerCase();
    return anomalies.filter((a) => {
      const id = String(a.id || '').toLowerCase();
      const name = String(a.name || a.facility_name || '').toLowerCase();
      const cat = String(a.category || '').toLowerCase();
      const reg = String(a.region || '').toLowerCase();
      return id.includes(q) || name.includes(q) || cat.includes(q) || reg.includes(q);
    });
  }, [anomalies, filterText]);

  // Handle live CSV export
  const handleExportCSV = () => {
    if (!filteredAnomalies.length) return;
    const header = ['ID', 'NAME', 'LATITUDE', 'LONGITUDE', 'CATEGORY', 'FRP_MW', 'CONFIDENCE', 'SEVERITY', 'REGION'];
    const rows = filteredAnomalies.map((a) => [
      a.id,
      `"${(a.name || a.facility_name || '').replace(/"/g, '""')}"`,
      a.latitude ?? a.lat ?? 0,
      a.longitude ?? a.lon ?? 0,
      `"${a.category || ''}"`,
      a.frp_radiance ?? a.max_frp ?? 0,
      a.confidence ?? 0,
      `"${a.severity_status || ''}"`,
      `"${a.region || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PYROVISION_TELEMETRY_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSync = async () => {
    if (refetch) {
      setIsSyncing(true);
      try {
        await refetch();
      } finally {
        setTimeout(() => setIsSyncing(false), 600);
      }
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.toUpperCase()) {
      case 'WILD FIRE':
        return 'bg-[#15803D]';
      case 'INDUSTRIAL FIRE':
        return 'bg-[#F59E0B]';
      case 'GAS FLARE':
        return 'bg-[#00F0FF]';
      case 'AGRICULTURE FIRE':
        return 'bg-[#22C55E]';
      case 'MINING ACTIVITY':
        return 'bg-[#A855F7]';
      default:
        return 'bg-slate-500';
    }
  };

  const getCategoryBadgeColor = (category) => {
    switch (category?.toUpperCase()) {
      case 'WILD FIRE':
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-600/50';
      case 'INDUSTRIAL FIRE':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'GAS FLARE':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50';
      case 'AGRICULTURE FIRE':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'MINING ACTIVITY':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const toDMS = (coord) => {
    const absolute = Math.abs(coord);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = Math.floor((minutesNotTruncated - minutes) * 60);
    return `${degrees}°${minutes}'${seconds}"`;
  };

  const formatCoord = (lat, lon) => {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    return `${toDMS(lat)}${latDir}, ${toDMS(lon)}${lonDir}`;
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 font-mono select-none">
      {/* Header Section */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold text-white uppercase">STATISTICS & TACTICAL TELEMETRY ANALYTICS</h1>
          <span className="bg-green-500/20 text-green-400 text-[9px] px-2 py-0.5 rounded animate-pulse-glow uppercase">
            LIVE TELEMETRY STREAM
          </span>
        </div>
        <p className="text-[9px] text-slate-500 mt-1 uppercase">
          SYNCHRONIZED SATELLITE RADIATIVE INVENTORY • NATIONAL DEFENSE RECONNAISSANCE GRID
        </p>

        <div className="flex items-center gap-6 mt-2 flex-wrap">
          <div className="text-[10px] uppercase">
            <span className="text-slate-400">CUMULATIVE DETECTIONS: </span>
            <span className="text-cyan-400 font-bold">{stats.total || anomalies.length || 0}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] uppercase">
            <span className="text-slate-400">THREAT CONVEX: </span>
            <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${defconColor}`}>{defconLevel}</span>
          </div>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="tactical-btn flex items-center gap-1.5 text-[10px] px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/40 rounded uppercase transition-colors"
          >
            <RefreshCw size={10} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'SYNCING...' : 'SYNC NOW'}
          </button>
        </div>
      </div>

      {/* 4 Gauge Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Gauge 01 // THREAT INDEX */}
        <div className="bg-[#181C26]/60 border border-blue-900/40 rounded p-3 flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-2">
            <span className="text-[9px] text-slate-500 uppercase">GAUGE 01 //</span>
            <span className={`px-2 py-0.5 rounded text-[8px] border font-bold uppercase ${defconColor}`}>
              {defconLevel}
            </span>
          </div>
          <div className="relative w-24 h-12 flex justify-center overflow-hidden">
            <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke={defconNum === 1 ? '#FF003C' : defconNum === 2 ? '#F59E0B' : '#00F0FF'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="126"
                strokeDashoffset={126 - (126 * (5 - defconNum)) / 4}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute bottom-0 text-xl font-bold text-white">{defconNum}</div>
          </div>
          <div className="text-[10px] text-slate-400 mt-2 uppercase">THREAT INDEX</div>
        </div>

        {/* Gauge 02 // RADIATIVE LOAD */}
        <div className="bg-[#181C26]/60 border border-blue-900/40 rounded p-3 flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-2">
            <span className="text-[9px] text-slate-500 uppercase">GAUGE 02 //</span>
            <div className="flex gap-1">
              <span className="bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 px-1 py-0.5 rounded text-[8px]">
                {loadPercentage}%
              </span>
              <span className="bg-amber-500/20 border border-amber-500/50 text-amber-400 px-1 py-0.5 rounded text-[8px]">
                {loadPeakLabel}
              </span>
            </div>
          </div>
          <div className="relative w-24 h-12 flex justify-center overflow-hidden">
            <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="126"
                strokeDashoffset={126 - (126 * loadPercentage) / 100}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute bottom-0 text-xl font-bold text-white">{loadPercentage}%</div>
          </div>
          <div className="text-[10px] text-slate-400 mt-2 uppercase">RADIATIVE LOAD</div>
        </div>

        {/* Dynamic FRP DISTRIBUTION HISTOGRAM */}
        <div className="bg-[#181C26]/60 border border-blue-900/40 rounded p-3 flex flex-col">
          <div className="w-full flex justify-between items-center mb-2">
            <span className="text-[9px] text-slate-400 uppercase font-bold">FRP DISTRIBUTION HISTOGRAM</span>
            <span className="bg-slate-700/50 text-slate-300 px-1 py-0.5 rounded text-[8px] uppercase">REAL BINS</span>
          </div>
          <div className="flex-1 flex items-end justify-between gap-1 mt-2 h-16 border-b border-slate-700">
            {frpBins.map((bin, i) => (
              <div key={i} className="w-full flex flex-col items-center group">
                <span className="text-[8px] text-cyan-400 opacity-0 group-hover:opacity-100 mb-1 transition-opacity">
                  {bin.count}
                </span>
                <div
                  className="w-full bg-cyan-400/60 hover:bg-cyan-400 transition-all rounded-t"
                  style={{ height: `${bin.heightPct}%` }}
                ></div>
                <span className="text-[7px] text-slate-500 mt-1 whitespace-nowrap overflow-hidden">
                  {bin.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SATELLITE TELEMETRY SPREAD */}
        <div className="bg-[#181C26]/60 border border-blue-900/40 rounded p-3 flex flex-col">
          <div className="w-full flex justify-between items-center mb-2">
            <span className="text-[9px] text-slate-400 uppercase font-bold">RADIAL FRP TREND</span>
            <span className="bg-slate-700/50 text-slate-300 px-1 py-0.5 rounded text-[8px] uppercase">
              VIIRS 375M
            </span>
          </div>
          <div className="flex-1 w-full relative mt-2">
            <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
              <polygon points="0,40 0,28 15,22 35,32 50,14 70,18 85,8 100,4 100,40" fill="rgba(0,240,255,0.12)" />
              <polyline points="0,28 15,22 35,32 50,14 70,18 85,8 100,4" fill="none" stroke="#00F0FF" strokeWidth="1.5" />
              <circle cx="100" cy="4" r="2.5" fill="#FF003C" className="animate-pulse" />
            </svg>
          </div>
        </div>
      </div>

      {/* Summary Stats Row with Real Computed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-[#202534]/70 border border-red-500/30 rounded p-2 text-[10px] flex items-center justify-center text-center uppercase">
          <span className="text-red-400 font-bold">
            SECTOR: {topRegion} <br />
            MAX FRP: {Math.round(stats.maxFrp || 0)} MW
          </span>
        </div>
        <div className="bg-[#202534]/70 border border-cyan-500/30 rounded p-2 text-[10px] flex items-center justify-center text-center uppercase">
          <span className="text-cyan-400 font-bold">
            TOTAL FRP: {totalFrp.toLocaleString()} MW <br />
            AVG FRP: {Math.round(stats.avgFrp || 0)} MW / SITE
          </span>
        </div>
        <div className="bg-[#202534]/70 border border-amber-500/30 rounded p-2 text-[10px] flex items-center justify-center text-center uppercase">
          <span className="text-amber-400 font-bold">
            CRITICAL ENVELOPE <br />
            {criticalCount} HIGH-PRIORITY RADIATORS
          </span>
        </div>
        <div className="bg-[#202534]/70 border border-slate-700/50 rounded p-2 text-[10px] flex items-center justify-center text-center uppercase">
          <span className="text-slate-400">
            TOTAL DETECTIONS: {anomalies.reduce((acc, cur) => acc + (Number(cur.total_detections) || 1), 0).toLocaleString()} <br />
            LAST SYNC: {new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
          </span>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="mt-4 bg-[#181C26]/80 border border-slate-700/50 rounded flex flex-col">
        <div className="p-3 border-b border-slate-700/50 flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-[11px] font-bold text-white uppercase">
              ACTIVE THERMAL ANOMALY TELEMETRY & TARGET DOSSIER TABLE
            </h2>
            <span className="bg-green-500/20 text-green-400 text-[9px] px-2 py-0.5 rounded border border-green-500/30 uppercase">
              {filteredAnomalies.length} TARGETS
            </span>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-2 top-1.5 text-cyan-500" size={12} />
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="FILTER TARGETS..."
                className="bg-[#12151C] border border-cyan-500/30 rounded px-2 py-1 pl-6 text-[10px] text-cyan-100 focus:outline-none focus:border-cyan-500 uppercase w-48"
              />
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1 bg-[#12151C] border border-slate-600 hover:border-cyan-400 hover:text-cyan-400 rounded px-2.5 py-1 text-[10px] text-slate-300 transition-colors uppercase cursor-pointer"
            >
              <Download size={10} /> EXPORT CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[480px]">
          <table className="w-full text-left border-collapse text-[10px]">
            <thead className="bg-[#12151C] border-b border-slate-700 text-slate-400 sticky top-0 z-10">
              <tr>
                <th className="p-2 font-normal uppercase">TARGET ID</th>
                <th className="p-2 font-normal uppercase">FACILITY / ZONE</th>
                <th className="p-2 font-normal uppercase">COORDINATES (LAT/LON)</th>
                <th className="p-2 font-normal uppercase">CATEGORY</th>
                <th className="p-2 font-normal uppercase text-right">FRP (MW)</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnomalies.length > 0 ? (
                filteredAnomalies.map((anomaly, index) => {
                  const lat = anomaly.latitude ?? anomaly.lat ?? 0;
                  const lon = anomaly.longitude ?? anomaly.lon ?? 0;
                  const frp = Math.round(anomaly.frp_radiance ?? anomaly.max_frp ?? 0);
                  return (
                    <tr
                      key={anomaly.id || index}
                      onClick={() => {
                        if (setSelectedTarget) setSelectedTarget(anomaly);
                        if (setActiveTab) setActiveTab('map');
                      }}
                      title={`Click to inspect #${anomaly.id} on Map & Dossier`}
                      className={`border-b border-slate-800/50 hover:bg-cyan-950/40 cursor-pointer transition-colors ${
                        index % 2 !== 0 ? 'bg-[#202534]/30' : ''
                      }`}
                    >
                      <td className="p-2 flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${getCategoryColor(anomaly.category)}`}></div>
                        <span className="font-bold text-cyan-400 uppercase">#{anomaly.id || `TGT-${index}`}</span>
                      </td>
                      <td className="p-2 text-slate-200 uppercase">{anomaly.name || anomaly.facility_name || 'THERMAL ANOMALY'}</td>
                      <td className="p-2 text-slate-400 font-mono">
                        {lat && lon ? formatCoord(lat, lon) : 'N/A'}
                      </td>
                      <td className="p-2">
                        <span className={`px-2 py-0.5 rounded border text-[8px] uppercase ${getCategoryBadgeColor(anomaly.category)}`}>
                          {anomaly.category || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-cyan-400">
                        {frp ? `${frp.toLocaleString()} MW` : '--'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500 uppercase">
                    NO ACTIVE HOTSPOTS MATCH "{filterText}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
