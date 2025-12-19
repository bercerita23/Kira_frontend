import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuizAverageChart from "@/components/dashboard/line-graph";
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
// Adjust import if needed

interface StudentEditModalProps {
  editStudent: DbUser;
  setEditStudent: (student: DbUser | null) => void;
  editForm: any;
  setEditForm: (form: any) => void;
  studentQuizAttempts: any;
  setStudentQuizAttempts: (data: any) => void;
  showAllPointsHistory: boolean;
  setShowAllPointsHistory: (show: boolean) => void;
  showAllQuizHistory: boolean;
  setShowAllQuizHistory: (show: boolean) => void;
  showAllAwards: boolean;
  setShowAllAwards: (show: boolean) => void;
  getUserInitials: (user: DbUser) => string;
  getDisplayName: (user: DbUser) => string;
  formatDate: (dateString: string) => string;
  createStatsForStudent: (quizHistory: any) => any;
  getThisWeekQuizStatus: (quizHistory: any) => any;
  handleUpdateStudent: () => void;
  isUpdating: boolean;
  schoolName: string | null;
  GRADES: string[];
  deactivateStudent: (username: string) => void;
  reactivateStudent: (username: string) => void;
}

const StudentEditModal = ({
  editStudent,
  setEditStudent,
  editForm,
  setEditForm,
  studentQuizAttempts,
  setStudentQuizAttempts,
  showAllPointsHistory,
  setShowAllPointsHistory,
  showAllQuizHistory,
  setShowAllQuizHistory,
  showAllAwards,
  setShowAllAwards,
  getUserInitials,
  getDisplayName,
  formatDate,
  createStatsForStudent,
  getThisWeekQuizStatus,
  handleUpdateStudent,
  isUpdating,
  schoolName,
  GRADES,
  deactivateStudent,
  reactivateStudent,
}: StudentEditModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ">
      <div className="bg-white rounded-lg p-8 w-full max-w-7xl max-h-[94vh] overflow-y-auto shadow-2xl">
        {/* Header with Avatar and Name */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-green-500 text-white font-semibold text-1xl">
                {getUserInitials(editStudent)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-1xl font-lato font-[600]">
                {getDisplayName(editStudent)}
              </h2>
              <p className="text-gray-500 text-[13px] font-lato font-[400]">
                {editStudent.username}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditStudent(null)}
          >
            ✕
          </Button>
        </div>
        <hr className="my-2 w-full border-t border-gray-300 mb-4" />
        {/* Two Tab Layout */}
        <div className="bg-white pl-1 pr-1  pb-2 rounded-xl">
          <Tabs defaultValue="progress" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 rounded-md overflow-hidden ">
              <TabsTrigger value="progress">PROGRESS</TabsTrigger>
              <TabsTrigger value="profile" className="rounded-[8px]">
                STUDENT PROFILE
              </TabsTrigger>
            </TabsList>

            {/* Progress Tab */}
            <TabsContent value="progress" className="space-y-4 p-8">
              <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
                {/* LEFT COLUMN */}
                <div className="space-y-6 w-full max-w-[300px]">
                  {studentQuizAttempts && (
                    <Card className="rounded-2xl shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-center text-base font-lato font-[500]">
                          This Week's Progress
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="text-sm space-y-2 text-center text-muted-foreground">
                        {getThisWeekQuizStatus(
                          studentQuizAttempts.quiz_history
                        ).map((entry: any, index: number) => (
                          <div
                            key={entry.id}
                            className="flex items-center justify-center gap-2"
                          >
                            <span
                              className={
                                entry.status === "completed"
                                  ? "text-green-600"
                                  : "text-yellow-500"
                              }
                            >
                              {entry.status === "completed" ? "✔️" : "🕒"}
                            </span>
                            <span>Quiz {index + 1}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-6">
                  {/* Total Points */}
                  <Card className="p-6 rounded-2xl shadow-sm">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      {/* Left: Total Points Circle */}
                      <div className="flex justify-center md:justify-start md:w-[180px] ">
                        <div className="w-36 h-36 rounded-full border-[10px] border-emerald-400 bg-emerald-100 flex flex-col items-center justify-center text-center shadow-lg">
                          <div className="text-sm text-emerald-700 font-lato font-[600]">
                            Total Points
                          </div>
                          <div className="text-3xl font-lato font-[600] text-black">
                            {studentQuizAttempts?.total_points}
                          </div>
                        </div>
                      </div>

                      {/* Right: Points History Table */}
                      <div className="flex-1 space-y-2 w-full">
                        <div className="border rounded-lg overflow-hidden divide-y">
                          {(showAllPointsHistory
                            ? studentQuizAttempts?.points_history
                            : studentQuizAttempts?.points_history.slice(0, 3)
                          )?.map((entry: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center px-4 py-2 text-sm bg-white"
                            >
                              <span className="font-lato font-[500] text-black">
                                {entry.points} points
                              </span>
                              <span className="text-muted-foreground font-lato font-[400]">
                                {formatDate(entry.date)}
                              </span>
                              <span className="text-muted-foreground font-lato font-[400]">
                                {entry.description}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* View Details Link */}
                        <div
                          className="text-right mt-2 text-sm text-purple-700 font-lato font-[500] cursor-pointer hover:underline"
                          onClick={() =>
                            setShowAllPointsHistory(!showAllPointsHistory)
                          }
                        >
                          {showAllPointsHistory
                            ? "Hide Details ⌃"
                            : "View Details ⌄"}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Average Quiz Grade + History */}
                  <Card className="p-6 rounded-2xl shadow-sm">
                    <div className="flex flex-col gap-6 items-start">
                      {/* Left: Average Quiz Grade Circle */}
                      <div className="flex flex-row w-full">
                        <div className="flex justify-center md:justify-start md:w-[180px] ">
                          <div className="w-36 h-36 rounded-full border-[10px] border-purple-700 bg-purple-100 flex flex-col items-center justify-center text-center shadow-lg">
                            <div className="text-sm text-purple-700 font-semibold">
                              Avg. Quiz Grade
                            </div>
                            <div className="text-3xl font-bold text-black">
                              {studentQuizAttempts?.avg_quiz_grade || "N/A"}
                            </div>
                          </div>
                        </div>

                        {studentQuizAttempts && (
                          <QuizAverageChart
                            quizStats={createStatsForStudent(
                              studentQuizAttempts
                            )}
                          />
                        )}
                      </div>

                      {/* Right: Quiz History Table */}
                      <div className="flex-1 space-y-2 w-full">
                        <div className="flex-1 w-full">
                          <div className="border rounded-lg overflow-hidden divide-y">
                            {(showAllQuizHistory
                              ? studentQuizAttempts?.quiz_history
                              : studentQuizAttempts?.quiz_history.slice(0, 3)
                            )?.map((quiz: any, idx: number) => (
                              <div
                                key={idx}
                                className="grid grid-cols-4 gap-4 items-center px-4 py-2 text-sm bg-white"
                              >
                                <span className="text-black font-lato font-[400]">
                                  {quiz.quiz_name}
                                </span>
                                <span className="text-muted-foreground font-lato font-[400]">
                                  {new Date(quiz.date).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    }
                                  )}
                                </span>
                                <span className="text-muted-foreground font-lato font-[400]">
                                  {quiz.grade}
                                </span>
                                <span className="text-muted-foreground font-lato font-[400]">
                                  {quiz.retakes} retakes
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* View Details Link */}
                          <div
                            className="text-right mt-2 text-sm text-purple-700 font-lato font-[500] cursor-pointer hover:underline"
                            onClick={() =>
                              setShowAllQuizHistory(!showAllQuizHistory)
                            }
                          >
                            {showAllQuizHistory
                              ? "Hide Details ⌃"
                              : "View Details ⌄"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Badges & Achievements */}
                  <Card className="p-6 rounded-2xl shadow-sm">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      {/* Left: Badges & Achievements Circle */}
                      <div className="flex justify-center md:justify-start md:w-[180px]">
                        <div className="w-36 h-36 rounded-full border-[10px] border-yellow-400 bg-yellow-100 flex flex-col items-center justify-center text-center shadow-lg">
                          <div className="text-sm text-yellow-700 font-lato font-[600]">
                            Badges & Achievements
                          </div>
                          <div className="text-3xl font-lato font-[600] text-black">
                            {(studentQuizAttempts?.badges.length || 0) +
                              (studentQuizAttempts?.achievements.length || 0)}
                          </div>
                        </div>
                      </div>

                      {/* Right: Badges and Achievements Lists */}
                      <div className="flex flex-col md:flex-row gap-4 w-full">
                        {/* Badges List */}
                        <div className="flex-1 space-y-2">
                          <div className="border rounded-lg overflow-hidden divide-y">
                            {(showAllAwards
                              ? studentQuizAttempts?.badges
                              : studentQuizAttempts?.badges.slice(0, 3)
                            )?.map((badge: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center px-4 py-2 text-sm bg-white"
                              >
                                <span className="text-black font-lato font-[400]">
                                  {badge.name}
                                </span>
                                <span className="text-muted-foreground font-lato font-[400]">
                                  {new Date(badge.earned_at).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    }
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Achievements List */}
                        <div className="flex-1 space-y-2">
                          <div className="border rounded-lg overflow-hidden divide-y">
                            {(showAllAwards
                              ? studentQuizAttempts?.achievements
                              : studentQuizAttempts?.achievements.slice(0, 3)
                            )?.map((ach: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center px-4 py-2 text-sm bg-white"
                              >
                                <span className="text-black font-lato font-[400]">
                                  {ach.name}
                                </span>
                                <span className="text-muted-foreground font-lato font-[400]">
                                  {new Date(
                                    ach.completed_at
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* View Details Link */}
                    <div
                      className="text-right mt-4 text-sm text-purple-700 font-lato font-[500] cursor-pointer hover:underline"
                      onClick={() => setShowAllAwards(!showAllAwards)}
                    >
                      {showAllAwards ? "Hide Details ⌃" : "View Details ⌄"}
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Student Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="w-full flex justify-center">
                <div className="max-w-2xl ">
                  {/* Account Details Section */}
                  <div className="bg-white border rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-lato font-[600]">
                        Account Details
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-600 hover:bg-green-50 font-lato font-[500]"
                      >
                        Edit
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="font-lato font-[500]">
                          First Name
                        </Label>
                        <Input
                          value={editForm.first_name}
                          onChange={(e) =>
                            setEditForm((f: any) => ({
                              ...f,
                              first_name: e.target.value,
                            }))
                          }
                          className="mt-1"
                          placeholder="First name"
                        />
                      </div>
                      <div>
                        <Label className="font-lato font-[500]">
                          Last Name
                        </Label>
                        <Input
                          value={editForm.last_name}
                          onChange={(e) =>
                            setEditForm((f: any) => ({
                              ...f,
                              last_name: e.target.value,
                            }))
                          }
                          className="mt-1"
                          placeholder="Last name"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label className="font-lato font-[500]">Email</Label>
                      <Input
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm((f: any) => ({
                            ...f,
                            email: e.target.value,
                          }))
                        }
                        className="mt-1"
                        placeholder="Email address"
                      />
                    </div>

                    <div className="mt-4">
                      <Label className="font-lato font-[500]">Username</Label>
                      <Input
                        value={editForm.username}
                        onChange={(e) =>
                          setEditForm((f: any) => ({
                            ...f,
                            username: e.target.value,
                          }))
                        }
                        className="mt-1"
                        placeholder="Username"
                      />
                      {editForm.username !== editStudent.username && (
                        <p className="text-sm text-orange-600 mt-1 font-lato font-[400]">
                          ⚠️ Changing username will affect student login
                          credentials
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label className="font-lato font-[500]">School</Label>
                        <div className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900">
                          {schoolName || "Not assigned"}
                        </div>
                      </div>
                      <div>
                        <Label className="font-lato font-[500]">Grade</Label>
                        <select
                          value={editForm.grade || ""}
                          onChange={(e) =>
                            setEditForm((prev: any) => ({
                              ...prev,
                              grade: e.target.value,
                            }))
                          }
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                        >
                          <option value="">Not assigned</option>
                          {GRADES.map((grade) => (
                            <option key={grade} value={grade}>
                              {grade}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label className="font-lato font-[500]">Notes</Label>
                      <hr className="my-2 w-full border-t border-gray-300 mb-4 mt-3" />
                      <textarea
                        value={
                          editForm.notes !== ""
                            ? editForm.notes
                            : studentQuizAttempts?.student_info.notes || ""
                        }
                        onChange={(e) =>
                          setEditForm((f: any) => ({
                            ...f,
                            notes: e.target.value,
                          }))
                        }
                        placeholder="Add notes about this student..."
                        className="mt-1 w-full h-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 resize-none"
                      />
                    </div>
                  </div>

                  {/* Account Options Section */}
                  <div className="bg-white border rounded-lg p-6 mb-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-lato font-[600]">
                        Account Options
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`border-green-600 hover:bg-green-50 font-lato font-[500] ${
                          studentQuizAttempts?.student_info.deactivated
                            ? "text-green-600"
                            : "text-green-600"
                        }`}
                        onClick={() => {
                          const username = editStudent.username;
                          if (studentQuizAttempts?.student_info.deactivated) {
                            reactivateStudent(username);
                          } else {
                            deactivateStudent(username);
                          }
                        }}
                      >
                        {studentQuizAttempts?.student_info.deactivated
                          ? "Reactivate Account"
                          : "Deactivate Account"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => setEditStudent(null)}
            className="font-lato font-[500]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStudent}
            disabled={isUpdating}
            className="bg-blue-600 hover:bg-blue-700 font-lato font-[500]"
          >
            {isUpdating ? "Updating..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentEditModal;
