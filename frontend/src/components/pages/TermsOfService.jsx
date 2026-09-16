import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import favicon from "../../../public/favicon.svg";
export default function TermsOfService() {
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
            Back to klyro
          </Link>
          <Link to="/">
            <div className="flex items-center gap-2">
              <img src={favicon} alt="klyro" width={18} height={18} />
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                klyro
              </span>
            </div>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
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
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using klyro ("the Service"), you agree to be bound
              by these Terms of Service. If you do not agree, do not use the
              Service.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              2. Description of Service
            </h2>
            <p>
              klyro is a free, AI-powered web-based code editor that allows
              users to write, run, and debug code in 80+ programming languages.
              Features include AI code generation, autocomplete, debugging
              assistance, project management, and code sharing.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              3. User Accounts
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must be at least 13 years old to use klyro.</li>
              <li>
                You are responsible for maintaining the security of your
                account.
              </li>
              <li>You must not share your account credentials with others.</li>
              <li>One person may not maintain more than one account.</li>
            </ul>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              4. Acceptable Use
            </h2>
            <p className="mb-3">You agree NOT to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service for any illegal or unauthorized purpose.</li>
              <li>
                Attempt to gain unauthorized access to any part of the Service.
              </li>
              <li>
                Abuse the AI features (e.g., generating malicious code, spam, or
                harmful content).
              </li>
              <li>
                Overload or disrupt the Service through excessive usage or
                automated attacks.
              </li>
              <li>
                Redistribute, resell, or commercially exploit the Service
                without permission.
              </li>
              <li>
                Use the code execution feature to run cryptocurrency miners,
                DDoS tools, or other resource-intensive/abusive code.
              </li>
            </ul>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              5. Intellectual Property
            </h2>
            <p>
              You retain full ownership of any code you create using klyro. The
              Service itself, including its design, features, and AI
              capabilities, is owned by klyro and protected by intellectual
              property laws.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              6. AI-Generated Content
            </h2>
            <p>
              AI-generated code and suggestions are provided "as is." You are
              responsible for reviewing, testing, and validating any
              AI-generated code before use. klyro does not guarantee the
              accuracy, security, or fitness of AI-generated content.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              7. Availability & Limitations
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                We aim for high availability but do not guarantee 100% uptime.
              </li>
              <li>
                Code execution is provided via third-party services (Judge0)
                with their own rate limits and limitations.
              </li>
              <li>
                AI features depend on third-party APIs (Groq) and may be
                temporarily unavailable.
              </li>
              <li>
                We reserve the right to modify or discontinue features at any
                time.
              </li>
            </ul>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              8. Limitation of Liability
            </h2>
            <p>
              klyro is provided "as is" without warranties of any kind. We shall
              not be liable for any indirect, incidental, or consequential
              damages arising from your use of the Service. Our total liability
              shall not exceed the amount you paid for the Service (which is $0
              for free users).
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              9. Termination
            </h2>
            <p>
              We reserve the right to suspend or terminate your access to the
              Service at our discretion, without notice, for conduct that we
              believe violates these Terms or is harmful to other users or the
              Service.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              10. Changes to Terms
            </h2>
            <p>
              We may update these Terms from time to time. Continued use of the
              Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              11. Contact
            </h2>
            <p>
              For questions about these Terms, contact us via{" "}
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
