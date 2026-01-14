import { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { IndustryPageContent } from "@/components/industry-page-content";

export const metadata: Metadata = {
  title: "AI Automation for Carpet & Tile Cleaning | Missed Call Recovery & Booking",
  description:
    "Stop losing carpet and tile cleaning jobs to missed calls. Our AI-powered system automatically responds to missed calls, qualifies leads, and books cleaning appointments 24/7. $497/mo, no contracts.",
  keywords: [
    "carpet cleaning automation",
    "tile cleaning lead management",
    "carpet cleaner CRM",
    "cleaning booking software",
    "missed call text back cleaning",
    "carpet cleaning leads",
    "tile cleaning leads",
    "cleaning company software",
    "floor cleaning scheduling",
    "carpet cleaning booking",
  ],
};

const industryData = {
  name: "Carpet & Tile Cleaning Companies",
  slug: "carpet-tile-cleaning",
  headline: "CARPET & TILE CLEANING:",
  subheadline: "BOOK MORE CLEANING JOBS AUTOMATICALLY",
  description:
    "When homeowners want their carpets or tile cleaned, they're comparing prices and availability from multiple companies. The one that responds fastest with a professional approach wins the booking. Our AI makes you that company.",
  painPoints: [
    "Missing calls while technicians are on cleaning jobs",
    "Losing bookings to competitors who answer first",
    "No time to follow up on quotes for large jobs",
    "After-hours inquiries going unanswered",
    "Struggling to manage commercial vs. residential scheduling",
  ],
  benefits: [
    "Instant SMS response to every cleaning inquiry",
    "AI qualifies job size and captures square footage details",
    "Automatic appointment booking on your schedule",
    "Smart follow-up for recurring cleaning agreements",
    "Review requests to dominate local cleaning searches",
  ],
  stats: {
    missedCallRecovery: "35%",
    responseTime: "< 30 seconds",
    moreEstimates: "42%",
  },
  testimonialPlaceholder:
    "We're a small team and couldn't always answer calls during jobs. Now every call gets handled instantly, and we've increased our monthly bookings by over 30%.",
};

export default function CarpetTileCleaningPage() {
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
