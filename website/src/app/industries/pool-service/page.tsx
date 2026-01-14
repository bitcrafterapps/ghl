import { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { IndustryPageContent } from "@/components/industry-page-content";

export const metadata: Metadata = {
  title: "AI Automation for Pool Service Companies | Missed Call Recovery & Booking",
  description:
    "Stop losing pool service and repair jobs to missed calls. Our AI-powered system automatically responds to missed calls, qualifies leads, and books service appointments 24/7. $497/mo, no contracts.",
  keywords: [
    "pool service automation",
    "pool company lead management",
    "pool service CRM",
    "pool booking software",
    "missed call text back pool",
    "pool cleaning leads",
    "pool repair leads",
    "pool company software",
    "pool maintenance scheduling",
    "pool service booking",
  ],
};

const industryData = {
  name: "Pool Service Companies",
  slug: "pool-service",
  headline: "POOL SERVICE COMPANIES:",
  subheadline: "DIVE INTO MORE BOOKINGS",
  description:
    "Pool season is short and competition is fierce. When homeowners need pool opening, repairs, or weekly service, they're comparing multiple companies. Fast, professional response wins the contract. Our AI makes sure you're always first.",
  painPoints: [
    "Missing calls while servicing pools around town",
    "Peak season overwhelm with too many inquiries to handle",
    "Losing weekly service contracts to faster responders",
    "No system to follow up on pool renovation quotes",
    "Seasonal staff can't keep up with phone volume",
  ],
  benefits: [
    "Instant SMS response to every pool inquiry",
    "AI qualifies service type: cleaning, repair, or renovation",
    "Automatic appointment booking for estimates",
    "Smart follow-up on weekly service proposals",
    "Review generation to build seasonal trust",
  ],
  stats: {
    missedCallRecovery: "38%",
    responseTime: "< 25 seconds",
    moreEstimates: "40%",
  },
  testimonialPlaceholder:
    "During pool season, we were drowning in calls and missing half of them. Now every inquiry gets handled instantly, and we've signed way more weekly service contracts.",
};

export default function PoolServicePage() {
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
