"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, Variants } from "framer-motion";

export function LandingCTA() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
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

  const buttonVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="py-20 bg-[#113604] text-white">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4"
            variants={itemVariants}
          >
            Transforming English Learning for Underserved Students
          </motion.h2>
          <motion.p className="text-xl text-white mb-8" variants={itemVariants}>
            KIRA was created to support Bercerita's long standing English
            learning program. Designed to make English practice fun and
            accessible for children in rural Indonesian schools, it enables them
            to practice daily even without a live teacher.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={buttonVariants}
          >
            <Button size="lg" asChild className="bg-[#2D7017] text-lg">
              <Link href="/signup">Help Us Serve Students </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
