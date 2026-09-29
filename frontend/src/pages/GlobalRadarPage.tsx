import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Compass,
  Crosshair,
  ExternalLink,
  Globe,
  Layers,
  Maximize2,
  Navigation,
  Radio,
  Ship,
  X,
} from 'lucide-react';
import GlobalRadarGlobe from '../components/maps/GlobalRadarGlobe';
import { fetchDisruptions } from '../services/disruptions';
import { MOCK_DISRUPTIONS } from '../data/mockData';
import type { DisruptionEvent } from '../types/disruptions';
import { useDemo } from '../context/DemoContext';

// Fix leaflet default icon
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Semantic Colors
const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#f43f5e', // red
  HIGH: '#f97316',     // orange
  MEDIUM: '#eab308',   // yellow
  LOW: '#38bdf8',      // blue
  RESOLVED: '#10b981', // green
};

// Maritime trade corridors connected to the Singapore disruption
const MARITIME_ROUTES: Array<{
  from: [number, number];
  to: [number, number];
  name: string;
  status: 'disrupted' | 'monitored';
}> = [
  { from: [1.2644, 103.8185], to: [5.4164, 100.3327], name: 'Singapore – Penang Corridor', status: 'disrupted' },
  { from: [5.4164, 100.3327], to: [50.1109, 8.6821], name: 'Penang – Frankfurt Assembly Route', status: 'disrupted' },
  { from: [1.2644, 103.8185], to: [35.6762, 139.6503], name: 'Singapore – Tokyo Route', status: 'monitored' },
  { from: [1.2644, 103.8185], to: [51.9244, 4.4777], name: 'Singapore – Rotterdam Corridor', status: 'monitored' },
  { from: [12.9716, 77.5946], to: [50.1109, 8.6821], name: 'Bangalore – Frankfurt Air Bridge (Strategy A)', status: 'monitored' },
];

const SUPPLY_FACILITIES: Array<{
  id: string;
  name: string;
  type: 'supplier' | 'factory' | 'alternate';
  coords: [number, number];
  affected: boolean;
  role: string;
}> = [
  { id: 'SG-LOGISTICS-01', name: 'Singapore Freight Hub', type: 'supplier', coords: [1.2644, 103.8185], affected: true, role: 'Tier 1 Logistics Hub' },
  { id: 'MY-ELECTRONICS-01', name: 'Penang Electronics', type: 'supplier', coords: [5.4141, 100.3288], affected: true, role: 'Tier 2 PCB Manufacturing' },
  { id: 'TW-CHIPS-01', name: 'Taiwan Semiconductor', type: 'supplier', coords: [25.0330, 121.5654], affected: true, role: 'Tier 2 Logic Chips' },
  { id: 'JP-PRECISION-01', name: 'Osaka Precision Parts', type: 'supplier', coords: [34.6937, 135.5023], affected: false, role: 'Tier 1 Precision Connectors' },
  { id: 'FAC-FRA-01', name: 'Frankfurt Manufacturing Hub', type: 'factory', coords: [50.1109, 8.6821], affected: true, role: 'Main Assembly (68 Plants)' },
  { id: 'IN-ALTERNATE-01', name: 'Bangalore Alt Partner', type: 'alternate', coords: [12.9716, 77.5946], affected: false, role: 'Strategy A Alternate Hub' },
];

