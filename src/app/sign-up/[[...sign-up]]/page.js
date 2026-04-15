import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/onboarding/role?new=1"
      />
      <p className="mt-4 max-w-md text-center text-xs text-zinc-600 dark:text-zinc-400">
        Resume upload is optional during sign up. You can add or update your resume anytime from your My Journey dashboard.
      </p>
    </div>
  );
}
