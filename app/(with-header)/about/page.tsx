"use client";

import { LandingFooter } from "@/components/landing/footer";
import { LandingHeader } from "@/components/landing/header";
import { Button } from "@/components/ui/button";
import { motion, Variants } from "framer-motion";
import {
  Award,
  BarChart,
  BookOpen,
  CheckCircle2,
  MessageCircle,
  Users,
} from "lucide-react";
import Link from "next/link";

const studentCards = [
  {
    icon: <BookOpen className="h-8 w-8 text-black" />,
    title: "AI-Powered Learning",
    description:
      "Smart quizzes generated weekly so kids can keep practicing outside the classroom.",
  },
  {
    icon: <MessageCircle className="h-8 w-8 text-black" />,
    title: "Practice Speaking English",
    description:
      "Talk with KIRA, an AI buddy that listens, responds, and encourages.",
  },
  {
    icon: <Award className="h-8 w-8 text-black" />,
    title: "Gamified Experience",
    description:
      "Fun points, badges, and compliments keep students motivated to learn.",
  },
  {
    icon: <CheckCircle2 className="h-8 w-8 text-black" />,
    title: "Personalized Practice",
    description:
      "Exercises adapt to student needs, helping them review and strengthen weak areas.",
  },
];

const teacherCards = [
  {
    icon: <BarChart className="h-8 w-8 text-black" />,
    title: "Progress Tracking",
    description:
      "See how often students practice each week and how their English skills improve over time.",
  },
  {
    icon: <BookOpen className="h-8 w-8 text-black" />,
    title: "Adapts to Curriculum",
    description:
      "Smart quizzes created by AI help kids practice and remember what they learn.",
  },
  {
    icon: <Users className="h-8 w-8 text-black" />,
    title: "Accessible for All",
    description:
      "Free English learning tools designed for rural and small-island communities.",
  },
];

