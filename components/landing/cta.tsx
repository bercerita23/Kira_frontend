"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingCTA() {
  return (
    <section className="py-20 bg-[#113604] text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Transforming English Learning for Underserved Students
          </h2>
          <p className="text-xl text-white mb-8">
            An AI-driven, gamified platform that helps children in rural
            Indonesia build confidence in English
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-[#2D7017] text-lg">
              <Link href="/signup">Try a sample quiz</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent text-[#2D7017] hover:bg-white/10 border-white bg-white text-lg"
              asChild
            >
              <Link href="/pricing">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
