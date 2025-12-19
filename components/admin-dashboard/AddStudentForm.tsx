import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface AddStudentFormProps {
  addStudentForm: {
    username: string;
    password: string;
    confirmPassword: string;
    first_name: string;
    last_name: string;
    grade: string;
  };
  setAddStudentForm: (form: AddStudentFormProps["addStudentForm"]) => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  addStudent: () => void;
  isAddingStudent: boolean;
  passwordMatch: boolean;
}

const GRADES = [
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
  "11th",
  "12th",
];

const AddStudentForm = ({
  addStudentForm,
  setAddStudentForm,
  handleKeyPress,
  addStudent,
  isAddingStudent,
  passwordMatch,
}: AddStudentFormProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 font-lato font-[600]">
        <UserPlus className="h-5 w-5 text-green-600" />
        Add New Student
      </CardTitle>
      <CardDescription className="font-lato font-[400]">
        Fill in the student's credentials below.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name" className="font-lato font-[500]">
              First Name *
            </Label>
            <Input
              id="first_name"
              placeholder="John"
              value={addStudentForm.first_name}
              onChange={(e) =>
                setAddStudentForm({
                  ...addStudentForm,
                  first_name: e.target.value,
                })
              }
              onKeyPress={handleKeyPress}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name" className="font-lato font-[500]">
              Last Name *
            </Label>
            <Input
              id="last_name"
              placeholder="Doe"
              value={addStudentForm.last_name}
              onChange={(e) =>
                setAddStudentForm({
                  ...addStudentForm,
                  last_name: e.target.value,
                })
              }
              onKeyPress={handleKeyPress}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="username" className="font-lato font-[500]">
            Username *
          </Label>
          <Input
            id="username"
            placeholder="student123"
            value={addStudentForm.username}
            onChange={(e) =>
              setAddStudentForm({
                ...addStudentForm,
                username: e.target.value,
              })
            }
            onKeyPress={handleKeyPress}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="font-lato font-[500]">
            Password *
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Minimum 6 characters"
            value={addStudentForm.password}
            onChange={(e) =>
              setAddStudentForm({
                ...addStudentForm,
                password: e.target.value,
              })
            }
            onKeyPress={handleKeyPress}
            className={
              !passwordMatch ? "border-red-500 focus:border-red-500" : ""
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="font-lato font-[500]">
            Confirm Password *
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={addStudentForm.confirmPassword}
            onChange={(e) =>
              setAddStudentForm({
                ...addStudentForm,
                confirmPassword: e.target.value,
              })
            }
            onKeyPress={handleKeyPress}
            className={
              !passwordMatch ? "border-red-500 focus:border-red-500" : ""
            }
          />
          {!passwordMatch && (
            <p className="text-sm text-red-500 font-lato font-[400]">
              Passwords do not match
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="grade" className="font-lato font-[500]">
            Grade
          </Label>
          <Select
            value={addStudentForm.grade}
            onValueChange={(value) =>
              setAddStudentForm({ ...addStudentForm, grade: value })
            }
          >
            <SelectTrigger id="grade">
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-input shadow-md">
              {GRADES.map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={addStudent}
            disabled={isAddingStudent}
            className="bg-green-600 hover:bg-green-700 font-lato font-[500]"
          >
            {isAddingStudent ? "Adding..." : "Add Student"}
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default AddStudentForm;
