import { Layers, Activity, AlertTriangle, Globe, CheckSquare, Eye, ChevronDown, CheckCircle } from 'lucide-react';

export default function LayersView({ stats = {}, layers = {}, toggleLayer = () => {} }) {
  const engagedCount = Object.values(layers).filter(Boolean).length;
  const totalLayers = 7; // We know there are 7 layers from DossierPanel

  const handleEngageAll = () => {
    Object.keys(layers).forEach(key => {
      if (!layers[key]) toggleLayer(key);
    });
  };

  const handleSoloThermal = () => {
    Object.keys(layers).forEach(key => {
      if (key === 'firms' && !layers[key]) toggleLayer(key);
      if (key !== 'firms' && layers[key]) toggleLayer(key);
    });
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 font-mono bg-[#12151C]">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold text-white uppercase">LAYER MATRIX & SENSOR INGEST STACK // MULTI-SPECTRAL GIS OVERLAY</h1>
          <span className="bg-cyan-500/20 text-cyan-400 text-[9px] px-2 py-0.5 rounded border border-cyan-500/30 uppercase">{engagedCount}/{totalLayers} ENGAGED</span>
        </div>
        <p className="text-[9px] text-slate-500 mt-1 uppercase">EPSG:32644 (UTM-44N) • 2-ORDER RASTER & VECTOR GEOMETRY PIPELINE • 14ms LATENCY</p>
      </div>

      {/* Action Buttons Row */}
      <div className="flex gap-2">
        <button onClick={handleEngageAll} className="tactical-btn bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 px-3 py-1 rounded text-[10px] hover:bg-cyan-500/40 uppercase font-bold">
          ENGAGE ALL ({totalLayers}/S)
        </button>
        <button onClick={handleSoloThermal} className="tactical-btn flex items-center gap-1 bg-[#181C26] border border-cyan-500/50 text-cyan-400 px-3 py-1 rounded text-[10px] uppercase font-bold">
          <CheckCircle size={10} className="text-cyan-400" /> SOLO THERMAL
        </button>
        <button className="tactical-btn bg-[#181C26] border border-slate-600 text-slate-400 px-3 py-1 rounded text-[10px] hover:text-white uppercase font-bold">
          ALPHA BLEND
        </button>
        <button className="tactical-btn bg-[#181C26] border border-slate-600 text-slate-400 px-3 py-1 rounded text-[10px] hover:text-white uppercase font-bold">
          GEO-TIFF
        </button>
      </div>

      {/* Info Cards Row */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#202534]/70 border border-slate-700/50 rounded p-2 text-[9px] flex items-center gap-2 uppercase">
          <Layers size={12} className="text-slate-400" />
          <span className="text-slate-300">STACK RESOLUTION: <br/> 10m - 375m Multi-Scale</span>
        </div>
        <div className="bg-[#202534]/70 border border-green-500/30 rounded p-2 text-[9px] flex items-center gap-2 uppercase">
          <Activity size={12} className="text-green-500" />
          <span className="text-green-400 font-bold">STREAM PIPELINE: <br/> LIVE 14ms (42.8 MB/s)</span>
        </div>
        <div className="bg-[#202534]/70 border border-red-500/30 rounded p-2 text-[9px] flex items-center gap-2 uppercase">
          <AlertTriangle size={12} className="text-red-500 animate-pulse" />
          <span className="text-red-400 font-bold">ACTIVE COLLISION BREACHES: <br/> {stats.forestBreachCount || 0} Forest Breach</span>
        </div>
        <div className="bg-[#202534]/70 border border-slate-700/50 rounded p-2 text-[9px] flex items-center gap-2 uppercase">
          <Globe size={12} className="text-slate-400" />
          <span className="text-slate-300">BASE PROJECTION: <br/> WGS-84 / UTM-44N</span>
        </div>
      </div>

      {/* Layer Cards */}
      <div className="space-y-3">
        
        {/* Layer 1: Z-06 */}
        <div className="bg-[#181C26]/40 border border-blue-900/40 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 cursor-move">⠿</span>
              <CheckSquare size={14} className={layers.firms ? "text-cyan-400" : "text-slate-600"} />
              <span className="bg-slate-800 text-slate-300 px-1 py-0.5 rounded text-[9px] border border-slate-700 uppercase">Z-06 // TOP</span>
              <span className="font-bold text-white text-[11px] uppercase ml-1">NASA FIRMS 375M VIIRS THERMAL RADIATIVE</span>
            </div>
            <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[9px] uppercase">RASTER HEATMAP</span>
          </div>
          
          <div className="flex items-center justify-between text-[9px] text-slate-400 mb-3 ml-8 uppercase">
            <div className="flex gap-4">
              <span><strong className="text-cyan-400">{stats.total || 0}</strong> HOTSPOTS ACTIVE</span>
              <span>CYCLE: 15s</span>
            </div>
            <Eye size={12} onClick={() => toggleLayer('firms')} className={`${layers.firms ? "text-cyan-400" : "text-slate-600"} cursor-pointer hover:text-cyan-300`} />
          </div>
          
          <div className="ml-8 grid grid-cols-2 gap-4 border-t border-slate-700/50 pt-3">
            <div>
              <div className="flex justify-between text-[9px] text-slate-400 mb-1 uppercase">
                <span>LAYER OPACITY</span>
                <span className="text-cyan-400">90%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full w-[90%]"></div>
              </div>
            </div>
            <div>
              <div className="text-[9px] text-slate-400 mb-1 uppercase">COLOR RAMP</div>
              <div className="flex gap-1">
                <button className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 px-2 py-0.5 rounded text-[8px] uppercase">INFERNO</button>
                <button className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded text-[8px] uppercase hover:text-white">WHITE-HOT</button>
                <button className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded text-[8px] uppercase hover:text-white">AMBER-RED</button>
              </div>
            </div>
            <div className="col-span-2 text-[9px] text-slate-400 bg-[#12151C] p-2 rounded border border-slate-800 flex items-center justify-between uppercase">
              <span>BAND: I4 (3.74μm) / I5 (11.4μm)</span>
              <span>THRESHOLD: &gt; 150 MW/pixel</span>
            </div>
          </div>
        </div>

        {/* Layer 2: Z-05 */}
        <div className="bg-[#181C26]/40 border border-blue-900/40 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 cursor-move">⠿</span>
              <CheckSquare size={14} className={layers.cloudmask ? "text-cyan-400" : "text-slate-600"} />
              <span className="bg-slate-800 text-slate-300 px-1 py-0.5 rounded text-[9px] border border-slate-700 uppercase">Z-05</span>
              <span className="font-bold text-white text-[11px] uppercase ml-1">SENTINEL-2 L2A SWIR FALSE-COLOR COMPOSITE</span>
            </div>
            <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded text-[9px] uppercase">20x MULTI-SPECTRAL</span>
          </div>
          
          <div className="flex items-center justify-between text-[9px] text-slate-400 mb-3 ml-8 uppercase">
            <div className="flex gap-4">
              <span className="text-amber-400">CLOUD MASK ACTIVE</span>
              <span>PASS: 12:08 Z</span>
            </div>
            <Eye size={12} onClick={() => toggleLayer('cloudmask')} className={`${layers.cloudmask ? "text-cyan-400" : "text-slate-600"} cursor-pointer hover:text-cyan-300`} />
          </div>
          
          <div className="ml-8 grid grid-cols-2 gap-4 border-t border-slate-700/50 pt-3">
            <div>
              <div className="flex justify-between text-[9px] text-slate-400 mb-1 uppercase">
                <span>LAYER OPACITY</span>
                <span className="text-cyan-400">75%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full w-[75%]"></div>
              </div>
            </div>
            <div>
              <div className="text-[9px] text-slate-400 mb-1 uppercase">BAND WEIGHT</div>
              <div className="bg-[#12151C] border border-slate-700 px-2 py-1 rounded text-[9px] text-white flex justify-between items-center">
                <span>B12:B11:B8A</span>
                <ChevronDown size={10} className="text-slate-500" />
              </div>
            </div>
            <div className="col-span-2 text-[9px] text-slate-400 bg-[#12151C] p-2 rounded border border-slate-800 flex items-center justify-between uppercase">
              <span>ATMOSPHERIC CORRECTION: Sen2Cor BOA Reflectance 2.1%</span>
              <span>CLOUD COVER: (MASKED)</span>
            </div>
          </div>
        </div>

        {/* Layer 3: Z-04 */}
        <div className="bg-[#181C26]/40 border border-blue-900/40 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 cursor-move">⠿</span>
              <CheckSquare size={14} className={layers.worldcover ? "text-cyan-400" : "text-slate-600"} />
              <span className="bg-slate-800 text-slate-300 px-1 py-0.5 rounded text-[9px] border border-slate-700 uppercase">Z-04</span>
              <span className="font-bold text-white text-[11px] uppercase ml-1">ESA WORLDCOVER 10M LAND USE & FOREST CANOPY</span>
            </div>
            <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded text-[9px] uppercase">10m LANDSAT/S2 RASTER</span>
          </div>
          
          <div className="flex items-center justify-between text-[9px] text-slate-400 mb-3 ml-8 uppercase">
            <div className="flex gap-4">
              <span>CANOPY CLASS 10 (TREE COVER)</span>
              <span>VERSION: 2024.1</span>
            </div>
            <Eye size={12} onClick={() => toggleLayer('worldcover')} className={`${layers.worldcover ? "text-cyan-400" : "text-slate-600"} cursor-pointer hover:text-cyan-300`} />
          </div>
          
          <div className="ml-8 grid grid-cols-2 gap-4 border-t border-slate-700/50 pt-3">
            <div>
              <div className="flex justify-between text-[9px] text-slate-400 mb-1 uppercase">
                <span>LAYER OPACITY</span>
                <span className="text-cyan-400">60%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full w-[60%]"></div>
              </div>
            </div>
            <div>
              <div className="text-[9px] text-slate-400 mb-1 uppercase">FEATURE FILTER</div>
              <div className="flex gap-1">
                <button className="bg-green-500/20 text-green-400 border border-green-500/50 px-2 py-0.5 rounded text-[8px] uppercase">TREE CANOPY</button>
                <button className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 px-2 py-0.5 rounded text-[8px] uppercase">CROPLAND</button>
                <button className="bg-blue-500/20 text-blue-400 border border-blue-500/50 px-2 py-0.5 rounded text-[8px] uppercase">WATER BODY</button>
              </div>
            </div>
            <div className="col-span-2 text-[9px] text-slate-400 bg-[#12151C] p-2 rounded border border-slate-800 flex items-center justify-between uppercase">
              <span className="text-red-400 font-bold border-b border-red-500 border-dashed">CANOPY BUFFER ZONE: 1.4km SAL FOREST THREAT</span>
              <span>ACCURACY: 91.8% OA</span>
            </div>
          </div>
        </div>

        {/* Layer 4: Z-03 */}
        <div className="bg-[#181C26]/40 border border-blue-900/40 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 cursor-move">⠿</span>
              <CheckSquare size={14} className={layers.industrial ? "text-cyan-400" : "text-slate-600"} />
              <span className="bg-slate-800 text-slate-300 px-1 py-0.5 rounded text-[9px] border border-slate-700 uppercase">Z-03</span>
              <span className="font-bold text-white text-[11px] uppercase ml-1">OPENSTREETMAP INDUSTRIAL & INFRASTRUCTURE POLYGONS</span>
            </div>
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[9px] uppercase">VECTOR OVERPASS</span>
          </div>
          
          <div className="flex items-center justify-between text-[9px] text-slate-400 mb-3 ml-8 uppercase">
            <div className="flex gap-4">
              <span><strong className="text-cyan-400">{stats.industrialCount || 0}</strong> HEAVY SITES</span>
              <span>SYNC: LIVE OVERPASS</span>
            </div>
            <Eye size={12} onClick={() => toggleLayer('industrial')} className={`${layers.industrial ? "text-cyan-400" : "text-slate-600"} cursor-pointer hover:text-cyan-300`} />
          </div>
          
          <div className="ml-8 border-t border-slate-700/50 pt-3">
            <div className="w-1/2 pr-2">
              <div className="flex justify-between text-[9px] text-slate-400 mb-1 uppercase">
                <span>LAYER OPACITY</span>
                <span className="text-cyan-400">85%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full w-[85%]"></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
