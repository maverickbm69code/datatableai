import { CutleryDivider } from "@/components/site/cutlery-divider";
import { HeroSection } from "@/components/site/hero-section";
import { OffersSection } from "@/components/site/offers-section";
import { PrivacySection } from "@/components/site/privacy-section";
import { RhythmSection } from "@/components/site/rhythm-section";
import { ServiceSection } from "@/components/site/service-section";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <CutleryDivider />
        <ServiceSection />
        <CutleryDivider />
        <RhythmSection />
        <CutleryDivider />
        <OffersSection />
        <CutleryDivider />
        <PrivacySection />
      </main>
      <SiteFooter />
    </div>
  );
};

export default Index;
