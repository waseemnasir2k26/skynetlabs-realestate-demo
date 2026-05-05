"use client";
import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { siteConfig } from "@/lib/config";

/**
 * Real-estate flagship — neighborhood grid (Brickell / Coconut Grove / etc).
 * Renders nothing when config.neighborhoods is absent.
 * 6-card 3-column grid w/ photo + cyan-bordered hover overlay.
 */
type Hood = { name: string; median: string; inventory: number };

const HOOD_PHOTOS: Record<string, string> = {
  Brickell: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1280&auto=format&fit=crop&q=80",
  "Coconut Grove": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1280&auto=format&fit=crop&q=80",
  "Bal Harbour": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1280&auto=format&fit=crop&q=80",
  "Sunny Isles": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1280&auto=format&fit=crop&q=80",
  "Coral Gables": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1280&auto=format&fit=crop&q=80",
  "Star Island": "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1280&auto=format&fit=crop&q=80",
};

export function NeighborhoodGrid() {
  const hoods = (siteConfig as { neighborhoods?: Hood[] }).neighborhoods;
  if (!hoods || hoods.length === 0) return null;

  return (
    <section
      id="neighborhoods"
      className="relative"
      style={{
        background: "var(--bg, #0A0A0A)",
        paddingTop: "9rem",
        paddingBottom: "9rem",
      }}
    >
      <div className="container">
        <div className="mb-10 flex flex-col gap-3 md:mb-14">
          <span
            className="text-[10px] font-medium uppercase tracking-[0.22em]"
            style={{
              color: "var(--accent2, #4DD0E1)",
              fontFamily: "var(--font-mono, ui-monospace)",
            }}
          >
            Where we work · Six markets
          </span>
          <h2
            className="font-display text-3xl font-normal leading-tight md:text-5xl"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--ink, #FFFFFF)",
              maxWidth: "44rem",
            }}
          >
            Six neighborhoods. One short list of relationships.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {hoods.map((h, i) => (
            <motion.a
              key={h.name}
              href="#contact"
              className="group relative block overflow-hidden rounded-[18px]"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{ duration: 0.55, delay: (i % 3) * 0.06, ease: [0.22, 1, 0.36, 1] }}
              style={{
                border: "1px solid rgba(77, 208, 225, 0.18)",
                boxShadow: "0 18px 50px -16px rgba(0,0,0,0.55)",
              }}
            >
              <div className="relative aspect-[5/4] w-full overflow-hidden">
                <Image
                  src={HOOD_PHOTOS[h.name] ?? "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1280&auto=format&fit=crop&q=80"}
                  alt={h.name}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                />
                <div
                  className="absolute inset-0 transition-colors"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(10,10,10,0.18) 0%, rgba(10,10,10,0.55) 60%, rgba(10,10,10,0.92) 100%)",
                  }}
                />
                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    boxShadow: "inset 0 0 0 2px rgba(77, 208, 225, 0.55)",
                  }}
                  aria-hidden
                />
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-3 p-5 md:p-6">
                  <h3
                    className="font-display text-2xl font-normal leading-tight md:text-3xl"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "#FFFFFF",
                    }}
                  >
                    {h.name}
                  </h3>
                  <div className="flex flex-col items-end gap-0.5">
                    <span
                      className="text-base font-medium tabular-nums"
                      style={{
                        color: "var(--accent2, #4DD0E1)",
                        fontFamily: "var(--font-mono, ui-monospace)",
                        textShadow: "0 0 12px rgba(77, 208, 225, 0.45)",
                      }}
                    >
                      {h.median}
                    </span>
                    <span
                      className="text-[10px] uppercase tracking-[0.18em]"
                      style={{
                        color: "rgba(255,255,255,0.55)",
                        fontFamily: "var(--font-mono, ui-monospace)",
                      }}
                    >
                      {h.inventory} active · median
                    </span>
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
