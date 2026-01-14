import { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { IndustryPageContent } from "@/components/industry-page-content";

export const metadata: Metadata = {
  title: "AI Automation for Water & Fire Restoration | Missed Call Recovery & Booking",
  description:
    "Stop losing restoration jobs to missed calls. Our AI-powered system automatically responds to emergency water and fire damage calls, qualifies leads, and dispatches 24/7. $497/mo, no contracts.",
  keywords: [
    "restoration company automation",
    "water damage lead management",
    "fire restoration CRM",
    "restoration booking software",
    "missed call text back restoration",
    "water damage leads",
    "fire damage leads",
    "restoration contractor software",
    "emergency restoration dispatch",
    "flood cleanup booking",
  ],
};

const industryData = {
  name: "Water & Fire Restoration Companies",
  slug: "restoration",
  headline: "RESTORATION COMPANIES:",
  subheadline: "BE FIRST ON EVERY EMERGENCY",
  description:
    "Water and fire emergencies can happen any time — 3 AM, holidays, weekends. Property owners need help immediately and will call whoever answers first. Our AI ensures you capture every emergency call, day or night.",
  painPoints: [
    "Missing middle-of-the-night emergency calls",
    "Losing jobs to competitors with 24/7 dispatch centers",
    "Emergency calls going to voicemail during active jobs",
    "No way to capture damage photos before dispatch",
    "Insurance referrals lost due to slow response times",
  ],
  benefits: [
    "Instant 24/7 SMS response to all emergency calls",
    "AI captures damage photos and severity assessment via text",
    "Automatic emergency dispatch coordination",
    "Smart follow-up on insurance claim documentation",
    "Review generation to build trust with insurance partners",
  ],
  stats: {
    missedCallRecovery: "52%",
    responseTime: "< 10 seconds",
    moreEstimates: "48%",
  },
  testimonialPlaceholder:
    "In restoration, the first responder wins. We were losing after-hours emergencies constantly. Now every call gets answered instantly, and we've significantly grown our emergency response revenue.",
};

export default function RestorationPage() {
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
