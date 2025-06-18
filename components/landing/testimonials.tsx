import { StarIcon } from 'lucide-react';
import Image from 'next/image';

export function LandingTestimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "University Student",
      content: "Kira's immersive approach helped me gain confidence in English. The story-based learning is both fun and effective!",
      avatar: "/avatars/sarah.jpg",
      rating: 5
    },
    {
      name: "Ahmad Rahman",
      role: "Working Professional", 
      content: "I've tried many language apps, but Kira's focus on natural learning through stories has been the most effective for me.",
      avatar: "/avatars/ahmad.jpg",
      rating: 5
    },
    {
      content: "The gamification elements keep me motivated and coming back every day. I've maintained a 45-day streak so far!",
      author: "Sophie Chen",
      role: "Marketing Manager, France",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 4
    },
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Learners Say</h2>
          <p className="text-xl text-center text-gray-600 dark:text-gray-300 mb-12">
            Join thousands of satisfied learners who have improved their English skills with Kira
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon 
                    key={i} 
                    className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <p className="text-foreground mb-6">{testimonial.content}</p>
              <div className="flex items-center">
                <div className="mr-4 relative w-12 h-12 rounded-full overflow-hidden">
                  <Image 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}