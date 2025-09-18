"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import { useAuth } from "@/lib/context/auth-context";
import { User2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type userDetails = {
  id: string;
  email?: string;
  first_name: string;
  last_name?: string;
  school_id: string;
  school_name?: string;
  grade?: string;
  username?: string;
};

export default function StudentProfile() {
  const { logout } = useAuth();
  const router = useRouter();

  const [userProfilePicture, setUserProfilePicture] = useState<string | null>();
  const [userDetails, setUserDetails] = useState<userDetails | null>(null);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await fetch("/api/users/details");
        if (!res.ok) throw new Error("Failed to fetch attempts");
        const data = await res.json();
        setUserDetails(data);
        console.log(data);
      } catch (err) {
        console.error("Error fetching attempts:", err);
      }
    }
    fetchDetails();
  }, []);

  return (
    <div className="h-screen bg-[#113604] flex flex-col select-none">
      <DashboardHeader />
      <div className={`flex-1 pt-6`}>
        <div className="flex flex-col bg-[#FCFCFC] rounded-2xl w-[95%] mx-auto h-full overflow-auto items-start">
          <div className="w-[80%] h-[10%] flex items-center self-center px-16 py-20">
            {/* Left */}
            <div className="flex-1">
              <span
                className="hover:cursor-pointer text-[#2D7017]"
                onClick={() => router.back()}
              >
                {"< "}Go Back to Home
              </span>
            </div>

            {/* Center */}
            <div className="flex-1 flex justify-center">
              {userProfilePicture ? (
                <img
                  src={userProfilePicture}
                  alt="user default logo"
                  className="w-14 h-14 rounded-full object-cover bg-black"
                />
              ) : (
                <User2Icon className="w-14 h-14 rounded-full bg-black text-white" />
              )}
            </div>

            {/* Right */}
            <div className="flex-1 text-right text-white">
              {userDetails?.first_name} {userDetails?.last_name}
            </div>
          </div>

          <div className="bg-white w-[60%] self-center rounded-xl shadow-md border flex flex-col">
            <span className="text-xl mt-3 self-center">My Account Details</span>
            <div className="h-[1px] w-[90%] bg-[#A5A2A8] mb-3 mt-1 self-center" />
            <div className="grid grid-cols-2 w-[90%] self-center gap-y-4 gap-x-4 mb-3">
              <div className="flex flex-col">
                First Name
                <input
                  className="rounded bg-[#D7D7D7] py-2 px-3 text-black"
                  placeholder="first name"
                  disabled
                  value={userDetails?.first_name ?? ""}
                />
              </div>
              <div className="flex flex-col">
                Last Name
                <input
                  className="rounded bg-[#D7D7D7] py-2 px-3"
                  placeholder="last name"
                  disabled
                  value={userDetails?.last_name ?? ""}
                />
              </div>
              <div className="flex flex-col">
                Username
                <input
                  className="rounded bg-[#D7D7D7] py-2 px-3"
                  placeholder="username"
                  disabled
                  value={userDetails?.username}
                />
              </div>
              <div className="flex flex-col">
                Grade
                <input
                  className="rounded bg-[#D7D7D7] py-2 px-3"
                  placeholder="grade"
                  disabled
                  value={userDetails?.grade ?? ""}
                />
              </div>
            </div>
          </div>
          <div className="bg-white w-[60%] self-center rounded-xl shadow-md border flex flex-col overflow-hidden mt-12 py-3">
            <span className="text-xl mt-3 self-center">My Account Details</span>
            <div className="h-[1px] w-[90%] bg-[#A5A2A8] mb-3 mt-1 self-center" />
            <button
              className="bg-[#2D7017] text-white w-[20%] self-center rounded py-3"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
