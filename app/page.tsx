import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { storeService } from "@/lib/server/services/store.service";

const FEATURE_TONES = {
  primary: { bg: "bg-primary-fixed", text: "text-primary" },
  tertiary: { bg: "bg-tertiary-fixed", text: "text-tertiary" },
  secondary: { bg: "bg-secondary-container", text: "text-on-secondary-container" },
} as const;

type ToneKey = keyof typeof FEATURE_TONES;

const LANGUAGES: { name: string; native: string; flag: string }[] = [
  { name: "Bengali", native: "বাংলা", flag: "🇧🇩" },
  { name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { name: "Arabic", native: "العربية", flag: "🇸🇦" },
  { name: "Spanish", native: "Español", flag: "🇪🇸" },
  { name: "French", native: "Français", flag: "🇫🇷" },
  { name: "Portuguese", native: "Português", flag: "🇵🇹" },
  { name: "Turkish", native: "Türkçe", flag: "🇹🇷" },
  { name: "Urdu", native: "اردو", flag: "🇵🇰" },
  { name: "Indonesian", native: "Bahasa", flag: "🇮🇩" },
];

const TESTIMONIALS: { name: string; role: string; initial: string; tone: ToneKey; quote: string }[] = [
  {
    name: "Aisha R.",
    role: "IELTS candidate",
    initial: "A",
    tone: "primary",
    quote:
      "The native-language examples are a game changer. I finally remember words because I see them used the way I'd use them in Bengali first.",
  },
  {
    name: "Diego M.",
    role: "Software engineer",
    initial: "D",
    tone: "tertiary",
    quote:
      "The streak system kept me coming back daily for three months straight. My active vocabulary easily doubled.",
  },
  {
    name: "Priya S.",
    role: "Medical student",
    initial: "P",
    tone: "secondary",
    quote:
      "I export every weekend to a spreadsheet and review on the train. Most apps lock that behind a paywall — here it just works.",
  },
];

function formatPrice(cents: number) {
  const dollars = cents / 100;
  return `$${dollars.toFixed(2)}`;
}

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  const packages = await storeService.getPackages().catch(() => []);
  const featuredIdx = packages.length > 0 ? Math.floor((packages.length - 1) / 2) : -1;

  return (
    <div className="min-h-dvh bg-surface text-on-surface overflow-x-hidden">
      {/* Top Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-surface-container-high/50">
        <div className="flex justify-between items-center px-6 lg:px-10 py-3.5 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-primary.svg" alt="LexiVault" className="h-8 w-auto" />
            <span className="text-xl font-black tracking-tight text-on-surface font-headline">LexiVault</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors">Features</a>
            <a href="#how" className="text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors">How it works</a>
            <a href="#pricing" className="text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors">Pricing</a>
            <a href="#faq" className="text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:block text-sm font-semibold text-on-surface px-4 py-2 rounded-xl hover:bg-surface-container transition-colors">
              Sign in
            </Link>
            <Link href="/register" className="text-sm font-bold text-on-primary bg-gradient-primary px-3 py-2 sm:px-4 rounded-xl shadow-sm shadow-primary/30 hover:shadow-md hover:shadow-primary/40 transition-all active:scale-95">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-0">
        {/* Hero */}
        <section className="relative px-6 lg:px-10 pt-12 pb-20 lg:pt-24 lg:pb-32 max-w-7xl mx-auto">
          {/* Decorative gradient blobs */}
          <div className="absolute top-20 -left-40 w-[28rem] h-[28rem] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-40 -right-40 w-[32rem] h-[32rem] bg-tertiary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Copy */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold tracking-wide uppercase mb-6">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                AI-Powered Learning
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-on-surface mb-6 leading-[1.05] font-headline">
                Master English vocabulary,
                <br className="hidden lg:block" />{" "}
                <span className="bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">one word at a time.</span>
              </h1>
              <p className="text-on-surface-variant text-lg leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                Build your vocabulary with spaced repetition, AI-generated examples in your native language, and a streak system that keeps you coming back daily.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
                <Link href="/register" className="inline-flex items-center justify-center gap-2 py-3.5 px-7 rounded-2xl bg-gradient-primary text-on-primary font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all">
                  Start free
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
                <Link href="/login" className="inline-flex items-center justify-center gap-2 py-3.5 px-7 rounded-2xl bg-surface-container-high text-on-surface font-bold hover:bg-surface-container-highest transition-colors">
                  Sign in
                </Link>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center lg:justify-start text-sm text-on-surface-variant">
                <span className="inline-flex items-center gap-1.5"><span className="material-symbols-outlined text-secondary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> Free welcome coins</span>
                <span className="inline-flex items-center gap-1.5"><span className="material-symbols-outlined text-secondary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> No credit card</span>
                <span className="inline-flex items-center gap-1.5"><span className="material-symbols-outlined text-secondary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> 9+ languages</span>
              </div>
            </div>

            {/* Hero visual — stacked floating cards */}
            <div className="relative h-[440px] lg:h-[520px] mx-auto w-full max-w-md">
              {/* Background card — stats */}
              <div className="absolute top-0 right-0 w-56 bg-surface-container-lowest rounded-3xl p-5 shadow-xl shadow-primary/5 border border-surface-container-high/30 rotate-3 animate-[float_6s_ease-in-out_infinite]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-tertiary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                  <span className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Streak</span>
                </div>
                <div className="font-headline font-extrabold text-3xl text-on-surface">12 days</div>
                <div className="mt-3 flex gap-1">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className={`h-2 flex-1 rounded-full ${i < 6 ? "bg-tertiary" : "bg-surface-container"}`} />
                  ))}
                </div>
                <p className="text-xs text-on-surface-variant mt-3">+50 XP today</p>
              </div>

              {/* Foreground card — word card */}
              <div className="absolute top-24 left-0 w-[19rem] bg-surface-container-lowest rounded-3xl p-6 shadow-2xl shadow-primary/10 border border-surface-container-high/30 -rotate-2 animate-[float_7s_ease-in-out_infinite_0.5s]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded-md bg-primary-fixed/40">adjective</span>
                  <span className="material-symbols-outlined text-outline text-base">volume_up</span>
                </div>
                <h3 className="font-headline text-3xl font-extrabold text-on-surface mb-1">Ephemeral</h3>
                <p className="text-on-surface-variant text-sm mb-4">क्षणभंगुर — lasting a very short time</p>
                <div className="bg-surface-container rounded-2xl p-4 mb-4">
                  <p className="text-sm text-on-surface italic leading-relaxed">&ldquo;The beauty of cherry blossoms is <span className="text-primary font-bold">ephemeral</span>, lasting only a few days.&rdquo;</p>
                  <p className="text-xs text-on-surface-variant mt-2">चेरी ब्लॉसम की सुंदरता क्षणभंगुर है, केवल कुछ दिनों तक चलती है।</p>
                </div>
                <div className="flex items-center justify-between text-xs text-on-surface-variant">
                  <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span> 7 correct</span>
                  <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span> Review in 4 days</span>
                </div>
              </div>

              {/* Floating coin badge */}
              <div className="absolute bottom-8 right-4 bg-gradient-primary rounded-full px-5 py-3 shadow-2xl shadow-primary/30 flex items-center gap-2 animate-[float_5s_ease-in-out_infinite_1s]">
                <span className="material-symbols-outlined text-on-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>toll</span>
                <span className="text-on-primary font-extrabold">+50 coins</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="px-6 lg:px-10 py-10 border-y border-surface-container-high/40 bg-surface-container-lowest/50">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "9+", label: "Languages supported", icon: "language" },
              { value: "AI", label: "Generated examples", icon: "auto_awesome" },
              { value: "SM-2", label: "Spaced repetition", icon: "psychology" },
              { value: "100%", label: "Free to start", icon: "favorite" },
            ].map((s) => (
              <div key={s.label}>
                <span className="material-symbols-outlined text-primary text-2xl mb-1 block" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                <div className="font-headline text-2xl lg:text-3xl font-extrabold text-on-surface">{s.value}</div>
                <div className="text-xs text-on-surface-variant mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Languages */}
        <section className="px-6 lg:px-10 py-16 lg:py-24 max-w-7xl mx-auto">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <span className="text-tertiary font-bold text-xs uppercase tracking-[0.2em]">Native language support</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold mt-3 font-headline leading-tight">
              Learn English in the language you <span className="text-primary">think in</span>.
            </h2>
            <p className="text-on-surface-variant mt-4">
              Every AI-generated example sentence comes with a translation in your native language — so meaning sticks immediately.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {LANGUAGES.map((l) => (
              <div key={l.name} className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-surface-container-lowest border border-surface-container-high/40 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all">
                <span className="text-xl leading-none">{l.flag}</span>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-bold text-on-surface">{l.name}</span>
                  <span className="text-xs text-on-surface-variant">{l.native}</span>
                </div>
              </div>
            ))}
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary-fixed/40 text-primary text-sm font-bold">
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
              More on the way
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="px-6 lg:px-10 py-20 lg:py-28 max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-secondary font-bold text-xs uppercase tracking-[0.2em]">Features</span>
            <h2 className="text-3xl lg:text-5xl font-extrabold mt-3 font-headline leading-tight">
              Everything you need to <span className="text-primary">remember</span>.
            </h2>
            <p className="text-on-surface-variant mt-4 text-lg">
              Real tools backed by cognitive science. Not flashcards from 1987.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {([
              {
                icon: "psychology",
                tone: "primary",
                title: "Adaptive spaced repetition",
                desc: "The SM-2 algorithm watches your accuracy and times each review for the moment your brain is about to forget.",
              },
              {
                icon: "auto_awesome",
                tone: "tertiary",
                title: "AI example sentences",
                desc: "Generate natural example sentences with one tap. Each one comes with a translation in your native language.",
              },
              {
                icon: "translate",
                tone: "secondary",
                title: "9+ native languages",
                desc: "Bengali, Hindi, Arabic, Spanish, French, Portuguese, Turkish, Urdu, Indonesian — pick what you think in.",
              },
              {
                icon: "quiz",
                tone: "primary",
                title: "Smart mixed quizzes",
                desc: "Multiple choice, fill-in-the-blank, and reverse-translation modes — auto-generated from your own word list.",
              },
              {
                icon: "local_fire_department",
                tone: "tertiary",
                title: "Streaks, XP & levels",
                desc: "Daily streaks reward consistency. XP and levels turn vocabulary practice into a habit you actually keep.",
              },
              {
                icon: "file_download",
                tone: "secondary",
                title: "Export anywhere",
                desc: "Download your vocabulary as Excel, Word, or print-ready PDF. Your data stays yours.",
              },
            ] as const).map((f) => {
              const tone = FEATURE_TONES[f.tone];
              return (
                <div key={f.title} className="group bg-surface-container-lowest rounded-3xl p-7 border border-surface-container-high/30 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all">
                  <div className={`w-14 h-14 rounded-2xl ${tone.bg} flex items-center justify-center ${tone.text} mb-5 group-hover:scale-110 transition-transform`}>
                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2 font-headline">{f.title}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="px-6 lg:px-10 py-20 lg:py-28 bg-surface-container-low">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <span className="text-tertiary font-bold text-xs uppercase tracking-[0.2em]">How it works</span>
              <h2 className="text-3xl lg:text-5xl font-extrabold mt-3 font-headline leading-tight">Three steps. Real fluency.</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 relative">
              {[
                { step: "01", icon: "library_add", title: "Add your words", desc: "Type a word, paste a list, or grab them from articles you read. Tag them and set difficulty." },
                { step: "02", icon: "auto_awesome", title: "Tap to generate", desc: "Get a natural example sentence and a native-language translation in seconds, powered by AI." },
                { step: "03", icon: "rocket_launch", title: "Quiz, repeat, master", desc: "Daily quizzes resurface words at the right time. Watch your accuracy climb week after week." },
              ].map((s, i) => (
                <div key={s.step} className="relative">
                  <div className="bg-surface-container-lowest rounded-3xl p-8 h-full border border-surface-container-high/30">
                    <div className="font-headline text-5xl font-extrabold text-primary/20 mb-4">{s.step}</div>
                    <div className="w-12 h-12 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary mb-4">
                      <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 font-headline">{s.title}</h3>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{s.desc}</p>
                  </div>
                  {i < 2 && (
                    <span className="material-symbols-outlined hidden lg:block absolute top-1/2 -right-5 -translate-y-1/2 text-outline-variant text-3xl z-10">arrow_forward</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="px-6 lg:px-10 py-20 lg:py-28 max-w-7xl mx-auto">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <span className="text-primary font-bold text-xs uppercase tracking-[0.2em]">Loved by learners</span>
            <h2 className="text-3xl lg:text-5xl font-extrabold mt-3 font-headline leading-tight">
              Words that <span className="text-tertiary">stick</span>.
            </h2>
            <p className="text-on-surface-variant mt-4 text-lg">
              From IELTS prep to medical-school flashcards — here&apos;s what learners say after their first month.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => {
              const tone = FEATURE_TONES[t.tone];
              return (
                <figure key={t.name} className="bg-surface-container-lowest rounded-3xl p-7 border border-surface-container-high/30 flex flex-col">
                  <div className="flex gap-0.5 mb-4 text-tertiary">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                  <blockquote className="text-on-surface text-base leading-relaxed flex-1 mb-5">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="flex items-center gap-3 mt-auto pt-4 border-t border-surface-container-high/40">
                    <div className={`w-10 h-10 rounded-full ${tone.bg} ${tone.text} flex items-center justify-center font-headline font-extrabold`}>
                      {t.initial}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-on-surface">{t.name}</div>
                      <div className="text-xs text-on-surface-variant">{t.role}</div>
                    </div>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </section>

        {/* Pricing teaser */}
        <section id="pricing" className="px-6 lg:px-10 py-20 lg:py-28 bg-surface-container-low">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <span className="text-primary font-bold text-xs uppercase tracking-[0.2em]">Pricing</span>
              <h2 className="text-3xl lg:text-5xl font-extrabold mt-3 font-headline leading-tight">Free to start. Coins to grow.</h2>
              <p className="text-on-surface-variant mt-4 text-lg">
                All learning features are free. AI sentence generation uses coins so you only pay for what you use — no subscription required.
              </p>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 ${packages.length >= 2 ? "lg:grid-cols-3" : ""} gap-6 max-w-5xl mx-auto`}>
              {/* Free forever — always shown as the lead-in */}
              <div className="relative rounded-3xl p-7 border bg-surface-container-lowest border-surface-container-high/40">
                <div className="text-xs uppercase tracking-wider font-bold mb-3 text-on-surface-variant">Free forever</div>
                <div className="mb-5">
                  <span className="font-headline text-4xl font-extrabold">$0</span>
                </div>
                <p className="text-sm mb-5 text-on-surface-variant">Start with bonus coins. Quizzes, streaks, exports — everything except AI generation.</p>
                <ul className="space-y-2.5 mb-7">
                  {["Unlimited words", "Daily quizzes", "Streak tracking", "Excel / PDF export"].map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm">
                      <span className="material-symbols-outlined text-base mt-0.5 text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className="block w-full py-3 px-5 rounded-2xl font-bold text-center transition-all active:scale-[0.98] bg-on-surface text-surface hover:opacity-90"
                >
                  Get started
                </Link>
              </div>

              {/* Dynamic paid packages from the store */}
              {packages.map((p, i) => {
                const featured = i === featuredIdx;
                const examples = Math.max(1, Math.floor(p.coins / 10));
                const features = [
                  `~${examples} AI-generated examples`,
                  "Native-language translations",
                  "Coins never expire",
                ];
                return (
                  <div
                    key={p.id}
                    className={`relative rounded-3xl p-7 border ${featured ? "bg-gradient-to-br from-primary to-tertiary text-on-primary border-transparent shadow-2xl shadow-primary/20 scale-[1.02]" : "bg-surface-container-lowest border-surface-container-high/40"}`}
                  >
                    {featured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-tertiary-fixed text-tertiary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                        Popular
                      </div>
                    )}
                    <div className={`text-xs uppercase tracking-wider font-bold mb-3 ${featured ? "text-on-primary/70" : "text-on-surface-variant"}`}>{p.name}</div>
                    <div className="mb-1 flex items-baseline gap-1">
                      <span className="font-headline text-4xl font-extrabold">{formatPrice(p.priceUsd)}</span>
                      <span className={`text-sm ml-1 ${featured ? "text-on-primary/70" : "text-on-surface-variant"}`}>USD</span>
                    </div>
                    <div className={`inline-flex items-center gap-1.5 mb-5 text-sm font-bold ${featured ? "text-on-primary/90" : "text-tertiary"}`}>
                      <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>toll</span>
                      {p.coins.toLocaleString()} coins
                    </div>
                    <ul className="space-y-2.5 mb-7">
                      {features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2 text-sm">
                          <span className={`material-symbols-outlined text-base mt-0.5 ${featured ? "text-on-primary" : "text-secondary"}`} style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/register"
                      className={`block w-full py-3 px-5 rounded-2xl font-bold text-center transition-all active:scale-[0.98] ${featured ? "bg-on-primary text-primary hover:shadow-lg" : "bg-on-surface text-surface hover:opacity-90"}`}
                    >
                      Buy {p.name.toLowerCase()}
                    </Link>
                  </div>
                );
              })}

              {/* Empty-state placeholder when no packages are configured */}
              {packages.length === 0 && (
                <div className="relative rounded-3xl p-7 border bg-surface-container-lowest border-surface-container-high/40 md:col-span-1 flex flex-col items-center justify-center text-center">
                  <span className="material-symbols-outlined text-4xl text-outline mb-3">inventory_2</span>
                  <h3 className="font-bold text-on-surface mb-2">Coin packs coming soon</h3>
                  <p className="text-sm text-on-surface-variant mb-5">
                    Sign up free now — we&apos;ll let you know the moment paid coin packs go live.
                  </p>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center py-3 px-5 rounded-2xl font-bold bg-on-surface text-surface hover:opacity-90 transition-all active:scale-[0.98]"
                  >
                    Get started free
                  </Link>
                </div>
              )}
            </div>
            <p className="text-center text-xs text-on-surface-variant mt-8">
              Coins never expire. No subscriptions. Pay only when you need more AI generations.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="px-6 lg:px-10 py-20 lg:py-28 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            <div className="lg:col-span-2 lg:sticky lg:top-28 lg:self-start text-center lg:text-left">
              <span className="text-secondary font-bold text-xs uppercase tracking-[0.2em]">FAQ</span>
              <h2 className="text-3xl lg:text-5xl font-extrabold mt-3 font-headline leading-tight">Questions, answered.</h2>
              <p className="text-on-surface-variant mt-4 text-lg">
                Still curious? Sign up free — your welcome coins let you try every feature in under a minute.
              </p>
              <Link href="/register" className="mt-6 hidden lg:inline-flex items-center gap-2 py-3 px-5 rounded-2xl bg-gradient-primary text-on-primary font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all">
                Try it free
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
            <div className="lg:col-span-3 space-y-3">
              {[
                { q: "Is LexiVault really free?", a: "Yes. Adding words, taking quizzes, tracking streaks, and exporting your data are all free forever. AI sentence generation uses coins, and you get bonus coins on signup to try it out." },
                { q: "How does spaced repetition work?", a: "We use the SM-2 algorithm: when you answer a word correctly, the time before you see it again grows exponentially. Wrong answers reset the interval to 1 day. The algorithm adapts to how well you actually remember each word." },
                { q: "Which native languages are supported?", a: "Bengali, Hindi, Arabic, Spanish, French, Portuguese, Turkish, Urdu, Indonesian, and more. AI-generated example sentences come with translations in your chosen language." },
                { q: "Do my coins expire?", a: "Never. Coins you buy or earn stay in your account forever, and you can use them whenever you need an AI-generated example." },
                { q: "Can I export my words?", a: "Yes. Export your full word list to Excel, Word, or print-ready PDF anytime. Your data is yours." },
                { q: "Is my data secure?", a: "Passwords are bcrypt-hashed, sessions use signed JWTs, and payments are processed by Lemon Squeezy. We don't store payment details on our servers." },
              ].map((f) => (
                <details key={f.q} className="group bg-surface-container-lowest rounded-2xl border border-surface-container-high/30 overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer hover:bg-surface-container/40 transition-colors">
                    <span className="font-bold text-on-surface">{f.q}</span>
                    <span className="material-symbols-outlined text-outline transition-transform group-open:rotate-180">expand_more</span>
                  </summary>
                  <p className="px-5 pb-5 text-sm text-on-surface-variant leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 lg:px-10 py-20 lg:py-28">
          <div className="max-w-5xl mx-auto bg-gradient-primary rounded-[40px] p-10 lg:p-16 text-center relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-tertiary/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-secondary/30 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-5xl font-extrabold text-on-primary mb-4 font-headline leading-tight">
                Ready to grow your<br className="hidden md:block" /> vocabulary?
              </h2>
              <p className="text-on-primary/80 text-lg mb-8 max-w-xl mx-auto">
                Sign up in under 30 seconds. Free welcome coins. No credit card.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/register" className="inline-flex items-center justify-center gap-2 py-4 px-8 rounded-2xl bg-on-primary text-primary font-extrabold shadow-xl hover:scale-105 active:scale-100 transition-transform">
                  Create free account
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <Link href="/login" className="inline-flex items-center justify-center gap-2 py-4 px-8 rounded-2xl bg-white/10 text-on-primary font-bold border border-white/20 hover:bg-white/20 transition-colors">
                  I already have one
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 lg:px-10 py-12 border-t border-surface-container-high">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <img src="/logo-primary.svg" alt="LexiVault" className="h-7 w-auto" />
                <span className="text-xl font-black tracking-tight font-headline">LexiVault</span>
              </div>
              <p className="text-sm text-on-surface-variant max-w-xs">
                The smarter way to remember English vocabulary — backed by spaced repetition and AI.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li><a href="#features" className="hover:text-on-surface">Features</a></li>
                <li><a href="#how" className="hover:text-on-surface">How it works</a></li>
                <li><a href="#pricing" className="hover:text-on-surface">Pricing</a></li>
                <li><a href="#faq" className="hover:text-on-surface">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3">Account</h4>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li><Link href="/login" className="hover:text-on-surface">Sign in</Link></li>
                <li><Link href="/register" className="hover:text-on-surface">Create account</Link></li>
                <li><Link href="/forgot-password" className="hover:text-on-surface">Forgot password</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-8 border-t border-surface-container-high">
            <p className="text-xs text-outline">© {new Date().getFullYear()} LexiVault. All rights reserved.</p>
            <p className="text-xs text-outline">Made for language learners worldwide</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
