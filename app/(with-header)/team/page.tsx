"use client";

import { ProfileCard } from "@/components/ui/profile-card";
import { JoinTeam } from "@/components/ui/join-team";
import { mentors, interns } from "@/lib/team-data";
import { motion, Variants } from "framer-motion";

export default function TeamPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const titleVariants: Variants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <div className="font-lato flex flex-col min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full bg-[#113604]">
        <section className="flex items-center justify-center py-12 md:py-20">
          <motion.h1
            className="font-medium text-2xl md:text-4xl text-white leading-[100%] tracking-[-0.02em] text-center uppercase px-4"
            variants={titleVariants}
            initial="hidden"
            animate="visible"
          >
            the kira team
          </motion.h1>
        </section>
      </div>
      <div className="py-12 md:py-20 gap-12 flex flex-col px-4 md:px-0">
        <motion.section
          className="flex flex-col justify-center items-center gap-8 md:gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <motion.h2
            className="font-medium text-xl md:text-2xl tracking-[-0.03em] text-center items-center justify-center"
            variants={headerVariants}
          >
            Mentors
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-x-12 md:gap-y-6 justify-items-center w-full max-w-6xl"
            variants={containerVariants}
          >
            {mentors.map((mentor, i) => (
              <motion.div
                key={i}
                variants={cardVariants}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2 },
                }}
                className="w-full max-w-sm"
              >
                <ProfileCard {...mentor} className="w-full h-full" />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          className="w-full flex flex-col justify-center items-center gap-8 md:gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <motion.h2
            className="font-medium text-xl md:text-2xl tracking-[-0.03em] text-center items-center justify-center"
            variants={headerVariants}
          >
            Interns
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-x-12 md:gap-y-6 justify-items-center w-full max-w-6xl"
            variants={containerVariants}
          >
            {interns.map((intern, i) => (
              <motion.div
                key={i}
                variants={cardVariants}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2 },
                }}
                className="w-full max-w-sm"
              >
                <ProfileCard {...intern} className="w-full h-full" />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      </div>
      <JoinTeam />
    </div>
  );
}
