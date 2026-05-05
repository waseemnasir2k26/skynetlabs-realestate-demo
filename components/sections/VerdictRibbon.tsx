import { siteConfig } from "@/lib/config";

/**
 * Phase 5 LIGHT FLAGSHIP (law) — verdict ribbon + press-logo strip below hero.
 * Reads:
 *   config.verdict_ribbon  : Array<{ value, label }>  (3 stats, tabular-nums)
 *   config.press_logos     : Array<string>            (press names — text fallback)
 * Renders nothing if verdict_ribbon is absent.
 */
export function VerdictRibbon() {
  const ribbon = (siteConfig as unknown as {
    verdict_ribbon?: Array<{ value: string; label: string }>;
    press_logos?: string[];
  }).verdict_ribbon;
  const pressLogos = (siteConfig as unknown as { press_logos?: string[] }).press_logos ?? [];

  if (!ribbon || ribbon.length === 0) return null;

  return (
    <section
      aria-label="Verdicts and press"
      className="border-y"
      style={{
        background: "var(--bg, #F5F1E8)",
        borderColor: "rgba(0,0,0,0.08)",
      }}
    >
      <div className="container py-10 md:py-14">
        {/* Verdict stat ribbon — bronze hairline rules between */}
        <div className="grid grid-cols-1 divide-y md:grid-cols-3 md:divide-x md:divide-y-0"
          style={{ borderColor: "rgba(184,137,62,0.30)" }}
        >
          {ribbon.map((stat, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1 px-4 py-6 text-center md:py-2"
              style={{ borderColor: "rgba(184,137,62,0.30)" }}
            >
              <span
                className="font-tabular text-4xl font-normal leading-none md:text-5xl"
                style={{
                  fontFamily: "var(--font-display, var(--font-heading))",
                  color: "var(--ink, #111)",
                }}
              >
                {stat.value}
              </span>
              <span
                className="text-[11px] font-medium uppercase tracking-[0.2em]"
                style={{ color: "var(--ink, #111)", opacity: 0.6 }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Press-logo strip — desaturated text-only fallback (no fake brand SVGs) */}
        {pressLogos.length > 0 && (
          <div className="mt-10 flex flex-col items-center gap-4">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.28em]"
              style={{ color: "var(--ink, #111)", opacity: 0.5 }}
            >
              As seen in
            </p>
            <div
              className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 md:gap-x-12"
              style={{ opacity: 0.55 }}
            >
              {pressLogos.map((name, i) => (
                <span
                  key={i}
                  className="text-sm font-medium uppercase tracking-[0.18em]"
                  style={{
                    color: "var(--ink, #111)",
                    fontFamily: "var(--font-body-v2, var(--font-body))",
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
