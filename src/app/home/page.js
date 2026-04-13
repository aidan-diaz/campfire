import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

export default async function HomePage() {
  const user = await currentUser();
  const name =
    user?.firstName || user?.username || user?.emailAddresses?.[0]?.emailAddress || "there";

  return (
    <div className="min-h-full flex-1 bg-zinc-50 dark:bg-black">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Campfire App</span>
        <UserButton afterSignOutUrl="/" />
      </header>
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Welcome to Campfire
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          You&apos;re signed in. Use this space for your app — lists, posts, or whatever you
          build next.
        </p>
      </main>
    </div>
  );
}
