import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, Copy, Check } from "lucide-react";
import favicon from "../../../public/favicon.svg";

const SECTIONS = [
  {
    id: "getting-started",
    title: "Getting Started",
    items: [
      { id: "quickstart", title: "Quickstart" },
      { id: "authentication", title: "Authentication" },
      { id: "first-request", title: "First API Request" },
    ],
  },
  {
    id: "tutorials",
    title: "Tutorials",
    items: [
      { id: "generate-code", title: "Generate Code with AI" },
      { id: "debug-code", title: "Debug an Error" },
      { id: "run-code", title: "Execute Code Remotely" },
    ],
  },
];

function CodeBlock({ language, children }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="rounded-lg overflow-hidden my-4"
      style={{ border: "1px solid var(--border)" }}
    >
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ background: "var(--bg-tertiary)" }}
      >
        <span
          className="text-xs font-mono"
          style={{ color: "var(--text-tertiary)" }}
        >
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs transition-colors"
          style={{ color: "var(--text-tertiary)" }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        className="px-4 py-3 overflow-x-auto text-[13px] leading-relaxed font-mono"
        style={{
          background: "var(--bg-secondary)",
          color: "var(--text-primary)",
        }}
      >
        <code>{children}</code>
      </pre>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-xs font-mono rounded-md transition-colors"
      style={{
        background: active ? "var(--accent-light)" : "transparent",
        color: active ? "var(--accent)" : "var(--text-secondary)",
        border: active
          ? "1px solid var(--glass-border)"
          : "1px solid transparent",
      }}
    >
      {children}
    </button>
  );
}

function GettingStarted() {
  return (
    <div className="space-y-10">
      <section id="quickstart">
        <h2
          className="text-xl font-semibold mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Quickstart
        </h2>
        <p className="mb-4">Get up and running with klyro in three steps.</p>

        <div className="space-y-4">
          <div className="flex gap-3">
            <span
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold"
              style={{
                background: "var(--accent-light)",
                color: "var(--accent)",
              }}
            >
              1
            </span>
            <div>
              <h3
                className="font-medium mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                Sign up for an account
              </h3>
              <p>
                Visit{" "}
                <a href="/" style={{ color: "var(--accent)" }}>
                  klyro.dev
                </a>{" "}
                and create a free account. You can sign in with GitHub, Google,
                or email.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold"
              style={{
                background: "var(--accent-light)",
                color: "var(--accent)",
              }}
            >
              2
            </span>
            <div>
              <h3
                className="font-medium mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                Get your API key
              </h3>
              <p>
                Navigate to <strong>Settings → API Keys</strong> in your
                dashboard and generate a new key.
              </p>
              <CodeBlock language="bash">
                [PLACEHOLDER] API key format not yet finalized
              </CodeBlock>
            </div>
          </div>

          <div className="flex gap-3">
            <span
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold"
              style={{
                background: "var(--accent-light)",
                color: "var(--accent)",
              }}
            >
              3
            </span>
            <div>
              <h3
                className="font-medium mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                Make your first request
              </h3>
              <p>Use the SDK or call the REST API directly.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="authentication">
        <h2
          className="text-xl font-semibold mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Authentication
        </h2>
        <p className="mb-4">
          All API requests require an API key passed via the{" "}
          <code
            className="px-1.5 py-0.5 rounded text-xs font-mono"
            style={{ background: "var(--bg-tertiary)" }}
          >
            Authorization
          </code>{" "}
          header.
        </p>
        <CodeBlock language="bash">
          curl -H "Authorization: Bearer [YOUR_API_KEY]"
          [PLACEHOLDER_BASE_URL]/v1/health
        </CodeBlock>
        <p className="mt-4">
          Keep your API key secret. Do not expose it in client-side code or
          public repositories.
        </p>
      </section>

      <section id="first-request">
        <h2
          className="text-xl font-semibold mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          First API Request
        </h2>
        <p className="mb-4">
          Here is a minimal request to verify your setup is working.
        </p>

        <CodeBlock language="JavaScript">{`import klyro from "klyro";

const client = new klyro({
  apiKey: process.env.klyro_API_KEY,
});

const response = await client.chat.create({
  model: "[PLACEHOLDER_MODEL]",
  messages: [
    { role: "user", content: "Hello, klyro!" },
  ],
});

console.log(response.choices[0].message.content);`}</CodeBlock>

        <CodeBlock language="Python">{`import klyro

client = klyro.klyro(api_key="YOUR_API_KEY")

response = client.chat.create(
    model="[PLACEHOLDER_MODEL]",
    messages=[
        {"role": "user", "content": "Hello, klyro!"},
    ],
)

print(response.choices[0].message.content)`}</CodeBlock>

        <p className="mt-4">
          If you get a{" "}
          <code
            className="px-1.5 py-0.5 rounded text-xs font-mono"
            style={{ background: "var(--bg-tertiary)" }}
          >
            200 OK
          </code>{" "}
          response, you're all set.
        </p>
      </section>
    </div>
  );
}

