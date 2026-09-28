import { useState, useEffect, useRef } from 'react';
import { Search, AlertTriangle, FileDown, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const TopHeader = ({ anomalies, stats, onSearchLocation, onSelectAnomaly }) => {
  const [time, setTime] = useState(new Date());
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Two search modes based on what's typed:
  // - Looks like an ID (letters/digits/dashes, e.g. "TH-3816", "3816", "th-3")
  //   -> search hotspot IDs in the live anomalies list (instant, case-insensitive, no network call).
  // - Anything else (3+ chars) -> debounced place search via Nominatim.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (!trimmed) {
      debounceRef.current = setTimeout(() => {
        setSuggestions([]);
        setShowDropdown(false);
        setSearching(false);
      }, 0);
      return () => clearTimeout(debounceRef.current);
    }

    const isIdLike = trimmed.length > 0 && /^[A-Za-z0-9-]+$/.test(trimmed) && /\d/.test(trimmed);

    debounceRef.current = setTimeout(async () => {
      if (isIdLike) {
        const needle = trimmed.toLowerCase();
        const matches = (anomalies || [])
          .filter((a) => String(a.id).toLowerCase().includes(needle))
          .slice(0, 6)
          .map((a) => ({ type: 'anomaly', anomaly: a }));
        setSuggestions(matches);
        setShowDropdown(matches.length > 0);
        setSearching(false);
        return;
      }

      if (trimmed.length < 3) {
        setSuggestions([]);
        setShowDropdown(false);
        setSearching(false);
        return;
      }

      setSearching(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          trimmed
        )}&limit=6&countrycodes=in`;
        const res = await fetch(url);
        const data = await res.json();
        setSuggestions(data.map((place) => ({ type: 'place', place })));
        setShowDropdown(true);
      } catch (err) {
        console.error('Location search failed:', err);
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, isIdLike ? 50 : 350);

    return () => clearTimeout(debounceRef.current);
  }, [query, anomalies]);

  // Close dropdown when clicking outside the search box.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    if (item.type === 'anomaly') {
      const a = item.anomaly;
      setQuery(String(a.id));
      setShowDropdown(false);
      if (onSelectAnomaly) onSelectAnomaly(a);
      if (onSearchLocation) {
        onSearchLocation({ lat: a.latitude, lon: a.longitude, label: `#${a.id} ${a.name || a.category}` });
      }
      return;
    }

    // type === 'place'
    const place = item.place;
    setQuery(place.display_name.split(',')[0]);
    setShowDropdown(false);
    if (onSearchLocation) {
      onSearchLocation({
        lat: parseFloat(place.lat),
        lon: parseFloat(place.lon),
        label: place.display_name,
      });
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-GB', { hour12: false });
  };

  const formatZulu = (date) => {
    return date.toISOString().substring(11, 19);
  };

  // Real critical count from stats (no more hardcoded "1 ALERT").
  const criticalCount = stats?.criticalCount || 0;
  const hasCritical = criticalCount > 0;
  const totalCount = stats?.total || 0;

  let defconLevel = 'DEFCON-4';
  if (criticalCount >= 5) defconLevel = 'DEFCON-1';
  else if (criticalCount >= 1) defconLevel = 'DEFCON-2';
  else if (totalCount > 0) defconLevel = 'DEFCON-3';

  let defconStyle = 'bg-green-600/30 border-green-500/50 text-green-400';
  if (defconLevel === 'DEFCON-1') defconStyle = 'bg-red-600/30 border-red-500/50 text-red-400';
  else if (defconLevel === 'DEFCON-2') defconStyle = 'bg-orange-600/30 border-orange-500/50 text-orange-400';
  else if (defconLevel === 'DEFCON-3') defconStyle = 'bg-yellow-600/30 border-yellow-500/50 text-yellow-400';

  // Clicking the Early Warning button jumps the map to the single most
  // severe active hotspot (highest FRP among critical ones).
  const handleEarlyWarningClick = () => {
    if (!hasCritical || !anomalies || anomalies.length === 0) return;
    const critical = anomalies
      .filter((a) => a.frp_radiance > 2000 || a.severity_status?.includes('CRITICAL'))
      .sort((a, b) => (b.frp_radiance || 0) - (a.frp_radiance || 0));
    const top = critical[0];
    if (!top) return;
    if (onSelectAnomaly) onSelectAnomaly(top);
    if (onSearchLocation) {
      onSearchLocation({ lat: top.latitude, lon: top.longitude, label: `#${top.id} ${top.name}` });
    }
  };

  // Generates a real downloadable PDF intel report from the live anomalies
  // data — summary stats + a table of every hotspot, sorted by severity.
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const now = new Date();

    doc.setFontSize(16);
    doc.setTextColor(20, 20, 20);
    doc.text('PYROVISION — EARLY WARNING INTELLIGENCE REPORT', 14, 16);

    doc.setFontSize(9);
    doc.setTextColor(120, 60, 0);
    doc.text('TOP SECRET // RESTRICTED - FOR INDIAN EYES ONLY // GOI-INTERNAL', 14, 22);

    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(`Generated: ${now.toLocaleString('en-GB')}`, 14, 29);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(
      `Total Active Hotspots: ${stats?.total || 0}    |    Critical (FRP > 2000 MW): ${criticalCount}    |    Industrial: ${stats?.industrialCount || 0}`,
      14,
      37
    );

    const rows = (anomalies || [])
      .slice()
      .sort((a, b) => (b.frp_radiance || 0) - (a.frp_radiance || 0))
      .slice(0, 200) // cap so the PDF doesn't get enormous on very large datasets
      .map((a) => [
        a.id,
        a.name,
        a.category || 'Unknown',
        a.latitude?.toFixed(3),
        a.longitude?.toFixed(3),
        a.frp_radiance,
        a.severity_status || '',
      ]);

    autoTable(doc, {
      startY: 43,
      head: [['ID', 'Name', 'Category', 'Lat', 'Lon', 'FRP (MW)', 'Severity']],
      body: rows,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [15, 23, 42] },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 6) {
          const val = String(data.cell.raw || '');
          if (val.includes('CRITICAL')) data.cell.styles.textColor = [200, 0, 40];
        }
      },
    });

    doc.save(`PYROVISION_INTEL_REPORT_${now.toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <header className="w-full h-[52px] bg-[#12151C] border-b border-cyan-500/10 flex items-center px-3 gap-3 text-[10px] tracking-wide font-mono shrink-0 select-none">
      {/* 1. PYROVISION Logo block */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className="text-[16px] font-bold text-white tracking-widest leading-none">PYROVISION</span>
          <span className="bg-red-600 text-white text-[9px] px-2 py-0.5 rounded-sm font-semibold leading-none">SEC-OPS // INDIA</span>
        </div>
        <div className="flex flex-col leading-[1]">
          <span className="text-[8px] text-slate-500 uppercase mt-1">NATIONAL THERMAL ANOMALY & EARLY</span>
          <span className="text-[8px] text-slate-500 uppercase">DISASTER WARNING SYSTEM</span>
        </div>
      </div>

      {/* 2. Active Hotspots counter */}
      <div className="border border-cyan-500/30 rounded px-3 py-1.5 flex items-center gap-2 h-8">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
        <div className="flex flex-col leading-[1.1]">
          <span className="text-cyan-400 font-bold text-[11px] uppercase">{stats?.total || 0} ACTIVE</span>
          <span className="text-[9px] text-slate-400 uppercase">HOTSPOTS</span>
        </div>
      </div>

      {/* 3. Search bar */}
      <div ref={wrapperRef} className="relative">
        <div className="flex items-center gap-1 border border-slate-700 rounded px-2 py-1 h-8 bg-[#202534]/50 focus-within:border-cyan-500/50">
          {searching ? (
            <Loader2 size={12} className="text-cyan-400 animate-spin" />
          ) : (
            <Search size={12} className="text-slate-400" />
          )}
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            placeholder="Search location..."
            className="bg-transparent border-none outline-none text-slate-300 w-32 text-[10px] placeholder:text-slate-600"
          />
          <span className="text-[8px] text-slate-500 bg-slate-800 px-1 rounded ml-1">[CTRL+K]</span>
        </div>

        {showDropdown && suggestions.length > 0 && (
          <div className="absolute top-9 left-0 w-64 bg-[#181C26] border border-slate-700 rounded shadow-lg z-[2000] max-h-64 overflow-y-auto">
            {suggestions.map((item) => {
              if (item.type === 'anomaly') {
                const a = item.anomaly;
                return (
                  <button
                    key={`a-${a.id}`}
                    onClick={() => handleSelect(item)}
                    className="w-full text-left px-2.5 py-1.5 text-[10px] text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-300 border-b border-slate-800 last:border-b-0 flex items-center justify-between gap-2"
                  >
                    <span className="truncate">
                      <span className="text-cyan-400 font-bold">#{a.id}</span> {a.name}
                    </span>
                    <span className="text-[8px] text-slate-500 uppercase shrink-0">{a.category || 'UNKNOWN'}</span>
                  </button>
                );
              }
              const place = item.place;
              return (
                <button
                  key={place.place_id}
                  onClick={() => handleSelect(item)}
                  className="w-full text-left px-2.5 py-1.5 text-[10px] text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-300 border-b border-slate-800 last:border-b-0 truncate"
                >
                  {place.display_name}
                </button>
              );
            })}
          </div>
        )}

        {showDropdown && !searching && query.trim().length >= 3 && suggestions.length === 0 && (
          <div className="absolute top-9 left-0 w-64 bg-[#181C26] border border-slate-700 rounded shadow-lg z-[2000] px-2.5 py-1.5 text-[10px] text-slate-500">
            No location found
          </div>
        )}
      </div>

      {/* Spacer — keeps the right-side buttons pushed to the edge */}
      <div className="flex-1" />

      {/* 5. Early Warning Button */}
      <div
        onClick={handleEarlyWarningClick}
        className={`border rounded px-3 py-1.5 flex items-center gap-1.5 h-8 transition-colors ${
          hasCritical
            ? 'border-red-500/50 bg-red-950/20 hover:bg-red-900/40 cursor-pointer animate-blink-alert'
            : 'border-slate-700 bg-slate-900/20 opacity-50 cursor-not-allowed'
        }`}
      >
        <AlertTriangle size={14} className={hasCritical ? 'text-red-400' : 'text-slate-500'} />
        <span className={`font-semibold uppercase ${hasCritical ? 'text-red-400' : 'text-slate-500'}`}>
          EARLY WARNING REPORT
        </span>
        <span className={`ml-1 font-semibold uppercase ${hasCritical ? 'text-red-300' : 'text-slate-500'}`}>
          ({criticalCount} ALERT{criticalCount === 1 ? '' : 'S'})
        </span>
      </div>

      {/* 6. Export Button */}
      <button
        onClick={handleExportPDF}
        disabled={!anomalies || anomalies.length === 0}
        className="tactical-btn flex items-center justify-center gap-1.5 h-8 px-3 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 hover:border-cyan-500/50 hover:bg-cyan-900/20 rounded text-slate-300 hover:text-cyan-300 transition-colors"
      >
        <FileDown size={14} />
        <span className="uppercase font-semibold">EXPORT INTEL PDF</span>
      </button>

      {/* 7. Clock section */}
      <div className="text-right border-l border-slate-700/50 pl-3 flex flex-col justify-center min-w-[140px]">
        <div className="flex items-center justify-end gap-2 mb-0.5">
          <span className="text-cyan-400 text-[10px] whitespace-nowrap uppercase">UTC+5:30 IST /</span>
          <span className={`border px-1.5 rounded text-[9px] font-bold uppercase ${defconStyle}`}>
            {defconLevel}
          </span>
        </div>
        <div className="flex items-center justify-end">
          <span className="text-cyan-100 text-sm font-bold leading-none tracking-widest">{formatTime(time)}</span>
        </div>
        <div className="text-[8px] text-slate-500 uppercase mt-0.5 leading-none">
          {formatZulu(time)} ZULU
        </div>
      </div>
    </header>
  );
};

export default TopHeader;