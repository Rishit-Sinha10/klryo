import { Link } from "react-router-dom";
import { ArrowLeft, Tag } from "lucide-react";
import favicon from "../../../public/favicon.svg";

const CHANGELOG = [
  {
    version: "0.1",
    date: "July 2026",
    title: "Initial Release",
    changes: [
      "klyro launches with AI-powered code generation, autocomplete, and debugging.",
      "Support for 80+ programming languages via integrated code execution.",
      "Project management, code sharing, and real-time collaboration features.",
    ],
  },
];

export default function Changelog() {
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
          <Tag size={28} style={{ color: "var(--accent)" }} />
          <h1 className="text-3xl font-bold">Changelog</h1>
        </div>
        <p className="text-sm mb-10" style={{ color: "var(--text-tertiary)" }}>
          A history of what changed in klyro.
        </p>

        <div className="relative">
          {/* Timeline line */}
          <div
            className="absolute left-[7px] top-2 bottom-2 w-px"
            style={{ background: "var(--border)" }}
          />

          <div className="space-y-10">
            {CHANGELOG.map((entry, idx) => (
              <div key={entry.version} className="relative pl-8">
                {/* Dot */}
                <div
                  className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2"
                  style={{
                    borderColor: "var(--accent)",
                    background:
                      idx === 0 ? "var(--accent)" : "var(--bg-primary)",
                  }}
                />

                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span
                      className="text-xs font-mono px-2 py-0.5 rounded"
                      style={{
                        background: "var(--accent-light)",
                        color: "var(--accent)",
                      }}
                    >
                      v{entry.version}
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {entry.date}
                    </span>
                  </div>
                  <h2
                    className="text-lg font-semibold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {entry.title}
                  </h2>
                  <ul
                    className="list-disc pl-5 space-y-1 text-[15px]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {entry.changes.map((change, i) => (
                      <li key={i}>{change}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
