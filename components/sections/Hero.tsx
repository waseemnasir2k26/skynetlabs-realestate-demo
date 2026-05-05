"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion } from "framer-motion";
import { siteConfig } from "@/lib/config";
import { renderItalic } from "@/lib/markdown-italic";

// ── Lazy R3F variants ─────────────────────────────────────────────────────────
const ToothMesh = dynamic(() => import("@/components/HeroR3F/Tooth"), { ssr: false });
const FilmCanister = dynamic(() => import("@/components/HeroR3F/FilmCanister"), { ssr: false });
const MarbleColumn = dynamic(() => import("@/components/HeroR3F/MarbleColumn"), { ssr: false });
const Floorplan = dynamic(() => import("@/components/HeroR3F/Floorplan"), { ssr: false });
const Mansion = dynamic(() => import("@/components/HeroR3F/Mansion"), { ssr: false });

// ── Legacy fallbacks (kept for backward compat) ───────────────────────────────
const HeroR3FLegacy = dynamic(() => import("./HeroR3F").then((m) => m.HeroR3F), { ssr: false });
const HeroMP4 = dynamic(() => import("./HeroMP4").then((m) => m.HeroMP4), { ssr: false });

export function Hero() {
  const { hero, hero_3d, theme, owner, copy } = siteConfig;
  const tel = `tel:${owner.contact_phone ?? ""}`;

  // Reduce-motion detection
  const [reducedMotion, setReducedMotion] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // v2 hero has h1/sub directly; v1 hero has headline/sub
  const h1Text = copy?.h1 ?? hero?.h1 ?? hero?.headline ?? siteConfig.brand.tagline;
  const subText = copy?.sub ?? hero?.sub ?? siteConfig.brand.tagline;
  const primaryCtaLabel = copy?.primary_cta ?? hero?.cta_primary?.label ?? "Get a free quote →";

  // v2: hero.kind determines scene; v1: hero_3d.r3f_scene
  const heroKind = hero?.kind; // "r3f" | "photo" | "cinemagraph" | undefined
  const posterSrc = hero_3d?.poster_src ?? hero?.src ?? "/hero/poster.jpg";
  // Map v2 hero.kind + hero_3d fields → scene string used by renderBg
  let scene = hero_3d?.r3f_scene;
  if (!scene && heroKind === "r3f") {
    // map hero_3d.r3f_scene from the config's hero_3d block (dental has "r3f-tooth")
    scene = hero_3d?.r3f_scene ?? "r3f-tooth";
  } else if (!scene && heroKind === "cinemagraph") {
    scene = "cinemagraph";
  } else if (!scene && heroKind === "photo") {
    scene = "photo";
  }

  // ── Background layer ────────────────────────────────────────────────────────
  function renderBg() {
    if (reducedMotion) {
      return (
        <Image
          src={posterSrc}
          alt=""
          fill
          priority
          fetchPriority="high"
          className="absolute inset-0 -z-10 object-cover"
        />
      );
    }

    switch (scene) {
      case "r3f-tooth":
        return (
          <React.Suspense fallback={<StaticPoster src={posterSrc} />}>
            <ToothMesh posterSrc={posterSrc} />
          </React.Suspense>
        );
      case "r3f-film-canister":
        return (
          <React.Suspense fallback={<StaticPoster src={posterSrc} />}>
            <FilmCanister posterSrc={posterSrc} />
          </React.Suspense>
        );
      case "r3f-marble-column":
        return (
          <React.Suspense fallback={<StaticPoster src={posterSrc} />}>
            <MarbleColumn posterSrc={posterSrc} />
          </React.Suspense>
        );
      case "r3f-floorplan":
        return (
          <React.Suspense fallback={<StaticPoster src={posterSrc} />}>
            <Floorplan posterSrc={posterSrc} />
          </React.Suspense>
        );
      case "r3f-mansion":
        return (
          <React.Suspense fallback={<StaticPoster src={posterSrc} />}>
            <Mansion posterSrc={posterSrc} />
          </React.Suspense>
        );
      case "cinemagraph":
        return (
          <HeroCinemagraph
            mp4Src={hero_3d?.mp4_src ?? hero?.src ?? ""}
            posterSrc={posterSrc}
          />
        );
      case "photo":
        return (
          <Image
            src={posterSrc}
            alt=""
            fill
            priority
            fetchPriority="high"
            className="absolute inset-0 -z-10 object-cover"
          />
        );
      default:
        // legacy v1 paths
        if (hero_3d?.variant === "r3f-flagship") {
          return <HeroR3FLegacy primaryColor={theme?.primary ?? "#7A2E2A"} accentColor={theme?.accent ?? "#C8A35B"} />;
        }
        if (hero_3d?.mp4_src) {
          return <HeroMP4 src={hero_3d.mp4_src} poster={posterSrc} />;
        }
        return (
          <Image
            src={posterSrc}
            alt=""
            fill
            priority
            fetchPriority="high"
            className="absolute inset-0 -z-10 object-cover"
          />
        );
    }
  }

  return (
    <section id="hero" className="relative isolate flex min-h-[88vh] items-center overflow-hidden">
      {/* Sentinel at bottom of hero for StickyTelBar IntersectionObserver */}
      <div id="hero-sentinel" className="absolute bottom-0 left-0 h-1 w-full" aria-hidden />
      {renderBg()}

      <div className="container relative z-10 grid gap-10 py-20 md:grid-cols-12 md:py-28">
        <motion.div
          className="md:col-span-8 lg:col-span-7"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* H1 — display font with markdown-italic support */}
          <h1
            className="font-display text-4xl font-normal leading-tight tracking-tight md:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-display, var(--font-heading))", color: "var(--ink, inherit)" }}
          >
            {renderItalic(h1Text)}
          </h1>

          {/* Sub */}
          <p
            className="mt-5 max-w-xl text-base md:text-lg"
            style={{ fontFamily: "var(--font-body-v2, var(--font-body))", color: "var(--ink, inherit)", opacity: 0.72 }}
          >
            {subText}
          </p>

          {/* CTAs — primary bronze pill + secondary navy ghost (config-driven) */}
          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <a
              href={(copy as { primary_cta_href?: string })?.primary_cta_href ?? hero?.cta_primary?.href ?? "#contact"}
              className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide shadow-medium transition-all duration-200 hover:shadow-hard hover:-translate-y-0.5"
              style={{
                background: "var(--accent2, var(--accent, #B8893E))",
                color: "var(--bg, #fff)",
                fontFamily: "var(--font-body-v2, var(--font-body))",
              }}
            >
              {primaryCtaLabel}
            </a>
            {(copy?.secondary_cta || hero?.cta_secondary?.label) && (
              <a
                href={(copy as { secondary_cta_href?: string })?.secondary_cta_href ?? hero?.cta_secondary?.href ?? (owner.contact_phone ? tel : "#contact")}
                className="inline-flex items-center gap-1.5 rounded-full border px-5 py-3 text-sm font-medium transition-colors hover:opacity-80"
                style={{
                  borderColor: "var(--detail, var(--ink, #111))",
                  color: "var(--detail, var(--ink, #111))",
                  background: "transparent",
                  fontFamily: "var(--font-body-v2, var(--font-body))",
                }}
              >
                {copy?.secondary_cta ?? hero?.cta_secondary?.label}
              </a>
            )}
          </div>
        </motion.div>

        {/* Inline filter row — Elliman pattern, only when niche === realestate */}
        {siteConfig.niche === "realestate" && (
          <FilterRow ctaLabel={primaryCtaLabel} ctaHref={(copy as { primary_cta_href?: string })?.primary_cta_href ?? "#listings"} />
        )}
      </div>
    </section>
  );
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function StaticPoster({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt=""
      fill
      priority
      fetchPriority="high"
      className="absolute inset-0 -z-10 object-cover"
    />
  );
}