export default function GlobalRadarPage() {
  const { rerouteState } = useDemo();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);
  const facilitiesLayerRef = useRef<L.LayerGroup | null>(null);
  const [disruptions, setDisruptions] = useState<DisruptionEvent[]>(MOCK_DISRUPTIONS);
  const [selectedEvent, setSelectedEvent] = useState<DisruptionEvent | null>(
    MOCK_DISRUPTIONS.find((d) => d.id === 'DISR-SG-2026-001') || MOCK_DISRUPTIONS[0]
  );
  const [showCorridors, setShowCorridors] = useState(true);
  const [showFacilities, setShowFacilities] = useState(true);
  const [showRadii, setShowRadii] = useState(true);
  const [tileError, setTileError] = useState(false);
  const [viewMode, setViewMode] = useState<'3D_GLOBE' | '2D_TACTICAL'>('3D_GLOBE');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDisruptions().then((data) => {
      if (data?.length) setDisruptions(data);
    });
  }, []);

  // Map initialization
  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [15, 105],
        zoom: 3.2,
        zoomControl: false,
        attributionControl: false,
      });
      mapInstanceRef.current = map;

      const tileLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 16 }
      );
      tileLayer.on('tileerror', () => {
        // Silently tolerate network drops without console errors
      });
      tileLayer.addTo(map);

      routesLayerRef.current = L.layerGroup().addTo(map);
      markersLayerRef.current = L.layerGroup().addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Ensure crisp sizing on mount
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);
    }

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
        routesLayerRef.current = null;
        facilitiesLayerRef.current = null;
      }
    };
  }, []);

  // Render Routes and Markers
  useEffect(() => {
    // Initialize facilities layer if needed
    if (!facilitiesLayerRef.current && mapInstanceRef.current) {
      facilitiesLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }
    const facilitiesLayer = facilitiesLayerRef.current;
    const routesLayer = routesLayerRef.current;
    const markersLayer = markersLayerRef.current;
    if (!routesLayer || !markersLayer) return;

    markersLayer.clearLayers();
    routesLayer.clearLayers();
    if (facilitiesLayer) facilitiesLayer.clearLayers();

    // 1. Draw maritime routes if enabled
    if (showCorridors) {
      MARITIME_ROUTES.forEach((route) => {
        const isDisrupted = route.status === 'disrupted';
        const polyline = L.polyline([route.from, route.to], {
          color: isDisrupted ? '#f43f5e' : '#38bdf8',
          weight: isDisrupted ? 2.5 : 1,
          opacity: isDisrupted ? 0.85 : 0.25,
          dashArray: isDisrupted ? '6, 8' : '3, 6',
        });
        polyline.addTo(routesLayer);
      });
    }

    // 2. Draw supply chain facilities if enabled
    if (showFacilities && facilitiesLayer) {
      SUPPLY_FACILITIES.forEach((fac) => {
        const isFactory = fac.type === 'factory';
        const isAlt = fac.type === 'alternate';
        const color = fac.affected ? '#f59e0b' : isAlt ? '#10b981' : '#38bdf8';

        const marker = L.circleMarker(fac.coords, {
          radius: isFactory ? 9 : 7,
          fillColor: color,
          color: '#ffffff',
          weight: 1.5,
          opacity: 0.9,
          fillOpacity: 0.8,
        });

        marker.bindTooltip(
          `<div class="font-mono text-xs p-1"><strong>${fac.name}</strong><br/><span class="text-slate-400">${fac.role}</span></div>`,
          { direction: 'top', className: 'bg-[#060a14] border border-white/20 text-white rounded' }
        );

        marker.addTo(facilitiesLayer);
      });
    }

    // 3. Draw disruption markers and impact radii
    disruptions.forEach((d) => {
      const color = SEVERITY_COLORS[d.status === 'RESOLVED' ? 'RESOLVED' : d.severity] ?? '#38bdf8';
      const isSelected = selectedEvent?.id === d.id;

      // Outer wave pulse & impact radius
      if (showRadii && d.status === 'ACTIVE') {
        L.circleMarker([d.location.lat, d.location.lng], {
          radius: isSelected ? 36 : 24,
          fillColor: color,
          color: color,
          weight: 1,
          opacity: 0.25,
          fillOpacity: 0.08,
        }).addTo(markersLayer);
      }

      // Animated radar beacon for active high/critical disruptions
      if (d.status === 'ACTIVE' && (d.severity === 'CRITICAL' || d.severity === 'HIGH')) {
        const pulseIcon = L.divIcon({
          className: '!bg-transparent !border-0',
          html: `<div class="relative flex items-center justify-center w-8 h-8 pointer-events-none">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style="background-color: ${color}"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 border-2 border-white shadow-[0_0_12px_${color}]" style="background-color: ${color}"></span>
          </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        L.marker([d.location.lat, d.location.lng], { icon: pulseIcon, interactive: false }).addTo(markersLayer);
      }

      // Center marker with severity ring
      const circle = L.circleMarker([d.location.lat, d.location.lng], {
        radius: isSelected ? 14 : 9,
        fillColor: color,
        color: '#ffffff',
        weight: isSelected ? 2.5 : 1.5,
        opacity: 0.95,
        fillOpacity: 0.9,
      });

      circle.on('click', () => {
        setSelectedEvent(d);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([d.location.lat, d.location.lng], 5, {
            duration: 1.2,
          });
        }
      });

      circle.addTo(markersLayer);
    });
  }, [disruptions, selectedEvent, showCorridors, showFacilities, showRadii]);

  function focusIncident(d: DisruptionEvent) {
    setSelectedEvent(d);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([d.location.lat, d.location.lng], 5, {
        duration: 1.4,
      });
    }
  }

  return (
    <div className="p-6 h-[calc(100vh-var(--header-height))] flex flex-col space-y-4 max-w-[1800px] mx-auto">
      {/* Top Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-sky-400 uppercase font-semibold">
              GEOSPATIAL SITUATIONAL RADAR
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-[10px] font-mono text-slate-400 uppercase">MARITIME & AIR CORRIDORS</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2.5">
            Global Disruption Radar
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
              Active Port Congestion
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* View Mode Toggle: 3D Digital Globe vs 2D Tactical Map */}
          <div className="flex items-center bg-[#070c18] p-1 rounded-xl border border-white/[0.08] shadow-inner">
            <button
              onClick={() => setViewMode('3D_GLOBE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === '3D_GLOBE'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe size={13} className={viewMode === '3D_GLOBE' ? 'text-cyan-400' : 'text-slate-400'} />
              <span>3D DIGITAL GLOBE</span>
            </button>
            <button
              onClick={() => {
                setViewMode('2D_TACTICAL');
                setTimeout(() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.invalidateSize();
                  }
                }, 50);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === '2D_TACTICAL'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers size={13} className={viewMode === '2D_TACTICAL' ? 'text-sky-400' : 'text-slate-400'} />
              <span>2D TACTICAL MAP</span>
            </button>
          </div>

          {/* Rapid Camera Quick-Picks (active in 2D or quick selection) */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {disruptions.map((d) => {
              const isSelected = selectedEvent?.id === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => focusIncident(d)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-sky-500/15 border-sky-400 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                      : 'bg-[#090f1d] border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/20'
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: SEVERITY_COLORS[d.severity] }}
                  />
                  <span className="font-semibold">{d.location?.city || d.location?.country || 'Node'}</span>
                  <span className="text-[10px] text-slate-500">{d.severity}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Map Viewport & Intelligence Drawer */}
      <div className="flex-1 relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.7)] bg-[#060a14]">
        {/* 3D WebGL Globe Viewport */}
        <div className={`w-full h-full ${viewMode === '3D_GLOBE' ? 'block' : 'hidden'}`}>
          <GlobalRadarGlobe
            rerouteState={rerouteState}
            onNodeSelect={(node) => {
              const matched = disruptions.find(
                (d) =>
                  d.location?.city?.toLowerCase().includes(node.name.toLowerCase()) ||
                  node.name.toLowerCase().includes(d.location?.city?.toLowerCase() || '') ||
                  d.title.toLowerCase().includes(node.name.toLowerCase())
              );
              if (matched) {
                setSelectedEvent(matched);
              }
            }}
          />
        </div>

        {/* 2D Leaflet Tactical Map Viewport */}
        <div
          ref={mapRef}
          className={`w-full h-full ${viewMode === '2D_TACTICAL' ? 'block' : 'hidden'}`}
        />

        {/* 2D Map Layer Controls (Top-Left) */}
        {viewMode === '2D_TACTICAL' && (
          <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 bg-[#070c18]/90 backdrop-blur-md border border-white/[0.08] rounded-xl p-1.5 pointer-events-auto">
            <div className="flex items-center gap-1.5 px-2 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-r border-white/[0.08] mr-1">
              <Layers size={13} className="text-cyan-400" />
              <span>LAYERS</span>
            </div>
            <button
              onClick={() => setShowCorridors(!showCorridors)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                showCorridors
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Maritime Corridors
            </button>
            <button
              onClick={() => setShowFacilities(!showFacilities)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                showFacilities
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Supply Nodes
            </button>
            <button
              onClick={() => setShowRadii(!showRadii)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                showRadii
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Impact Radii
            </button>
          </div>
        )}

        {/* Radar Overlay Reticle & Legend (Bottom-Left) - 2D Tactical Only */}
        {viewMode === '2D_TACTICAL' && (
          <div className="absolute bottom-5 left-5 z-[1000] bg-[#070c18]/90 backdrop-blur-md border border-white/[0.08] rounded-xl p-3 space-y-2 pointer-events-auto">
            <div className="flex items-center justify-between gap-4 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Radio size={12} className="text-sky-400 animate-pulse" />
                <span>RADAR STATUS: ACTIVE AIS SWEEP</span>
              </div>
              <span className="text-[9px] text-emerald-400 font-semibold">VECTOR ENGINE OK</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono pt-1 border-t border-white/[0.06] flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-slate-400 text-[11px]">Critical</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-slate-400 text-[11px]">High</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-slate-400 text-[11px]">Moderate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span className="text-slate-400 text-[11px]">Information</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-400 text-[11px]">Recovered</span>
              </div>
            </div>
          </div>
        )}

        {/* Slide-in Intelligence HUD Drawer (Right Side) - 2D Tactical Only */}
        {viewMode === '2D_TACTICAL' && selectedEvent && (
          <div className="absolute top-4 right-4 bottom-4 w-96 max-w-[calc(100vw-32px)] z-[1000] bg-[#070c1a]/95 backdrop-blur-xl border border-white/[0.1] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.8)] p-5 flex flex-col justify-between overflow-y-auto animate-fade-in pointer-events-auto">
            <div className="space-y-4">
              {/* Drawer Header */}
              <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-semibold">
                      SITUATIONAL INTEL
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                      ● {selectedEvent.severity}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-100 tracking-tight mt-1 font-mono uppercase">
                    {selectedEvent.title}
                  </h3>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    {selectedEvent.location?.city || 'Region'}, {selectedEvent.location?.country || 'Global'} ·{' '}
                    {selectedEvent.location.lat.toFixed(4)}° N, {selectedEvent.location.lng.toFixed(4)}° E
                  </p>
                </div>

                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Exact Requested Intelligence Metrics Table */}
              <div className="p-3.5 rounded-xl bg-[#091224] border border-white/[0.08] space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                  <span className="text-slate-400 uppercase tracking-wider text-[11px]">Severity</span>
                  <span className="font-bold text-rose-400 font-mono">{selectedEvent.severity}</span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                  <span className="text-slate-400 uppercase tracking-wider text-[11px]">Detected</span>
                  <span className="font-bold text-slate-200 font-mono">09:42 UTC</span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                  <span className="text-slate-400 uppercase tracking-wider text-[11px]">Suppliers</span>
                  <span className="font-bold text-amber-400 font-mono">4 Exposed</span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                  <span className="text-slate-400 uppercase tracking-wider text-[11px]">Materials</span>
                  <span className="font-bold text-amber-400 font-mono">7 Critical</span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                  <span className="text-slate-400 uppercase tracking-wider text-[11px]">Orders</span>
                  <span className="font-bold text-rose-400 font-mono">22 at Risk</span>
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-slate-400 uppercase tracking-wider text-[11px]">Exposure</span>
                  <span className="font-black text-rose-400 font-mono text-sm">$28.3M MAX</span>
                </div>
              </div>

              {/* Causal Vector Indicator */}
              <div className="p-2.5 rounded-lg bg-[#0b1222] border border-white/[0.04] text-[10px] font-mono text-slate-400">
                <span className="text-cyan-400 font-semibold">CAUSAL VECTOR:</span>{' '}
                Singapore Port ──► Malacca Strait ──► Penang Hub ──► Frankfurt Plant
              </div>

              {/* Congestion Telemetry */}
              <div className="p-3 rounded-xl bg-[#0a1020] border border-white/[0.06] space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Vessels Queued:</span>
                  <span className="font-bold text-rose-400">847 Vessels</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Throughput Drop:</span>
                  <span className="font-bold text-amber-400">65% (35% capacity)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Berth Waiting:</span>
                  <span className="font-bold text-slate-200">8–12 Days</span>
                </div>
              </div>
            </div>

            {/* Direct Trace Impact Transition Action */}
            <div className="pt-4 border-t border-white/[0.08] space-y-2">
              <button
                onClick={() => navigate('/supply-chain')}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.35)]"
              >
                <span>[ TRACE IMPACT ]</span>
                <ArrowRight size={15} />
              </button>
              <button
                onClick={() => navigate(`/impact/${selectedEvent.id}`)}
                className="w-full py-2 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 text-xs font-mono transition-colors text-center"
              >
                Open Full Impact Dossier
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
