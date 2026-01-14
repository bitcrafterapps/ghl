import { PublicLayout } from '@/components/PublicLayout';
import { HeroSection } from '@/components/sections/hero';
import { TrustBar } from '@/components/sections/trust-bar';
import { ServicesSection } from '@/components/sections/services';
import { WhyChooseUs } from '@/components/sections/why-choose-us';
import { TestimonialsSection } from '@/components/sections/testimonials';
import { ServiceAreaSection } from '@/components/sections/service-area';
import { GalleryPreview } from '@/components/sections/gallery-preview';
import { CTASection } from '@/components/sections/cta';
import { FAQSection } from '@/components/sections/faq';

export default function HomePage() {
  return (
    <PublicLayout>
      <HeroSection />
      <TrustBar />
      <ServicesSection />
      <WhyChooseUs />
      <TestimonialsSection />
      <ServiceAreaSection />
      <GalleryPreview />
      <FAQSection />
      <CTASection />
    </PublicLayout>
  );
}