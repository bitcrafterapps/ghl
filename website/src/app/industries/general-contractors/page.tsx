import { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { IndustryPageContent } from "@/components/industry-page-content";

export const metadata: Metadata = {
  title: "AI Automation for General Contractors | Missed Call Recovery & Booking",
  description:
    "Stop losing construction leads to missed calls. Our AI-powered system automatically responds to missed calls, qualifies leads, and books estimates 24/7 for general contractors. $497/mo, no contracts.",
  keywords: [
    "general contractor automation",
    "construction lead management",
    "general contractor CRM",
    "construction booking software",
    "missed call text back contractors",
    "contractor lead capture",
    "construction estimate booking",
    "general contractor software",
  ],
};

const industryData = {
  name: "General Contractors",
  slug: "general-contractors",
  headline: "GENERAL CONTRACTORS:",
  subheadline: "STOP LOSING JOBS TO MISSED CALLS",
  description:
    "When homeowners and property managers reach out for construction projects, they're usually calling 3-5 contractors. The one who responds first and follows up best wins the job. Our AI system ensures you never miss another opportunity.",
  painPoints: [
    "Missing calls while your crew is on job sites",
    "Leads going cold during busy construction seasons",
    "No time to follow up on estimates while managing projects",
    "Losing after-hours calls to competitors who respond faster",
    "Spending on Google Ads and LSAs but missing the leads they generate",
  ],
  benefits: [
    "Instant SMS response to every missed call",
    "AI qualification asks about project scope, timeline, and budget",
    "Automatic estimate booking on your calendar",
    "Smart follow-up on quotes until you get a yes or no",
    "Review requests after completed projects to boost rankings",
  ],
  stats: {
    missedCallRecovery: "35%",
    responseTime: "< 30 seconds",
    moreEstimates: "40%",
  },
  testimonialPlaceholder:
    "We were missing evening calls from Google Ads all the time. Now every call gets a response, and we're booking 3-4 extra estimates per week without adding office staff.",
};

export default function GeneralContractorsPage() {
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
