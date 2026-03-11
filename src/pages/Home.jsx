import React from "react";
import FireworkCanvas from "../components/hero/FireworkCanvas";
import HeroContent from "../components/hero/HeroContent";
import FeaturedProducts from "../components/home/FeaturedProducts";
import HowItWorks from "../components/home/HowItWorks";

export default function Home() {
  return (
    <div className="bg-black">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#080808] to-[#0c0005]" />

        {/* Firework particle canvas */}
        <FireworkCanvas />

        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />

        {/* Hero content */}
        <HeroContent />
      </section>

      {/* Featured Products */}
      <FeaturedProducts />

      {/* How It Works */}
      <HowItWorks />
    </div>
  );
}
