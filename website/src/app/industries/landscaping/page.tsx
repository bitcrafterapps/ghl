import { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { IndustryPageContent } from "@/components/industry-page-content";

export const metadata: Metadata = {
  title: "AI Automation for Landscaping Companies | Missed Call Recovery & Booking",
  description:
    "Stop losing landscaping jobs to missed calls. Our AI-powered system automatically responds to missed calls, qualifies leads, and books estimates 24/7 for landscapers. $497/mo, no contracts.",
  keywords: [
    "landscaping automation",
    "landscaper lead management",
    "landscaping CRM",
    "landscaping booking software",
    "missed call text back landscaper",
    "landscaping leads",
    "lawn care leads",
    "landscaping company software",
    "landscape design scheduling",
    "lawn service booking",
  ],
};

const industryData = {
  name: "Landscaping Companies",
  slug: "landscaping",
  headline: "LANDSCAPING COMPANIES:",
  subheadline: "GROW YOUR BUSINESS AUTOMATICALLY",
  description:
    "Spring and summer are when landscaping businesses thrive — but also when you're too busy working to answer phones. Homeowners comparing landscape companies go with whoever responds first. Our AI ensures you never miss an opportunity.",
  painPoints: [
    "Missing calls while crews are out on jobs all day",
    "Peak season overwhelm with hundreds of estimate requests",
    "Losing recurring lawn care contracts to faster competitors",
    "No time to follow up on landscape design proposals",
    "Commercial leads slipping through during busy residential season",
  ],
  benefits: [
    "Instant SMS response to every landscaping inquiry",
    "AI qualifies project type: lawn care, design, or hardscape",
    "Automatic estimate scheduling on your calendar",
    "Smart follow-up on landscape design proposals",
    "Review requests to dominate local landscaping searches",
  ],
  stats: {
    missedCallRecovery: "44%",
    responseTime: "< 30 seconds",
    moreEstimates: "38%",
  },
  testimonialPlaceholder:
    "Our crews are in the field all day and we were missing tons of calls. Now every lead gets captured instantly, and we've added dozens of new recurring lawn care clients.",
};

export default function LandscapingPage() {
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
