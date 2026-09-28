import { useState, useEffect, useRef } from 'react';
import { 
  Map, 
  BarChart3, 
  Layers, 
  Crosshair, 
  GitBranch, 
  Shield,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, stats, loading, error, lastFetchedAt, realtimeStatus, layers = {} }) => {
  // Sliding drawer open/collapsed state
  const [isOpen, setIsOpen] = useState(true);

  const handleToggle = () => {
    setIsOpen((prev) => {
      const next = !prev;
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 320);
      return next;
    });
  };

  // Dropdown state for navigation menu
  const [isNavOpen, setIsNavOpen] = useState(false);
  const navDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navDropdownRef.current && !navDropdownRef.current.contains(e.target)) {
        setIsNavOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ticking "time ago" clock so the last-updated label stays fresh without
  // needing a new fetch — re-renders every 5s.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);

  const timeAgo = (date) => {
    if (!date) return 'NEVER';
    const secs = Math.floor((now - date.getTime()) / 1000);
    if (secs < 5) return 'JUST NOW';
    if (secs < 60) return `${secs}S AGO`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}M AGO`;
    return `${Math.floor(mins / 60)}H AGO`;
  };

  // Real backend connection status
  const backendOk = !error && !loading;
  const backendLabel = error ? 'ERROR' : loading ? 'SYNCING...' : `${timeAgo(lastFetchedAt)}`;
  const backendDot = error ? 'bg-red-500' : loading ? 'bg-amber-400' : 'bg-green-500';
  const backendText = error ? 'text-red-400' : loading ? 'text-amber-400' : 'text-green-400';

  // Real WebSocket subscription state from Supabase realtime channel.
  const rtIsLive = realtimeStatus === 'SUBSCRIBED';
  const rtIsError = realtimeStatus === 'CHANNEL_ERROR' || realtimeStatus === 'TIMED_OUT' || realtimeStatus === 'CLOSED';
  const rtLabel = rtIsLive ? 'LIVE SYNC' : rtIsError ? 'DISCONNECTED' : 'CONNECTING...';
  const rtDot = rtIsLive ? 'bg-green-500' : rtIsError ? 'bg-red-500' : 'bg-amber-400';
  const rtText = rtIsLive ? 'text-green-400' : rtIsError ? 'text-red-400' : 'text-amber-400';

  // FIRMS-derived hotspot count — real, from stats.total.
  const firmsHasData = (stats?.total || 0) > 0;
  const firmsLabel = firmsHasData ? `${stats.total} DETECTED` : 'NO DATA';
  const firmsDot = firmsHasData ? 'bg-green-500' : 'bg-slate-500';
  const firmsText = firmsHasData ? 'text-green-400' : 'text-slate-500';

  // ESA WorldCover — tied to the real layer toggle in the map
  const worldcoverOn = Boolean(layers.worldcover);
  const wcLabel = worldcoverOn ? 'ACTIVE' : 'OFF';
  const wcDot = worldcoverOn ? 'bg-green-500' : 'bg-slate-500';
  const wcText = worldcoverOn ? 'text-green-400' : 'text-slate-500';

  const allNominal = backendOk && rtIsLive && firmsHasData;

  const activeLayersCount = Object.values(layers).filter(Boolean).length;
  const totalLayersCount = Object.keys(layers).length || 7;

  const tabs = [
    { id: 'map', icon: Map, label: 'MAP VIEW', desc: 'LIVE CARTOGRAPHY & TARGETS', badge: 'ACTIVE', badgeColor: 'green' },
    { id: 'statistics', icon: BarChart3, label: 'STATISTICS', desc: 'DISTRIBUTION & SATELLITE KPIS', badge: '4 CHARTS', badgeColor: 'slate' },
    { id: 'layers', icon: Layers, label: 'LAYERS', desc: 'FIRMS, OSM & WORLDCOVER 10M', badge: `${activeLayersCount}/${totalLayersCount} ACTIVE`, badgeColor: 'cyan' },
    { id: 'thermal-hunt', icon: Crosshair, label: 'THERMAL HUNT', desc: 'GEO-TRANSFORMER MODEL', badge: 'AI/ML SEARCH', badgeColor: 'cyan' },
    { id: 'pipeline', icon: GitBranch, label: 'PIPELINE INFO', desc: 'INGEST DAEMONS & ETL QUEUES', badge: null },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];
  const CurrentIcon = currentTab.icon;

  return (
    <aside
      style={{
        width: '260px',
        marginLeft: isOpen ? '0px' : '-260px',
        transition: 'margin-left 350ms cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'margin-left',
      }}
      className="relative h-full bg-[#12151C] border-r border-cyan-500/20 flex flex-col font-mono shrink-0 z-30 select-none"
    >
      {/* Sliding Drawer Toggle Handle (Glides continuously on the right edge) */}
      <button
        type="button"
        onClick={handleToggle}
        className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-full z-50 flex items-center justify-center w-5 h-14 bg-[#181C26] border border-l-0 border-cyan-500/50 hover:border-cyan-300 text-cyan-400 rounded-r shadow-[4px_0_15px_rgba(0,240,255,0.25)] transition-colors hover:bg-cyan-950/90 cursor-pointer group"
        title={isOpen ? 'Collapse Panel (Slide Left)' : 'Expand Panel (Slide Right)'}
      >
        <div className="transition-transform duration-200">
          {isOpen ? (
            <ChevronLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
          ) : (
            <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          )}
        </div>
      </button>

      {/* Internal scrollable content - constant width, no squishing, no reflow */}
      <div className="w-[260px] h-full flex flex-col overflow-y-auto overflow-x-hidden">
      {/* 1. Header Block */}
      <div className="p-3 border-b border-blue-900/40 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-700 border border-cyan-500/30 flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-cyan-400" />
        </div>
        <div className="flex flex-col">
          <div className="text-[11px] font-bold text-cyan-400">NTRO // GOI :: GEO-INT LABS</div>
          <div className="text-[9px] text-slate-400">TECH RES ORG :: DEFENSE GIS</div>
          <div className="flex items-center gap-1 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-glow" />
            <div className="text-[9px] text-green-400">GRID: WGS-84 UTM-GRID SYNC</div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Module Dropdown */}
      <div className="p-3 border-b border-blue-900/40 relative" ref={navDropdownRef}>
        <div className="text-[10px] text-slate-400 mb-1.5">NAVIGATION MODULE:</div>
        
        {/* Dropdown Trigger Button */}
        <button
          onClick={() => setIsNavOpen(!isNavOpen)}
          className="w-full flex items-center justify-between p-2 rounded bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <CurrentIcon className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-[11px] font-bold text-white">{currentTab.label}</div>
              <div className="text-[8px] text-slate-400">{currentTab.desc}</div>
            </div>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isNavOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu Options */}
        {isNavOpen && (
          <div className="absolute left-3 right-3 top-[calc(100%-8px)] z-50 bg-[#181C26] border border-cyan-500/40 rounded shadow-xl overflow-hidden divide-y divide-slate-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsNavOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 hover:bg-slate-800/60 transition-colors text-left ${
                    isActive ? 'bg-cyan-950/40 border-l-2 border-cyan-400' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <div>
                      <div className={`text-[10px] font-bold ${isActive ? 'text-cyan-400' : 'text-slate-200'}`}>
                        {tab.label}
                      </div>
                      <div className="text-[8px] text-slate-500">{tab.desc}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {tab.badge && (
                      <span className={`text-[7px] px-1 py-0.2 rounded border font-mono ${
                        tab.badgeColor === 'green' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                        tab.badgeColor === 'cyan' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' :
                        'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                    {isActive && <Check className="w-3 h-3 text-cyan-400 ml-1" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Tactical Threat Tiers */}
      <div className="p-3 border-b border-blue-900/40">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] text-slate-400">TACTICAL THREAT TIERS</div>
          <div className="bg-red-500/20 text-red-400 border border-red-500/30 text-[8px] px-1.5 py-0.5 rounded animate-pulse-glow">
            CRITICAL ENVELOPE
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-[#FF003C]" />
              <div className="text-[10px] text-slate-300">CRITICAL HOTSPOTS (&gt;2,000 MW)</div>
            </div>
            <div className="text-[10px] text-[#FF003C] font-bold font-mono">{stats?.criticalCount || 0}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-[#F59E0B]" />
              <div className="text-[10px] text-slate-300">INDUSTRIAL CLUSTERS</div>
            </div>
            <div className="text-[10px] text-amber-400 font-bold font-mono">{stats?.industrialCount || 0}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-[#22C55E]" />
              <div className="text-[10px] text-slate-300">FOREST CANOPY BUFFER BREACHES</div>
            </div>
            <div className="text-[10px] text-[#22C55E] font-bold font-mono">{stats?.forestBreachCount || 0} FLAGS</div>
          </div>
        </div>
      </div>

      {/* 4. Sensor Ingestion Matrix */}
      <div className="p-3 border-t border-blue-900/40">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] text-slate-400">SENSOR INGESTION MATRIX</div>
          <div className={`text-[8px] px-1.5 py-0.5 rounded border ${
            allNominal
              ? 'bg-green-500/20 text-green-400 border-green-500/30'
              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
          }`}>
            {allNominal ? 'ALL NOMINAL' : 'CHECK STATUS'}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#222838]/50 border border-blue-900/40 rounded p-2">
            <div className="text-[9px] text-slate-300 mb-1">SUPABASE BACKEND</div>
            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${backendDot}`} />
              <div className={`text-[9px] ${backendText}`}>{backendLabel}</div>
            </div>
          </div>
          <div className="bg-[#222838]/50 border border-blue-900/40 rounded p-2">
            <div className="text-[9px] text-slate-300 mb-1">REALTIME WS SYNC</div>
            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${rtDot}`} />
              <div className={`text-[9px] ${rtText}`}>{rtLabel}</div>
            </div>
          </div>
          <div className="bg-[#222838]/50 border border-blue-900/40 rounded p-2">
            <div className="text-[9px] text-slate-300 mb-1">NASA FIRMS FEED</div>
            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${firmsDot}`} />
              <div className={`text-[9px] ${firmsText}`}>{firmsLabel}</div>
            </div>
          </div>
          <div className="bg-[#222838]/50 border border-blue-900/40 rounded p-2">
            <div className="text-[9px] text-slate-300 mb-1">ESA WORLDCOVER 10M</div>
            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${wcDot}`} />
              <div className={`text-[9px] ${wcText}`}>{wcLabel}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Data Ingestion Stream */}
      <div className="mt-auto p-3 border-t border-blue-900/40 bg-[#202534]/50">
        <div className="text-[9px] text-slate-500 mb-1">DATA INGESTION STREAM:</div>
        <div className="text-[9px] text-cyan-400 font-medium">
          SUPABASE + NASA FIRMS + ESA WORLDCOVER :: {rtIsLive ? 'LIVE' : rtLabel.toUpperCase()}
        </div>
      </div>
      </div>
    </aside>
  );
};

export default Sidebar;