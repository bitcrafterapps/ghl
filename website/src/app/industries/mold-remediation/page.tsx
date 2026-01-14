import { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { IndustryPageContent } from "@/components/industry-page-content";

export const metadata: Metadata = {
  title: "AI Automation for Mold Remediation | Missed Call Recovery & Booking",
  description:
    "Stop losing mold remediation jobs to missed calls. Our AI-powered system automatically responds to missed calls, qualifies leads, and books inspections 24/7 for mold removal companies. $497/mo, no contracts.",
  keywords: [
    "mold remediation automation",
    "mold removal lead management",
    "mold company CRM",
    "mold inspection booking",
    "missed call text back mold",
    "mold remediation leads",
    "mold testing scheduling",
    "mold removal software",
    "mold damage leads",
    "mold inspection software",
  ],
};

const industryData = {
  name: "Mold Remediation Companies",
  slug: "mold-remediation",
  headline: "MOLD REMEDIATION:",
  subheadline: "RESPOND TO HEALTH CONCERNS INSTANTLY",
  description:
    "When homeowners discover mold, they're worried about their family's health. They want answers and action fast. The mold remediation company that responds first builds trust and wins the job. Our AI ensures you're always first.",
  painPoints: [
    "Missing calls during mold testing and remediation jobs",
    "Anxious homeowners calling competitors when you don't answer",
    "No system to capture photos of mold damage via text",
    "Follow-up on inspection quotes falling through the cracks",
    "Losing insurance referral leads to slow response times",
  ],
  benefits: [
    "Instant SMS response to concerned homeowners",
    "AI captures mold photos and damage details via text",
    "Automatic mold inspection scheduling",
    "Smart follow-up on remediation quotes",
    "Review requests to build trust and credibility",
  ],
  stats: {
    missedCallRecovery: "40%",
    responseTime: "< 20 seconds",
    moreEstimates: "36%",
  },
  testimonialPlaceholder:
    "Homeowners with mold are stressed and call multiple companies. Now we respond instantly to every call, and our close rate has improved dramatically because we're first.",
};

export default function MoldRemediationPage() {
  return (
    <>
      <Navigation />
      <main>
        <IndustryPageContent industry={industryData} />
      </main>
      <Footer />
    </>
  );
}