export default function About() {
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

  const imageVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <div className="w-full min-h-screen">
      <LandingHeader />
      {/** What is Kira? */}
      <motion.div
        className="w-full h-min bg-white pb-16 pt-36 flex flex-col justify-center items-center gap-y-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="font-lato text-4xl md:text-5xl font-bold text-black mb-4"
          variants={titleVariants}
        >
          WHAT IS <span className="text-[#2D7017]">KIRA?</span>
        </motion.h1>
        <motion.span
          className="w-[46%] text-center font-lato text-[18px] md:text-[20px] font-[400] leading-[28px] text-[#4B4B4E] mb-4"
          variants={contentVariants}
        >
          KIRA is a free, web-based platform that helps children in remote and
          underserved areas learn English in a fun, engaging, and effective way.
          Built with AI and gamification, it is designed to supplement classroom
          lessons and make language learning accessible, even for schools with
          limited resources. KIRA is implemented in partnership with schools
          working with Bercerita, ensuring it reaches students who need it most.
        </motion.span>
        <motion.span
          className="w-[46%] text-center font-lato text-[18px] md:text-[20px] font-[400] leading-[28px] text-[#4B4B4E]"
          variants={contentVariants}
        >
          In many rural communities, children have little access to quality
          English education, yet English skills are crucial for future
          opportunities. KIRA bridges this gap by using technology to deliver
          interactive practice that builds confidence, improves speaking and
          comprehension, and makes learning engaging. Even in remote areas,
          students can now benefit from advanced digital tools, showing that
          location is no longer a barrier to quality education.
        </motion.span>

        <motion.div variants={contentVariants}>
          <Button
            size="lg"
            className="bg-[#2D7017] hover:bg-[#1e4a0f] text-white mt-6 font-lato text-[18px] font-[500]"
          >
            <Link
              href="https://www.bercerita.org/general-6"
              target="_blank"
              rel="noopener noreferrer"
              className="font-lato text-[18px] font-[500] leading-[120%] tracking-[-2%]"
            >
              Support KIRA's Mission
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      {/** Who Can Benefit */}
      <motion.div
        className="w-full bg-gradient-to-b from-white via-[#E7F7E2] to-[#AFD8A1] pt-16 pb-20 text-center mt-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <motion.h1
          className="font-lato text-3xl md:text-4xl font-normal text-black mb-16"
          variants={titleVariants}
        >
          Who Can Benefit?
        </motion.h1>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-8"
          variants={containerVariants}
        >
          {/* Students Card */}
          <motion.div
            className="bg-white rounded-[10px] overflow-hidden transition-all duration-300 hover:shadow-lg w-full max-w-[400px] mx-auto"
            variants={cardVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <motion.div variants={imageVariants}>
              <img
                src="/assets/about/students.png"
                alt="Students"
                className="w-full h-[363px] object-cover"
              />
            </motion.div>
            <div className="bg-[#E7F7E2] p-3 text-left">
              <h3 className="text-[20px] font-[700] text-[#1C1C1C] mb-0 font-lato leading-[28px]">
                Students
              </h3>
            </div>
            <div className="bg-white p-4 pt-3 pb-5">
              <p className="text-left font-lato text-[20px] font-[400] leading-[28px] text-[#4B4B4E] tracking-[0px]">
                Build confidence and improve English skills through engaging,
                interactive practice.
              </p>
            </div>
          </motion.div>

          {/* Schools Card */}
          <motion.div
            className="bg-white rounded-[10px] overflow-hidden transition-all duration-300 hover:shadow-lg w-full max-w-[400px] mx-auto"
            variants={cardVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <motion.div variants={imageVariants}>
              <img
                src="/assets/about/schools.png"
                alt="Schools"
                className="w-full h-[363px] object-cover"
              />
            </motion.div>
            <div className="bg-[#E7F7E2] p-3 text-left">
              <h3 className="text-[20px] font-[700] text-[#1C1C1C] mb-0 font-lato leading-[28px]">
                Schools
              </h3>
            </div>
            <div className="bg-white p-4 pt-3 pb-5">
              <p className="text-left font-lato text-[20px] font-[400] leading-[28px] text-[#4B4B4E] tracking-[0px]">
                Gain access to a free, easy-to-implement digital tool that
                complements classroom teaching.
              </p>
            </div>
          </motion.div>

          {/* Funders & Partners Card */}
          <motion.div
            className="bg-white rounded-[10px] overflow-hidden transition-all duration-300 hover:shadow-lg w-full max-w-[400px] mx-auto"
            variants={cardVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <motion.div variants={imageVariants}>
              <img
                src="/assets/about/funders.png"
                alt="Funders & Partners"
                className="w-full h-[363px] object-cover"
              />
            </motion.div>
            <div className="bg-[#E7F7E2] p-3 text-left">
              <h3 className="text-[20px] font-[700] text-[#1C1C1C] mb-0 font-lato leading-[28px]">
                Funders & Partners
              </h3>
            </div>
            <div className="bg-white p-4 pt-3 pb-5">
              <p className="text-left font-lato text-[20px] font-[400] leading-[28px] text-[#4B4B4E] tracking-[0px]">
                Invest in a scalable, tech-powered solution that expands
                educational access and empowers the next generation.
              </p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div variants={contentVariants}>
          <Button
            size="lg"
            className="bg-[#2D7017] hover:bg-[#1e4a0f] text-white mt-12 font-lato text-[18px] font-[500]"
          >
            <Link
              href="https://www.bercerita.org/general-6"
              target="_blank"
              rel="noopener noreferrer"
              className="font-lato text-[18px] font-[500] leading-[120%] tracking-[-2%]"
            >
              Donate Now
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      {/**A Platform for students */}
      <motion.div
        className="w-full bg-[#F5F5F5] pt-12 py-24 text-center text-black gap-y-3 flex flex-col"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <motion.h1
          className="font-lato text-3xl md:text-4xl font-normal text-black"
          variants={titleVariants}
        >
          A Platform For Students
        </motion.h1>
        <motion.span
          className="font-lato text-[18px] md:text-[20px] font-[400] leading-[28px] text-[#4B4B4E] mt-3 mb-8"
          variants={contentVariants}
        >
          Our approach makes learning English effective and enjoyable for kids.
        </motion.span>
        <motion.div
          className="relative mx-auto w-full max-w-[800px] sm:max-w-[900px] md:max-w-[1100px] mt-6 min-h-[350px] sm:min-h-[420px] md:min-h-[480px] overflow-visible mb-32 scale-75 sm:scale-90 md:scale-100 origin-center"
          variants={imageVariants}
        >
          <div className="pointer-events-none absolute -left-6 sm:-left-8 md:-left-10 top-4 sm:top-5 md:top-6 h-48 w-48 sm:h-56 sm:w-56 md:h-64 md:w-64 rounded-full bg-gradient-to-br from-amber-300/60 to-yellow-300/30 blur-3xl" />
          <div className="pointer-events-none absolute right-2 sm:right-3 md:right-4 bottom-0 h-56 w-56 sm:h-64 sm:w-64 md:h-72 md:w-72 rounded-full bg-gradient-to-br from-rose-400/60 to-pink-300/30 blur-3xl" />

          <div className="absolute left-0 top-4 w-fit -translate-x-2 sm:-translate-x-3 md:-translate-x-4 -translate-y-2 rotate-[-0.5deg] scale-[0.94] md:top-2 rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden shadow-[0_12px_45px_rgba(0,0,0,0.25)]">
            <img
              src="/assets/students_new_quiz.png"
              alt="New Quiz"
              className="h-[min(280px,26vh)] sm:h-[min(320px,30vh)] md:h-[min(380px,36vh)] w-min object-fill"
              loading="lazy"
            />
          </div>
          <div className="absolute left-1/2 top-1/2 w-fit -translate-x-1/2 -translate-y-1/3 z-20 rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
            <img
              src="/assets/students_quiz.png"
              alt="Student Quiz"
              className="h-[min(280px,26vh)] sm:h-[min(320px,30vh)] md:h-[min(380px,36vh)] w-min object-fill"
              loading="lazy"
            />
          </div>

          <div className="absolute right-0 bottom-2 w-[50%] translate-y-24 sm:translate-y-28 md:translate-y-32 z-30 rotate-[0.4deg] scale-[0.96] md:bottom-1 md:w-[52%] rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.22)]">
            <img
              src="/assets/students_gpt.png"
              alt="Students GPT"
              className="h-[min(280px,26vh)] sm:h-[min(320px,30vh)] md:h-[min(380px,36vh)] w-full object-fill"
              loading="lazy"
            />
          </div>
        </motion.div>

        {/** Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 w-[50%] self-center mt-12"
          variants={containerVariants}
        >
          {studentCards.map((feature, index) => (
            <motion.div
              key={index}
              className="border-2 border-[#F96753] p-8 rounded-xl transition-all duration-300 hover:shadow-md text-left"
              variants={cardVariants}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="font-lato text-[20px] font-[700] text-[#1C1C1C] mb-3 leading-[28px]">
                {feature.title}
              </h3>
              <p className="font-lato text-[18px] font-[400] leading-[28px] text-[#4B4B4E]">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
        <motion.div variants={contentVariants}>
          <Button
            size="lg"
            className="bg-[#5CA145] hover:bg-[#4a8a37] text-white mt-12 w-min self-center font-lato text-[18px] font-[500]"
          >
            Student Demo Coming Soon
          </Button>
        </motion.div>
      </motion.div>

      {/**A Platform for Teachers */}
      <motion.div
        className="w-full bg-[#F5F5F5] pt-12 py-24 text-center text-black gap-y-3 flex flex-col"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <motion.h1
          className="font-lato text-3xl md:text-4xl font-normal text-black"
          variants={titleVariants}
        >
          A Platform For Teachers
        </motion.h1>
        <motion.span
          className="font-lato text-[18px] md:text-[20px] font-[400] leading-[28px] text-[#4B4B4E] mt-3 mb-8"
          variants={contentVariants}
        >
          Our approach makes English instruction easy for teachers.
        </motion.span>
        <motion.div
          className="relative mx-auto w-full max-w-[800px] sm:max-w-[900px] md:max-w-[1100px] mt-6 min-h-[350px] sm:min-h-[420px] md:min-h-[480px] overflow-visible mb-32 scale-75 sm:scale-90 md:scale-100 origin-center"
          variants={imageVariants}
        >
          <div className="pointer-events-none absolute -left-6 sm:-left-8 md:-left-10 top-4 sm:top-5 md:top-6 h-48 w-48 sm:h-56 sm:w-56 md:h-64 md:w-64 rounded-full bg-gradient-to-br from-amber-300/60 to-yellow-300/30 blur-3xl" />
          <div className="pointer-events-none absolute right-2 sm:right-3 md:right-4 bottom-0 h-56 w-56 sm:h-64 sm:w-64 md:h-72 md:w-72 rounded-full bg-gradient-to-br from-rose-400/60 to-pink-300/30 blur-3xl" />

          <div className="absolute left-0 top-4 w-fit -translate-x-2 sm:-translate-x-3 md:-translate-x-4 -translate-y-2 rotate-[-0.5deg] scale-[0.94] md:top-2 rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden shadow-[0_12px_45px_rgba(0,0,0,0.25)]">
            <img
              src="/assets/about/teachers/Admin Dash.png"
              alt="Upload bulk"
              className="h-[min(280px,26vh)] sm:h-[min(320px,30vh)] md:h-[min(380px,36vh)] w-min object-fill"
              loading="lazy"
            />
          </div>
          <div className="absolute left-1/2 top-1/2 w-fit -translate-x-1/2 -translate-y-1/3 z-20 rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
            <img
              src="/assets/about/teachers/progress.png"
              alt="Admin dashboard"
              className="h-[min(280px,26vh)] sm:h-[min(320px,30vh)] md:h-[min(380px,36vh)] w-min object-fill"
              loading="lazy"
            />
          </div>

          <div className="absolute right-0 bottom-2 w-[50%] translate-y-24 sm:translate-y-28 md:translate-y-32 z-30 rotate-[0.4deg] scale-[0.96] md:bottom-1 md:w-[52%] rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.22)]">
            <img
              src="/assets/about/teachers/analytics.png"
              alt="Results view"
              className="h-[min(280px,26vh)] sm:h-[min(320px,30vh)] md:h-[min(380px,36vh)] w-full object-fill"
              loading="lazy"
            />
          </div>
        </motion.div>

        {/** Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 w-[50%] self-center md:[&>*:nth-child(3)]:col-span-2 md:[&>*:nth-child(3)]:justify-self-center md:[&>*:nth-child(3)]:p-8 md:[&>*:nth-child(3)]:max-w-[50%] mt-12"
          variants={containerVariants}
        >
          {teacherCards.map((feature, index) => (
            <motion.div
              key={index}
              className="border-2 border-[#FEB030] p-8 rounded-xl transition-all duration-300 hover:shadow-md text-left"
              variants={cardVariants}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="font-lato text-[20px] font-[700] text-[#1C1C1C] mb-3 leading-[28px]">
                {feature.title}
              </h3>
              <p className="font-lato text-[18px] font-[400] leading-[28px] text-[#4B4B4E]">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
        <motion.div variants={contentVariants}>
          <Button
            size="lg"
            className="bg-[#2D7017] hover:bg-[#1e4a0f] text-white mt-12 w-min self-center font-lato text-[18px] font-[500]"
          >
            <Link
              href="https://www.bercerita.org/general-6"
              target="_blank"
              rel="noopener noreferrer"
              className="font-lato text-[18px] font-[500] leading-[120%] tracking-[-2%]"
            >
              Support KIRA
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
