import { z } from "zod";
import { getAIProvider } from "../services/ai/index.js";

const completionSchema = z
  .object({
    code: z.string().max(50000).optional(),
    language: z.string().max(50).optional(),
    prefix: z.string().max(50000).optional(),
    suffix: z.string().max(50000).optional(),
  })
  .refine((d) => d.code || d.prefix, { message: "Code or prefix is required" });

const generationSchema = z.object({
  specs: z.string().min(1, "Specifications are required").max(10000),
  language: z.string().max(50).optional(),
  filename: z.string().max(200).optional(),
});

const debugSchema = z.object({
  code: z.string().min(1, "Code is required").max(50000),
  language: z.string().max(50).optional(),
  error: z.string().max(10000).optional(),
});

export const handleCompletion = async (req, res) => {
  try {
    const parsed = completionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, message: parsed.error.errors[0].message });
    }
    const { code, language, prefix, suffix } = parsed.data;
    const provider = await getAIProvider();

    const contextLines = (prefix || "").split("\n");
    const recentLines = contextLines.slice(-30).join("\n");
    const afterLines = (suffix || "").split("\n").slice(0, 10).join("\n");

    const prompt = `You are an inline code completion engine, like an IDE autocomplete. Complete ONLY the code at the cursor position.
Language: ${language || "javascript"}
Code before cursor:
${recentLines}
<CURSOR>
Code after cursor:
${afterLines}
RULES:
- Output ONLY the text that should be inserted at <CURSOR>. Do not repeat "before cursor" or "after cursor" content.
- Do not duplicate anything already present in "Code after cursor" — assume it stays exactly as-is following your insertion.
- Match the existing indentation, style, and naming conventions exactly.
- Keep the completion minimal and contextually appropriate — typically one line to a few lines, not an entire function or file, unless the immediate context clearly requires more (e.g., completing an open block).
- If the surrounding code is empty or gives no clear signal, return an empty string rather than guessing unrelated boilerplate.
- No markdown, no code fences, no explanations, no labels like "Completion:" — output raw code only.
Insert at <CURSOR>:`;

    let completion = await provider.chat([{ role: "user", content: prompt }], {
      temperature: 0.1,
      maxTokens: 120,
    });
    completion = completion.trim();
    completion = completion
      .replace(/^```[\w]*\n?/gm, "")
      .replace(/```$/gm, "")
      .trim();

    if (completion.length > 500) {
      completion = completion.substring(0, 500);
    }

    res.json({ success: true, completion });
  } catch (error) {
    console.error("Completion Error:", error.message);
    res.status(500).json({ success: false, message: "Completion failed" });
  }
};

export const handleGeneration = async (req, res) => {
  try {
    const parsed = generationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, message: parsed.error.errors[0].message });
    }
    const { specs, language, filename } = parsed.data;
    const provider = await getAIProvider();

    const prompt = `You are an expert ${language || "javascript"} engineer. Generate a complete, production-ready file named "${filename || "generated"}" based on the specification below.
SPECIFICATION:
${specs}
OUTPUT CONTRACT (STRICT):
- Output raw source code only — no markdown, no triple backticks, no code fences, no JSON wrapping.
- No prose before or after the code: no "Here's the code", no explanations, no summaries.
- First character of your response = first character of the code. Last character = last character of the code. Nothing else.
- If you are about to add a closing remark or fence, delete it before responding.
CODE REQUIREMENTS:
- Fully working, self-contained code unless the spec explicitly requires multiple files.
- Include all necessary imports/dependencies.
- Follow idiomatic best practices and standard formatting/linting conventions for ${language || "javascript"}.
- Handle realistic edge cases and errors (invalid input, null/undefined, async failures) rather than only the happy path.
- Use the filename "${filename || "generated"}" for naming conventions where relevant (e.g., class/module name, exports).
- Add comments only where logic is non-obvious — do not narrate every line.
- If the specification is ambiguous or incomplete, make the most reasonable, minimal assumption and proceed — do not ask questions or leave TODOs/placeholders.
- Do not truncate. Output the entire file in full.`;

    const generatedCode = await provider.chat(
      [{ role: "user", content: prompt }],
      { temperature: 0.3, maxTokens: 2048 },
    );

    res.json({
      success: true,
      code: generatedCode.trim(),
      language: language || "javascript",
      filename: filename || "generated",
    });
  } catch (error) {
    console.error("Generation Error:", error.message);
    res.status(500).json({ success: false, message: "Code generation failed" });
  }
};

