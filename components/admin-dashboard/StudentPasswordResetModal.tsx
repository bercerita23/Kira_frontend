import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface StudentPasswordResetModalProps {
  show: boolean;
  selectedStudent: {
    username: string;
  } | null;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  passwordError: boolean;
  setShowModal: (show: boolean) => void;
  resetStudentPassword: () => void;
  isResettingPassword: boolean;
}

const StudentPasswordResetModal = ({
  show,
  selectedStudent,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  passwordError,
  setShowModal,
  resetStudentPassword,
  isResettingPassword,
}: StudentPasswordResetModalProps) => {
  if (!show || !selectedStudent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-lato font-[600] mb-4">
          Reset Password for {selectedStudent.username}
        </h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="new_password" className="font-lato font-[500]">
              New Password
            </Label>
            <Input
              id="new_password"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={cn(passwordError && "border-red-500")}
            />
          </div>

          <div>
            <Label htmlFor="confirm_password" className="font-lato font-[500]">
              Confirm Password
            </Label>
            <Input
              id="confirm_password"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={cn(passwordError && "border-red-500")}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              className="font-lato font-[500]"
            >
              Cancel
            </Button>
            <Button
              onClick={resetStudentPassword}
              disabled={isResettingPassword}
              className="bg-green-600 hover:bg-green-700 font-lato font-[500]"
            >
              {isResettingPassword ? "Resetting..." : "Reset Password"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPasswordResetModal;
