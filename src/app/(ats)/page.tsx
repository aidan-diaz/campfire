import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Landing from "@/components/ats/pages/Landing";

export default async function AtsLandingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <Landing />;
}
