import { useState } from "react";
import { Copy, Check, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MessageBubble } from "@/components/ui/message-bubble";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Marker } from "@/components/ui/marker";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function CodeBlock({ language, children }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="relative my-2 rounded-md overflow-hidden"
      style={{ border: "1px solid var(--border)" }}
    >
      <div
        className="flex items-center justify-between px-3 py-1.5 text-xs"
        style={{
          backgroundColor: "var(--bg-secondary)",
          color: "var(--text-secondary)",
        }}
      >
        <span className="font-mono">{language || "code"}</span>
        <Button variant="ghost" size="icon-xs" onClick={handleCopy}>
          {copied ? (
            <Check size={12} className="text-green-400" />
          ) : (
            <Copy size={12} />
          )}
        </Button>
      </div>
      <pre
        className="p-3 overflow-x-auto text-sm font-mono"
        style={{
          backgroundColor: "var(--bg-tertiary)",
          color: "var(--text-primary)",
        }}
      >
        <code>{children}</code>
      </pre>
    </div>
  );
}

function MessageBubbleAI({ message, isUser }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <MessageBubble isUser={isUser}>
      {!isUser && (
        <div
          className="flex items-center gap-2 mb-2 pb-2"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <Avatar size="sm">
            <AvatarFallback>
              <Sparkles size={12} style={{ color: "#fbbf24" }} />
            </AvatarFallback>
          </Avatar>
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--text-secondary)" }}
          >
            klyro
          </span>
        </div>
      )}

      <div className="text-sm leading-relaxed">
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                if (!inline && match) {
                  return (
                    <CodeBlock language={match[1]}>
                      {String(children).replace(/\n$/, "")}
                    </CodeBlock>
                  );
                }
                if (!inline && !match && String(children).includes("\n")) {
                  return (
                    <CodeBlock>{String(children).replace(/\n$/, "")}</CodeBlock>
                  );
                }
                return (
                  <code
                    className="px-1.5 py-0.5 rounded text-xs font-mono"
                    style={{
                      backgroundColor: "var(--bg-tertiary)",
                      color: "var(--text-primary)",
                    }}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              p({ children }) {
                return <p className="mb-2 last:mb-0">{children}</p>;
              },
              ul({ children }) {
                return (
                  <ul className="list-disc list-inside mb-2 space-y-0.5">
                    {children}
                  </ul>
                );
              },
              ol({ children }) {
                return (
                  <ol className="list-decimal list-inside mb-2 space-y-0.5">
                    {children}
                  </ol>
                );
              },
              h1({ children }) {
                return <h1 className="text-lg font-bold mb-2">{children}</h1>;
              },
              h2({ children }) {
                return (
                  <h2 className="text-base font-semibold mb-2">{children}</h2>
                );
              },
              h3({ children }) {
                return (
                  <h3 className="text-sm font-semibold mb-1">{children}</h3>
                );
              },
              a({ href, children }) {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                    style={{ color: "var(--accent)" }}
                  >
                    {children}
                  </a>
                );
              },
              blockquote({ children }) {
                return (
                  <blockquote
                    className="pl-3 border-l-2 mb-2"
                    style={{ borderColor: "var(--accent)" }}
                  >
                    {children}
                  </blockquote>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>

      <div className="flex items-center justify-between mt-2 pt-1">
        {message.timestamp && (
          <Marker variant="timestamp" timestamp={message.timestamp} />
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleCopy}
            >
              {copied ? (
                <Check size={14} className="text-green-400" />
              ) : (
                <Copy size={14} />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy message</TooltipContent>
        </Tooltip>
      </div>
    </MessageBubble>
  );
}

export default MessageBubbleAI;
