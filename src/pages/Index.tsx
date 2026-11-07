import { AnalysisSection } from "@/components/site/analysis-section";
import { CutleryDivider } from "@/components/site/cutlery-divider";
import { DarkBandSection } from "@/components/site/dark-band-section";
import { FinalCtaSection } from "@/components/site/final-cta-section";
import { FounderSection } from "@/components/site/founder-section";
import { HeroSection } from "@/components/site/hero-section";
import { HumanSection } from "@/components/site/human-section";
import { OffersSection } from "@/components/site/offers-section";
import { PromiseSection } from "@/components/site/promise-section";
import { WatchSection } from "@/components/site/watch-section";
import { PrivacySection } from "@/components/site/privacy-section";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { StepsSection } from "@/components/site/steps-section";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <CutleryDivider />
        <StepsSection />
        <CutleryDivider />
        <AnalysisSection />
        <CutleryDivider />
        <DarkBandSection />
        <CutleryDivider />
        <OffersSection />
        <CutleryDivider />
        <WatchSection />
        <CutleryDivider />
        <HumanSection />
        <CutleryDivider />
        <PromiseSection />
        <CutleryDivider />
        <PrivacySection />
        <CutleryDivider />
        <FounderSection />
        <CutleryDivider />
        <FinalCtaSection />
      </main>
      <SiteFooter />
    </div>
  );
};

export default Index;
