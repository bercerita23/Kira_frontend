"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, Variants } from "framer-motion";

export function LandingHero() {
  const containerVariants: Variants = {
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
    <section
      className="py-20 md:py-28 lg:py-36 xl:py-44 2xl:py-52 pb-16 md:pb-24 lg:pb-60 xl:pb-80 2xl:pb-96 px-4 md:px-8 lg:px-16 xl:px-24"
      style={{
        background:
          "radial-gradient(circle at center, #E2FFF6 0%, #FCFCFC 50%, #E7F7E2 100%)",
      }}
    >
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          <motion.div
            className="flex-1 text-center md:text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="gap-y-1">
              <motion.h1
                className="font-lato text-4xl md:text-5xl lg:text-6xl font-[600] leading-tight tracking-tighter mb-4 text-[#2D7017]"
                variants={itemVariants}
              >
                K<span className="text-black">IDS</span>
              </motion.h1>
              <motion.h1
                className="font-lato text-4xl md:text-5xl lg:text-6xl font-[600] leading-tight tracking-tighter mb-4 text-[#2D7017]"
                variants={itemVariants}
              >
                I<span className="text-black">NTERACTIVE</span>
              </motion.h1>
              <motion.h1
                className="font-lato text-4xl md:text-5xl lg:text-6xl font-[600] leading-tight tracking-tighter mb-4 text-[#2D7017]"
                variants={itemVariants}
              >
                R<span className="text-black">EINFORCEMENT</span>
              </motion.h1>
              <motion.h1
                className="font-lato text-4xl md:text-5xl lg:text-6xl font-[600] leading-tight tracking-tighter mb-4 text-[#2D7017]"
                variants={itemVariants}
              >
                A<span className="text-black">PP</span>
              </motion.h1>
              <motion.p
                className="font-lato text-[20px] font-[400] leading-[28px] text-[#4B4B4E] mb-8 max-w-lg mx-auto md:mx-0"
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
                className="bg-[#2D7017] hover:bg-[#244011] text-[#F5F5F5] font-lato text-[18px] font-[500]"
                asChild
              >
                <Link
                  href="https://www.bercerita.org/general-6"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Support Kira
                </Link>
              </Button>
              <Button
                size="lg"
                className="border-2 border-[#2D7017] text-[#2D7017] hover:text-white hover:bg-[#244011] bg-white font-lato text-[18px] font-[500]"
                asChild
              >
                <Link href="/about">Learn More About Our Product</Link>
              </Button>
            </motion.div>
          </motion.div>
          <motion.div
            className="flex-1 relative z-0"
            variants={imageVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Background blur elements - moved before the main content */}
            <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-purple-200 rounded-full blur-3xl opacity-70"></div>
            <div className="absolute -top-10 -left-10 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-70"></div>

            <div className="relative z-10 bg-white rounded-2xl shadow-xl overflow-hidden max-w-md mx-auto lg:max-w-lg xl:max-w-lg 2xl:max-w-xl border border-gray-100">
              <div className="h-12 bg-sky-500 flex items-center px-4">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="w-full h-[190px] sm:h-[190px] md:h-[150px] lg:h-[360px]">
                <iframe
                  src="https://www.figma.com/proto/tbQaPvUwIeDN4CQYNarvPc/Kira?node-id=39-85&t=ejdoS5IHXgAFSIoE-1&scaling=scale-down-width&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=39%3A85&embed_host=share&hide-ui=1"
                  className="w-full h-full border-0"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
