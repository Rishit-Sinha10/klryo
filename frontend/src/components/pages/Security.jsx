import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import favicon from "../../../public/favicon.svg";

export default function Security() {
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
        <div className="flex items-center gap-3 mb-2">
          <Shield size={28} style={{ color: "var(--accent)" }} />
          <h1 className="text-3xl font-bold">Security</h1>
        </div>
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
              Data Encryption
            </h2>
            <p className="mb-3">
              All data transmitted between your client and klyro servers is
              encrypted using TLS [CONFIRM: verify TLS version, e.g. TLS 1.2+].
              This includes API requests, authentication traffic, and all web
              application communication.
            </p>
            <p>
              Data at rest — including your projects, code files, and account
              information — is stored in MongoDB Atlas with encryption at rest
              enabled [CONFIRM: verify MongoDB Atlas encryption-at-rest
              configuration].
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Data Retention
            </h2>
            <p className="mb-3">
              We retain your account data and project files as long as your
              account is active. You can delete individual projects or your
              entire account at any time from the dashboard.
            </p>
            <p>
              Upon account deletion, all associated data is permanently removed
              within 30 days [CONFIRM: verify exact deletion timeline]. Backups
              may persist for up to 90 days in encrypted form before being
              overwritten [CONFIRM: verify backup retention period].
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              AI Training &amp; Your Data
            </h2>
            <p className="mb-3">
              Your prompts, code, and AI-generated outputs are{" "}
              <strong>not</strong> used to train or fine-tune AI models. The AI
              features on klyro are powered by third-party APIs (Groq) that
              process your requests in real time without retaining your data for
              training purposes [CONFIRM: verify Groq's data retention and
              training policy for your specific plan].
            </p>
            <p>
              We do not sell, share, or provide your code or prompts to any
              third party for the purpose of model training.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Infrastructure
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Hosting:</strong> Frontend is deployed on Vercel.
                Backend runs on Render
              </li>
              <li>
                <strong>Database:</strong> MongoDB Atlas
              </li>
              <li>
                <strong>Code Execution:</strong>Handled By Judge0 Self Hosted
                Docker container on vps
              </li>
              <li>
                <strong>Authentication:</strong> Handled by Clerk, which
                provides secure OAuth, email/password, and MFA support.
              </li>
            </ul>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Reporting a Security Issue
            </h2>
            <p className="mb-3">
              If you discover a security vulnerability or have a security
              concern, please report it responsibly. Do not open a public GitHub
              issue for security matters.
            </p>
            <p>
              Instead, email{" "}
              <a
                href="mailto:security@klyro.dev"
                style={{ color: "var(--accent)" }}
              >
                security@klyro.dev
              </a>{" "}
              [CONFIRM: verify this email address exists and is monitored] with
              a description of the issue. We will acknowledge your report within
              48 hours and work with you to understand and resolve the issue.
            </p>
            <p className="mt-3">We ask that you:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Do not publicly disclose the issue until we have had a chance to
                address it.
              </li>
              <li>Provide sufficient detail to reproduce the issue.</li>
              <li>Do not access or modify data that does not belong to you.</li>
            </ul>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Compliance
            </h2>
            <p>
              [CONFIRM: Add any compliance certifications here (SOC 2, ISO
              27001, GDPR compliance status, etc.) only if you actually hold
              them. Do not claim compliance you do not have.]
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Contact
            </h2>
            <p>
              For general security questions, contact us via{" "}
              <a
                href="https://github.com/Rishit-Sinha10/klyro/issues"
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--accent)" }}
              >
                GitHub Issues
              </a>{" "}
              or email{" "}
              <a
                href="mailto:security@klyro.dev"
                style={{ color: "var(--accent)" }}
              >
                security@klyro.dev
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