// ── Real-estate filter row (Elliman pattern) ─────────────────────────────────
function FilterRow({ ctaLabel, ctaHref }: { ctaLabel: string; ctaHref: string }) {
  const fields = [
    { label: "Price", options: ["Any", "$1M+", "$5M+", "$10M+", "$20M+", "$50M+"] },
    { label: "Beds", options: ["Any", "2+", "3+", "4+", "5+", "6+"] },
    { label: "Baths", options: ["Any", "2+", "3+", "4+", "5+"] },
    { label: "Type", options: ["Any", "Condo", "Penthouse", "Estate", "Waterfront", "New Dev"] },
  ];

  return (
    <motion.form
      onSubmit={(e) => e.preventDefault()}
      className="md:col-span-12"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div
        className="grid grid-cols-1 items-stretch gap-2 rounded-[18px] border p-2 md:grid-cols-[1fr_1fr_1fr_1fr_auto] md:gap-0 md:p-1.5"
        style={{
          background: "rgba(26, 26, 26, 0.65)",
          borderColor: "rgba(77, 208, 225, 0.22)",
          boxShadow: "0 30px 80px -20px rgba(77, 208, 225, 0.18), 0 8px 24px -4px rgba(0,0,0,0.45)",
        }}
      >
        {fields.map((f, i) => (
          <label
            key={f.label}
            className="relative flex flex-col gap-0.5 px-4 py-2.5 md:py-3"
            style={{
              borderRight: i < fields.length - 1 ? "1px solid rgba(77, 208, 225, 0.14)" : "none",
            }}
          >
            <span
              className="text-[10px] font-medium uppercase tracking-[0.18em]"
              style={{
                color: "rgba(255,255,255,0.55)",
                fontFamily: "var(--font-mono, ui-monospace)",
              }}
            >
              {f.label}
            </span>
            <select
              defaultValue={f.options[0]}
              className="w-full bg-transparent text-sm font-medium outline-none"
              style={{
                color: "#FFFFFF",
                fontFamily: "var(--font-body-v2, var(--font-body))",
              }}
            >
              {f.options.map((opt) => (
                <option key={opt} value={opt} style={{ background: "#0A0A0A", color: "#FFFFFF" }}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        ))}
        <a
          href={ctaHref}
          className="flex items-center justify-center gap-1.5 rounded-[14px] px-6 py-3 text-sm font-semibold tracking-wide transition-all duration-200 hover:opacity-90 md:rounded-[12px] md:px-7"
          style={{
            background: "transparent",
            color: "#4DD0E1",
            border: "1px solid rgba(77, 208, 225, 0.7)",
            fontFamily: "var(--font-body-v2, var(--font-body))",
            boxShadow: "0 0 18px -4px rgba(77, 208, 225, 0.45) inset, 0 0 18px -4px rgba(77, 208, 225, 0.35)",
          }}
        >
          {ctaLabel}
        </a>
      </div>
    </motion.form>
  );
}

function HeroCinemagraph({ mp4Src, posterSrc }: { mp4Src: string; posterSrc: string }) {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        poster={posterSrc}
        className="h-full w-full object-cover"
      >
        <source src={mp4Src} type="video/mp4" />
      </video>
    </div>
  );
}