function Tutorials() {
  const [activeTab, setActiveTab] = useState("generate-code");

  return (
    <div className="space-y-10">
      <div className="flex gap-2 flex-wrap">
        <TabButton
          active={activeTab === "generate-code"}
          onClick={() => setActiveTab("generate-code")}
        >
          Generate Code
        </TabButton>
        <TabButton
          active={activeTab === "debug-code"}
          onClick={() => setActiveTab("debug-code")}
        >
          Debug an Error
        </TabButton>
        <TabButton
          active={activeTab === "run-code"}
          onClick={() => setActiveTab("run-code")}
        >
          Execute Code
        </TabButton>
      </div>

      {activeTab === "generate-code" && (
        <section id="generate-code">
          <h2
            className="text-xl font-semibold mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            Generate Code with AI
          </h2>
          <p className="mb-4">
            Use the klyro API to generate code from a natural language prompt.
            This is the same engine that powers the in-editor code generation.
          </p>

          <h3
            className="font-medium mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            1. Send a prompt
          </h3>
          <CodeBlock language="JavaScript">{`const response = await client.code.generate({
  prompt: "Write a React hook that debounces a value",
  language: "javascript",
  context: "[PLACEHOLDER] optional project context",
});

console.log(response.code);`}</CodeBlock>

          <h3
            className="font-medium mb-2 mt-6"
            style={{ color: "var(--text-primary)" }}
          >
            2. Stream the response
          </h3>
          <CodeBlock language="JavaScript">{`const stream = await client.code.generate({
  prompt: "Write a binary search in Python",
  language: "python",
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.code);
}`}</CodeBlock>

          <h3
            className="font-medium mb-2 mt-6"
            style={{ color: "var(--text-primary)" }}
          >
            Python example
          </h3>
          <CodeBlock language="Python">{`response = client.code.generate(
    prompt="Write a binary search in Python",
    language="python",
)

print(response.code)`}</CodeBlock>

          <div
            className="mt-4 p-3 rounded-lg text-sm"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-secondary)",
            }}
          >
            <strong style={{ color: "var(--text-primary)" }}>Tip:</strong>{" "}
            [PLACEHOLDER] Add details about supported languages, token limits,
            and rate limits once finalized.
          </div>
        </section>
      )}

      {activeTab === "debug-code" && (
        <section id="debug-code">
          <h2
            className="text-xl font-semibold mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            Debug an Error
          </h2>
          <p className="mb-4">
            Pass an error message and source code to klyro and receive a
            diagnosis with a suggested fix.
          </p>

          <CodeBlock language="JavaScript">{`const result = await client.debug.analyze({
  error: "TypeError: Cannot read properties of undefined (reading 'map')",
  code: \`const items = userData.items;
return items.map(i => i.name);\`,
  language: "javascript",
});

console.log(result.diagnosis);
console.log(result.suggestedFix);`}</CodeBlock>

          <CodeBlock language="Python">{`result = client.debug.analyze(
    error="TypeError: 'NoneType' object is not iterable",
    code="""items = user_data["items"]
return [i["name"] for i in items]""",
    language="python",
)

print(result.diagnosis)
print(result.suggested_fix)`}</CodeBlock>

          <div
            className="mt-4 p-3 rounded-lg text-sm"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-secondary)",
            }}
          >
            <strong style={{ color: "var(--text-primary)" }}>Tip:</strong>{" "}
            Include as much context as possible — stack traces, surrounding
            code, and the runtime environment — for more accurate diagnoses.
          </div>
        </section>
      )}

      {activeTab === "run-code" && (
        <section id="run-code">
          <h2
            className="text-xl font-semibold mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            Execute Code Remotely
          </h2>
          <p className="mb-4">
            klyro supports code execution in 80+ languages via [PLACEHOLDER]
            Judge0 integration. Send code and receive stdout/stderr output.
          </p>

          <CodeBlock language="JavaScript">{`const execution = await client.code.run({
  language: "python",
  code: \`
for i in range(5):
    print(f"Hello from klyro {i}")
\`,
});

console.log(execution.stdout);
console.log(execution.stderr);
console.log(execution.time);`}</CodeBlock>

          <CodeBlock language="Python">{`execution = client.code.run(
    language="python",
    code="""
for i in range(5):
    print(f"Hello from klyro {i}")
""",
)

print(execution.stdout)
print(execution.stderr)
print(execution.time)`}</CodeBlock>

          <div
            className="mt-4 p-3 rounded-lg text-sm"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-secondary)",
            }}
          >
            <strong style={{ color: "var(--text-primary)" }}>Note:</strong>{" "}
            [PLACEHOLDER] Execution has time and memory limits. Add specifics
            about supported languages, timeouts, and resource constraints.
          </div>
        </section>
      )}
    </div>
  );
}

