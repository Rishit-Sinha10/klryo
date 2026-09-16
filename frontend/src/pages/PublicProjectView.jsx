import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Code2, Loader2, FileCode, ExternalLink } from "lucide-react";
import Editor from "@monaco-editor/react";
import { getSharedProjectAPI } from "../services/projectAPI";

const detectLanguage = (filename) => {
  if (!filename) return "javascript";
  const ext = filename.split(".").pop()?.toLowerCase();
  const map = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    java: "java",
    cpp: "cpp",
    c: "c",
    cs: "csharp",
    rb: "ruby",
    go: "go",
    rs: "rust",
    php: "php",
    swift: "swift",
    kt: "kotlin",
    sql: "sql",
    html: "html",
    css: "css",
    scss: "scss",
    json: "json",
    xml: "xml",
    yaml: "yaml",
    yml: "yaml",
    md: "markdown",
    sh: "shell",
    bash: "shell",
  };
  return map[ext] || "javascript";
};

function PublicProjectView() {
  const { shareId } = useParams();
  const [project, setProject] = useState(null);
  const [activeFile, setActiveFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSharedProject();
  }, [shareId]);

  const loadSharedProject = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSharedProjectAPI(shareId);
      setProject(data);
      if (data.files && data.files.length > 0) {
        const mainFile = data.files.find((f) => f.isMain);
        setActiveFile(mainFile || data.files[0]);
      }
    } catch (err) {
      setError(err?.message || "Failed to load shared project");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="h-screen w-screen flex flex-col"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <header
          className="h-14 flex items-center px-6 border-b"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--bg-primary)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="p-1.5 rounded-md"
              style={{ backgroundColor: "var(--accent-light)" }}
            >
              <Code2 size={18} style={{ color: "var(--accent)" }} />
            </div>
            <span
              className="font-semibold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              klyro
            </span>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2
              size={24}
              className="animate-spin"
              style={{ color: "var(--text-tertiary)" }}
            />
            <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              Loading shared project...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="h-screen w-screen flex flex-col"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <header
          className="h-14 flex items-center px-6 border-b"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--bg-primary)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="p-1.5 rounded-md"
              style={{ backgroundColor: "var(--accent-light)" }}
            >
              <Code2 size={18} style={{ color: "var(--accent)" }} />
            </div>
            <span
              className="font-semibold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              klyro
            </span>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileCode
              size={48}
              className="mx-auto mb-4"
              style={{ color: "var(--text-tertiary)", opacity: 0.3 }}
            />
            <p
              className="text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              {error}
            </p>
            <Link
              to="/"
              className="text-sm font-medium mt-2 inline-flex items-center gap-1.5"
              style={{ color: "var(--accent)" }}
            >
              Go to klyro <ExternalLink size={13} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen w-screen flex flex-col"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <header
        className="h-14 flex items-center justify-between px-6 border-b shrink-0"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className="p-1.5 rounded-md"
              style={{ backgroundColor: "var(--accent-light)" }}
            >
              <Code2 size={18} style={{ color: "var(--accent)" }} />
            </div>
            <span
              className="font-semibold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              klyro
            </span>
          </div>
          <div
            className="w-px h-4"
            style={{ backgroundColor: "var(--border)" }}
          />
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            {project?.name}
          </span>
          <span
            className="text-[11px] px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              color: "var(--text-tertiary)",
            }}
          >
            Read-only
          </span>
        </div>
        <Link
          to="/"
          className="flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-md transition-colors"
          style={{
            color: "var(--text-secondary)",
            backgroundColor: "var(--bg-tertiary)",
          }}
        >
          <ExternalLink size={13} />
          Open klyro
        </Link>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside
          className="w-56 shrink-0 overflow-y-auto border-r"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--bg-secondary)",
          }}
        >
          <div className="px-3 py-3">
            <p
              className="text-[10px] font-semibold tracking-wider uppercase mb-2 px-2"
              style={{ color: "var(--text-tertiary)" }}
            >
              Files ({project?.files?.length || 0})
            </p>
            <div className="space-y-0.5">
              {project?.files?.map((file) => {
                const isActive = activeFile?._id === file._id;
                const ext = file.name.split(".").pop()?.toLowerCase();
                const iconColor =
                  {
                    js: "#fbbf24",
                    jsx: "#61dafb",
                    ts: "#3178c6",
                    tsx: "#3178c6",
                    py: "#3776ab",
                    java: "#ed8b00",
                    html: "#e34f26",
                    css: "#1572b6",
                    json: "#000000",
                    md: "#ffffff",
                  }[ext] || "var(--text-tertiary)";

                return (
                  <button
                    key={file._id}
                    onClick={() => setActiveFile(file)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] text-left transition-colors"
                    style={{
                      backgroundColor: isActive
                        ? "var(--accent-light)"
                        : "transparent",
                      color: isActive
                        ? "var(--accent)"
                        : "var(--text-secondary)",
                    }}
                  >
                    <FileCode
                      size={14}
                      style={{ color: iconColor }}
                      className="shrink-0"
                    />
                    <span className="truncate">{file.name}</span>
                    {file.isMain && (
                      <span
                        className="ml-auto text-[9px] px-1.5 py-0.5 rounded font-medium"
                        style={{
                          backgroundColor: "var(--bg-tertiary)",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        main
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 flex flex-col">
          <div
            className="h-10 min-h-[40px] shrink-0 flex items-center px-4 gap-2 border-b"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--bg-secondary)",
            }}
          >
            <FileCode size={14} style={{ color: "var(--text-tertiary)" }} />
            <span
              className="text-[13px] font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {activeFile?.name}
            </span>
          </div>
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={detectLanguage(activeFile?.name)}
              value={activeFile?.content || ""}
              theme="vs-dark"
              options={{
                readOnly: true,
                domReadOnly: true,
                minimap: {
                  enabled: true,
                  maxColumn: 80,
                  renderCharacters: false,
                },
                wordWrap: "on",
                tabSize: 2,
                fontSize: 14,
                lineHeight: 22,
                fontFamily:
                  "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
                fontLigatures: true,
                automaticLayout: true,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorStyle: "line",
                padding: { top: 12, bottom: 12 },
                renderLineHighlight: "all",
                bracketPairColorization: { enabled: true },
                guides: { bracketPairs: true, indentation: true },
                scrollbar: {
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                  verticalSliderSize: 8,
                },
                overviewRulerLanes: 0,
                hideCursorInOverviewRuler: true,
                contextmenu: true,
                copyWithSyntaxHighlighting: true,
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default PublicProjectView;
