import { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { IndustryPageContent } from "@/components/industry-page-content";

export const metadata: Metadata = {
  title: "AI Automation for Electrical Contractors | Missed Call Recovery & Booking",
  description:
    "Stop losing electrical jobs to missed calls. Our AI-powered system automatically responds to missed calls, qualifies leads, and books service appointments 24/7 for electricians. $497/mo, no contracts.",
  keywords: [
    "electrician automation software",
    "electrical contractor lead management",
    "electrician CRM software",
    "electrical booking system",
    "missed call text back electrician",
    "electrical lead capture",
    "electrician scheduling software",
    "electrical contractor software",
    "electrician leads",
    "panel upgrade booking",
  ],
};

const industryData = {
  name: "Electrical Contractors",
  slug: "electrical",
  headline: "ELECTRICAL CONTRACTORS:",
  subheadline: "POWER UP YOUR LEAD CAPTURE",
  description:
    "From panel upgrades to EV charger installations to emergency repairs, homeowners and businesses need reliable electricians. When they call, they expect a quick response. Our AI ensures you never miss an opportunity to win their business.",
  painPoints: [
    "Missing calls while electricians are on job sites",
    "Losing commercial and residential leads during busy periods",
    "No time to follow up on quotes for larger electrical projects",
    "After-hours emergency calls going unanswered",
    "Spending on marketing but not capturing all the leads",
  ],
  benefits: [
    "Instant SMS response to every missed service call",
    "AI qualification for residential vs. commercial projects",
    "Automatic appointment booking for estimates",
    "Smart follow-up on panel upgrade and EV charger quotes",
    "Review requests to boost your electrical contractor rankings",
  ],
  stats: {
    missedCallRecovery: "38%",
    responseTime: "< 25 seconds",
    moreEstimates: "32%",
  },
  testimonialPlaceholder:
    "We were losing a lot of commercial leads because we couldn't answer during service calls. Now every inquiry gets handled instantly, and we've doubled our quote volume.",
};

export default function ElectricalPage() {
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
