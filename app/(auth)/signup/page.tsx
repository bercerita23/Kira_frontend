"use client";
import { useAuth } from "@/lib/context/auth-context";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { UserPlus, AlertCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const dummySchools = [
  { school_id: "SCH001", name: "Greenwood High" },
  { school_id: "SCH002", name: "Bright Future Academy" },
  { school_id: "SCH003", name: "Riverdale School" },
];

export default function SignupPage() {
  const [schools, setSchools] = useState<{ school_id: string; name: string }[]>(
    []
  );
  const { loginAdmin } = useAuth();

  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
    schoolId: "",
    code: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

  const handleSchoolChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      schoolId: value,
    }));
  };
  useEffect(() => {
    const loadSchools = async () => {
      try {
        const res = await fetch("/api/auth/school");
        if (!res.ok) throw new Error("Failed to load schools");

        const data = await res.json();
        setSchools(data); // expected: [{ school_id: "...", name: "..." }]
      } catch (err) {
        console.warn("Using temporarly stored schools due to error:", err);
        setSchools(dummySchools);
      }
    };

    loadSchools();
  }, []);
  useEffect(() => {
    const firstName = searchParams.get("first_name");

    const lastName = searchParams.get("last_name");
    const email = searchParams.get("email");
    const userId = searchParams.get("user_id");
    const code = searchParams.get("code");
    const schoolId = searchParams.get("school_id");

    setFormData((prev) => ({
      ...prev,
      firstName: firstName || prev.firstName,
      lastName: lastName || prev.lastName,
      email: email || prev.email,
      code: code || prev.code,
      schoolId: schoolId || prev.schoolId,
    }));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const payload = {
        email: formData.email,
        school_id: formData.schoolId,
        first_name: formData.firstName,
        last_name: formData.lastName,
        code: formData.code,
        password: formData.password,
      };

      const res = await fetch("/api/auth/register-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Registration failed.");
      }

      toast({
        title: "Registration Successful",
        description: "Welcome to Kira!",
      });

      await loginAdmin({ email: formData.email, password: formData.password });

      router.push("/admin/");
    } catch (err: any) {
      setError("Incorrect information entered");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordsMatch =
    formData.password && formData.confirmPassword
      ? formData.password === formData.confirmPassword
      : null;
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#f5f5f5" }}
    >
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img
            src="/assets/auth.png"
            alt="Kira Auth"
            style={{ width: 64, height: 64, objectFit: "contain" }}
            className="mb-1"
          />
          <span className="text-xl font-medium text-[#2D0B18] mb-2">
            Create Admin Account
          </span>
        </div>
        <Card className="bg-white">
          <CardHeader>
            {/* Remove icon and duplicate title, keep only description */}
            <CardDescription className="text-center">
              Register to access the Kira admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="focus:ring-[#2d7017] focus:border-[#2d7017]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="focus:ring-[#2d7017] focus:border-[#2d7017]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="focus:ring-[#2d7017] focus:border-[#2d7017]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={
                    (passwordsMatch === null
                      ? ""
                      : passwordsMatch
                      ? "border-green-500 focus-visible:ring-green-500"
                      : "border-red-500 focus-visible:ring-red-500") +
                    " focus:ring-[#2d7017] focus:border-[#2d7017]"
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={
                    (passwordsMatch === null
                      ? ""
                      : passwordsMatch
                      ? "border-green-500 focus-visible:ring-green-500"
                      : "border-red-500 focus-visible:ring-red-500") +
                    " focus:ring-[#2d7017] focus:border-[#2d7017]"
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schoolId">Select School</Label>
                <Select
                  value={formData.schoolId}
                  onValueChange={handleSchoolChange}
                >
                  <SelectTrigger className="focus:ring-[#2d7017] focus:border-[#2d7017]">
                    <SelectValue placeholder="Choose a school" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {schools.map((school) => (
                      <SelectItem
                        className="!bg-white !text-black hover:!bg-gray-100"
                        key={school.school_id}
                        value={school.school_id}
                      >
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    name="code"
                    required
                    value={formData.code}
                    onChange={handleChange}
                    className="focus:ring-[#2d7017] focus:border-[#2d7017]"
                  />
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  className="focus:ring-[#2d7017] focus:border-[#2d7017] "
                  id="terms"
                  name="terms"
                  required
                  checked={formData.terms}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      terms: checked as boolean,
                    }))
                  }
                />
                <Label htmlFor="terms" className="text-sm font-normal">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="font-medium hover:underline"
                    style={{ color: "#94b689" }}
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="font-medium hover:underline"
                    style={{ color: "#94b689" }}
                  >
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full text-white"
                style={{ background: "#2d7017" }}
                disabled={isLoading || !formData.terms}
              >
                {isLoading ? (
                  "Registering..."
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" /> Create Account
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium hover:underline"
                style={{ color: "#94b689" }}
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
