import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import worldLandData from '../../data/world-land-110m.json';
import {
  Compass,
  Crosshair,
  Globe,
  Maximize2,
  Navigation,
  Radio,
  RotateCcw,
  Ship,
  X,
  Zap,
} from 'lucide-react';

export interface GlobeIncident {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'disruption' | 'supplier' | 'factory' | 'route_hub' | 'alternate';
  status: 'critical' | 'warning' | 'normal' | 'alternate';
  detail: string;
  metric: string;
}

const GLOBAL_NODES: GlobeIncident[] = [
  {
    id: 'sg-port',
    name: 'Singapore Port',
    lat: 1.2644,
    lng: 103.8185,
    type: 'disruption',
    status: 'critical',
    detail: 'MPA Tanjong Pagar Berth Congestion · 847 vessels in queue',
    metric: '35% Cap · $28.3M Exposure',
  },
  {
    id: 'my-penang',
    name: 'Penang Electronics',
    lat: 5.4141,
    lng: 100.3288,
    type: 'supplier',
    status: 'warning',
    detail: 'Tier 2 PCB Manufacturing · Outbound transshipment halted',
    metric: 'Shipment Delayed',
  },
  {
    id: 'tw-chips',
    name: 'Taiwan Semiconductor',
    lat: 25.033,
    lng: 121.5654,
    type: 'supplier',
    status: 'warning',
    detail: 'Tier 2 Logic Chips · Queue delay in Malacca Strait',
    metric: '7-Day Runway Buffer',
  },
  {
    id: 'jp-osaka',
    name: 'Osaka Precision Parts',
    lat: 34.6937,
    lng: 135.5023,
    type: 'supplier',
    status: 'normal',
    detail: 'Tier 1 Connectors · Direct North Pacific routing',
    metric: 'Stable · Normal Flow',
  },
  {
    id: 'fac-frankfurt',
    name: 'Frankfurt Hub',
    lat: 50.1109,
    lng: 8.6821,
    type: 'factory',
    status: 'warning',
    detail: 'Main European Plant · Assembly Line B throttled to 70%',
    metric: '68 Plants Impacted',
  },
  {
    id: 'nl-rotterdam',
    name: 'Rotterdam Port',
    lat: 51.9244,
    lng: 4.4777,
    type: 'route_hub',
    status: 'normal',
    detail: 'European Maritime Gateway · Monitoring feeder queue',
    metric: 'Normal Operation',
  },
  {
    id: 'in-bangalore',
    name: 'Bangalore Alt Partner',
    lat: 12.9716,
    lng: 77.5946,
    type: 'alternate',
    status: 'alternate',
    detail: 'Strategy A Alternate Hub · Available for activation',
    metric: '18d Recovery · $1.2M',
  },
];

interface ArcDefinition {
  id: string;
  from: GlobeIncident;
  to: GlobeIncident;
  status: 'critical' | 'warning' | 'normal' | 'alternate';
  altitude: number;
}

const TRADE_ARCS: ArcDefinition[] = [
  {
    id: 'arc-1',
    from: GLOBAL_NODES[0], // Singapore
    to: GLOBAL_NODES[1], // Penang
    status: 'critical',
    altitude: 0.12,
  },
  {
    id: 'arc-2',
    from: GLOBAL_NODES[1], // Penang
    to: GLOBAL_NODES[4], // Frankfurt
    status: 'critical',
    altitude: 0.35,
  },
  {
    id: 'arc-3',
    from: GLOBAL_NODES[0], // Singapore
    to: GLOBAL_NODES[5], // Rotterdam
    status: 'warning',
    altitude: 0.3,
  },
  {
    id: 'arc-4',
    from: GLOBAL_NODES[0], // Singapore
    to: GLOBAL_NODES[3], // Osaka
    status: 'normal',
    altitude: 0.22,
  },
  {
    id: 'arc-5',
    from: GLOBAL_NODES[6], // Bangalore
    to: GLOBAL_NODES[4], // Frankfurt (Strategy A Air Bridge)
    status: 'alternate',
    altitude: 0.28,
  },
];

// Helper to convert lat/lng into 3D Vector3
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

interface GlobalRadarGlobeProps {
  onNodeSelect?: (node: GlobeIncident) => void;
}

