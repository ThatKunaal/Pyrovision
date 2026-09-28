import React, { useState } from 'react';
import TopHeader from './components/TopHeader';
import Sidebar from './components/Sidebar';
import BottomBar from './components/BottomBar';
import MapView from './components/MapView';
import StatisticsView from './components/StatisticsView';
import LayersView from './components/LayersView';
import ThermalHuntView from './components/ThermalHuntView';
import { useThermalAnomalies } from './hooks/useThermalAnomalies';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PyroVision Runtime Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-[#12151C] text-red-400 font-mono flex flex-col items-center justify-center p-8 select-none">
          <div className="bg-[#181C26] border border-red-500/40 p-6 rounded-lg max-w-xl w-full shadow-2xl">
            <h1 className="text-lg font-bold text-red-500 mb-2 tracking-wider uppercase">
              TACTICAL ENGINE DIAGNOSTIC ERROR
            </h1>
            <p className="text-xs text-slate-300 mb-4 font-mono leading-relaxed">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 text-white text-xs font-bold rounded transition-colors uppercase cursor-pointer"
            >
              RELOAD DASHBOARD
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const PipelineInfo = ({ stats, lastFetchedAt, realtimeStatus }) => (
  <div className="flex flex-col h-full w-full items-center justify-center bg-[#12151C] text-slate-400 gap-4 font-mono select-none">
    <div className="text-xl text-cyan-400 font-bold mb-4 border-b border-cyan-500/30 pb-2 tracking-widest uppercase">
      PIPELINE DIAGNOSTICS & TELEMETRY
    </div>
    <div className="flex flex-col gap-2.5 bg-[#202534]/60 p-6 rounded border border-slate-800 w-96 text-xs">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <span className="text-slate-400">TOTAL SITES INDEXED:</span>
        <span className="text-cyan-300 font-bold font-mono">{stats?.total || 0}</span>
      </div>
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <span className="text-slate-400">LAST SYNC TIME:</span>
        <span className="text-slate-300 font-mono">
          {lastFetchedAt ? lastFetchedAt.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST' : 'INITIALIZING...'}
        </span>
      </div>
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <span className="text-slate-400">REALTIME WEBSOCKET:</span>
        <span className={`font-bold font-mono ${realtimeStatus === 'SUBSCRIBED' ? 'text-green-400' : 'text-amber-400'}`}>
          {realtimeStatus === 'SUBSCRIBED' ? 'LIVE SYNC' : (realtimeStatus || 'CONNECTING')}
        </span>
      </div>
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <span className="text-slate-400">ACTIVE CRITICAL RADIATORS:</span>
        <span className="text-[#FF003C] font-bold font-mono">{stats?.criticalCount || 0}</span>
      </div>
      <div className="flex justify-between items-center pt-1">
        <span className="text-slate-400">DATABASE STATUS:</span>
        <span className="text-green-400 font-bold font-mono">CONNECTED (SUPABASE PG)</span>
      </div>
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [searchLocation, setSearchLocation] = useState(null);
  const [layers, setLayers] = useState({
    firms: true,
    industrial: true,
    risk: true,
    worldcover: true,
    buffer: true,
    cloudmask: false,
    wriPlants: true,
  });
  const toggleLayer = (key) => setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  const { anomalies, selectedTarget, setSelectedTarget, loading, error, lastFetchedAt, realtimeStatus, stats, refetch } = useThermalAnomalies();

  return (
    <ErrorBoundary>
      <div className="h-screen w-screen overflow-hidden bg-[#12151C] text-slate-200 font-mono flex flex-col">
        <TopHeader anomalies={anomalies} stats={stats} onSearchLocation={setSearchLocation} onSelectAnomaly={setSelectedTarget} />
        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            stats={stats}
            loading={loading}
            error={error}
            lastFetchedAt={lastFetchedAt}
            realtimeStatus={realtimeStatus}
            layers={layers}
          />
          <main className="flex-1 overflow-hidden">
            {activeTab === 'map' && (
              <MapView
                anomalies={anomalies}
                selectedTarget={selectedTarget}
                setSelectedTarget={setSelectedTarget}
                stats={stats}
                searchLocation={searchLocation}
                layers={layers}
                toggleLayer={toggleLayer}
              />
            )}
            {activeTab === 'statistics' && (
              <StatisticsView
                anomalies={anomalies}
                stats={stats}
                setSelectedTarget={setSelectedTarget}
                setActiveTab={setActiveTab}
                refetch={refetch}
              />
            )}
            {activeTab === 'layers' && <LayersView stats={stats} layers={layers} toggleLayer={toggleLayer} />}
            {activeTab === 'thermal-hunt' && (
              <ThermalHuntView
                anomalies={anomalies}
                setSelectedTarget={setSelectedTarget}
                setActiveTab={setActiveTab}
              />
            )}
            {activeTab === 'pipeline' && <PipelineInfo stats={stats} lastFetchedAt={lastFetchedAt} realtimeStatus={realtimeStatus} />}
          </main>
        </div>
        <BottomBar anomalies={anomalies} realtimeStatus={realtimeStatus} lastFetchedAt={lastFetchedAt} />
        <Analytics />
        <SpeedInsights />
      </div>
    </ErrorBoundary>
  );
}