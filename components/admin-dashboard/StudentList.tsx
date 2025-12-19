import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, User as UserIcon, Star } from "lucide-react";

type DbUser = {
  user_id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  last_login_time: string;
  school: string;
  notes: string;
  grade?: string;
  points?: number;
};

interface StudentListProps {
  students: DbUser[];
  loading: boolean;
  viewMode: "grid" | "list";
  onStudentClick: (student: DbUser) => void;
  getUserInitials: (user: DbUser) => string;
  getDisplayName: (user: DbUser) => string;
}

export default function StudentList({
  students,
  loading,
  viewMode,
  onStudentClick,
  getUserInitials,
  getDisplayName,
}: StudentListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-gray-600">Loading students...</span>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-lato font-[500] text-gray-900 mb-2">
            No Students Found
          </h3>
          <p className="text-gray-500 font-lato font-[400]">
            There are currently no students registered in the system.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {students.map((student, idx) => (
          <Card
            key={student.user_id || student.username || idx}
            onClick={() => onStudentClick(student)}
            className="hover:shadow-lg transition-all duration-200 border border-gray-200 cursor-pointer"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gray-200 text-gray-700 font-semibold text-lg">
                    {getUserInitials(student)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate font-lato font-[500]">
                    {getDisplayName(student)}
                  </CardTitle>
                  <CardDescription className="text-sm truncate font-lato font-[400]">
                    {student.username}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto p-0 mb-4"
                >
                  <span className="sr-only">More options</span>
                  ...
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center text-xs text-gray-600 font-lato font-[400]">
                  <UserIcon className="h-4 w-4 mr-1" />{" "}
                  {student.grade ? student.grade + " grade" : "-"}
                </span>
                <span className="flex items-center text-xs text-gray-600 font-lato font-[400]">
                  <Star className="h-4 w-4 mr-1" />{" "}
                  {typeof student.points === "number" ? student.points : 0}{" "}
                  points
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // List view
  return (
    <div className="flex flex-col gap-3">
      {students.map((student, idx) => (
        <Card
          key={student.user_id || student.username || idx}
          onClick={() => onStudentClick(student)}
          className="hover:shadow-md transition-all duration-200 border border-gray-200 cursor-pointer rounded-2xl bg-white px-0"
        >
          <CardContent className="flex items-center justify-between gap-x-6 py-2 px-6 min-h-[56px]">
            {/* Avatar + Name */}
            <div className="flex items-center gap-x-3 min-w-[180px]">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gray-200 text-gray-700 font-semibold text-base">
                  {getUserInitials(student)}
                </AvatarFallback>
              </Avatar>
              <span className="font-lato font-[500] text-base text-gray-900 whitespace-nowrap">
                {getDisplayName(student)}
              </span>
            </div>
            {/* Username */}
            <span className="text-gray-500 text-base whitespace-nowrap min-w-[120px] ml-[100px] text-center font-lato font-[400]">
              {student.username}
            </span>
            {/* Grade */}
            <span className="flex items-center text-gray-400 text-base whitespace-nowrap min-w-[110px] ml-[100px] justify-center font-lato font-[400]">
              <UserIcon className="h-5 w-5 mr-1" />{" "}
              {student.grade ? student.grade + " grade" : "-"}
            </span>
            {/* Points */}
            <span className="flex items-center text-gray-400 text-base whitespace-nowrap min-w-[110px] ml-[100px] justify-center font-lato font-[400]">
              <Star className="h-5 w-5 mr-1" />{" "}
              {typeof student.points === "number" ? student.points : 0} points
            </span>
            {/* Menu */}
            <Button variant="ghost" size="icon" className="ml-auto">
              <span className="sr-only">More options</span>
              ...
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
