import { BookOpen, Award, BarChart, Users, Clock, CheckCircle2 } from 'lucide-react';

export function LandingFeatures() {
  const features = [
    {
      icon: <BookOpen className="h-8 w-8 text-sky-500" />,
      title: 'Interactive Lessons',
      description: 'Engage with stories and exercises designed to make learning natural and enjoyable.',
    },
    {
      icon: <Award className="h-8 w-8 text-purple-500" />,
      title: 'Achievement System',
      description: 'Earn badges and track your progress as you master new language skills.',
    },
    {
      icon: <BarChart className="h-8 w-8 text-orange-500" />,
      title: 'Progress Tracking',
      description: 'Visualize your improvement with detailed statistics and learning insights.',
    },
    {
      icon: <Users className="h-8 w-8 text-green-500" />,
      title: 'Community Learning',
      description: 'Practice with fellow learners and get feedback from native speakers.',
    },
    {
      icon: <Clock className="h-8 w-8 text-red-500" />,
      title: 'Spaced Repetition',
      description: 'Our algorithm ensures you review words and phrases at optimal intervals.',
    },
    {
      icon: <CheckCircle2 className="h-8 w-8 text-blue-500" />,
      title: 'Personalized Path',
      description: 'Learning experience tailored to your goals, level, and progress.',
    },
  ];

  return (
    <section className="py-20 bg-white dark:bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Learn With Bercerita?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our science-based approach makes learning English effective and enjoyable
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl transition-all duration-300 hover:shadow-md border border-gray-100 dark:border-gray-700"
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