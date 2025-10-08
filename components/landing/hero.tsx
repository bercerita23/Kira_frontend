"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <section className="pt-32 pb-20 md:pt-36 md:pb-24 bg-gradient-to-b from-sky-50 to-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex-1 text-center md:text-left">
            <div className="gap-y-1">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tighter mb-4 text-[#2D7017]">
                K<span className="text-black">IDS</span>
              </h1>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tighter mb-4 text-[#2D7017]">
                I<span className="text-black">NTERACTIVE</span>
              </h1>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tighter mb-4 text-[#2D7017]">
                R<span className="text-black">EINFORCEMENT</span>
              </h1>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tighter mb-4 text-[#2D7017]">
                A<span className="text-black">PP</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-lg mx-auto md:mx-0">
                A gamified, AI-powered platform that makes English practice fun
                and accessible for children across remote areas.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button
                size="lg"
                className="bg-[#2D7017] text-[#F5F5F5] text-lg"
                asChild
              >
                <Link href="/signup">Try KIRA for Free</Link>
              </Button>
              <Button
                size="lg"
                className="border-2 border-[#2D7017] text-[#2D7017] bg-white text-lg"
                asChild
              >
                <Link href="/courses">Learn More</Link>
              </Button>
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="relative z-10 bg-white rounded-2xl shadow-xl overflow-hidden max-w-md mx-auto border border-gray-100">
              <div className="h-12 bg-sky-500 flex items-center px-4">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="">
                <img
                  src="/assets/sample_quiz.png"
                  className="w-full h-auto self-center rounded-xl"
                />
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-purple-200 rounded-full blur-3xl -z-10 opacity-70"></div>
            <div className="absolute -top-10 -left-10 w-72 h-72 bg-blue-200 rounded-full blur-3xl -z-10 opacity-70"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
