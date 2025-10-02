import { ProfileCard } from "@/components/ui/profile-card";
import { JoinTeam } from "@/components/ui/join-team";
import { mentors, interns } from "@/lib/team-data";

export default function TeamPage() {
  return (
    <div className="font-lato flex flex-col min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full bg-[#113604]">
        <section className="flex items-center justify-center py-20">
          <h1 className="font-medium text-4xl text-white leading-[100%] tracking-[-0.02em] text-center uppercase">
            the kira team
          </h1>
        </section>
      </div>
      <div className="py-20 gap-12 flex flex-col">
        <section className="flex flex-col justify-center items-center gap-12">
          <h2 className="font-medium text-2xl tracking-[-0.03em] text-center items-center justify-center">
            Mentors
          </h2>
          <div className="grid grid-cols-2 gap-x-12 gap-y-6 justify-items-center">
            {mentors.map((mentor, i) => (
              <ProfileCard key={i} {...mentor} className="w-full h-full" />
            ))}
          </div>
        </section>

        <section className="w-full flex flex-col justify-center items-center gap-12">
          <h2 className="font-medium text-2xl tracking-[-0.03em] text-center items-center justify-center">
            Interns
          </h2>
          <div className="grid grid-cols-3 gap-x-12 gap-y-6 justify-items-center">
            {interns.map((intern, i) => (
              <ProfileCard key={i} {...intern} className="w-full h-full" />
            ))}
          </div>
        </section>
      </div>
      <JoinTeam />
    </div>
  );
}
