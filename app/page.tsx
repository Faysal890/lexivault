import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-dvh bg-surface text-on-surface">
      {/* Top Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-primary.svg" alt="Lexora" className="h-8 w-auto" />
            <span className="text-xl font-bold tracking-tight text-on-surface font-headline">Lexora</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-on-surface-variant px-4 py-2 rounded-xl hover:bg-surface-container transition-colors">
              Login
            </Link>
            <Link href="/register" className="text-sm font-bold text-on-primary bg-gradient-primary px-4 py-2 rounded-xl shadow-sm shadow-primary/20 transition-transform active:scale-95">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-24">
        {/* Hero */}
        <section className="px-6 py-12 flex flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold tracking-wide uppercase">
            New: AI Vocabulary Tutor
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-on-surface mb-6 leading-tight font-headline">
            Learn English Words{" "}
            <span className="text-primary">Smarter</span>
          </h1>
          <p className="text-on-surface-variant text-lg mb-10 max-w-md">
            The fluid approach to mastering vocabulary. Lexora adapts to your pace using cognitive science and spaced repetition.
          </p>
          <div className="w-full max-w-sm space-y-4">
            <Link href="/register" className="block w-full py-4 px-8 rounded-2xl bg-gradient-primary text-on-primary font-bold text-lg shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform text-center">
              Get Started — It&apos;s Free
            </Link>
            <Link href="/login" className="block w-full py-4 px-8 rounded-2xl bg-surface-container-high text-on-surface font-bold text-lg active:scale-[0.98] transition-transform text-center">
              Login to your account
            </Link>
          </div>

          {/* Hero Image */}
          <div className="mt-14 w-full max-w-lg aspect-[4/3] rounded-3xl overflow-hidden bg-surface-container-low p-4 shadow-xl shadow-primary/5">
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary-fixed via-secondary-container to-tertiary-fixed flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="absolute rounded-full bg-white/30"
                    style={{ width: `${80 + i * 40}px`, height: `${80 + i * 40}px`, top: `${Math.random() * 80}%`, left: `${Math.random() * 80}%` }} />
                ))}
              </div>
              <div className="relative z-10 text-center p-8">
                <div className="text-6xl mb-4">📚</div>
                <div className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-lg">
                  <div className="font-headline font-bold text-2xl text-on-surface mb-1">Ephemeral</div>
                  <div className="text-on-surface-variant text-sm italic">adj. lasting a very short time</div>
                  <div className="mt-3 flex gap-2 justify-center">
                    {["Fleeting", "Eternal", "Temporary", "Brief"].map((opt, i) => (
                      <span key={opt} className={`text-xs px-2 py-1 rounded-lg font-bold ${i === 0 ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container text-on-surface-variant"}`}>{opt}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 py-16 bg-surface-container-low">
          <div className="text-center mb-12 max-w-md mx-auto">
            <span className="text-secondary font-bold text-xs uppercase tracking-widest">Why Lexora</span>
            <h2 className="text-3xl font-bold mt-2 font-headline">Engineered for Fluency</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: "psychology", color: "bg-primary-fixed", textColor: "text-primary", title: "Adaptive Learning", desc: "Our SRS analyzes your recall patterns to present words exactly when your brain is ready to memorize them." },
              { icon: "auto_awesome", color: "bg-secondary-fixed", textColor: "text-secondary", title: "Contextual Depth", desc: "See words in real-world sentences and rich context — not just dry definitions." },
              { icon: "show_chart", color: "bg-tertiary-fixed", textColor: "text-tertiary", title: "Progress Insights", desc: "Visualize your vocabulary growth with beautiful charts tracking fluency and streak milestones." },
            ].map((f) => (
              <div key={f.title} className="bg-surface-container-lowest p-8 rounded-3xl text-center flex flex-col items-center">
                <div className={`w-16 h-16 rounded-2xl ${f.color} flex items-center justify-center ${f.textColor} mb-6`}>
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-3 font-headline">{f.title}</h3>
                <p className="text-on-surface-variant leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bento Grid */}
        <section className="px-6 py-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 font-headline">The Lexora Experience</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface-container-high rounded-3xl p-6 h-48 flex flex-col justify-end relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
              <div className="relative z-10">
                <h4 className="font-bold text-lg font-headline">Smart Dashboards</h4>
                <p className="text-sm text-on-surface-variant">Clean, focused, distraction-free learning.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary-container rounded-3xl p-6 h-40 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-on-secondary-container text-4xl mb-2">menu_book</span>
                <span className="font-bold text-sm text-on-secondary-container font-headline">5k+ Words</span>
              </div>
              <div className="bg-primary-container rounded-3xl p-6 h-40 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-on-primary-container text-4xl mb-2">group</span>
                <span className="font-bold text-sm text-on-primary-container font-headline">Live Quizzes</span>
              </div>
              <div className="bg-tertiary-fixed rounded-3xl p-6 h-40 flex flex-col items-center justify-center text-center col-span-2">
                <span className="material-symbols-outlined text-tertiary text-4xl mb-2">local_fire_department</span>
                <span className="font-bold text-sm text-tertiary font-headline">Daily Streaks & XP</span>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 py-12 max-w-2xl mx-auto">
          <div className="bg-inverse-surface rounded-[32px] p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
            <h2 className="text-3xl font-bold text-surface mb-4 relative z-10 font-headline">Ready to master English?</h2>
            <p className="text-surface-dim mb-8 relative z-10 text-sm">Join 50,000+ learners evolving their language skills daily.</p>
            <Link href="/register" className="block w-full py-4 bg-surface text-on-surface font-black rounded-2xl active:scale-95 transition-transform font-headline">
              Start Your Journey
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 py-12 text-center border-t border-surface-container-high">
        <span className="text-2xl font-black text-on-surface block mb-6 font-headline">Lexora</span>
        <div className="flex justify-center gap-8 mb-8 text-on-surface-variant font-medium text-sm">
          <span>Features</span>
          <span>Pricing</span>
          <span>Privacy</span>
        </div>
        <p className="text-xs text-outline uppercase tracking-widest font-bold">© {new Date().getFullYear()} Lexora Fluid Scholar</p>
      </footer>
    </div>
  );
}
