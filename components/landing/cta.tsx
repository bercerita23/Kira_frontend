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
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={itemVariants}>
              <img
                src="/assets/children_picture.png"
                alt="Children learning English"
                className="w-full h-auto rounded-xl"
              />
            </motion.div>

            <motion.div className="text-center" variants={itemVariants}>
              <h2 className="font-lato text-[32px] font-medium mb-4 leading-[40px]">
                Transforming English Learning for Underserved Students
              </h2>
              <p className="font-lato text-[20px] font-normal text-[##F5F5F5] mb-8 leading-[28px]">
                KIRA was created to support Bercerita's long standing English
                learning program. Designed to make English practice fun and
                accessible for children in rural Indonesian schools, it enables
                them to practice daily even without a live teacher.
              </p>

              <motion.div
                className="flex justify-center"
                variants={buttonVariants}
              >
                <Button
                  size="lg"
                  asChild
                  className="bg-[#2D7017] hover:bg-[#45A049] font-lato text-[16px] font-medium px-8 py-3 rounded-lg"
                >
                  <Link
                    href="https://www.bercerita.org/general-6"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Support KIRA's Mission
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
