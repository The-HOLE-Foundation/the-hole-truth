import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The/Hole/Truth — public-records assistant",
  description:
    "A free public-records assistant. Understand your rights, draft a legally-sound request, and track the response.",
  robots: { index: false, follow: false }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:rounded focus:bg-black focus:px-3 focus:py-1 focus:text-white"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
