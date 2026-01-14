import { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { IndustryPageContent } from "@/components/industry-page-content";

export const metadata: Metadata = {
  title: "AI Automation for HVAC Companies | Missed Call Recovery & Booking",
  description:
    "Stop losing HVAC service calls to missed calls. Our AI-powered system automatically responds to missed calls, qualifies leads, and books service appointments 24/7 for HVAC companies. $497/mo, no contracts.",
  keywords: [
    "HVAC automation software",
    "HVAC lead management",
    "HVAC CRM software",
    "HVAC booking system",
    "missed call text back HVAC",
    "HVAC lead capture",
    "HVAC service scheduling",
    "HVAC contractor software",
    "heating and cooling leads",
    "AC repair booking software",
  ],
};

const industryData = {
  name: "HVAC Companies",
  slug: "hvac",
  headline: "HVAC COMPANIES:",
  subheadline: "NEVER MISS ANOTHER SERVICE CALL",
  description:
    "When a homeowner's AC breaks down in the summer heat or their furnace dies in winter, they're calling every HVAC company they can find. The first one to respond wins the job. Our AI ensures you're always first to respond — even at 2 AM.",
  painPoints: [
    "Missing emergency calls when technicians are on service calls",
    "Losing after-hours calls to competitors with 24/7 answering",
    "Peak season overwhelm leading to lost opportunities",
    "No time to follow up on maintenance agreement renewals",
    "Spending on Google LSAs but missing the calls they generate",
  ],
  benefits: [
    "Instant SMS response to every missed emergency call",
    "AI qualification identifies urgent vs. routine service needs",
    "Automatic service appointment booking on your calendar",
    "Smart follow-up on maintenance agreements and quotes",
    "Review requests after completed jobs to dominate local search",
  ],
  stats: {
    missedCallRecovery: "42%",
    responseTime: "< 15 seconds",
    moreEstimates: "38%",
  },
  testimonialPlaceholder:
    "During our busiest summer months, we were missing 30% of calls. Now every call gets an instant response, and we're booking way more AC installs from the same marketing spend.",
};

export default function HVACPage() {
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
