"use client";
import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { siteConfig } from "@/lib/config";

/**
 * Real-estate flagship — notable-sales carousel.
 * Renders nothing when config.notable_sales is absent.
 * 3-up grid on desktop, swipe carousel on mobile.
 */
type Sale = { address: string; neighborhood: string; price: string; photo_url: string };

export function NotableSales() {
  const sales = (siteConfig as { notable_sales?: Sale[] }).notable_sales;
  if (!sales || sales.length === 0) return null;

  return (
    <section
      id="notable-sales"
      className="relative"
      style={{
        background: "var(--bg, #0A0A0A)",
        paddingTop: "9rem",
        paddingBottom: "9rem",
      }}
    >
      <div className="container">
        <div className="mb-12 flex flex-col gap-3 md:mb-16">
          <span
            className="text-[10px] font-medium uppercase tracking-[0.22em]"
            style={{
              color: "var(--accent2, #4DD0E1)",
              fontFamily: "var(--font-mono, ui-monospace)",
            }}
          >
            Notable Sales · 2024 — 2026
          </span>
          <h2
            className="font-display text-3xl font-normal leading-tight md:text-5xl"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--ink, #FFFFFF)",
              maxWidth: "44rem",
            }}
          >
            Closed at the top of the comp set.
          </h2>
          <p
            className="max-w-xl text-base"
            style={{
              fontFamily: "var(--font-body-v2, var(--font-body))",
              color: "var(--ink, #FFFFFF)",
              opacity: 0.62,
            }}
          >
            A representative sample. The off-market book carries another set never published.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-7">
          {sales.map((sale, i) => (
            <motion.article
              key={sale.address}
              className="group relative overflow-hidden rounded-[18px]"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: "var(--surface, #1A1A1A)",
                border: "1px solid rgba(77, 208, 225, 0.18)",
                boxShadow:
                  "0 30px 80px -20px rgba(0,0,0,0.55), 0 0 24px -8px rgba(77,208,225,0.18)",
              }}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={sale.photo_url}
                  alt={sale.address}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(10,10,10,0) 35%, rgba(10,10,10,0.8) 100%)",
                  }}
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-3 p-5 md:p-6">
                <div className="flex flex-col gap-1">
                  <span
                    className="text-[10px] font-medium uppercase tracking-[0.2em]"
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      fontFamily: "var(--font-mono, ui-monospace)",
                    }}
                  >
                    {sale.neighborhood}
                  </span>
                  <span
                    className="text-base font-medium leading-tight"
                    style={{
                      color: "#FFFFFF",
                      fontFamily: "var(--font-body-v2, var(--font-body))",
                    }}
                  >
                    {sale.address}
                  </span>
                </div>
                <span
                  className="font-display text-2xl font-normal leading-none md:text-3xl"
                  style={{
                    color: "var(--accent2, #4DD0E1)",
                    fontFamily: "var(--font-display)",
                    textShadow: "0 0 18px rgba(77, 208, 225, 0.45)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {sale.price}
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
