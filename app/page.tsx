import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { VerdictRibbon } from "@/components/sections/VerdictRibbon";
import { VerdictGallery } from "@/components/sections/VerdictGallery";
import { ServicesEditorial } from "@/components/sections/ServicesEditorial";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { CaseStudy } from "@/components/sections/CaseStudy";
import { TestimonialsEditorial } from "@/components/sections/TestimonialsEditorial";
import { PhotoGallery } from "@/components/sections/PhotoGallery";
import { FAQv2 } from "@/components/sections/FAQv2";
import { LeadMagnetV2 } from "@/components/sections/LeadMagnetV2";
import { ServiceAreaWidget } from "@/components/sections/ServiceAreaWidget";
import { NotableSales } from "@/components/sections/NotableSales";
import { NeighborhoodGrid } from "@/components/sections/NeighborhoodGrid";
import { siteConfig } from "@/lib/config";

export default function HomePage() {
  return (
    <>
      {/* 1. Hero */}
      <Hero />

      {/* 2. Verdict Ribbon + Press Logos (law flagship — null on niches w/o config) */}
      <VerdictRibbon />

      {/* 3. Trust Strip (v2 — replaces TrustRow) */}
      <TrustStrip />

      {/* 4. Services — editorial 3-col */}
      <ServicesEditorial />

      {/* 5. Process Timeline */}
      <ProcessTimeline />

      {/* 6. Case Study (new, optional) */}
      <CaseStudy />

      {/* 7. Notable Sales (real-estate flagship — null without config.notable_sales) */}
      <NotableSales />

      {/* 8. Verdict Gallery (law flagship — null on niches w/o config) */}
      <VerdictGallery />

      {/* 9. Testimonials — 3-card editorial */}
      <TestimonialsEditorial />

      {/* 9b. Neighborhood Grid (real-estate flagship — null without config.neighborhoods) */}
      <NeighborhoodGrid />

      {/* 9. Gallery — reads config.photos.gallery array */}
      {(siteConfig.modules?.photo_gallery !== false) && <PhotoGallery />}

      {/* 10. FAQ */}
      {(siteConfig.modules?.faq !== false) && <FAQv2 />}

      {/* 11. Lead Magnet */}
      <LeadMagnetV2 />

      {/* 12. Service Area Map */}
      {(siteConfig.modules?.service_area_map !== false) && <ServiceAreaWidget />}
    </>
  );
}
