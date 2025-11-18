import {
  BookOpen,
  Award,
  BarChart,
  Users,
  Clock,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";

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

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Kira Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Combining technology, practice, and motivation makes English
            learning effective and accessible for every child.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[#E7F7E2] p-8 rounded-xl transition-all duration-300 hover:shadow-md border border-gray-100"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
