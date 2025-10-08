import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LandingHeader } from "@/components/landing/header";
import { LandingHero } from "@/components/landing/hero";
import { LandingFeatures } from "@/components/landing/features";
import { LandingCTA } from "@/components/landing/cta";
import Support from "@/components/landing/support";

export default function Home() {
  return (
    <div>
      <LandingHero />
      <LandingFeatures />
      <LandingCTA />
      <Support />
    </div>
  );
}
