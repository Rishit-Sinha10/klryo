import {
  Copy,
  Save,
  Play,
  Brain,
  FileCode,
  Loader2,
  Sparkles,
  Keyboard,
  X,
  RotateCcw,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import Terminal from "./Terminal";
import CodeGenerator from "./CodeGenerator";
import { executeCode, fetchLanguages } from "../../services/codeAPI";
import { getCompletion, debugCode, formatCodeAPI } from "../../services/aiAPI";
import { useToast } from "../../context/ToastContext";
import useAuth from "../../hooks/useAuth";
import "./Terminal.css";

const detectLanguage = (filename) => {
  if (!filename) return "javascript";
  const ext = filename.split(".").pop()?.toLowerCase();
  const map = {
    js: "javascript", jsx: "javascript", ts: "typescript", tsx: "typescript",
    py: "python", java: "java", cpp: "cpp", c: "c", cs: "csharp",
    rb: "ruby", go: "go", rs: "rust", php: "php", swift: "swift",
    kt: "kotlin", sql: "sql", html: "html", css: "css", scss: "scss",
    json: "json", xml: "xml", yaml: "yaml", yml: "yaml", md: "markdown",
    sh: "shell", bash: "shell",
  };
  return map[ext] || "javascript";
};

const formatLangName = (name) => {
  if (!name) return "";
  return name.replace(/\s*\(.*\)\s*/, "").trim();
};

function CodeEditor({ activeFile, project, onContentChange, onOpenAI, runTrigger, onEditorMount, onFindInProject }) {
  const [isSaved, setIsSaved] = useState(true);
  const [editorContent, setEditorContent] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [selectedCode, setSelectedCode] = useState("");
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState("");
  const [terminalError, setTerminalError] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const [exitCode, setExitCode] = useState(null);
  const [memory, setMemory] = useState(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [stdinInput, setStdinInput] = useState("");
  const [showStdin, setShowStdin] = useState(false);
  const [languages, setLanguages] = useState([]);

  const [isFixing, setIsFixing] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const editorRef = useRef(null);
  const stdinRef = useRef(null);
  const contentRef = useRef("");
  const languageRef = useRef("javascript");
  const stdinRef2 = useRef("");
  const findRef = useRef(null);
  const { toast } = useToast();
  const { getToken } = useAuth();

  useEffect(() => { contentRef.current = editorContent; }, [editorContent]);
  useEffect(() => { languageRef.current = language; }, [language]);
  useEffect(() => { stdinRef2.current = stdinInput; }, [stdinInput]);
  useEffect(() => { findRef.current = onFindInProject; }, [onFindInProject]);

  useEffect(() => { fetchLanguages().then(setLanguages); }, []);

  useEffect(() => {
    if (runTrigger > 0 && project?.files) {
      const mainFile = project.files.find((f) => f.isMain);
      if (mainFile) {
        const mainLang = detectLanguage(mainFile.name);
        setLanguage(mainLang);
        setEditorContent(mainFile.content);
        handleExecute(mainFile.content, mainLang);
      } else {
        toast.warning("No main file set. Right-click a file in the explorer and set it as main.");
      }
    }
  }, [runTrigger]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleExecute();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "F") {
        e.preventDefault();
        onFindInProject?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editorContent, language]);

  useEffect(() => {
    if (activeFile) {
      setEditorContent(activeFile.content);
      setLanguage(detectLanguage(activeFile.name));
      setIsSaved(true);
      setSelectedCode("");
    }
  }, [activeFile]);

  const handleContentChange = (newContent) => {
    if (newContent !== undefined) {
      setEditorContent(newContent);
      setIsSaved(false);
      onContentChange(newContent);
      setIsSaved(true);
    }
  };

  const handleInsertGeneratedCode = (code) => {
    setEditorContent(code);
    onContentChange(code);
    setIsSaved(false);
  };

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    onEditorMount?.(editor);

    editor.onDidChangeCursorSelection((e) => {
      const selection = editor.getModel().getValueInRange(e.selection);
      setSelectedCode(selection || "");
    });

    let lastRequestTime = 0;

    monaco.languages.registerInlineCompletionsProvider("*", {
      provideInlineCompletions: async (model, position, context, token) => {
        const now = Date.now();
        if (now - lastRequestTime < 800) return { items: [] };
        lastRequestTime = now;

        const textUntil = model.getValueInRange({
          startLineNumber: 1, startColumn: 1,
          endLineNumber: position.lineNumber, endColumn: position.column,
        });
        const textAfter = model.getValueInRange({
          startLineNumber: position.lineNumber, startColumn: position.column,
          endLineNumber: model.getLineCount(), endColumn: model.getLineMaxColumn(model.getLineCount()),
        });

        try {
          setIsCompleting(true);
          const result = await getCompletion(model.getValue(), language, textUntil, textAfter, getToken);
          if (result.success && result.completion && !token.isCancellationRequested) {
            const lines = result.completion.split("\n");
            const insertText = lines.join("\n");
            return {
              items: [{
                insertText,
                range: {
                  startLineNumber: position.lineNumber,
                  startColumn: position.column,
                  endLineNumber: position.lineNumber,
                  endColumn: position.column,
                },
                command: { id: "editor.action.inlineSuggest.commit", title: "Accept" },
              }],
            };
          }
        } catch (err) {
          console.error("AI completion failed:", err);
        } finally {
          setIsCompleting(false);
        }
        return { items: [] };
      },
      freeInlineCompletions: () => {},
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleExecute();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
      onFindInProject?.();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP, () => {
      onFindInProject?.();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyP, () => {
      onFindInProject?.();
    });

    editor.updateOptions({
      inlineSuggest: { enabled: true, suppressSuggestions: false },
      quickSuggestions: { other: true, comments: false, strings: false },
    });
  };

  const handleExecute = async (code, lang) => {
    const codeToRun = code || editorContent;
    const langToUse = lang || language;
    if (!codeToRun.trim()) { toast.warning("No code to execute"); return; }
    setShowTerminal(true);
    setIsExecuting(true);
    setTerminalOutput(""); setTerminalError(""); setExecutionTime(0); setExitCode(null); setMemory(null);
    const startTime = Date.now();
    try {
      const result = await executeCode(codeToRun, langToUse, stdinInput, getToken);
      setExecutionTime(((Date.now() - startTime) / 1000).toFixed(2));
      setExitCode(result.exitCode); setMemory(result.memory); 
      if (result.success) { setTerminalOutput(result.output || "Code executed successfully with no output"); setTerminalError(""); }
      else { setTerminalError(result.error || "Execution failed"); setTerminalOutput(result.output || ""); }
    } catch (err) { setTerminalError(err.message || "Unknown error occurred"); setTerminalOutput(""); }
    finally { setIsExecuting(false); }
  };

  const handleCopy = () => navigator.clipboard.writeText(editorContent);
  const handleSave = () => setIsSaved(true);
  const handleClearStdin = () => { setStdinInput(""); stdinRef.current?.focus(); };

  const handleFixWithAI = async () => {
    if (!editorContent || !terminalError) return;
    setIsFixing(true);
    try {
      const result = await debugCode(editorContent, language, terminalError, getToken);
      if (result.success && result.analysis) {
        const { errors, summary, fixedCode } = result.analysis;

        if (fixedCode && fixedCode !== editorContent) {
          setEditorContent(fixedCode);
          onContentChange(fixedCode);
          setIsSaved(false);

          const errorCount = errors?.length || 0;
          const detail = errorCount > 0
            ? `\n${errorCount} issue(s) found:\n${errors.map((e) => `  L${e.line}: ${e.message}`).join("\n")}`
            : "";
          toast.success(`AI fix applied — Ctrl+Z to undo${detail}`);
          setTerminalOutput((prev) => prev + `\n\n--- AI Fix Applied ---\n${summary || "Code corrected"}${detail}`);
        } else if (errors?.length > 0) {
          const fixes = errors.map((e) => `Line ${e.line}: ${e.message}\n  Fix: ${e.fix}`).join("\n\n");
          toast.info(`Found ${errors.length} issue(s). Check terminal for details.`);
          setTerminalOutput((prev) => prev + `\n\n--- AI Debug ---\n${summary}\n\nIssues:\n${fixes}`);
        } else {
          toast.info(summary || "No issues found.");
        }
      }
    } catch (err) {
      toast.error("AI debug failed: " + err.message);
    } finally {
      setIsFixing(false);
    }
  };

  const handleFormat = async () => {
    if (!editorContent) return;
    setIsFormatting(true);
    try {
      const ext = activeFile?.name?.split(".").pop()?.toLowerCase();

      const browserParsers = {
        js: "babel", jsx: "babel", ts: "babel", tsx: "babel",
        json: "babel", jsonc: "babel",
        css: "css", scss: "css",
        html: "html", htm: "html",
        md: "markdown",
        yaml: "yaml", yml: "yaml",
        graphql: "graphql", gql: "graphql",
      };

      const backendLangMap = {
        py: "python", python: "python",
        java: "java",
        php: "php",
        xml: "xml",
        rb: "ruby", ruby: "ruby",
        kt: "kotlin", kotlin: "kotlin",
        cs: "csharp", csharp: "csharp",
        swift: "swift",
        rs: "rust", rust: "rust",
        go: "go", golang: "go",
        cpp: "cpp", c: "c", "c++": "cpp", h: "c", hpp: "cpp",
        sh: "shell", bash: "shell",
      };

      if (browserParsers[ext]) {
        const prettier = await import("prettier/standalone");
        const plugins = [];

        if (["js", "jsx", "ts", "tsx", "json", "jsonc"].includes(ext)) {
          const [babel, estree] = await Promise.all([
            import("prettier/plugins/babel"),
            import("prettier/plugins/estree"),
          ]);
          plugins.push(babel.default, estree.default);
        } else if (["css", "scss"].includes(ext)) {
          const postcss = await import("prettier/plugins/postcss");
          plugins.push(postcss.default);
        } else if (["html", "htm"].includes(ext)) {
          const html = await import("prettier/plugins/html");
          plugins.push(html.default);
        } else if (ext === "md") {
          const markdown = await import("prettier/plugins/markdown");
          plugins.push(markdown.default);
        } else if (["yaml", "yml"].includes(ext)) {
          const yaml = await import("prettier/plugins/yaml");
          plugins.push(yaml.default);
        } else if (["graphql", "gql"].includes(ext)) {
          const graphql = await import("prettier/plugins/graphql");
          plugins.push(graphql.default);
        }

        const formatted = await prettier.format(editorContent, {
          parser: browserParsers[ext],
          plugins,
          semi: true,
          singleQuote: true,
          tabWidth: 2,
          trailingComma: "es5",
          printWidth: 100,
        });

        setEditorContent(formatted);
        onContentChange(formatted);
        toast.success("Code formatted");
      } else if (backendLangMap[ext]) {
        const result = await formatCodeAPI(editorContent, backendLangMap[ext], getToken);
        if (result.success && result.formatted) {
          setEditorContent(result.formatted);
          onContentChange(result.formatted);
          toast.success("Code formatted");
        } else {
          toast.warning(result.message || "Formatting unavailable");
        }
      } else {
        toast.warning(`No formatter available for .${ext} files`);
      }
    } catch (err) {
      toast.error("Format failed: " + err.message);
    } finally {
      setIsFormatting(false);
    }
  };

  if (!activeFile) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="text-center">
          <FileCode size={48} className="mx-auto mb-3" style={{ color: "var(--text-tertiary)", opacity: 0.4 }} />
          <p className="text-sm font-medium" style={{ color: "var(--text-tertiary)" }}>No file selected</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)", opacity: 0.6 }}>Choose a file from the explorer</p>
        </div>
      </div>
    );
  }

  const t = {
    bg: "var(--bg-primary)",
    bg2: "var(--bg-secondary)",
    bg3: "var(--bg-tertiary)",
    text: "var(--text-primary)",
    text2: "var(--text-secondary)",
    text3: "var(--text-tertiary)",
    border: "var(--border)",
    borderStrong: "var(--border-strong)",
    accent: "var(--accent)",
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* ── Toolbar ── */}
      <div
        className="h-11 min-h-[44px] shrink-0 px-4 flex items-center justify-between gap-3"
        style={{ borderBottom: `1px solid ${t.border}`, backgroundColor: t.bg }}
      >
        {/* Left: File info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <FileCode size={15} className="shrink-0" style={{ color: t.text3 }} />
          <span className="text-[13px] font-semibold truncate" style={{ color: t.text }}>{activeFile.name}</span>
          {!isSaved && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
          <span className="text-[11px] hidden sm:inline" style={{ color: t.text3 }}>/ {project?.name}</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {isCompleting && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium mr-1" style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)" }}>
              <Loader2 size={12} className="animate-spin" />
              <span className="hidden md:inline">AI...</span>
            </div>
          )}
          <button
            onClick={() => setShowStdin(!showStdin)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md transition-all text-[11px] font-medium h-7"
            style={{
              backgroundColor: showStdin ? "var(--accent-light)" : "transparent",
              color: showStdin ? "var(--accent)" : t.text3,
              border: showStdin ? `1px solid var(--accent)` : "1px solid transparent",
            }}
            title="Toggle stdin input"
          >
            <Keyboard size={13} />
            <span className="hidden md:inline">Input</span>
          </button>

          <button onClick={handleCopy} className="flex items-center gap-1.5 px-2 py-1 rounded-md transition-all text-[11px] font-medium h-7" style={{ color: t.text3 }} title="Copy code">
            <Copy size={13} />
          </button>

          <button onClick={handleSave} className="flex items-center gap-1.5 px-2 py-1 rounded-md transition-all text-[11px] font-medium h-7" style={{ color: t.text3 }} title="Save">
            <Save size={13} />
          </button>

          <button onClick={handleFormat} disabled={isFormatting} className="flex items-center gap-1.5 px-2 py-1 rounded-md transition-all text-[11px] font-medium h-7" style={{ color: isFormatting ? t.text3 : "#a78bfa" }} title="Format code (Prettier)">
            {isFormatting ? <Loader2 size={13} className="animate-spin" /> : <span className="font-bold text-[10px]">{"{ }"}</span>}
          </button>

          <div className="w-px h-4 mx-1" style={{ backgroundColor: t.border }} />

          <button
            onClick={() => handleExecute()}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all text-[11px] font-semibold h-7"
            style={{ backgroundColor: "#10b981" }}
            title="Run code"
          >
            {isExecuting ? <Loader2 size={13} className="animate-spin" /> : <Play size={12} fill="currentColor" />}
            Run
          </button>

          <div className="w-px h-4 mx-1" style={{ backgroundColor: t.border }} />

          <button onClick={() => setShowGenerator(true)} className="flex items-center gap-1.5 px-2 py-1 rounded-md transition-all text-[11px] font-medium h-7" style={{ color: "#a78bfa" }} title="AI Code Generator">
            <Sparkles size={13} />
            <span className="hidden lg:inline">Generate</span>
          </button>

          <button onClick={() => onOpenAI?.()} className="flex items-center gap-1.5 px-2 py-1 rounded-md transition-all text-[11px] font-medium h-7" style={{ color: "#fbbf24" }} title="Ask AI">
            <Brain size={13} />
            <span className="hidden lg:inline">Ask AI</span>
          </button>
        </div>
      </div>

      {/* ── Editor + Panels ── */}
      <div className="flex-1 flex flex-col min-h-0 p-3 gap-2" style={{ backgroundColor: t.bg }}>
        {/* Editor */}
        <div className="flex-1 min-h-0 flex flex-col rounded-lg overflow-hidden" style={{ backgroundColor: t.bg2, border: `1px solid ${t.border}` }}>
          <Editor
            height="100%"
            language={language}
            value={editorContent}
            onChange={handleContentChange}
            onMount={handleEditorMount}
            theme="vs-dark"
            loading={
              <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: t.bg2 }}>
                <Loader2 size={24} className="animate-spin" style={{ color: t.text3 }} />
              </div>
            }
            options={{
              minimap: { enabled: true, maxColumn: 80, renderCharacters: false },
              wordWrap: "on", formatOnPaste: true, formatOnType: true,
              tabSize: 2, fontSize: 14, lineHeight: 22,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
              fontLigatures: true, automaticLayout: true, smoothScrolling: true,
              cursorBlinking: "smooth", cursorSmoothCaretAnimation: "on", cursorStyle: "line",
              padding: { top: 12, bottom: 12 },
              renderLineHighlight: "all", renderLineHighlightOnlyWhenFocus: false,
              currentLineHighlight: "gutter", selectionHighlight: true,
              occurrencesHighlight: "singleFile", bracketPairColorization: { enabled: true },
              guides: { bracketPairs: true, indentation: true },
              suggest: { showMethods: true, showFunctions: true, showConstructors: true, showFields: true, showVariables: true, showClasses: true, showStructs: true, showInterfaces: true, showModules: true, showProperties: true, showEvents: true, showOperators: true, showUnits: true, showValues: true, showConstants: true, showEnums: true, showEnumMembers: true, showKeywords: true, showWords: true, showColors: true, showFiles: true, showReferences: true, showFolders: true, showTypeParameters: true, showSnippets: true },
              quickSuggestions: { other: true, comments: false, strings: false },
              parameterHints: { enabled: true }, suggestSelection: "first",
              tabCompletion: "on", wordBasedSuggestions: "off", mouseWheelZoom: true,
              scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8, verticalSliderSize: 8 },
              overviewRulerLanes: 0, hideCursorInOverviewRuler: true, renderWhitespace: "selection",
            }}
          />
        </div>

        {/* Stdin Panel */}
        {showStdin && (
          <div className="shrink-0 rounded-lg overflow-hidden" style={{ backgroundColor: t.bg2, border: `1px solid ${t.border}` }}>
            <div className="flex items-center justify-between px-3 py-1.5" style={{ backgroundColor: t.bg3, borderBottom: `1px solid ${t.border}` }}>
              <div className="flex items-center gap-2">
                <Keyboard size={12} style={{ color: t.text3 }} />
                <span className="text-[11px] font-medium" style={{ color: t.text2 }}>Standard Input</span>
                {stdinInput.length > 0 && <span className="text-[10px] font-mono" style={{ color: t.text3 }}>{stdinInput.length} chars</span>}
              </div>
              <div className="flex items-center gap-1">
                {stdinInput.length > 0 && (
                  <button onClick={handleClearStdin} className="p-1 rounded transition-colors" style={{ color: t.text3 }} title="Clear input">
                    <RotateCcw size={12} />
                  </button>
                )}
                <button onClick={() => setShowStdin(false)} className="p-1 rounded transition-colors" style={{ color: t.text3 }} title="Close stdin">
                  <X size={12} />
                </button>
              </div>
            </div>
            <textarea
              ref={stdinRef}
              value={stdinInput}
              onChange={(e) => setStdinInput(e.target.value)}
              placeholder="Enter input for your program..."
              className="w-full font-mono text-[13px] leading-relaxed p-3 resize-none focus:outline-none border-none"
              style={{ backgroundColor: t.bg2, color: "#34d399" }}
              rows={4}
              spellCheck={false}
            />
          </div>
        )}

        {/* Terminal Output */}
        {showTerminal && (
          <div className="shrink-0">
            <Terminal
              output={terminalOutput}
              error={terminalError}
              isLoading={isExecuting}
              onClose={() => setShowTerminal(false)}
              executionTime={executionTime}
              exitCode={exitCode}
              memory={memory}
              onFixWithAI={terminalError ? handleFixWithAI : null}
              isFixing={isFixing}
            />
          </div>
        )}
      </div>

      <CodeGenerator isOpen={showGenerator} onClose={() => setShowGenerator(false)} onInsertCode={handleInsertGeneratedCode} />
    </div>
  );
}

export default CodeEditor;
