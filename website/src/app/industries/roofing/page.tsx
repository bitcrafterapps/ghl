import { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { IndustryPageContent } from "@/components/industry-page-content";

export const metadata: Metadata = {
  title: "AI Automation for Roofing Companies | Missed Call Recovery & Booking",
  description:
    "Stop losing roofing jobs to missed calls. Our AI-powered system automatically responds to missed calls, qualifies leads, and books roof inspections 24/7 for roofers. $497/mo, no contracts.",
  keywords: [
    "roofing automation software",
    "roofer lead management",
    "roofing CRM software",
    "roofing booking system",
    "missed call text back roofer",
    "roofing lead capture",
    "roof inspection scheduling",
    "roofing contractor software",
    "storm damage leads",
    "roof replacement booking",
  ],
};

const industryData = {
  name: "Roofing Companies",
  slug: "roofing",
  headline: "ROOFING COMPANIES:",
  subheadline: "CAPTURE MORE ROOF JOBS",
  description:
    "After a storm, homeowners are calling every roofer in town. The companies that respond fastest and follow up best get the jobs. Our AI ensures you're first to respond and never lose a lead to slow follow-up.",
  painPoints: [
    "Missing calls while crews are up on roofs",
    "Storm season overwhelm with hundreds of calls pouring in",
    "Leads going cold because follow-up takes days",
    "Office staff can't handle the volume during busy periods",
    "Insurance claim leads slipping through the cracks",
  ],
  benefits: [
    "Instant SMS response to every storm damage inquiry",
    "AI qualifies leads and captures damage photos via text",
    "Automatic roof inspection scheduling on your calendar",
    "Smart follow-up on quotes until you get a decision",
    "Review generation to dominate local roofing searches",
  ],
  stats: {
    missedCallRecovery: "48%",
    responseTime: "< 30 seconds",
    moreEstimates: "45%",
  },
  testimonialPlaceholder:
    "After the last big storm, we had hundreds of calls and couldn't keep up. Now every call gets handled instantly, and we're booking more inspections than ever before.",
};

export default function RoofingPage() {
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
