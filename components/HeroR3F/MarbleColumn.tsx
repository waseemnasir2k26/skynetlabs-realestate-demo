"use client";
import * as React from "react";
import Image from "next/image";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import { useCameraDrift, useMouseParallax } from "@/lib/r3f-helpers";

/**
 * Phase 5 LIGHT FLAGSHIP — Doric marble column close-up with gold-leaf capital
 * and volumetric light shaft. Performance budget ≤5k tris total.
 *
 * Brief alignment:
 *  - Camera: slow vertical pan (useCameraDrift y-axis, 60s linear loop)
 *  - Camera: mouse parallax ±2°
 *  - Materials: marble PBR (procedural normal map for veining, high anisotropy
 *    via clearcoat) + gold metalness 1.0 roughness 0.15
 *  - Lights: single hard key (SpotLight = light shaft) + soft ambient fill
 *  - Mobile: <768px renders static parchment-toned image (no Canvas mount)
 */

// ── Procedural marble normal-map (CanvasTexture, 256×256) ────────────────────
function buildMarbleNormalMap(): THREE.Texture {
  if (typeof document === "undefined") {
    // SSR safety — return a 1x1 placeholder
    const t = new THREE.DataTexture(new Uint8Array([128, 128, 255, 255]), 1, 1);
    t.needsUpdate = true;
    return t;
  }
  const size = 256;
  const cv = document.createElement("canvas");
  cv.width = size;
  cv.height = size;
  const ctx = cv.getContext("2d")!;
  // base mid-blue normal (128,128,255)
  ctx.fillStyle = "rgb(128,128,255)";
  ctx.fillRect(0, 0, size, size);
  // simulate veining as soft directional gradients
  ctx.globalAlpha = 0.18;
  for (let i = 0; i < 14; i++) {
    const x0 = Math.random() * size;
    const y0 = Math.random() * size;
    const x1 = x0 + (Math.random() - 0.5) * size;
    const y1 = y0 + (Math.random() - 0.5) * size;
    const grad = ctx.createLinearGradient(x0, y0, x1, y1);
    // veining biased toward grey/lavender to simulate Carrara
    grad.addColorStop(0, "rgba(140,140,255,0.0)");
    grad.addColorStop(0.5, "rgba(110,118,235,0.55)");
    grad.addColorStop(1, "rgba(140,140,255,0.0)");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.bezierCurveTo(
      x0 + (Math.random() - 0.5) * size * 0.5,
      y0 + (Math.random() - 0.5) * size * 0.5,
      x1 + (Math.random() - 0.5) * size * 0.5,
      y1 + (Math.random() - 0.5) * size * 0.5,
      x1,
      y1,
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 4);
  tex.anisotropy = 4;
  return tex;
}

function ColumnAndLights() {
  // Vertical pan + mouse parallax — both no-op on prefers-reduced-motion
  useCameraDrift({ amplitude: 0.18, periodSeconds: 60 });
  useMouseParallax({ strength: 0.07, smoothing: 0.08 });

  // Build textures + materials once per mount
  const marbleNormal = React.useMemo(buildMarbleNormalMap, []);

  const marbleMat = React.useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#EDE7DC",
        roughness: 0.32,
        metalness: 0,
        clearcoat: 0.6,
        clearcoatRoughness: 0.12,
        envMapIntensity: 0.85,
        normalMap: marbleNormal,
        normalScale: new THREE.Vector2(0.45, 0.45),
      }),
    [marbleNormal],
  );

  const goldMat = React.useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#C8973F",
        metalness: 1.0,
        roughness: 0.15,
        envMapIntensity: 1.4,
      }),
    [],
  );

  return (
    <group>
      {/* Soft ambient fill */}
      <ambientLight intensity={0.35} />

      {/* Hard key light (SpotLight = the light shaft from above) */}
      <spotLight
        position={[1.4, 5, 2.5]}
        angle={0.42}
        penumbra={0.55}
        intensity={36}
        color="#FFF1D8"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* HDRI environment for grounded reflections (apartment ≈ rotunda warmth) */}
      <Environment preset="apartment" />

      {/* Volumetric light-shaft cone (semi-transparent additive) — pure visual */}
      <mesh position={[0.55, 1.6, 0.4]} rotation={[0, 0, -0.18]}>
        <coneGeometry args={[0.65, 4.6, 16, 1, true]} />
        <meshBasicMaterial
          color="#FFE4B0"
          transparent
          opacity={0.07}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ── Marble column ──────────────────────────────────────────────── */}
      {/* Doric shaft (24 radial segs ≈ subtle fluting illusion) */}
      <mesh position={[0, -0.05, 0]} material={marbleMat} castShadow receiveShadow>
        <cylinderGeometry args={[0.48, 0.54, 4.0, 24, 1]} />
      </mesh>

      {/* Capital — abacus block */}
      <mesh position={[0, 2.05, 0]} material={marbleMat} castShadow>
        <boxGeometry args={[1.25, 0.28, 1.25]} />
      </mesh>

      {/* Echinus (rounded transition under the abacus) */}
      <mesh position={[0, 1.8, 0]} material={marbleMat} castShadow>
        <cylinderGeometry args={[0.7, 0.5, 0.24, 24]} />
      </mesh>

      {/* Gold-leaf accent ring under the abacus */}
      <mesh position={[0, 1.93, 0]} material={goldMat} castShadow>
        <torusGeometry args={[0.62, 0.022, 12, 36]} />
      </mesh>

      {/* Gold-leaf accent ring at top of shaft */}
      <mesh position={[0, 1.66, 0]} material={goldMat} castShadow>
        <torusGeometry args={[0.55, 0.018, 12, 36]} />
      </mesh>

      {/* Base (stylobate) */}
      <mesh position={[0, -2.16, 0]} material={marbleMat} castShadow receiveShadow>
        <cylinderGeometry args={[0.74, 0.74, 0.22, 24]} />
      </mesh>

      {/* Gold-leaf base ring */}
      <mesh position={[0, -2.0, 0]} material={goldMat} castShadow>
        <torusGeometry args={[0.6, 0.018, 12, 36]} />
      </mesh>
    </group>
  );
  // Tris budget: 24-seg cylinders ≈ 96 tris each × 3 (shaft + echinus + base) = 288
  //              boxGeometry abacus ≈ 12 tris
  //              torusGeometry 36×12 ≈ 864 tris × 3 (gold rings) = 2592
  //              cone (16 segs) ≈ 32 tris
  //              total ≈ 2924 tris — well under 5k budget
}

