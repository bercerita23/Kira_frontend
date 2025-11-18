"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, Variants } from "framer-motion";

export function LandingHero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const imageVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut", delay: 0.4 },
    },
  };

  return (
    <section className="pt-32 pb-20 md:pt-36 md:pb-24 bg-gradient-to-b from-sky-50 to-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          <motion.div
            className="flex-1 text-center md:text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="gap-y-1">
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tighter mb-4 text-[#2D7017]"
                variants={itemVariants}
              >
                K<span className="text-black">IDS</span>
              </motion.h1>
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tighter mb-4 text-[#2D7017]"
                variants={itemVariants}
              >
                I<span className="text-black">NTERACTIVE</span>
              </motion.h1>
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tighter mb-4 text-[#2D7017]"
                variants={itemVariants}
              >
                R<span className="text-black">EINFORCEMENT</span>
              </motion.h1>
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tighter mb-4 text-[#2D7017]"
                variants={itemVariants}
              >
                A<span className="text-black">PP</span>
              </motion.h1>
              <motion.p
                className="text-xl text-muted-foreground mb-8 max-w-lg mx-auto md:mx-0"
                variants={itemVariants}
              >
                A gamified, AI-powered platform that makes English practice fun
                and accessible for children across remote areas.
              </motion.p>
            </div>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
              variants={itemVariants}
            >
              <Button
                size="lg"
                className="bg-[#2D7017] text-[#F5F5F5] text-lg"
                asChild
              >
                <Link href="/signup">Support Kira</Link>
              </Button>
              <Button
                size="lg"
                className="border-2 border-[#2D7017] text-[#2D7017] bg-white text-lg"
                asChild
              >
                <Link href="/about">Learn More About Our Product</Link>
              </Button>
            </motion.div>
          </motion.div>
          <motion.div
            className="flex-1 relative"
            variants={imageVariants}
            initial="hidden"
            animate="visible"
          >
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
          </motion.div>
        </div>
      </div>
    </section>
  );
}
