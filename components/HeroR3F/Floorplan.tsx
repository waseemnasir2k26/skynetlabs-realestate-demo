"use client";
import * as React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, MeshTransmissionMaterial, Environment } from "@react-three/drei";
import * as THREE from "three";
import { useCameraDrift, useMouseParallax } from "@/lib/r3f-helpers";

/**
 * Real-estate flagship — stylized 3D floorplan, glowing cyan emissive edges,
 * floating room labels in Geist Mono. Camera animates from top-down (90°)
 * to a 30° tilt over 3s on mount. Subtle drift + mouse parallax after.
 *
 * Materials:
 *  - Walls: emissive cyan #4DD0E1 line edges (LineSegments)
 *  - Floors: frosted glass via MeshTransmissionMaterial
 *  - Background: solid #0A0A0A near-black
 *
 * Performance budget: ~6k tris (well under 10k limit).
 */

const ACCENT = "#4DD0E1";
const DETAIL = "#C8A961";

// ── Floorplan room geometry ───────────────────────────────────────────────────
// Coordinate space: x=horizontal, z=depth, y=vertical (wall height).
// Plan dimensions ~10 × 7 units. Origin at center.
type Room = { id: string; label: string; x: number; z: number; w: number; d: number };

const ROOMS: Room[] = [
  { id: "primary",   label: "PRIMARY",    x: -3.0, z: -1.5, w: 4.0, d: 4.0 },
  { id: "ensuite",   label: "ENSUITE",    x: -0.4, z: -2.5, w: 1.6, d: 2.0 },
  { id: "living",    label: "LIVING",     x:  2.4, z: -1.0, w: 4.4, d: 5.0 },
  { id: "kitchen",   label: "KITCHEN",    x: -2.5, z:  2.5, w: 3.0, d: 3.0 },
  { id: "dining",    label: "DINING",     x:  0.5, z:  2.5, w: 2.0, d: 3.0 },
  { id: "guest",     label: "GUEST",      x:  3.0, z:  2.5, w: 2.6, d: 3.0 },
  { id: "terrace",   label: "TERRACE",    x:  0.0, z: -3.8, w: 9.6, d: 0.6 },
];

// Build wall edge segments around each room as line geometry
function buildEdges(rooms: Room[]): Float32Array {
  const pts: number[] = [];
  const Y = 0.0;
  for (const r of rooms) {
    const x1 = r.x - r.w / 2;
    const x2 = r.x + r.w / 2;
    const z1 = r.z - r.d / 2;
    const z2 = r.z + r.d / 2;
    pts.push(x1, Y, z1, x2, Y, z1);
    pts.push(x2, Y, z1, x2, Y, z2);
    pts.push(x2, Y, z2, x1, Y, z2);
    pts.push(x1, Y, z2, x1, Y, z1);
  }
  return new Float32Array(pts);
}

function buildVerticalEdges(rooms: Room[]): Float32Array {
  const pts: number[] = [];
  const HEIGHT = 0.8;
  for (const r of rooms) {
    const x1 = r.x - r.w / 2;
    const x2 = r.x + r.w / 2;
    const z1 = r.z - r.d / 2;
    const z2 = r.z + r.d / 2;
    pts.push(x1, 0, z1, x1, HEIGHT, z1);
    pts.push(x2, 0, z1, x2, HEIGHT, z1);
    pts.push(x2, 0, z2, x2, HEIGHT, z2);
    pts.push(x1, 0, z2, x1, HEIGHT, z2);
  }
  return new Float32Array(pts);
}

function buildTopEdges(rooms: Room[]): Float32Array {
  const pts: number[] = [];
  const Y = 0.8;
  for (const r of rooms) {
    const x1 = r.x - r.w / 2;
    const x2 = r.x + r.w / 2;
    const z1 = r.z - r.d / 2;
    const z2 = r.z + r.d / 2;
    pts.push(x1, Y, z1, x2, Y, z1);
    pts.push(x2, Y, z1, x2, Y, z2);
    pts.push(x2, Y, z2, x1, Y, z2);
    pts.push(x1, Y, z2, x1, Y, z1);
  }
  return new Float32Array(pts);
}

function GlowingEdges() {
  const baseEdges = React.useMemo(() => buildEdges(ROOMS), []);
  const topEdges = React.useMemo(() => buildTopEdges(ROOMS), []);
  const verticalEdges = React.useMemo(() => buildVerticalEdges(ROOMS), []);

  const baseGeom = React.useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(baseEdges, 3));
    return g;
  }, [baseEdges]);
  const topGeom = React.useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(topEdges, 3));
    return g;
  }, [topEdges]);
  const vGeom = React.useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(verticalEdges, 3));
    return g;
  }, [verticalEdges]);

  return (
    <group>
      <lineSegments geometry={baseGeom}>
        <lineBasicMaterial color={ACCENT} transparent opacity={0.95} toneMapped={false} />
      </lineSegments>
      <lineSegments geometry={topGeom}>
        <lineBasicMaterial color={ACCENT} transparent opacity={0.55} toneMapped={false} />
      </lineSegments>
      <lineSegments geometry={vGeom}>
        <lineBasicMaterial color={ACCENT} transparent opacity={0.35} toneMapped={false} />
      </lineSegments>
    </group>
  );
}

function GlowFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
      <planeGeometry args={[14, 10, 1, 1]} />
      <MeshTransmissionMaterial
        transmission={0.92}
        thickness={0.6}
        roughness={0.32}
        ior={1.35}
        chromaticAberration={0.04}
        backside={false}
        color={"#0F1517"}
        attenuationColor={ACCENT}
        attenuationDistance={6}
      />
    </mesh>
  );
}

function EmissiveAccent() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]}>
      <ringGeometry args={[3.8, 7.0, 64]} />
      <meshBasicMaterial color={ACCENT} transparent opacity={0.10} toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

function RoomLabels() {
  return (
    <group>
      {ROOMS.filter((r) => r.id !== "terrace").map((r) => (
        <Html
          key={r.id}
          position={[r.x, 0.01, r.z]}
          center
          occlude={false}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono, ui-monospace, SFMono-Regular)",
              fontSize: "10px",
              letterSpacing: "0.18em",
              color: ACCENT,
              opacity: 0.85,
              textShadow: `0 0 8px rgba(77, 208, 225, 0.6)`,
              whiteSpace: "nowrap",
              textTransform: "uppercase",
            }}
          >
            {r.label}
          </span>
        </Html>
      ))}
    </group>
  );
}

function CameraIntro() {
  const camera = useThree((s) => s.camera);
  const startTime = React.useRef<number | null>(null);
  const introDone = React.useRef(false);

  const START = React.useRef({ x: 0, y: 14, z: 0.001 });
  const END = React.useRef({ x: 0, y: 7.0, z: 8.6 });

  React.useEffect(() => {
    camera.position.set(START.current.x, START.current.y, START.current.z);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  useFrame((state) => {
    if (introDone.current) return;
    if (startTime.current === null) startTime.current = state.clock.elapsedTime;
    const t = (state.clock.elapsedTime - startTime.current) / 3.0;
    const k = Math.min(1, Math.max(0, t));
    const eased = 1 - Math.pow(1 - k, 3);
    camera.position.x = START.current.x + (END.current.x - START.current.x) * eased;
    camera.position.y = START.current.y + (END.current.y - START.current.y) * eased;
    camera.position.z = START.current.z + (END.current.z - START.current.z) * eased;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    if (k >= 1) introDone.current = true;
  });

  useCameraDrift({ amplitude: 0.18, periodSeconds: 75, disabled: !introDone.current });
  useMouseParallax({ strength: 3, smoothing: 0.06, disabled: !introDone.current });

  return null;
}

interface FloorplanProps {
  posterSrc?: string;
}

export default function Floorplan({ posterSrc: _posterSrc = "/hero/poster.jpg" }: FloorplanProps) {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isMobile) {
    return (
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "#0A0A0A" }} />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 60%, rgba(77,208,225,0.18) 0%, rgba(77,208,225,0.04) 35%, rgba(0,0,0,0) 70%)",
          }}
        />
        <svg
          className="absolute inset-0 m-auto"
          width="92%"
          height="60%"
          viewBox="0 0 700 500"
          style={{ filter: "drop-shadow(0 0 14px rgba(77,208,225,0.55))" }}
          preserveAspectRatio="xMidYMid meet"
        >
          <g fill="none" stroke={ACCENT} strokeWidth="1.4" opacity="0.92">
            <rect x="40" y="40" width="280" height="220" />
            <rect x="320" y="40" width="200" height="160" />
            <rect x="520" y="40" width="140" height="160" />
            <rect x="40" y="260" width="200" height="200" />
            <rect x="240" y="260" width="180" height="200" />
            <rect x="420" y="260" width="240" height="200" />
          </g>
          <g fontFamily="ui-monospace, monospace" fontSize="11" letterSpacing="2" fill={ACCENT} opacity="0.85">
            <text x="180" y="155" textAnchor="middle">PRIMARY</text>
            <text x="420" y="125" textAnchor="middle">LIVING</text>
            <text x="590" y="125" textAnchor="middle">GUEST</text>
            <text x="140" y="365" textAnchor="middle">KITCHEN</text>
            <text x="330" y="365" textAnchor="middle">DINING</text>
            <text x="540" y="365" textAnchor="middle">TERRACE</text>
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 -z-10">
      <div className="absolute inset-0" style={{ background: "#0A0A0A" }} />
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 14, 0.001], fov: 42, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ position: "absolute", inset: 0 }}
      >
        <color attach="background" args={["#0A0A0A"]} />
        <fog attach="fog" args={["#0A0A0A", 14, 28]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[6, 10, 6]} intensity={0.4} color={ACCENT} />
        <directionalLight position={[-6, 8, -4]} intensity={0.25} color={DETAIL} />
        <pointLight position={[0, 4, 0]} intensity={0.6} color={ACCENT} distance={14} decay={2} />

        <React.Suspense fallback={null}>
          <Environment preset="night" />
          <EmissiveAccent />
          <GlowFloor />
          <GlowingEdges />
          <RoomLabels />
        </React.Suspense>

        <CameraIntro />
      </Canvas>

      {/* Vignette gradient overlay for headline contrast */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.0) 30%, rgba(10,10,10,0.0) 60%, rgba(10,10,10,0.85) 100%), radial-gradient(ellipse 60% 40% at 30% 35%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 70%)",
        }}
      />
    </div>
  );
}
