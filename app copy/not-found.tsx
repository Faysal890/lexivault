import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-surface flex flex-col items-center justify-center text-center px-6">
      <div className="text-8xl mb-6">📚</div>
      <h1 className="font-headline text-4xl font-extrabold text-on-surface mb-3">Page not found</h1>
      <p className="text-on-surface-variant mb-8 max-w-sm">
        This page doesn&apos;t exist. Let&apos;s get you back to learning!
      </p>
      <Link href="/" className="btn-primary w-auto px-8 py-3 inline-block rounded-2xl bg-gradient-primary text-on-primary font-bold">
        Go Home
      </Link>
    </div>
  );
}
