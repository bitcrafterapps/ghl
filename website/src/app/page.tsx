import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/sections/hero";
import { ProblemSection } from "@/components/sections/problem";
import { SolutionSection } from "@/components/sections/solution";
import { WhatYouGetSection } from "@/components/sections/what-you-get";
import { HowItWorksSection } from "@/components/sections/how-it-works";
import { WhoItsForSection } from "@/components/sections/who-its-for";
import { ResultsSection } from "@/components/sections/results";
import { CaseStudySection } from "@/components/sections/case-study";
import { PricingSection } from "@/components/sections/pricing";
import { GuaranteeSection } from "@/components/sections/guarantee";
import { FAQSection } from "@/components/sections/faq";
import { AboutSection } from "@/components/sections/about";
import { CTASection } from "@/components/sections/cta";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <HeroSection />
        <ProblemSection />
        <WhatYouGetSection />
        <SolutionSection />
        <HowItWorksSection />
        <WhoItsForSection />
        <ResultsSection />
        <CaseStudySection />
        <PricingSection />
        <GuaranteeSection />
        <FAQSection />
        <AboutSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}

