import Link from 'next/link';
import { ChevronRight, LockIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";

interface LessonCardProps {
  title: string;
  description: string;
  progress: number;
  icon: string;
  href: string;
  completed?: boolean;
  active?: boolean;
  locked?: boolean;
}

export function LessonCard({
  title,
  description,
  progress,
  icon,
  href,
  completed = false,
  active = false,
  locked = false
}: LessonCardProps) {
  return (
    <div 
          className={cn(
      "lesson-card card-hover bg-white shadow-sm hover:shadow-md transition-shadow",
      completed ? "border-secondary" : active ? "border-primary" : "border-gray-200",
    )}
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div 
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center text-2xl",
                completed ? "bg-secondary/10 text-secondary" : 
                active ? "bg-primary/10 text-primary" : 
                "bg-gray-100"
              )}
            >
              {locked ? <LockIcon className="h-7 w-7 text-muted-foreground" /> : icon}
            </div>
            <div className="ml-5">
              <h3 className="font-bold text-xl flex items-center">
                {title}
                {completed && (
                  <span className="ml-2 text-xs px-2.5 py-1 rounded-full bg-secondary/10 text-secondary">
                    Completed
                  </span>
                )}
              </h3>
              <p className="text-muted-foreground text-sm mt-1.5">{description}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-5">
          {progress > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full">
                <div 
                  className="progress-bar"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          
          <div className="mt-5">
            <Button
              variant={completed ? "outline" : active ? "default" : "secondary"}
              className="w-full justify-between font-bold py-6"
              asChild
              disabled={locked}
            >
              <Link href={locked ? "#" : href} className="flex items-center justify-between">
                <span>{completed ? "Review" : active ? "Continue" : "Start"}</span>
                <ChevronRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}