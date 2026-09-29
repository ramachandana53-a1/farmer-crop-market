import React, { useState, useMemo, useEffect } from 'react';
import { MarketZone, TransitRoute, DijkstraResult } from '../types';
import { runDijkstra } from '../utils/dijkstra';
import { 
  Play, 
  RotateCcw, 
  MapPin, 
  Compass, 
  Layers, 
  ArrowRight, 
  CheckCircle,
  Clock,
  Truck,
  HelpCircle,
  Route
} from 'lucide-react';

interface GraphVisualizerProps {
  zones: MarketZone[];
  routes: TransitRoute[];
  initialSourceZoneId?: string;
  initialDestZoneId?: string;
}

export const GraphVisualizer: React.FC<GraphVisualizerProps> = ({ 
  zones, 
  routes,
  initialSourceZoneId,
  initialDestZoneId 
}) => {
  const [sourceZoneId, setSourceZoneId] = useState<string>(initialSourceZoneId || zones[0]?.zoneId || 'PUN_KHANNA');
  const [destZoneId, setDestZoneId] = useState<string>(initialDestZoneId || zones[3]?.zoneId || 'MH_NASHIK');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);

  // Sync when props change
  useEffect(() => {
    if (initialSourceZoneId && zones.some(z => z.zoneId === initialSourceZoneId)) {
      setSourceZoneId(initialSourceZoneId);
    }
  }, [initialSourceZoneId, zones]);

  useEffect(() => {
    if (initialDestZoneId && zones.some(z => z.zoneId === initialDestZoneId)) {
      setDestZoneId(initialDestZoneId);
    }
  }, [initialDestZoneId, zones]);

  const allZoneIds = useMemo(() => zones.map((z) => z.zoneId), [zones]);

  const dijkstraResult: DijkstraResult = useMemo(() => {
    return runDijkstra(routes, allZoneIds, sourceZoneId, destZoneId);
  }, [routes, allZoneIds, sourceZoneId, destZoneId]);

  // Set of edges on shortest path for highlighting
  const shortestPathEdges = useMemo(() => {
    const set = new Set<string>();
    const path = dijkstraResult.path;
    for (let i = 0; i < path.length - 1; i++) {
      set.add(`${path[i]}->${path[i + 1]}`);
      set.add(`${path[i + 1]}->${path[i]}`); // bidirectional visual match
    }
    return set;
  }, [dijkstraResult]);

  const shortestPathNodes = useMemo(() => {
    return new Set(dijkstraResult.path);
  }, [dijkstraResult]);

  // Unique bidirectional edges for rendering without duplicate overlapping lines
  const uniqueEdges = useMemo(() => {
    const map = new Map<string, TransitRoute>();
    routes.forEach((r) => {
      const key = [r.sourceZoneId, r.destZoneId].sort().join('--');
      if (!map.has(key)) {
        map.set(key, r);
      }
    });
    return Array.from(map.values());
  }, [routes]);

  const activeStep = currentStepIndex >= 0 && currentStepIndex < dijkstraResult.steps.length
    ? dijkstraResult.steps[currentStepIndex]
    : dijkstraResult.steps[dijkstraResult.steps.length - 1];

  return (
    <div className="space-y-6">
      {/* Theoretical & Agritech Context Banner */}
      <div className="bg-[#FAF7EE] border border-[#E2DAC5] rounded-2xl p-4.5 shadow-xs flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-[#2D6A4F]/10 text-[#2D6A4F] shrink-0 text-2xl">
          🗺️
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-bold text-[#1B4332]">
              ADSA & DMGT: Pan-India Highway Transit Graph & Dijkstra's Algorithm
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E9C46A]/40 text-[#1B4332] border border-[#E9C46A]">
              O((V + E) log V)
            </span>
          </div>
          <p className="text-xs text-[#40534C] leading-relaxed">
            The national agricultural logistics network is mathematically structured as a weighted directed graph <code className="bg-[#EAE6D6] px-1.5 py-0.5 rounded font-mono font-bold text-[#1B4332]">G = (V, E, w)</code>, 
            where vertices <strong className="text-[#1B4332] font-semibold">V</strong> represent interstate APMC Mandi Hubs and edges <strong className="text-[#1B4332] font-semibold">E</strong> represent freight corridors along National Highways (NH-44, NH-48, NH-16, NH-19, NH-27). 
            Weight <strong className="text-[#1B4332] font-semibold">w(u, v)</strong> indicates freight transit cost in <strong className="text-[#1B4332]">₹ per Quintal</strong>.
          </p>
        </div>
      </div>

      {/* Control Bar: Select Origin & Destination */}
      <div className="bg-white border border-[#E2DAC5] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-[#1B4332] mb-1.5 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F] inline-block"></span>
              Farmer Origin Mandi (Source s):
            </label>
            <select
              id="graph-source-select"
              value={sourceZoneId}
              onChange={(e) => {
                setSourceZoneId(e.target.value);
                setCurrentStepIndex(-1);
              }}
              className="w-full bg-[#FAF7EE] border border-[#D8CDB2] text-[#1B4332] font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
            >
              {zones.map((z) => (
                <option key={z.zoneId} value={z.zoneId}>
                  {z.districtRegion} ({z.state || z.zoneId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1B4332] mb-1.5 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#264653] inline-block"></span>
              Buyer Market Hub (Target t):
            </label>
            <select
              id="graph-dest-select"
              value={destZoneId}
              onChange={(e) => {
                setDestZoneId(e.target.value);
                setCurrentStepIndex(-1);
              }}
              className="w-full bg-[#FAF7EE] border border-[#D8CDB2] text-[#1B4332] font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
            >
              {zones.map((z) => (
                <option key={z.zoneId} value={z.zoneId}>
                  {z.districtRegion} ({z.state || z.zoneId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1B4332] mb-1.5">
              Algorithm Walkthrough:
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (currentStepIndex < dijkstraResult.steps.length - 1) {
                    setCurrentStepIndex((prev) => (prev < 0 ? 0 : prev + 1));
                  } else {
                    setCurrentStepIndex(0);
                  }
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Play className="w-3.5 h-3.5 text-[#E9C46A]" />
                <span>{currentStepIndex < 0 ? 'Step Forward' : `Step ${currentStepIndex + 1}/${dijkstraResult.steps.length}`}</span>
              </button>

              <button
                onClick={() => setCurrentStepIndex(-1)}
                title="Reset to Complete Path"
                className="p-2 rounded-xl bg-[#FAF7EE] hover:bg-[#F4F1DE] text-[#40534C] border border-[#E2DAC5] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Direct Calculation Metrics */}
          <div className="bg-[#FAF7EE] p-2.5 rounded-xl border border-[#E2DAC5] flex justify-between items-center text-xs">
            <div>
              <span className="text-[10px] text-[#52796F] font-semibold block">Min Freight Transit:</span>
              <span className="font-mono font-bold text-sm text-[#1B4332]">
                ₹{(dijkstraResult.totalCostPerQuintal ?? dijkstraResult.totalCostPerTon).toFixed(2)}
                <span className="text-[10px] font-normal text-[#52796F]">/q</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#52796F] font-semibold block">Distance & Time:</span>
              <span className="font-mono font-bold text-xs text-[#264653]">
                {dijkstraResult.totalDistanceKm} km &bull; {(dijkstraResult.totalDurationHours ?? 0).toFixed(1)}h
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Canvas & Step Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Topology Graph Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#E2DAC5] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2DAC5]">
            <h3 className="text-xs font-bold text-[#1B4332] uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#2D6A4F]" />
              Andhra Pradesh Regional Highway Graph Map
            </h3>
            <span className="text-[11px] font-medium text-[#52796F]">
              Click any district to set as Buyer Destination
            </span>
          </div>

          {/* SVG Map */}
          <div className="relative w-full bg-[#FAF7EE] rounded-xl border border-[#E2DAC5] overflow-hidden p-2">
            <svg
              viewBox="0 0 620 400"
              className="w-full h-auto max-h-[460px] select-none"
            >
              {/* Background Grid Accent */}
              <defs>
                <pattern id="sand-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#E2DAC5" strokeWidth="0.75" />
                </pattern>
              </defs>

              <rect width="620" height="400" fill="url(#sand-grid)" />

              {/* Transit Edges */}
              {uniqueEdges.map((edge) => {
                const z1 = zones.find((z) => z.zoneId === edge.sourceZoneId);
                const z2 = zones.find((z) => z.zoneId === edge.destZoneId);
                if (!z1 || !z2) return null;

                const edgeKeyForward = `${edge.sourceZoneId}->${edge.destZoneId}`;
                const edgeKeyBackward = `${edge.destZoneId}->${edge.sourceZoneId}`;
                const isOnShortestPath = shortestPathEdges.has(edgeKeyForward) || shortestPathEdges.has(edgeKeyBackward);

                const midX = (z1.x + z2.x) / 2;
                const midY = (z1.y + z2.y) / 2;
                const cost = edge.transitCostPerQuintal ?? edge.transitCostPerTon ?? 0;

                return (
                  <g key={`${edge.sourceZoneId}-${edge.destZoneId}`}>
                    {/* Glow line for shortest path */}
                    {isOnShortestPath && (
                      <line
                        x1={z1.x}
                        y1={z1.y}
                        x2={z2.x}
                        y2={z2.y}
                        stroke="#E9C46A"
                        strokeWidth="8"
                        strokeLinecap="round"
                        opacity="0.7"
                      />
                    )}

                    {/* Main Edge Line */}
                    <line
                      x1={z1.x}
                      y1={z1.y}
                      x2={z2.x}
                      y2={z2.y}
                      stroke={isOnShortestPath ? '#2D6A4F' : '#C5B99B'}
                      strokeWidth={isOnShortestPath ? '3.5' : '1.5'}
                      strokeDasharray={isOnShortestPath ? 'none' : '4,3'}
                    />

                    {/* Edge Weight Badge (₹ / Quintal) */}
                    <rect
                      x={midX - 26}
                      y={midY - 11}
                      width="52"
                      height="22"
                      rx="6"
                      fill={isOnShortestPath ? '#2D6A4F' : '#FFFFFF'}
                      stroke={isOnShortestPath ? '#E9C46A' : '#D8CDB2'}
                      strokeWidth="1.5"
                    />
                    <text
                      x={midX}
                      y={midY + 4}
                      textAnchor="middle"
                      fill={isOnShortestPath ? '#FFFFFF' : '#1B4332'}
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      ₹{cost.toFixed(0)}/q
                    </text>
                  </g>
                );
              })}

              {/* Hub Vertices (Nodes) */}
              {zones.map((zone) => {
                const isSource = zone.zoneId === sourceZoneId;
                const isDest = zone.zoneId === destZoneId;
                const isOnPath = shortestPathNodes.has(zone.zoneId);

                let fillColor = '#FFFFFF';
                let strokeColor = '#D8CDB2';
                let textColor = '#1B4332';

                if (isSource) {
                  fillColor = '#2D6A4F';
                  strokeColor = '#E9C46A';
                  textColor = '#FFFFFF';
                } else if (isDest) {
                  fillColor = '#264653';
                  strokeColor = '#E9C46A';
                  textColor = '#FFFFFF';
                } else if (isOnPath) {
                  fillColor = '#E9C46A';
                  strokeColor = '#2D6A4F';
                  textColor = '#1B4332';
                }

                return (
                  <g
                    key={zone.zoneId}
                    className="cursor-pointer transition-transform hover:scale-110"
                    onClick={() => {
                      if (sourceZoneId !== zone.zoneId) {
                        setDestZoneId(zone.zoneId);
                        setCurrentStepIndex(-1);
                      }
                    }}
                  >
                    {/* Pulsing indicator for Source */}
                    {isSource && (
                      <circle
                        cx={zone.x}
                        cy={zone.y}
                        r="26"
                        fill="none"
                        stroke="#2D6A4F"
                        strokeWidth="2"
                        opacity="0.5"
                      />
                    )}

                    {/* Main Node Circle */}
                    <circle
                      cx={zone.x}
                      cy={zone.y}
                      r="20"
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth="2.5"
                      className="shadow-sm"
                    />

                    {/* Zone ID Tag inside circle */}
                    <text
                      x={zone.x}
                      y={zone.y + 4}
                      textAnchor="middle"
                      fill={textColor}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {zone.zoneId.replace('AP_', '')}
                    </text>

                    {/* Label Badge below circle */}
                    <rect
                      x={zone.x - 60}
                      y={zone.y + 25}
                      width="120"
                      height="18"
                      rx="6"
                      fill="#FAF7EE"
                      stroke="#E2DAC5"
                      strokeWidth="1"
                    />
                    <text
                      x={zone.x}
                      y={zone.y + 37}
                      textAnchor="middle"
                      fill="#1B4332"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {zone.districtRegion}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Map Legend */}
          <div className="flex items-center justify-center gap-4 flex-wrap pt-1 text-[11px] text-[#40534C] font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#2D6A4F] border border-[#E9C46A]"></span>
              Farmer Origin Mandi
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#264653] border border-[#E9C46A]"></span>
              Buyer Processing Mandi
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#E9C46A] border border-[#2D6A4F]"></span>
              Intermediate Transit Hub
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-1 bg-[#2D6A4F] rounded"></span>
              Optimal Highway Route
            </span>
          </div>
        </div>

        {/* Right Column: Dijkstra Route Analysis & Execution Steps (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Optimal Route Summary Card */}
          <div className="bg-white border-2 border-[#2D6A4F] rounded-2xl p-5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2DAC5]">
              <h3 className="text-xs font-bold text-[#1B4332] uppercase tracking-wider flex items-center gap-1.5">
                <Route className="w-4 h-4 text-[#2D6A4F]" />
                Optimal Route Solution
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E9C46A]/40 text-[#1B4332] border border-[#E9C46A]">
                Min-Heap Priority
              </span>
            </div>

            {/* Hop by Hop Route Chain */}
            <div className="p-3 bg-[#FAF7EE] rounded-xl border border-[#E2DAC5] space-y-2">
              <div className="text-[10px] text-[#52796F] font-bold uppercase">Transit Highway Corridor:</div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {dijkstraResult.path.map((node, idx) => (
                  <React.Fragment key={node}>
                    <span className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
                      idx === 0
                        ? 'bg-[#2D6A4F] text-white'
                        : idx === dijkstraResult.path.length - 1
                        ? 'bg-[#264653] text-white'
                        : 'bg-[#E9C46A] text-[#1B4332]'
                    }`}>
                      {node.replace('AP_', '')}
                    </span>
                    {idx < dijkstraResult.path.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 text-[#52796F]" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Detailed Hop Metrics Table */}
            {dijkstraResult.hopDetails.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-[#52796F] uppercase">Corridor Segments:</span>
                {dijkstraResult.hopDetails.map((h, i) => (
                  <div key={i} className="p-2 rounded-lg bg-[#FAF7EE] border border-[#E2DAC5] flex justify-between items-center text-xs">
                    <div>
                      <div className="font-mono font-bold text-[#1B4332]">
                        {h.from.replace('AP_', '')} &rarr; {h.to.replace('AP_', '')}
                      </div>
                      <div className="text-[10px] text-[#52796F]">{h.highway || 'Corridor'}</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-[#2D6A4F]">₹{h.cost.toFixed(2)}/q</div>
                      <div className="text-[10px] text-[#52796F]">{h.distance} km &bull; {h.duration}h</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Final Cost Highlight */}
            <div className="p-3 bg-[#FAF7EE] rounded-xl border border-[#D8CDB2] flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-[#52796F] uppercase block">Total Freight Cost:</span>
                <span className="text-xs text-[#40534C]">{dijkstraResult.totalDistanceKm} km total corridor</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-lg text-[#1B4332]">
                  ₹{(dijkstraResult.totalCostPerQuintal ?? dijkstraResult.totalCostPerTon).toFixed(2)}
                </span>
                <span className="text-[10px] text-[#52796F] block">/quintal</span>
              </div>
            </div>
          </div>

          {/* Algorithm Trace & Step Snapshot */}
          <div className="bg-white border border-[#E2DAC5] rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2DAC5]">
              <h4 className="text-xs font-bold text-[#1B4332] uppercase tracking-wider">
                Priority Queue Relaxation Trace
              </h4>
              <span className="text-[10px] font-mono text-[#52796F]">
                Step {activeStep.stepNumber} of {dijkstraResult.steps.length}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF7EE] border border-[#E2DAC5] text-xs text-[#40534C] leading-relaxed">
              <strong className="text-[#1B4332] block mb-1">Current Action:</strong>
              {activeStep.actionDescription}
            </div>

            <div className="space-y-1 text-xs font-mono">
              <span className="text-[10px] text-[#52796F] font-bold font-sans uppercase block">
                Distance Map (Tentative ₹/q):
              </span>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                {Object.entries(activeStep.distanceMap).map(([node, cost]) => (
                  <div
                    key={node}
                    className={`p-1.5 rounded border flex justify-between ${
                      activeStep.settledNodes.includes(node)
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                        : 'bg-white text-gray-700 border-gray-200'
                    }`}
                  >
                    <span>{node.replace('AP_', '')}:</span>
                    <span className="font-bold">
                      {cost === Infinity ? '∞' : `₹${cost.toFixed(1)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