export const handleDebug = async (req, res) => {
  try {
    const parsed = debugSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, message: parsed.error.errors[0].message });
    }
    const { code, language, error: runtimeError } = parsed.data;
    const provider = await getAIProvider();

    const prompt = `You are a debugging assistant. Analyze the code below and fix all issues.

Language: ${language || "javascript"}

Code:
${code}

${runtimeError ? `Runtime Error:\n${runtimeError}` : "No runtime error was provided — check for logical, syntax, and best-practice issues."}

TASK:
1. Identify every bug: the runtime error above (if provided) AND any other logical, syntax, type, or edge-case issues you find.
2. Produce a fully corrected version of the entire file.

OUTPUT FORMAT (STRICT):
Return ONLY a single valid JSON object. No markdown, no code fences, no commentary before or after.

JSON schema:
{
  "errors": [
    {
      "line": <number, best estimate based on the original code above>,
      "message": "<concise description of the issue>",
      "severity": "error" | "warning",
      "fix": "<concise description of what was changed and why>"
    }
  ],
  "summary": "<1-2 sentence summary of what was wrong and what was fixed>",
  "fixedCode": "<the complete corrected file as a single string>"
}

CRITICAL JSON-SAFETY RULES for "fixedCode":
- Escape all double quotes as \"
- Escape all newlines as \n (do not use literal line breaks inside the string)
- Escape all backslashes as \\
- Do not wrap the code in markdown backticks inside the string
- The value must be valid, parseable JSON when the whole response is passed to JSON.parse()

If no errors are found, return "errors": [] and set "fixedCode" equal to the original code, unchanged.`;

    const response = await provider.chat([{ role: "user", content: prompt }], {
      temperature: 0.1,
      maxTokens: 4096,
    });

    let analysis;
    try {
      analysis = JSON.parse(response.trim());
    } catch {
      analysis = { errors: [], summary: response.trim(), fixedCode: null };
    }

    res.json({ success: true, analysis });
  } catch (error) {
    console.error("Debug Error:", error.message);
    res.status(500).json({ success: false, message: "Debug analysis failed" });
  }
};

const streamChatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().max(50000),
      }),
    )
    .min(1)
    .max(100),
  projectContext: z.string().max(50000).optional(),
});

export const handleStreamChat = async (req, res) => {
  try {
    const parsed = streamChatSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, message: parsed.error.errors[0].message });
    }
    const { messages, projectContext } = parsed.data;
    const provider = await getAIProvider();

    const systemMessage = {
      role: "system",
      content: `You are klyro, an expert AI coding assistant. You help users write, debug, review, and improve code. Be concise, accurate, and actionable. Use markdown code blocks when showing code. ${projectContext ? `\n\nProject context:\n${projectContext}` : ""}`,
    };

    const fullMessages = [systemMessage, ...messages];

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    try {
      for await (const chunk of provider.chatStream(fullMessages, {
        temperature: 0.7,
        maxTokens: 4096,
      })) {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    } catch (err) {
      console.error("Stream error:", err.message);
      res.write(`data: ${JSON.stringify({ error: "Stream failed" })}\n\n`);
    }
    res.end();
  } catch (error) {
    console.error("StreamChat Error:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Chat failed" });
    }
  }
};

export default {
  handleCompletion,
  handleGeneration,
  handleDebug,
  handleStreamChat,
};