export default function Documentation() {
  const [activeSection, setActiveSection] = useState("getting-started");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      <header className="border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
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

      <div className="max-w-6xl mx-auto flex">
        {/* Sidebar */}
        <aside
          className="hidden md:block w-56 flex-shrink-0 border-r py-8 pr-6"
          style={{ borderColor: "var(--border)" }}
        >
          <nav className="sticky top-8 space-y-6">
            {SECTIONS.map((section) => (
              <div key={section.id}>
                <h3
                  className="font-mono text-xs tracking-wider uppercase mb-3"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {section.title}
                </h3>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setActiveSection(section.id);
                          document
                            .getElementById(item.id)
                            ?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                        }}
                        className="w-full text-left flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors"
                        style={{
                          color:
                            activeSection === section.id
                              ? "var(--accent)"
                              : "var(--text-secondary)",
                          background: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (activeSection !== section.id)
                            e.target.style.background = "var(--bg-tertiary)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "transparent";
                        }}
                      >
                        <ChevronRight size={12} />
                        {item.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Mobile nav toggle */}
        <div className="md:hidden fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
            style={{
              background: "var(--accent)",
              color: "var(--text-inverse)",
            }}
          >
            <ChevronRight
              size={16}
              style={{
                transform: mobileNavOpen ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          </button>
        </div>

        {/* Mobile nav dropdown */}
        {mobileNavOpen && (
          <div
            className="md:hidden fixed inset-0 z-40"
            onClick={() => setMobileNavOpen(false)}
          >
            <div
              className="absolute inset-0"
              style={{ background: "var(--overlay)" }}
            />
            <nav
              className="absolute bottom-16 right-4 w-56 rounded-xl p-4 shadow-xl"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {SECTIONS.map((section) => (
                <div key={section.id} className="mb-4 last:mb-0">
                  <h3
                    className="font-mono text-xs tracking-wider uppercase mb-2"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {section.title}
                  </h3>
                  <ul className="space-y-1">
                    {section.items.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => {
                            setActiveSection(section.id);
                            setMobileNavOpen(false);
                            document
                              .getElementById(item.id)
                              ?.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              });
                          }}
                          className="w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {item.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 px-6 md:px-10 py-12">
          <h1 className="text-3xl font-bold mb-2">Documentation</h1>
          <p
            className="text-sm mb-10"
            style={{ color: "var(--text-tertiary)" }}
          >
            Learn how to integrate klyro into your workflow.
          </p>

          <div
            className="space-y-16 text-[15px] leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            <GettingStarted />
            <Tutorials />
          </div>
        </main>
      </div>
    </div>
  );
}
