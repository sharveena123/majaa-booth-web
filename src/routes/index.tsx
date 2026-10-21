import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/marketing/Navbar";
import { HeroSection } from "@/components/marketing/HeroSection";
import { FAQSection, FeatureSection, FinalCTA, Footer, HowItWorks, PricingSection, ProductShowcase } from "@/components/marketing/Sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Majaa — Premium Photo Booth Software & Business Platform" },
      { name: "description", content: "Photo booth software, AI experiences, instant cloud galleries, and business management in one seamless platform." },
      { property: "og:title", content: "Majaa — Your Photo Booth Business. Elevated." },
      { property: "og:description", content: "Photo booth software, AI experiences, cloud galleries, and business management in one platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative overflow-x-hidden">
      <Navbar />
      <main>
        <HeroSection />
        <FeatureSection />
        <ProductShowcase />
        <HowItWorks />
        <PricingSection />
        <FAQSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
