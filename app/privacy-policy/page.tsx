import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy – LexiVault",
  description: "Learn how LexiVault collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-dvh bg-surface text-on-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-surface-container-high/50">
        <div className="flex justify-between items-center px-6 lg:px-10 py-3.5 max-w-5xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-primary.svg" alt="LexiVault" className="h-8 w-auto" />
            <span className="text-xl font-black tracking-tight text-on-surface font-headline">LexiVault</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-base" style={{ fontSize: "1.1rem" }}>arrow_back</span>
            Back to home
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="py-12 px-6 lg:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Page title */}
          <div className="mb-10">
            <h1 className="font-headline text-3xl lg:text-4xl font-extrabold text-on-surface mb-3">
              Privacy Policy
            </h1>
            <p className="text-sm text-on-surface-variant">
              Effective date: May 5, 2026
            </p>
          </div>

          {/* Section 1 — Introduction */}
          <section className="mb-10">
            <h2 className="font-headline text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: "1.25rem" }}>info</span>
              Introduction
            </h2>
            <div className="text-on-surface-variant text-sm leading-relaxed space-y-3">
              <p>
                LexiVault ("we", "us", or "our") is an English vocabulary learning platform that uses spaced repetition and AI-powered tools to help users build and retain vocabulary. This Privacy Policy explains what personal data we collect, why we collect it, and how it is used and protected.
              </p>
              <p>
                This policy applies to all users of the LexiVault website and service. By creating an account or continuing to use LexiVault, you agree to the practices described in this document. If you do not agree, please discontinue use and contact us to delete your account.
              </p>
            </div>
          </section>
          <hr className="border-surface-container-high mb-10" />

          {/* Section 2 — Information We Collect */}
          <section className="mb-10">
            <h2 className="font-headline text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: "1.25rem" }}>database</span>
              Information We Collect
            </h2>
            <div className="text-on-surface-variant text-sm leading-relaxed space-y-3">
              <p>We collect only the data necessary to provide the service:</p>
              <ul className="list-disc list-inside space-y-2 pl-1">
                <li>
                  <strong className="text-on-surface">Account data:</strong> your email address and password (stored using an industry-standard one-way hashing algorithm — never in plain text). You may also provide a display name.
                </li>
                <li>
                  <strong className="text-on-surface">Vocabulary data:</strong> the words, definitions, personal notes, and tags you add to your word list, along with any AI-generated example sentences you request.
                </li>
                <li>
                  <strong className="text-on-surface">Learning data:</strong> quiz results, spaced repetition state per word, your daily streak, total XP, level, and coin balance with full transaction history.
                </li>
                <li>
                  <strong className="text-on-surface">Security tokens:</strong> time-limited email verification and password reset tokens, stored as cryptographic hashes and invalidated after use.
                </li>
                <li>
                  <strong className="text-on-surface">Payment event metadata:</strong> when you purchase a coin package, our payment processor sends us an order confirmation containing the transaction ID and amount. We do not receive or store your card details.
                </li>
              </ul>
              <p>
                We do not collect browsing behaviour, device fingerprints, or use third-party advertising or analytics trackers.
              </p>
            </div>
          </section>
          <hr className="border-surface-container-high mb-10" />

          {/* Section 3 — How We Use Your Information */}
          <section className="mb-10">
            <h2 className="font-headline text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: "1.25rem" }}>settings</span>
              How We Use Your Information
            </h2>
            <div className="text-on-surface-variant text-sm leading-relaxed space-y-3">
              <p>We use your data solely to operate and improve LexiVault:</p>
              <ul className="list-disc list-inside space-y-2 pl-1">
                <li>Authenticate your account and maintain secure sessions.</li>
                <li>Send transactional emails — email address verification when you register, and password reset links when requested.</li>
                <li>Power the spaced repetition algorithm to schedule your word reviews at the optimal time for memory retention.</li>
                <li>Track your daily learning streak, XP, level, and coin balance for gamification.</li>
                <li>Process coin purchases and credit your balance upon confirmed payment.</li>
                <li>Transmit vocabulary words to an AI provider when you request an AI-generated example sentence (see the AI section below).</li>
                <li>Allow you to export your word list to Excel, PDF, or Word format using your active filters.</li>
              </ul>
            </div>
          </section>
          <hr className="border-surface-container-high mb-10" />

          {/* Section 4 — AI Features */}
          <section className="mb-10">
            <h2 className="font-headline text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: "1.25rem" }}>auto_awesome</span>
              AI Features and Data Processing
            </h2>
            <div className="text-on-surface-variant text-sm leading-relaxed space-y-3">
              <p>
                LexiVault offers an optional feature that generates example sentences for your vocabulary words using an AI language model. When you request a sentence:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-1">
                <li>The word and its definition are sent to a third-party AI provider to generate the sentence.</li>
                <li>No other personal data (your email, quiz history, profile, or coin balance) is transmitted to the AI provider.</li>
                <li>Your data is not used to train or fine-tune any AI models.</li>
                <li>Each generation deducts coins from your balance. The generated sentence is stored in LexiVault's database and linked to your account.</li>
              </ul>
              <p>
                This feature is entirely optional. You can use LexiVault — add words, run quizzes, and track progress — without ever triggering AI generation.
              </p>
            </div>
          </section>
          <hr className="border-surface-container-high mb-10" />

          {/* Section 5 — Payment Information */}
          <section className="mb-10">
            <h2 className="font-headline text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: "1.25rem" }}>payments</span>
              Payment Information
            </h2>
            <div className="text-on-surface-variant text-sm leading-relaxed space-y-3">
              <p>
                Coin purchases are processed entirely by <strong className="text-on-surface">Lemon Squeezy</strong>, a third-party payment processor. LexiVault never receives, processes, or stores your credit card number, billing address, or any other sensitive payment details.
              </p>
              <p>
                When a purchase is completed, Lemon Squeezy sends a cryptographically signed notification to LexiVault confirming the order. LexiVault verifies the signature and credits the corresponding coins to your account. The only payment data stored on our side is the order confirmation metadata (transaction ID and coin package purchased).
              </p>
              <p>
                For questions about payment processing, billing, or refunds, please refer to{" "}
                <a
                  href="https://www.lemonsqueezy.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-semibold"
                >
                  Lemon Squeezy's Privacy Policy
                </a>
                .
              </p>
            </div>
          </section>
          <hr className="border-surface-container-high mb-10" />

          {/* Section 6 — Email Communications */}
          <section className="mb-10">
            <h2 className="font-headline text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: "1.25rem" }}>mail</span>
              Email Communications
            </h2>
            <div className="text-on-surface-variant text-sm leading-relaxed space-y-3">
              <p>
                LexiVault sends only <strong className="text-on-surface">transactional emails</strong> — specifically:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-1">
                <li>An email verification link when you first create your account.</li>
                <li>A password reset link when you request one via the "Forgot password" flow.</li>
              </ul>
              <p>
                We do not send newsletters, promotional emails, product announcements, or any other marketing communications. Because these emails are required for account security, they cannot be opted out of while your account is active.
              </p>
            </div>
          </section>
          <hr className="border-surface-container-high mb-10" />

          {/* Section 7 — Data Retention */}
          <section className="mb-10">
            <h2 className="font-headline text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: "1.25rem" }}>history</span>
              Data Retention
            </h2>
            <div className="text-on-surface-variant text-sm leading-relaxed space-y-3">
              <p>
                Your data is retained for as long as your account is active. If you request account deletion, all personal data — including your email, vocabulary words, quiz history, streak records, and coin transactions — will be permanently deleted within <strong className="text-on-surface">30 days</strong>.
              </p>
              <p>
                Payment records (order confirmation metadata) may be retained for up to <strong className="text-on-surface">7 years</strong> to comply with applicable financial regulations, even after account deletion.
              </p>
              <p>
                Email verification and password reset tokens expire automatically after a short window and are invalidated immediately upon use.
              </p>
            </div>
          </section>
          <hr className="border-surface-container-high mb-10" />

          {/* Section 8 — Your Rights */}
          <section className="mb-10">
            <h2 className="font-headline text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: "1.25rem" }}>shield_person</span>
              Your Rights
            </h2>
            <div className="text-on-surface-variant text-sm leading-relaxed space-y-3">
              <p>You have the following rights regarding your personal data:</p>
              <ul className="list-disc list-inside space-y-2 pl-1">
                <li><strong className="text-on-surface">Access:</strong> view all vocabulary words, quiz history, and profile data from within your account at any time.</li>
                <li><strong className="text-on-surface">Export:</strong> download your full word list in Excel, PDF, or Word format using the built-in export feature (available on the Words page).</li>
                <li><strong className="text-on-surface">Correction:</strong> update inaccurate information in your profile settings.</li>
                <li><strong className="text-on-surface">Deletion:</strong> request permanent deletion of your account and all associated data by emailing{" "}
                  <a href="mailto:support@lexivault.app" className="text-primary hover:underline font-semibold">
                    support@lexivault.app
                  </a>
                  .
                </li>
              </ul>
              <p>
                LexiVault does not sell, rent, or share your personal data with third parties for their own marketing or commercial purposes.
              </p>
            </div>
          </section>
          <hr className="border-surface-container-high mb-10" />

          {/* Section 9 — Security */}
          <section className="mb-10">
            <h2 className="font-headline text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: "1.25rem" }}>lock</span>
              Security
            </h2>
            <div className="text-on-surface-variant text-sm leading-relaxed space-y-3">
              <p>We implement several technical measures to protect your data:</p>
              <ul className="list-disc list-inside space-y-2 pl-1">
                <li>Passwords are stored using a secure one-way hashing algorithm and are never logged or stored in plain text.</li>
                <li>Sessions use encrypted, signed tokens that are validated on every request.</li>
                <li>The database is hosted by a managed cloud provider with encryption at rest and in transit.</li>
                <li>Security tokens (email verification, password reset) are stored as cryptographic hashes, are single-use, and expire automatically.</li>
                <li>HTTPS is enforced across the entire application with HTTP Strict Transport Security (HSTS) enabled in production.</li>
                <li>Response headers restrict which external resources the browser may load.</li>
              </ul>
              <p>
                Despite these measures, no internet-based service can guarantee absolute security. If you suspect a security issue or unauthorised access to your account, please contact us immediately at{" "}
                <a href="mailto:support@lexivault.app" className="text-primary hover:underline font-semibold">
                  support@lexivault.app
                </a>
                .
              </p>
            </div>
          </section>
          <hr className="border-surface-container-high mb-10" />

          {/* Section 10 — Changes to This Policy */}
          <section className="mb-10">
            <h2 className="font-headline text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: "1.25rem" }}>update</span>
              Changes to This Policy
            </h2>
            <div className="text-on-surface-variant text-sm leading-relaxed space-y-3">
              <p>
                We may update this Privacy Policy from time to time to reflect changes in the service or applicable law. When we do, the "Effective date" at the top of this page will be updated. Continued use of LexiVault after any changes constitutes your acceptance of the revised policy.
              </p>
              <p>
                For material changes — such as collecting new categories of data or sharing data with additional parties — we will send a notification email to registered users where feasible.
              </p>
            </div>
          </section>
          <hr className="border-surface-container-high mb-10" />

          {/* Section 11 — Contact Us */}
          <section className="mb-10">
            <h2 className="font-headline text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: "1.25rem" }}>contact_support</span>
              Contact Us
            </h2>
            <div className="text-on-surface-variant text-sm leading-relaxed space-y-3">
              <p>
                If you have questions, concerns, or requests related to this Privacy Policy or the data LexiVault holds about you, please reach out:
              </p>
              <p>
                <a
                  href="mailto:support@lexivault.app"
                  className="text-primary hover:underline font-semibold"
                >
                  support@lexivault.app
                </a>
              </p>
              <p>
                This is also the address to use for account deletion requests. We aim to respond within 5 business days.
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-container-high py-8 px-6 text-center">
        <p className="text-xs text-outline">
          © {new Date().getFullYear()} LexiVault. All rights reserved.{" "}
          <Link href="/" className="hover:text-on-surface transition-colors">
            Go back home
          </Link>
        </p>
      </footer>
    </div>
  );
}