interface MarbleColumnProps {
  posterSrc?: string;
}

export default function MarbleColumn({
  posterSrc = "/hero/poster.jpg",
}: MarbleColumnProps) {
  // Detect mobile (<768) for static poster fallback per brief perf budget
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    if (mq.addEventListener) {
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
    mq.addListener?.(handler);
    return () => mq.removeListener?.(handler);
  }, []);

  if (isMobile) {
    // Mobile fallback — static parchment-toned hero image with subtle ken-burns
    return (
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[#F5F1E8]" />
        <Image
          src={posterSrc}
          alt=""
          fill
          priority
          fetchPriority="high"
          className="object-cover opacity-75 motion-safe:animate-[kenburns_18s_ease-in-out_infinite_alternate]"
          sizes="100vw"
        />
        {/* parchment overlay-gradient lifts text contrast (WCAG AA) */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(245,241,232,0.85) 0%, rgba(245,241,232,0.55) 40%, rgba(245,241,232,0.0) 70%)",
          }}
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-[#F5F1E8]" />
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.4, 5.6], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        shadows
        style={{ position: "absolute", inset: 0 }}
      >
        <React.Suspense fallback={null}>
          <ColumnAndLights />
        </React.Suspense>
      </Canvas>

      {/* Parchment overlay gradient — anchors copy contrast on left 40% */}
      <div
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          background:
            "linear-gradient(90deg, rgba(245,241,232,0.78) 0%, rgba(245,241,232,0.42) 38%, rgba(245,241,232,0.0) 65%)",
        }}
        aria-hidden
      />
    </div>
  );
}
