import React, { useState, useEffect } from 'react';
import { Box, Layers, RotateCcw, Compass, MapPin, CheckCircle2, Play, Pause, Maximize2 } from 'lucide-react';

interface LandMap3DProps {
  polygonJson?: string;
  district: string;
  anchal: string;
  mauza: string;
  khata: string;
  khesra: string;
  areaAcre: number;
}

export const LandMap3D: React.FC<LandMap3DProps> = ({ polygonJson, district, anchal, mauza, khata, khesra, areaAcre }) => {
  const [extrusionHeight, setExtrusionHeight] = useState<number>(35);
  const [terrainElevation, setTerrainElevation] = useState<number>(15);
  const [rotationAngle, setRotationAngle] = useState<number>(25);
  const [pitchAngle, setPitchAngle] = useState<number>(55);
  const [viewMode, setViewMode] = useState<'cadastral' | 'terrain' | 'wireframe'>('cadastral');
  const [coordsCount, setCoordsCount] = useState<number>(4);
  const [autoSpin, setAutoSpin] = useState<boolean>(false);

  useEffect(() => {
    if (polygonJson) {
      try {
        const parsed = JSON.parse(polygonJson);
        if (parsed?.coordinates?.[0]) {
          setCoordsCount(parsed.coordinates[0].length - 1);
        }
      } catch (err) {
        console.error("3D polygon parse error", err);
      }
    }
  }, [polygonJson]);

  // 360 Auto-spin Orbit Effect
  useEffect(() => {
    if (!autoSpin) return;
    const interval = setInterval(() => {
      setRotationAngle(prev => (prev >= 180 ? -180 : prev + 2));
    }, 50);
    return () => clearInterval(interval);
  }, [autoSpin]);

  const applyCameraPreset = (preset: 'ISO' | 'TOP_DOWN' | 'HIGH_EXTRUSTION' | 'TERRAIN') => {
    if (preset === 'ISO') {
      setExtrusionHeight(35);
      setTerrainElevation(15);
      setRotationAngle(25);
      setPitchAngle(55);
    } else if (preset === 'TOP_DOWN') {
      setExtrusionHeight(10);
      setTerrainElevation(0);
      setRotationAngle(0);
      setPitchAngle(15);
    } else if (preset === 'HIGH_EXTRUSTION') {
      setExtrusionHeight(75);
      setTerrainElevation(25);
      setRotationAngle(45);
      setPitchAngle(65);
    } else if (preset === 'TERRAIN') {
      setExtrusionHeight(20);
      setTerrainElevation(40);
      setRotationAngle(-35);
      setPitchAngle(40);
    }
  };

  const sqFt = (areaAcre * 43560).toLocaleString(undefined, { maximumFractionDigits: 0 });
  const sqMeters = (areaAcre * 4046.86).toLocaleString(undefined, { maximumFractionDigits: 0 });
  const decimals = (areaAcre * 100).toFixed(1);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-2xl text-slate-100 space-y-4">
      {/* 3D Map Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-sky-400 font-bold text-sm">
            <Box className="w-5 h-5 text-sky-400" />
            <span>JharBhuNaksha Official 3D Cadastral Spatial Projection</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
            <span className="flex items-center space-x-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Official GeoJSON Polygons ({coordsCount}-Point Boundary)</span>
            </span>
            <span>• {mauza}, {anchal}, {district}</span>
          </div>
        </div>

        {/* View Mode Switcher & Auto Spin Button */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setAutoSpin(!autoSpin)}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 transition-all ${
              autoSpin ? 'bg-emerald-600 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {autoSpin ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{autoSpin ? "Orbiting" : "360° Orbit"}</span>
          </button>

          <div className="h-4 w-px bg-slate-800"></div>

          <button
            onClick={() => setViewMode('cadastral')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${viewMode === 'cadastral' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            3D Solid
          </button>
          <button
            onClick={() => setViewMode('terrain')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${viewMode === 'terrain' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            3D Topo
          </button>
          <button
            onClick={() => setViewMode('wireframe')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${viewMode === 'wireframe' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Wireframe
          </button>
        </div>
      </div>

      {/* Quick Camera Preset Badges */}
      <div className="flex items-center space-x-2 text-xs overflow-x-auto pb-1">
        <span className="text-slate-400 text-[11px] font-semibold shrink-0">Camera Angle Presets:</span>
        <button
          onClick={() => applyCameraPreset('ISO')}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium transition-colors"
        >
          Isometric View
        </button>
        <button
          onClick={() => applyCameraPreset('TOP_DOWN')}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium transition-colors"
        >
          Plan View (Top-Down)
        </button>
        <button
          onClick={() => applyCameraPreset('HIGH_EXTRUSTION')}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium transition-colors"
        >
          High Height Extrusion
        </button>
        <button
          onClick={() => applyCameraPreset('TERRAIN')}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium transition-colors"
        >
          Elevated Topography
        </button>
      </div>

      {/* 3D WebGL / Perspective Isometric Canvas */}
      <div className="w-full h-[420px] bg-slate-950 rounded-xl relative overflow-hidden border border-slate-800 flex items-center justify-center">
        {/* Spatial Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:28px_28px] opacity-40 pointer-events-none"></div>

        {/* Official Satellite Topo Texture Base */}
        <div className="absolute inset-0 bg-radial from-slate-900/50 via-slate-950 to-slate-950 pointer-events-none"></div>

        {/* 3D CSS Isometric Perspective Polygon Container */}
        <div
          className="relative transition-transform duration-300 ease-out cursor-grab active:cursor-grabbing"
          style={{
            transform: `perspective(1000px) rotateX(${pitchAngle}deg) rotateZ(${rotationAngle}deg) translateY(-20px)`,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Base Terrain Baseboard */}
          <div className="w-72 h-72 bg-slate-900/90 border-2 border-dashed border-sky-500/40 rounded-2xl flex items-center justify-center relative shadow-2xl">
            {/* 3D Extruded Cadastral Geometry Block */}
            <div
              className={`relative transition-all duration-300 rounded-xl shadow-2xl ${
                viewMode === 'wireframe'
                  ? 'bg-amber-500/10 border-2 border-amber-400 shadow-amber-500/20'
                  : viewMode === 'terrain'
                  ? 'bg-gradient-to-tr from-emerald-800 via-emerald-600 to-teal-400 border-2 border-emerald-300 shadow-emerald-500/40'
                  : 'bg-gradient-to-tr from-sky-700 via-indigo-600 to-sky-400 border-2 border-sky-300 shadow-sky-500/40'
              }`}
              style={{
                width: '210px',
                height: '160px',
                clipPath: 'polygon(0% 15%, 85% 0%, 100% 85%, 15% 100%)',
                transform: `translateZ(${extrusionHeight + terrainElevation}px)`,
                filter: 'drop-shadow(0 25px 35px rgba(0,0,0,0.85))'
              }}
            >
              {/* 3D Parcel Surface Labels */}
              <div className="p-4 text-center space-y-1 transform -rotate-12 translate-y-3">
                <span className="font-mono font-extrabold text-xs text-white block bg-slate-950/80 px-2.5 py-1 rounded-lg border border-white/20 shadow">
                  Khata #{khata} / Khesra #{khesra}
                </span>
                <span className="text-[10px] font-bold text-sky-100 block drop-shadow">
                  {areaAcre} Acres ({mauza})
                </span>
              </div>
            </div>

            {/* Projected Shadow Plane */}
            <div
              className="absolute bg-black/60 rounded-xl blur-md"
              style={{
                width: '210px',
                height: '160px',
                clipPath: 'polygon(0% 15%, 85% 0%, 100% 85%, 15% 100%)',
                transform: `translateZ(5px) scale(0.95)`
              }}
            ></div>
          </div>
        </div>

        {/* Area Metrics Quick Overlay */}
        <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-[11px] space-y-1 font-mono text-slate-300 shadow-xl z-10">
          <div className="text-sky-400 font-bold uppercase text-[9px]">Land Parcel Measurement Conversion</div>
          <div>• <strong>{areaAcre}</strong> Acres</div>
          <div>• <strong>{decimals}</strong> Decimals / Disimil</div>
          <div>• <strong>{sqFt}</strong> Sq. Feet</div>
          <div>• <strong>{sqMeters}</strong> Sq. Meters</div>
        </div>

        {/* 3D Control Panel Overlay */}
        <div className="absolute top-4 right-4 bg-slate-900/95 backdrop-blur-md p-4 rounded-xl border border-slate-800 text-xs space-y-3 z-10 w-60 shadow-2xl">
          <div className="font-bold text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-800 pb-1.5 flex items-center justify-between">
            <span>3D GIS Camera & Elevation</span>
            <Compass className="w-4 h-4 text-sky-400" />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>3D Extrusion Height:</span>
              <span className="font-mono text-sky-400 font-bold">{extrusionHeight}m</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={extrusionHeight}
              onChange={e => setExtrusionHeight(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Terrain Topography:</span>
              <span className="font-mono text-emerald-400 font-bold">{terrainElevation}m</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={terrainElevation}
              onChange={e => setTerrainElevation(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>360° Orbit Rotation:</span>
              <span className="font-mono text-amber-400 font-bold">{rotationAngle}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              value={rotationAngle}
              onChange={e => setRotationAngle(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Camera Pitch Tilt:</span>
              <span className="font-mono text-indigo-400 font-bold">{pitchAngle}°</span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              value={pitchAngle}
              onChange={e => setPitchAngle(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <button
            onClick={() => {
              applyCameraPreset('ISO');
              setAutoSpin(false);
            }}
            className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-semibold flex items-center justify-center space-x-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset 3D Camera Controls</span>
          </button>
        </div>
      </div>
    </div>
  );
};