export function GlobalRadarGlobe({ onNodeSelect }: GlobalRadarGlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedIncident, setSelectedIncident] = useState<GlobeIncident>(GLOBAL_NODES[0]);
  const [isRotating, setIsRotating] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  // References for camera tweening
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const cameraPosTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.2, 3.8));
  const targetRotationRef = useRef<{ x: number; y: number } | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 3.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Starfield Background (1,000 gentle twinkling particles)
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 1000;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 40;
      starPositions[i + 1] = (Math.random() - 0.5) * 40;
      starPositions[i + 2] = (Math.random() - 0.5) * 40;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0x60a5fa,
      size: 0.05,
      transparent: true,
      opacity: 0.35,
    });
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);

    // 3. Globe Group
    const globeGroup = new THREE.Group();
    globeGroupRef.current = globeGroup;
    scene.add(globeGroup);

    // Earth Sphere (radius 1.5)
    const sphereRadius = 1.5;
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, 64, 64);
    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0x071124,
      emissive: 0x020712,
      specular: 0x1e3a8a,
      shininess: 25,
      wireframe: false,
    });
    const earthMesh = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(earthMesh);

    // Subtle Longitudinal / Latitudinal Grid Overlay
    const gridGeo = new THREE.WireframeGeometry(new THREE.SphereGeometry(sphereRadius * 1.002, 24, 24));
    const gridMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.06,
    });
    const gridMesh = new THREE.LineSegments(gridGeo, gridMat);
    globeGroup.add(gridMesh);

    // 3b. Real Earth Geography: Continent & Coastline Geometry from Natural Earth
    const coastlinePoints: THREE.Vector3[] = [];
    const landDotPositions: number[] = [];
    const coastRadius = sphereRadius * 1.0035;

    interface GeoJsonFeature {
      geometry: {
        type: string;
        coordinates: any;
      };
    }

    (worldLandData.features as unknown as GeoJsonFeature[]).forEach((feature) => {
      const geom = feature.geometry;
      const processRing = (ring: number[][]) => {
        for (let i = 0; i < ring.length - 1; i++) {
          const lng1 = ring[i][0];
          const lat1 = ring[i][1];
          const lng2 = ring[i + 1][0];
          const lat2 = ring[i + 1][1];
          const p1 = latLngToVector3(lat1, lng1, coastRadius);
          const p2 = latLngToVector3(lat2, lng2, coastRadius);
          coastlinePoints.push(p1, p2);

          // Add land surface marker dots along coasts
          landDotPositions.push(p1.x, p1.y, p1.z);
        }
      };

      if (geom.type === 'Polygon') {
        geom.coordinates.forEach((ring: number[][]) => processRing(ring));
      } else if (geom.type === 'MultiPolygon') {
        geom.coordinates.forEach((poly: number[][][]) => {
          poly.forEach((ring: number[][]) => processRing(ring));
        });
      }
    });

    const coastlineGeo = new THREE.BufferGeometry().setFromPoints(coastlinePoints);
    const coastlineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.7,
    });
    const coastlineMesh = new THREE.LineSegments(coastlineGeo, coastlineMat);
    globeGroup.add(coastlineMesh);

    // Subtle tactical dot density on landmass boundaries
    const landDotGeo = new THREE.BufferGeometry();
    landDotGeo.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(landDotPositions, 3)
    );
    const landDotMat = new THREE.PointsMaterial({
      color: 0x0ea5e9,
      size: 0.02,
      transparent: true,
      opacity: 0.45,
    });
    const landDotMesh = new THREE.Points(landDotGeo, landDotMat);
    globeGroup.add(landDotMesh);

    // Atmospheric Outer Glow Halo
    const atmosGeo = new THREE.SphereGeometry(sphereRadius * 1.08, 48, 48);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.5);
          gl_FragColor = vec4(0.02, 0.75, 1.0, 1.0) * intensity * 0.7;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    globeGroup.add(atmosMesh);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0x67e8f9, 1.5);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0xf43f5e, 0.8);
    rimLight.position.set(-5, -2, -3);
    scene.add(rimLight);

    // 5. Build 3D Elevated Curved Trade Arcs & Particles
    const arcCurves: { curve: THREE.QuadraticBezierCurve3; color: number; speed: number }[] = [];
    const movingPackets: { mesh: THREE.Mesh; curveIndex: number; progress: number; speed: number }[] = [];

    TRADE_ARCS.forEach((arc) => {
      const p1 = latLngToVector3(arc.from.lat, arc.from.lng, sphereRadius);
      const p2 = latLngToVector3(arc.to.lat, arc.to.lng, sphereRadius);

      // Midpoint elevated outward
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const dist = p1.distanceTo(p2);
      mid.normalize().multiplyScalar(sphereRadius + dist * arc.altitude);

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const points = curve.getPoints(50);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);

      const arcColor =
        arc.status === 'critical'
          ? 0xf43f5e
          : arc.status === 'warning'
          ? 0xf59e0b
          : arc.status === 'alternate'
          ? 0x10b981
          : 0x38bdf8;

      const curveMat = new THREE.LineBasicMaterial({
        color: arcColor,
        transparent: true,
        opacity: arc.status === 'critical' ? 0.85 : 0.4,
        linewidth: 2,
      });

      const arcLine = new THREE.Line(curveGeo, curveMat);
      globeGroup.add(arcLine);

      const curveIdx = arcCurves.length;
      arcCurves.push({
        curve,
        color: arcColor,
        speed: arc.status === 'critical' ? 0.35 : 0.2,
      });

      // Flowing Energy Packet (Small glowing sphere)
      const packetGeo = new THREE.SphereGeometry(0.028, 12, 12);
      const packetMat = new THREE.MeshBasicMaterial({
        color: arcColor,
      });
      const packetMesh = new THREE.Mesh(packetGeo, packetMat);
      globeGroup.add(packetMesh);

      movingPackets.push({
        mesh: packetMesh,
        curveIndex: curveIdx,
        progress: Math.random(),
        speed: arc.status === 'critical' ? 0.35 : 0.2,
      });
    });

    // 6. Interactive Node Beacons & Expanding Shockwave Ripples
    const nodeMeshes: { mesh: THREE.Mesh; node: GlobeIncident }[] = [];
    let rippleMesh: THREE.Mesh | null = null;

    GLOBAL_NODES.forEach((node) => {
      const pos = latLngToVector3(node.lat, node.lng, sphereRadius);
      const isCritical = node.status === 'critical';
      const isWarning = node.status === 'warning';
      const isAlt = node.status === 'alternate';

      const color = isCritical
        ? 0xf43f5e
        : isWarning
        ? 0xf59e0b
        : isAlt
        ? 0x10b981
        : 0x38bdf8;

      // Pin Mesh
      const pinGeo = new THREE.SphereGeometry(isCritical ? 0.045 : 0.03, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);
      globeGroup.add(pinMesh);
      nodeMeshes.push({ mesh: pinMesh, node });

      // Singapore Expanding Radar Shockwave
      if (isCritical) {
        const ringGeo = new THREE.RingGeometry(0.04, 0.065, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xf43f5e,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(pos);
        ring.lookAt(pos.clone().multiplyScalar(2));
        globeGroup.add(ring);
        rippleMesh = ring;
      }
    });

    // 7. Mouse Drag Controls & Damping
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let rotSpeed = { x: 0, y: 0.002 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMousePos.x;
      const dy = e.clientY - prevMousePos.y;
      prevMousePos = { x: e.clientX, y: e.clientY };

      globeGroup.rotation.y += dx * 0.005;
      globeGroup.rotation.x += dy * 0.005;
      globeGroup.rotation.x = Math.max(-0.8, Math.min(0.8, globeGroup.rotation.x));
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Initial position: Orient Singapore towards viewer
    const sgPos = latLngToVector3(GLOBAL_NODES[0].lat, GLOBAL_NODES[0].lng, 1);
    globeGroup.rotation.y = -Math.atan2(sgPos.x, sgPos.z) + 0.3;
    globeGroup.rotation.x = 0.2;

    // 8. Main Render Loop
    let animId: number;
    let rippleScale = 1;
    let lastTime = performance.now();

    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Rotation handling: smooth target interpolation or slow idle rotation
      if (targetRotationRef.current && globeGroup) {
        globeGroup.rotation.y += (targetRotationRef.current.y - globeGroup.rotation.y) * 0.08;
        globeGroup.rotation.x += (targetRotationRef.current.x - globeGroup.rotation.x) * 0.08;
        if (
          Math.abs(targetRotationRef.current.y - globeGroup.rotation.y) < 0.001 &&
          Math.abs(targetRotationRef.current.x - globeGroup.rotation.x) < 0.001
        ) {
          targetRotationRef.current = null;
        }
      } else if (isRotating && !isDragging && !isFocused) {
        globeGroup.rotation.y += 0.0018;
      }

      // Smooth Camera Tweening
      camera.position.lerp(cameraPosTargetRef.current, 0.06);
      camera.lookAt(cameraTargetRef.current);

      // Advance moving packet particles along 3D elevated arcs
      movingPackets.forEach((pkt) => {
        pkt.progress += pkt.speed * dt;
        if (pkt.progress > 1) pkt.progress = 0;
        const curve = arcCurves[pkt.curveIndex].curve;
        const point = curve.getPoint(pkt.progress);
        pkt.mesh.position.copy(point);
      });

      // Expand Singapore shockwave ripple
      if (rippleMesh) {
        rippleScale += dt * 1.4;
        if (rippleScale > 3.2) rippleScale = 1;
        rippleMesh.scale.set(rippleScale, rippleScale, rippleScale);
        (rippleMesh.material as THREE.MeshBasicMaterial).opacity = Math.max(
          0,
          1 - (rippleScale - 1) / 2.2
        );
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    // 8b. Raycasting for direct pin clicking on 3D globe
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClickCanvas = (e: MouseEvent) => {
      if (isDragging) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hit = raycaster.intersectObjects(nodeMeshes.map((m) => m.mesh));
      if (hit.length > 0) {
        const found = nodeMeshes.find((m) => m.mesh === hit[0].object);
        if (found) {
          focusOnNode(found.node);
        }
      }
    };
    container.addEventListener('click', onClickCanvas);

    // 9. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('click', onClickCanvas);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Smooth Camera FlyTo on Node Focus
  const focusOnNode = (node: GlobeIncident) => {
    setSelectedIncident(node);
    setIsFocused(true);
    setIsRotating(false);

    if (onNodeSelect) onNodeSelect(node);

    // Calculate target rotation to smoothly orient node towards the front viewer
    const pos = latLngToVector3(node.lat, node.lng, 1);
    const targetY = -Math.atan2(pos.x, pos.z);
    const targetX = -Math.asin(pos.y / 1);
    targetRotationRef.current = { x: targetX, y: targetY };

    // Smoothly fly camera in closer
    cameraPosTargetRef.current.set(0, 0, 2.5);
  };

  // Reset to Global Overview
  const resetCamera = () => {
    setIsFocused(false);
    setIsRotating(true);
    cameraPosTargetRef.current.set(0, 1.2, 3.8);
    cameraTargetRef.current.set(0, 0, 0);
  };

  return (
    <div className="relative w-full h-[620px] rounded-2xl bg-gradient-to-b from-[#060b18] via-[#040813] to-[#020409] border border-white/[0.08] shadow-[0_16px_60px_rgba(0,0,0,0.8)] overflow-hidden">
      {/* Three.js Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Top Floating Controls */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#091122]/90 border border-white/10 backdrop-blur-md">
          <Globe size={15} className="text-sky-400 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            3D DIGITAL GEOSPHERE
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-[10px] font-mono text-slate-400">WebGL Atmospheric Rendering</span>
        </div>

        {isFocused && (
          <button
            onClick={resetCamera}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-mono flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
          >
            <RotateCcw size={12} />
            <span>GLOBAL ORBIT VIEW</span>
          </button>
        )}
      </div>

      {/* Right Incident & Node Quick Selector */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 max-w-[280px]">
        <div className="p-3 rounded-xl bg-[#070e1c]/90 border border-white/10 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-400 uppercase font-semibold">GEOSPATIAL ANCHORS</span>
            <span className="text-sky-400">CLICK TO FLY</span>
          </div>

          <div className="space-y-1">
            {GLOBAL_NODES.slice(0, 5).map((node) => {
              const isSelected = selectedIncident.id === node.id;
              return (
                <button
                  key={node.id}
                  onClick={() => focusOnNode(node)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg border text-xs font-mono flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-sky-500/20 border-sky-400 text-white shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                      : 'bg-black/30 border-white/5 text-slate-300 hover:border-white/15'
                  }`}
                >
                  <span className="truncate">{node.name}</span>
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      node.status === 'critical'
                        ? 'bg-rose-400 animate-pulse'
                        : node.status === 'warning'
                        ? 'bg-amber-400'
                        : node.status === 'alternate'
                        ? 'bg-emerald-400'
                        : 'bg-sky-400'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Floating Telemetry Dossier */}
      <div className="absolute bottom-4 left-4 right-4 z-20 p-4 rounded-xl bg-[#060b17]/90 border border-white/10 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              selectedIncident.status === 'critical'
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : selectedIncident.status === 'warning'
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-sky-500/20 border-sky-500/40 text-sky-400'
            }`}
          >
            {selectedIncident.type === 'disruption' ? (
              <Radio size={20} className="animate-pulse" />
            ) : selectedIncident.type === 'route_hub' ? (
              <Ship size={20} />
            ) : (
              <Navigation size={20} />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-white uppercase">
                {selectedIncident.name}
              </span>
              <span
                className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                  selectedIncident.status === 'critical'
                    ? 'bg-rose-500/25 text-rose-200 border-rose-500/40'
                    : selectedIncident.status === 'warning'
                    ? 'bg-amber-500/25 text-amber-200 border-amber-500/40'
                    : 'bg-sky-500/25 text-sky-200 border-sky-500/40'
                }`}
              >
                {selectedIncident.type}
              </span>
              <span className="text-xs font-mono text-amber-300 font-semibold">
                {selectedIncident.metric}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono mt-0.5">{selectedIncident.detail}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => focusOnNode(selectedIncident)}
            className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-300 text-xs font-semibold font-mono tracking-wide transition-all shadow-[0_0_15px_rgba(56,189,248,0.2)]"
          >
            FLY TO FOCUS
          </button>
        </div>
      </div>
    </div>
  );
}

export default GlobalRadarGlobe;
