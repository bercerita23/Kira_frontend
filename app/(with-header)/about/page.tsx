import { LandingFooter } from "@/components/landing/footer";
import { LandingHeader } from "@/components/landing/header";
import { Button } from "@/components/ui/button";
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
    title: "Adapts to Cirriculum",
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
  return (
    <div className="w-full min-h-screen">
      <LandingHeader />
      {/** What is Kira? */}
      <div className="w-full h-min bg-white pb-16 pt-36 flex flex-col justify-center items-center gap-y-3">
        <h1 className="text-5xl">
          WHAT IS <span className="text-[#2D7017]">KIRA?</span>
        </h1>
        <span className="w-[46%] text-center text-md">
          KIRA is a free, web-based platform that helps children in remote and
          underserved areas learn English in a fun, engaging, and effective way.
          Built with AI and gamification, it is designed to supplement classroom
          lessons and make language learning accessible, even for schools with
          limited resources. KIRA is implemented in partnership with schools
          working with Bercerita, ensuring it reaches students who need it most.
        </span>
        <br />
        <span className="w-[46%] text-center text-md">
          In many rural communities, children have little access to quality
          English education, yet English skills are crucial for future
          opportunities. KIRA bridges this gap by using technology to deliver
          interactive practice that builds confidence, improves speaking and
          comprehension, and makes learning engaging. Even in remote areas,
          students can now benefit from advanced digital tools, showing that
          location is no longer a barrier to quality education.
        </span>

        <Button size="lg" className="bg-[#2D7017] text-white mt-6">
          <Link href="/demo">Support KIRA’s Mission</Link>
        </Button>
      </div>

      {/**A Platform for students */}
      <div className="w-full bg-[#F5F5F5] pt-12 py-24 text-center text-black gap-y-3 flex flex-col">
        <div className="relative mx-auto w-full max-w-[800px] sm:max-w-[900px] md:max-w-[1100px] mt-6 min-h-[350px] sm:min-h-[420px] md:min-h-[480px] overflow-visible mb-32 scale-75 sm:scale-90 md:scale-100 origin-center">
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
        </div>
        <h1 className="text-4xl font-normal ">A Platform For Students</h1>
        <span className="text-muted-foreground text-lg mt-3 mb-8">
          Our approach makes learning English effective and enjoyable for kids
        </span>

        {/** Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-[50%] self-center">
          {studentCards.map((feature, index) => (
            <div
              key={index}
              className="border-2 border-[#F96753] p-8 rounded-xl transition-all duration-300 hover:shadow-md text-left"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
        <Button
          size="lg"
          className="bg-[#2D7017] text-white mt-12 w-min self-center"
        >
          <Link href="/demo">Try a Student Quiz Demo</Link>
        </Button>
      </div>

      {/**A Platform for Teachers */}
      <div className="w-full bg-[#F5F5F5] pt-12 py-24 text-center text-black gap-y-3 flex flex-col">
        <h1 className="text-4xl font-normal ">A Platform For Teachers</h1>
        <span className="text-muted-foreground text-lg mt-3 mb-8">
          Our approach makes English instruction easy for teachers.
        </span>
        <div className="relative mx-auto w-full max-w-[800px] sm:max-w-[900px] md:max-w-[1100px] mt-6 min-h-[350px] sm:min-h-[420px] md:min-h-[480px] overflow-visible mb-32 scale-75 sm:scale-90 md:scale-100 origin-center">
          <div className="pointer-events-none absolute -left-6 sm:-left-8 md:-left-10 top-4 sm:top-5 md:top-6 h-48 w-48 sm:h-56 sm:w-56 md:h-64 md:w-64 rounded-full bg-gradient-to-br from-amber-300/60 to-yellow-300/30 blur-3xl" />
          <div className="pointer-events-none absolute right-2 sm:right-3 md:right-4 bottom-0 h-56 w-56 sm:h-64 sm:w-64 md:h-72 md:w-72 rounded-full bg-gradient-to-br from-rose-400/60 to-pink-300/30 blur-3xl" />

          <div className="absolute left-0 top-4 w-fit -translate-x-2 sm:-translate-x-3 md:-translate-x-4 -translate-y-2 rotate-[-0.5deg] scale-[0.94] md:top-2 rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden shadow-[0_12px_45px_rgba(0,0,0,0.25)]">
            <img
              src="/assets/Quiz Start.png"
              alt="Upload bulk"
              className="h-[min(280px,26vh)] sm:h-[min(320px,30vh)] md:h-[min(380px,36vh)] w-min object-fill"
              loading="lazy"
            />
          </div>
          <div className="absolute left-1/2 top-1/2 w-fit -translate-x-1/2 -translate-y-1/3 z-20 rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
            <img
              src="/assets/Multiple Choice 1.png"
              alt="Admin dashboard"
              className="h-[min(280px,26vh)] sm:h-[min(320px,30vh)] md:h-[min(380px,36vh)] w-min object-fill"
              loading="lazy"
            />
          </div>

          <div className="absolute right-0 bottom-2 w-[50%] translate-y-24 sm:translate-y-28 md:translate-y-32 z-30 rotate-[0.4deg] scale-[0.96] md:bottom-1 md:w-[52%] rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.22)]">
            <img
              src="/assets/sample_quiz.png"
              alt="Results view"
              className="h-[min(280px,26vh)] sm:h-[min(320px,30vh)] md:h-[min(380px,36vh)] w-full object-fill"
              loading="lazy"
            />
          </div>
        </div>

        {/** Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-[50%] self-center md:[&>*:nth-child(3)]:col-span-2 md:[&>*:nth-child(3)]:justify-self-center md:[&>*:nth-child(3)]:p-8 md:[&>*:nth-child(3)]:max-w-[50%]">
          {teacherCards.map((feature, index) => (
            <div
              key={index}
              className="border-2 border-[#FEB030] p-8 rounded-xl transition-all duration-300 hover:shadow-md text-left"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
        <Button
          size="lg"
          className="bg-[#2D7017] text-white mt-12 w-min self-center"
        >
          <Link href="/demo">Give Today</Link>
        </Button>
      </div>
    </div>
  );
}
