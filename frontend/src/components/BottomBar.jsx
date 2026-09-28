import { useState, useEffect } from 'react';
import { Shield, Radio, Lock, Wifi } from 'lucide-react';

export default function BottomBar({ anomalies, realtimeStatus, lastFetchedAt }) {
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString('en-IN', { hour12: false, timeZone: 'Asia/Kolkata' }) + ' IST'
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-IN', { hour12: false, timeZone: 'Asia/Kolkata' }) + ' IST');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalDetections = (anomalies || []).reduce((s, a) => s + (Number(a.total_detections) || 1), 0).toLocaleString();

  const isOnline = anomalies && anomalies.length > 0 && realtimeStatus === 'CONNECTED';
  const connectionText = realtimeStatus === 'CONNECTED' ? 'SAT-AES256 ENCRYPTED // TELEMETRY LINK LOCKED' : 'TELEMETRY LINK DISCONNECTED // AWAITING SECURE CONNECTION';
  
  const lastIngestTime = lastFetchedAt 
    ? lastFetchedAt.toLocaleTimeString('en-IN', { hour12: false, timeZone: 'Asia/Kolkata' }) + ' IST'
    : currentTime;

  return (
    <div className="h-8 w-full bg-[#12151C] border-t border-cyan-500/10 flex items-center justify-between px-4 text-[10px] tracking-wide shrink-0">
      
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-slate-400">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse-glow shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}></div>
          <span>WATCHDESK 04 // OP #NTRO-9182</span>
        </div>
        <div className="h-3 w-px bg-slate-700/50"></div>
        <div className={`${realtimeStatus === 'CONNECTED' ? 'bg-red-500/20 text-red-400 border-red-500/20' : 'bg-slate-500/20 text-slate-400 border-slate-500/20'} px-2 py-0.5 rounded flex items-center gap-1 border`}>
          <Lock size={10} />
          <span>AES-256</span>
        </div>
        <span className="text-slate-500">{connectionText}</span>
      </div>

      {/* Center Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Wifi size={10} className="text-cyan-500" />
          <span className="text-slate-400">FIRMS STREAM:</span>
          <span className={`font-bold ${isOnline ? 'text-green-400' : 'text-red-400'}`}>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
        <div className="h-3 w-px bg-slate-700/50"></div>
        <div className="flex items-center gap-1">
          <Radio size={10} className="text-slate-400" />
          <span className="text-slate-400">LATEST INGEST:</span>
          <span className="text-slate-300">{lastIngestTime}</span>
          <span className="text-slate-500">(VIIRS NOAA-20)</span>
        </div>
        <div className="h-3 w-px bg-slate-700/50"></div>
        <div className="flex items-center gap-1">
          <span className="text-slate-400">ACTIVE PIXELS</span>
          <span className="text-slate-500">MONITORED:</span>
          <span className="text-cyan-400">{totalDetections}</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">SCALE</span>
          <div className="w-16 h-1 bg-slate-800 rounded relative overflow-hidden">
            <div className="absolute left-0 top-0 h-full w-1/3 bg-cyan-500/50"></div>
          </div>
          <span className="text-slate-400">25 KM</span>
        </div>
        <div className="h-3 w-px bg-slate-700/50"></div>
        <span className="text-slate-400">1:500,000</span>
        <div className="h-3 w-px bg-slate-700/50"></div>
        <div className="flex items-center gap-1">
          <Shield size={10} className="text-amber-400" />
          <span className="text-amber-400 font-bold">SECURITY LEVEL: SECRET // NOFORN</span>
        </div>
        <span className="text-slate-500">NTRO-SEC-SAT-08</span>
      </div>

    </div>
  );
}
