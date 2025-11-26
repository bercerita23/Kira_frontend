"use client";

import { motion, Variants } from "framer-motion";
import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";

// Define interface for role data
interface Role {
  id: number;
  title: string;
  description: string;
  requirements: string[];
  duration: string;
  type: string;
}

// Mock roles data - can be populated when actual roles are available
const openRoles: Role[] = [
  // {
  //   id: 1,
  //   title: "Frontend Developer Intern",
  //   description: "Work with React, TypeScript, and modern web technologies to build engaging user interfaces for our educational platform.",
  //   requirements: ["React/TypeScript experience", "UI/UX design sense", "Passion for education technology"],
  //   duration: "3-6 months",
  //   type: "Remote/Hybrid"
  // }
];

export default function Opportunities() {
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

  const titleVariants: Variants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const contentVariants: Variants = {
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

  return (
    <div className="font-lato flex flex-col min-h-screen bg-gray-50">
      <LandingHeader />
      <div className="w-full bg-[#113604]">
        <section className="flex items-center justify-center py-12 md:py-20">
          <motion.h1
            className="font-medium text-2xl md:text-4xl text-white leading-[100%] tracking-[-0.02em] text-center uppercase px-4"
            variants={titleVariants}
            initial="hidden"
            animate="visible"
          >
            INTERNSHIP OPPORTUNITIES
          </motion.h1>
        </section>
      </div>

      <motion.div
        className="py-12 md:py-20 px-4 md:px-8 max-w-4xl mx-auto flex-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.section
          className="mb-12 text-center"
          variants={contentVariants}
        >
          <h2 className="font-lato text-[32px] font-[700] mb-6 text-gray-800 leading-[40px]">
            Open Roles
          </h2>

          {openRoles.length === 0 ? (
            <motion.div
              className="text-center py-12"
              variants={contentVariants}
            >
              <p className="font-lato text-[18px] font-[400] leading-[28px] text-[#4B4B4E] mb-4">
                We are not currently accepting interns but we welcome
                expressions of interest.
              </p>
            </motion.div>
          ) : (
            <motion.div
              className="grid gap-6 mt-8"
              variants={containerVariants}
            >
              {openRoles.map((role: Role) => (
                <motion.div
                  key={role.id}
                  className="bg-[#E7F7E2] border border-gray-200 rounded-lg p-6 text-left"
                  variants={cardVariants}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                >
                  <div className="mb-4">
                    <h3 className="font-lato text-[20px] font-[700] text-gray-800 mb-2 leading-[28px]">
                      {role.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="bg-[#2D7017] text-white px-3 py-1 rounded-full text-sm">
                        {role.type}
                      </span>
                      <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {role.duration}
                      </span>
                    </div>
                  </div>

                  <p className="font-lato text-[16px] font-[400] leading-[24px] text-[#4B4B4E] mb-4">
                    {role.description}
                  </p>

                  {role.requirements && role.requirements.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-lato text-[16px] font-[600] text-gray-800 mb-2">
                        Requirements:
                      </h4>
                      <ul className="list-disc list-inside font-lato text-[16px] font-[400] text-[#4B4B4E] space-y-1">
                        {role.requirements.map((req: string, index: number) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    className="bg-[#2D7017] text-white hover:bg-[#1e4a0f] mt-4 font-lato text-[16px] font-[500]"
                    size="sm"
                  >
                    Apply Now
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.section>
      </motion.div>

      {/* Want to join our team section */}
      <motion.div
        className="w-full bg-[#AFD8A1] py-16"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div
            className="bg-[#E7F7E2] rounded-lg p-8 shadow-sm"
            variants={cardVariants}
          >
            <motion.h2
              className="font-lato text-[24px] font-[700] text-gray-800 mb-4 leading-[32px]"
              variants={titleVariants}
            >
              Want to join our team?
            </motion.h2>

            <motion.div
              className="space-y-4 text-gray-700"
              variants={contentVariants}
            >
              <p className="font-lato text-[16px] font-[400] leading-[24px] text-[#4B4B4E]">
                College students, contact the KIRA team at{" "}
                <a
                  href="mailto:hello@bercerita.com"
                  className="text-[#2D7017] font-[500] hover:underline"
                >
                  hello@bercerita.com
                </a>
                .
              </p>

              <p className="font-lato text-[16px] font-[400] leading-[24px] text-[#4B4B4E]">
                Please include your resume and indicate your preferred area
                (engineering, product, or operations).
              </p>

              <motion.div className="pt-4" variants={contentVariants}>
                <Button
                  className="bg-[#2D7017] text-white hover:bg-[#1e4a0f] font-lato text-[16px] font-[500] px-6 py-2"
                  asChild
                >
                  <a href="mailto:hello@bercerita.com">Email Us</a>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
