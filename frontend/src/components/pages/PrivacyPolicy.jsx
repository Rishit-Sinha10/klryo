import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import favicon from "../../../public/favicon.svg";
export default function PrivacyPolicy() {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      <header className="border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            <ArrowLeft size={16} />
            Back to klyro
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/">
              <img src={favicon} alt="klyro" width={18} height={18} />
            </Link>
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              klyro
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-tertiary)" }}>
          Last updated: July 2026
        </p>

        <div
          className="space-y-8 text-[15px] leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              1. Information We Collect
            </h2>
            <p className="mb-3">When you use klyro, we collect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Account Information:</strong> Email address, name, and
                profile image provided through Clerk authentication.
              </li>
              <li>
                <strong>Project Data:</strong> Code files, project
                configurations, and chat history you create on the platform.
              </li>
              <li>
                <strong>Usage Data:</strong> Pages visited, features used, and
                interaction patterns via Vercel Analytics.
              </li>
            </ul>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              2. How We Use Your Data
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain the klyro service.</li>
              <li>To authenticate users and manage accounts via Clerk.</li>
              <li>To process code execution requests via Judge0.</li>
              <li>
                To power AI features (autocomplete, code generation, debugging)
                via Groq AI.
              </li>
              <li>
                To improve the platform through aggregated usage analytics.
              </li>
            </ul>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              3. Data Storage & Security
            </h2>
            <p>
              Your project data is stored in MongoDB Atlas with
              industry-standard encryption. We use Clerk for secure
              authentication. We do not sell, trade, or rent your personal data
              to third parties.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              4. Third-Party Services
            </h2>
            <p className="mb-3">
              klyro integrates with the following third-party services:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Clerk</strong> - Authentication and user management
              </li>
              <li>
                <strong>MongoDB Atlas</strong> - Database hosting
              </li>
              <li>
                <strong>Groq AI</strong> - AI code analysis and generation
              </li>
              <li>
                <strong>Judge0</strong> - Code execution
              </li>
              <li>
                <strong>Vercel</strong> - Frontend hosting and analytics
              </li>
            </ul>
            <p className="mt-3">
              Each service has its own privacy policy governing data handling.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              5. Data Retention
            </h2>
            <p>
              We retain your account and project data as long as your account is
              active. You may delete your projects at any time. Upon account
              deletion, all associated data will be permanently removed within
              30 days.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              6. Your Rights
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access, export, or delete your data at any time.</li>
              <li>Request a copy of all data associated with your account.</li>
              <li>Opt out of analytics tracking.</li>
            </ul>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              7. Changes to This Policy
            </h2>
            <p>
              We may update this privacy policy from time to time. Changes will
              be posted on this page with an updated revision date.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              8. Contact
            </h2>
            <p>
              For questions about this privacy policy, contact us via{" "}
              <a
                href="https://github.com/Ramesh1234-ai/klyro/issues"
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--accent)" }}
              >
                GitHub Issues
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
