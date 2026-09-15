import { BrandStory } from "@/components/home/BrandStory";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Hero } from "@/components/home/Hero";
import { PartnersSection } from "@/components/home/PartnersSection";
import { PersonalizationSection } from "@/components/home/PersonalizationSection";
import { VillageStory } from "@/components/home/VillageStory";

export default function Home() {
  return (
    <main>
      <Hero />
      <FeaturedProducts />
      <BrandStory />
      <VillageStory />
      <PartnersSection />
      <PersonalizationSection />
    </main>
  );
}
