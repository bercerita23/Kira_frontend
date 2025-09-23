import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LandingHero } from "@/components/landing/hero";
import { LandingFeatures } from "@/components/landing/features";
import { LandingCTA } from "@/components/landing/cta";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
        <LandingCTA />
      </main>
    </div>
  );
}
