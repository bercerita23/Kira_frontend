"use client";

import {
  BookOpen,
  Award,
  BarChart,
  Users,
  Clock,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";
import { motion, Variants } from "framer-motion";

export function LandingFeatures() {
  const features = [
    {
      icon: <BookOpen className="h-8 w-8 text-black" />,
      title: "AI-Powered Learning",
      description:
        "Smart quizzes created by AI help kids practice and remember what they learn.",
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-black" />,
      title: "Practice Speaking English",
      description:
        "Talk with KIRA, an AI buddy that listens, responds, and encourages.",
    },
    {
      icon: <BarChart className="h-8 w-8 text-black" />,
      title: "Progress Tracking",
      description:
        "See how often students practice each week and how their English skills improve over time.",
    },
    {
      icon: <Award className="h-8 w-8 text-black" />,
      title: "Gamified Experience",
      description:
        "Points, badges, and positive reinforcement keep students motivated and excited to continue practicing ",
    },
    {
      icon: <CheckCircle2 className="h-8 w-8 text-black" />,
      title: "Personalized Practice",
      description:
        "Exercises adapt to student needs, helping them review and strengthen weak areas.",
    },
    {
      icon: <Users className="h-8 w-8 text-black" />,
      title: "Accessible for All",
      description:
        "Free English learning tools designed for rural and small-island communities.",
    },
  ];

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

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Kira Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Combining technology, practice, and motivation makes English
            learning effective and accessible for every child.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-[#E7F7E2] p-8 rounded-xl transition-all duration-300 hover:shadow-md border border-gray-100"
              variants={cardVariants}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.2 },
              }}
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
