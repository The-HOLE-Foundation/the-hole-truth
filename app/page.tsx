export default function Home() {
  return (
    <main
      id="main"
      className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16"
    >
      <p className="mb-3 text-sm font-medium uppercase tracking-widest text-neutral-500">
        The/Hole/Truth
      </p>
      <h1 className="font-serif text-4xl leading-tight sm:text-5xl">
        Public records, for the public.
      </h1>
      <p className="mt-6 text-lg text-neutral-700 dark:text-neutral-300">
        A free assistant that helps anyone understand their right to access
        government records, draft a legally-sound request to the correct
        agency, and track the response — across federal FOIA and all 50 state
        transparency laws.
      </p>
      <p className="mt-6 text-sm text-neutral-500">
        v0 — under construction. A 501(c)(3) project.
      </p>
    </main>
  );
}
