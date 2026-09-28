import { useState } from 'react';
import { Play, Download, Lock, Crosshair, AlertOctagon } from 'lucide-react';

export default function ThermalHuntView({ anomalies = [], setSelectedTarget, setActiveTab }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSweepActive, setAiSweepActive] = useState(false);

  const chipCategories = {
    "WILD FIRE": "Wild Fire",
    "INDUSTRIAL FIRE": "Industrial Fire",
    "GAS FLARE": "Gas Flare",
    "AGRICULTURE FIRE": "Agriculture Fire",
    "MINING ACTIVITY": "Mining Activity"
  };

  const handleChipClick = (label) => {
    setSearchQuery(chipCategories[label] || label);
  };

  const filtered = anomalies.filter(a => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const nameMatch = (a.name || '').toLowerCase().includes(q);
      const catMatch = (a.category || '').toLowerCase().includes(q);
      const regMatch = (a.region || '').toLowerCase().includes(q);
      if (!nameMatch && !catMatch && !regMatch) return false;
    }
    if (aiSweepActive) {
      if (!a.ai_prediction) return false;
    }
    return true;
  });

  const sortedAnomalies = [...filtered].sort((a, b) => {
    if (aiSweepActive) {
      return (b.confidence || 0) - (a.confidence || 0);
    }
    return (b.frp_radiance || 0) - (a.frp_radiance || 0);
  });

  const displayAnomalies = sortedAnomalies.slice(0, 10);

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Name,Category,FRP_MW,Confidence,AI_Prediction,Final_Classification,Region\n" +
      filtered.map(a => `${a.id},"${a.name || ''}","${a.category || ''}",${a.frp_radiance},${a.confidence},"${a.ai_prediction || ''}","${a.final_classification || ''}","${a.region || ''}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PREDICTIVE_INTEL.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLockTarget = (anomaly) => {
    if (setSelectedTarget) setSelectedTarget(anomaly);
    if (setActiveTab) setActiveTab('map');
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 font-mono bg-[#12151C]">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold text-white uppercase">GEO-TRANSFORMER THERMAL HUNT // NEURAL SEMANTIC & MULTI-SPECTRAL VECTOR TARGETING</h1>
          <span className="bg-green-500/20 text-green-400 text-[9px] px-2 py-0.5 rounded border border-green-500/30 uppercase animate-pulse-glow">AI READY</span>
        </div>
        <p className="text-[9px] text-slate-500 mt-1 uppercase">MULTIMODAL EMBEDDING QUERY ENGINE • PYTORCH / TENSOR-RT FP16A ACCELERATED</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button 
          onClick={() => setAiSweepActive(!aiSweepActive)} 
          className={`tactical-btn flex items-center gap-1 border px-3 py-1.5 rounded text-[10px] uppercase font-bold ${aiSweepActive ? 'bg-cyan-500/40 border-cyan-400 text-cyan-300' : 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/40'}`}
        >
          <Play size={10} /> {aiSweepActive ? 'AI SWEEP ENGAGED' : 'EXECUTE AI SWEEP'}
        </button>
        <button onClick={handleExport} className="tactical-btn flex items-center gap-1 bg-[#181C26] border border-cyan-500/50 text-cyan-400 px-3 py-1.5 rounded text-[10px] hover:bg-cyan-500/20 uppercase font-bold">
          <Download size={10} /> EXPORT PREDICTIVE INTEL
        </button>
      </div>

      {/* Model Info Cards */}
      <div className="grid grid-cols-5 gap-2">
        <div className="bg-[#181C26]/60 border border-blue-900/40 rounded p-2 text-center flex flex-col justify-center">
          <span className="text-[8px] text-slate-500 uppercase">MODEL ARCHITECTURE</span>
          <span className="text-[10px] text-cyan-400 font-bold uppercase mt-1">GEO-TRANSFORMER v4.2-DEFENSE</span>
        </div>
        <div className="bg-[#181C26]/60 border border-blue-900/40 rounded p-2 text-center flex flex-col justify-center">
          <span className="text-[8px] text-slate-500 uppercase">EXECUTION RUNTIME</span>
          <span className="text-[10px] text-slate-300 font-bold uppercase mt-1">WEIGHTS: FP16 TENSOR-RT</span>
        </div>
        <div className="bg-[#181C26]/60 border border-blue-900/40 rounded p-2 text-center flex flex-col justify-center">
          <span className="text-[8px] text-slate-500 uppercase">INFERENCE LATENCY</span>
          <span className="text-[10px] text-slate-300 font-bold uppercase mt-1">18ms INFERENCE (GPU-0)</span>
        </div>
        <div className="bg-[#181C26]/60 border border-blue-900/40 rounded p-2 text-center flex flex-col justify-center col-span-2">
          <span className="text-[8px] text-slate-500 uppercase">CONFIDENCE THRESHOLD</span>
          <span className="text-[10px] text-slate-300 font-bold uppercase mt-1">&gt; 88% COSINE SIM</span>
        </div>
      </div>

      {/* Natural Language Query */}
      <div className="bg-[#181C26]/40 border border-cyan-500/20 rounded-lg p-4 mt-4 relative">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] text-slate-400 uppercase font-bold">NATURAL LANGUAGE & MULTI-SPECTRAL VECTOR QUERY PROMPT</span>
          <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded text-[8px] uppercase">VECTOR INDEX: 142,000 EMBEDDINGS</span>
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="FIND ALL STEEL OR METALLURGICAL PLANTS WITHIN 3KM..." 
            className="flex-1 h-10 bg-[#12151C] border border-cyan-500/30 rounded px-3 text-[11px] text-white focus:outline-none focus:border-cyan-500 font-mono"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="flex items-center gap-1 bg-green-500/20 border border-green-500/50 text-green-400 px-4 rounded hover:bg-green-500/40 uppercase font-bold text-[10px]">
            <Play size={12} /> PARSE & INFER
          </button>
        </div>
        
        {/* Preset Query Chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {Object.keys(chipCategories).map(label => (
            <span key={label} onClick={() => handleChipClick(label)} className="px-3 py-1 rounded-full text-[9px] border border-green-500/30 bg-green-500/10 text-green-400 cursor-pointer hover:bg-green-500/20 uppercase">
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Filter Controls Row */}
      <div className="grid grid-cols-4 gap-4 mt-4">
        <div>
          <div className="flex justify-between text-[9px] text-slate-400 mb-1 uppercase">
            <span>MIN RADIATIVE POWER (FRP)</span>
            <span className="text-red-400 font-bold">1,000 MW</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-red-500 h-full w-[40%]"></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[9px] text-slate-400 mb-1 uppercase">
            <span>SPECTRAL MATCH COSINE SIM</span>
            <span className="text-cyan-400">0.85</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-cyan-400 h-full w-[85%]"></div>
          </div>
        </div>
        <div>
          <div className="text-[9px] text-slate-400 mb-1 uppercase">TEMPORAL DELTA WINDOW</div>
          <div className="flex gap-1 h-5">
            <button className="flex-1 bg-slate-800 text-slate-400 border border-slate-700 rounded text-[9px] uppercase"> -3H </button>
            <button className="flex-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded text-[9px] uppercase font-bold"> -12H </button>
            <button className="flex-1 bg-slate-800 text-slate-400 border border-slate-700 rounded text-[9px] uppercase"> -24H </button>
          </div>
        </div>
        <div>
          <div className="text-[9px] text-slate-400 mb-1 uppercase">GEO-FENCE BOUNDARY</div>
          <div className="flex gap-1 h-5">
            <button className="flex-1 bg-green-500/20 text-green-400 border border-green-500/50 rounded text-[8px] uppercase font-bold"> BASTAR </button>
            <button className="flex-1 bg-slate-800 text-slate-400 border border-slate-700 rounded text-[8px] uppercase"> CHOTA NAGPUR </button>
            <button className="flex-1 bg-slate-800 text-slate-400 border border-slate-700 rounded text-[8px] uppercase"> DECCAN </button>
          </div>
        </div>
      </div>

      {/* Candidate Detections Section */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[11px] font-bold text-white uppercase">CANDIDATE DETECTIONS & FEATURE ATTRIBUTION DOSSIER ({displayAnomalies.length} ANOMALIES)</h2>
          <span className="text-[10px] text-cyan-400 uppercase">TOP MATCH CONFIDENCE: 98.4%</span>
        </div>

        <div className="space-y-3">
          {displayAnomalies.map((anomaly, index) => {
            const isCritical = anomaly.severity_status === 'CRITICAL' || index === 0;
            const borderColor = isCritical ? 'border-red-500/30' : 'border-amber-500/30';
            const accentColor = isCritical ? 'bg-red-500' : 'bg-amber-500';
            const badgeBg = isCritical ? 'bg-red-500/20' : 'bg-amber-500/20';
            const badgeBorder = isCritical ? 'border-red-500/50' : 'border-amber-500/50';
            const badgeText = isCritical ? 'text-red-400' : 'text-amber-400';

            return (
              <div key={anomaly.id} className={`bg-[#181C26]/40 border ${borderColor} rounded-lg p-4 relative overflow-hidden`}>
                <div className={`absolute top-0 left-0 w-1 h-full ${accentColor}`}></div>
                
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`${badgeBg} border ${badgeBorder} ${badgeText} p-1.5 rounded text-[10px] uppercase font-bold`}>
                      RANK #{index + 1} // {anomaly.category}
                    </span>
                    <div>
                      <h3 className="text-white font-bold text-sm uppercase flex items-center gap-2">
                        <Crosshair size={14} className={badgeText} /> [#{anomaly.id}] {anomaly.name || anomaly.category}
                      </h3>
                      <div className="mt-1">
                        <span className="text-slate-400 text-[9px] uppercase">{anomaly.region || 'UNKNOWN REGION'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="bg-green-500/20 border border-green-500/50 text-green-400 px-2 py-1 rounded text-[10px] uppercase font-bold">COSINE SIM: {anomaly.confidence}%</span>
                    <span className="text-cyan-400 text-[11px] font-bold uppercase">FRP: {anomaly.frp_radiance} MW</span>
                    <button onClick={() => handleLockTarget(anomaly)} className="flex items-center gap-1 bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/40 px-3 py-1 rounded text-[10px] uppercase font-bold">
                      <Lock size={10} /> LOCK TARGET
                    </button>
                  </div>
                </div>

                {isCritical && (
                  <div className="grid grid-cols-3 gap-6 mt-4 pt-4 border-t border-slate-700/50">
                    <div className="col-span-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">NEURAL ATTENTION WEIGHTS</span>
                        <span className="bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded text-[8px] uppercase">5 DOMINANT SENSORS</span>
                      </div>
                      
                      <div className="space-y-3 mt-3">
                        <div>
                          <div className="flex justify-between text-[8px] text-slate-400 mb-1 uppercase">
                            <span>MWIR I4 (3.74μm) RADIANCE</span>
                            <span className="text-amber-400">42%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full w-[42%]"></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[8px] text-slate-400 mb-1 uppercase">
                            <span>SWIR B12 (2.19μm) ABSORPTION</span>
                            <span className="text-red-400">36%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-red-500 h-full w-[36%]"></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[8px] text-slate-400 mb-1 uppercase">
                            <span>ESA CANOPY 10m PROXIMITY</span>
                            <span className="text-green-400">22%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full w-[22%]"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-span-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold mb-2 block">ATTENTION CORRELATION MATRIX</span>
                      <div className="grid grid-cols-4 gap-0.5 w-32 h-32 mt-2">
                        {[
                          [1.00, 0.82, 0.94, 0.71], 
                          [0.82, 1.00, 0.80, 0.65], 
                          [0.94, 0.80, 0.79, 0.79], 
                          [0.71, 0.65, 0.79, 1.00]
                        ].map((row, i) => 
                          row.map((val, j) => {
                            let bgClass = "bg-cyan-500/10";
                            if (val === 1.00) bgClass = "bg-cyan-400";
                            else if (val > 0.9) bgClass = "bg-cyan-500/60";
                            else if (val > 0.8) bgClass = "bg-cyan-500/40";
                            else if (val > 0.7) bgClass = "bg-cyan-500/20";
                            
                            return (
                              <div key={`${i}-${j}`} className={`${bgClass} flex items-center justify-center text-[7px] text-slate-900 font-bold`} title={`Value: ${val}`}>
                                {val === 1.00 ? '1.0' : val.toFixed(2)}
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>

                    <div className="col-span-1 bg-red-950/20 border border-red-500/20 p-3 rounded flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertOctagon size={14} className="text-red-500" />
                        <span className="text-[10px] text-red-400 uppercase font-bold">AI PREDICTION / CLASSIFICATION</span>
                      </div>
                      <div className="text-red-400 text-[11px] font-bold mb-1 uppercase">{anomaly.ai_prediction || 'PENDING CLASSIFICATION'}</div>
                      <p className="text-[9px] text-slate-400 uppercase leading-relaxed">
                        FINAL CLASSIFICATION: {anomaly.final_classification || 'N/A'}. {anomaly.threat_summary || 'No further threat summary provided.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {displayAnomalies.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-[10px]">
              NO DETECTIONS MATCH CURRENT FILTER
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
