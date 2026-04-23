import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomeRedirectPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  redirect("/onboarding/role");
}
