"use client";
import * as React from "react";
import { motion } from "framer-motion";
import { siteConfig } from "@/lib/config";

/**
 * Phase 5 LIGHT FLAGSHIP (law) — named-verdict gallery.
 * 12 cards, 3 cols desktop / 1 col mobile, each card = headline + verdict $
 * (tabular-nums) + 1-line summary + year. Card primitive = featured per brief
 * (radius lg, hairline border, shadow-soft → shadow-medium on hover).
 *
 * Reads config.verdict_gallery — renders nothing if absent.
 */
export function VerdictGallery() {
  const items = (siteConfig as unknown as {
    verdict_gallery?: Array<{ headline: string; amount: string; summary: string; year: string }>;
  }).verdict_gallery;
  if (!items || items.length === 0) return null;

  return (
    <section
      id="verdicts"
      className="py-20 md:py-24"
      style={{ background: "var(--surface, #fff)" }}
    >
      <div className="container">
        <div className="mb-10 max-w-2xl">
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--accent2, var(--accent))", fontFamily: "var(--font-body-v2, var(--font-body))" }}
          >
            Verdicts &amp; resolutions
          </p>
          <h2
            className="text-3xl font-normal md:text-4xl"
            style={{ fontFamily: "var(--font-display, var(--font-heading))", color: "var(--ink, #111)" }}
          >
            Recent results, on the record.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((c, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="group flex flex-col gap-3 rounded-[18px] border bg-[var(--bg,#fff)] p-6 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-medium"
              style={{ borderColor: "rgba(0,0,0,0.10)" }}
            >
              <div
                className="font-tabular text-3xl font-normal leading-none"
                style={{
                  fontFamily: "var(--font-display, var(--font-heading))",
                  color: "var(--accent2, var(--accent))",
                }}
              >
                {c.amount}
              </div>
              <h3
                className="text-base font-medium leading-snug"
                style={{
                  fontFamily: "var(--font-body-v2, var(--font-body))",
                  color: "var(--ink, #111)",
                }}
              >
                {c.headline}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--ink, #111)", opacity: 0.62 }}
              >
                {c.summary}
              </p>
              <div className="mt-auto flex items-center gap-2 pt-2">
                <span
                  className="inline-block h-px w-6"
                  style={{ background: "var(--accent2, var(--accent))" }}
                  aria-hidden
                />
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                  style={{ color: "var(--ink, #111)", opacity: 0.5 }}
                >
                  {c.year}
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
