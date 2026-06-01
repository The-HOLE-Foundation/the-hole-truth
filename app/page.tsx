import Link from "next/link";

export default function Home() {
  return (
    <main
      id="main"
      className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16"
    >
      <p className="mb-3 text-sm font-medium uppercase tracking-widest text-neutral-600 dark:text-neutral-400">
        The/Hole/Truth
      </p>
      <h1 className="font-serif text-4xl leading-tight sm:text-5xl">
        Public records, for the public.
      </h1>
      <p className="mt-6 text-lg text-neutral-800 dark:text-neutral-200">
        A free assistant that helps anyone understand their right to access
        government records, draft a legally-sound request to the correct
        agency, and track the response — across federal FOIA and all 50 state
        transparency laws.
      </p>
      <div className="mt-8">
        <Link
          href="/draft"
          className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-5 py-3 text-base font-medium text-white transition hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:ring-neutral-100"
        >
          Draft a request →
        </Link>
      </div>
      <p className="mt-6 text-sm text-neutral-600 dark:text-neutral-400">
        v0 — covering federal FOIA and TX, CA, NY, IL, FL. A 501(c)(3) project.
      </p>
    </main>
  );
}
