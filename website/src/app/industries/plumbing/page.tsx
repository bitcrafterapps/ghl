import { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { IndustryPageContent } from "@/components/industry-page-content";

export const metadata: Metadata = {
  title: "AI Automation for Plumbing Companies | Missed Call Recovery & Booking",
  description:
    "Stop losing plumbing jobs to missed calls. Our AI-powered system automatically responds to missed calls, qualifies emergency leads, and books service appointments 24/7 for plumbers. $497/mo, no contracts.",
  keywords: [
    "plumbing automation software",
    "plumber lead management",
    "plumbing CRM software",
    "plumber booking system",
    "missed call text back plumber",
    "plumbing lead capture",
    "plumber scheduling software",
    "plumbing contractor software",
    "emergency plumber leads",
    "drain cleaning booking",
  ],
};

const industryData = {
  name: "Plumbing Companies",
  slug: "plumbing",
  headline: "PLUMBING COMPANIES:",
  subheadline: "CAPTURE EVERY EMERGENCY CALL",
  description:
    "When someone has a burst pipe or clogged drain, they need help NOW. They're calling multiple plumbers and going with whoever answers first. Our AI ensures you respond instantly — turning emergencies into booked jobs.",
  painPoints: [
    "Missing emergency calls while dealing with other emergencies",
    "Losing weekend and after-hours calls to 24/7 competitors",
    "Dispatch overwhelmed during peak morning hours",
    "No system to follow up on water heater quotes",
    "Paying for ads but missing the calls they bring in",
  ],
  benefits: [
    "Instant SMS response to emergency plumbing calls",
    "AI identifies emergency severity and routes appropriately",
    "Automatic service scheduling for routine calls",
    "Smart follow-up on quotes for water heaters, repiping, etc.",
    "Review automation to build your local reputation",
  ],
  stats: {
    missedCallRecovery: "45%",
    responseTime: "< 20 seconds",
    moreEstimates: "35%",
  },
  testimonialPlaceholder:
    "Emergency calls were going to voicemail and we'd lose them to competitors. Now we capture every call instantly, and our booking rate has gone through the roof.",
};

export default function PlumbingPage() {
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
