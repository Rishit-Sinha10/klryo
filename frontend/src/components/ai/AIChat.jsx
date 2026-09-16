import { useState, useEffect, useRef } from "react";
import { Brain, X } from "lucide-react";
import MessageBubbleAI from "./MessageBubble";
import PromptInput from "./PromptInput";
import { streamChat } from "../../services/aiAPI";
import useAuth from "../../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Marker } from "@/components/ui/marker";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MessageScroller } from "@/components/ui/message-scroller";

function AIChat({ activeFile, project, onClose }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef(null);
  const abortRef = useRef(null);
  const { getToken } = useAuth();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const buildProjectContext = () => {
    if (!project?.files) return undefined;
    const fileSummaries = project.files
      .slice(0, 20)
      .map((f) => `${f.name}${f.isMain ? " (main)" : ""}`)
      .join(", ");
    return `Project: ${project.name || "Untitled"}\nFiles: ${fileSummaries}`;
  };

  const handleSubmitMessage = async (userInput) => {
    if (!userInput.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: userInput,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setStreamingContent("");

    const chatMessages = [...messages, userMessage].map((m) => ({
      role: m.role === "ai" ? "assistant" : m.role,
      content: m.content,
    }));

    try {
      const iterator = await streamChat(
        chatMessages,
        getToken,
        buildProjectContext(),
      );
      let full = "";
      for await (const chunk of iterator) {
        full += chunk;
        setStreamingContent(full);
      }
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: full, timestamp: new Date() },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: `Error: ${error.message}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setStreamingContent("");
      setIsLoading(false);
    }
  };

  const handleAnalyzeCode = () => {
    if (!activeFile?.content) return;
    const prompt = `Please analyze this code from ${activeFile.name}:\n\n\`\`\`\n${activeFile.content}\n\`\`\`\n\nProvide suggestions for improvements, potential bugs, and best practices.`;
    handleSubmitMessage(prompt);
  };

  const t = {
    bg: "var(--bg-primary)",
    bg3: "var(--bg-tertiary)",
    text: "var(--text-primary)",
    text3: "var(--text-tertiary)",
    border: "var(--border)",
  };

  return (
    <div
      className="flex min-h-0 min-w-0 flex-col h-full rounded overflow-hidden"
      style={{ backgroundColor: t.bg, border: `1px solid ${t.border}` }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{
          borderBottom: `1px solid ${t.border}`,
          backgroundColor: t.bg3,
        }}
      >
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            <AvatarFallback>
              <Brain size={16} style={{ color: "#fbbf24" }} />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: t.text }}>
              klyro Assistant
            </h3>
            <p className="text-xs" style={{ color: t.text3 }}>
              {activeFile ? `Analyzing ${activeFile.name}` : "Ready to help"}
            </p>
          </div>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-xs" onClick={onClose}>
              <X size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Close chat</TooltipContent>
        </Tooltip>
      </div>

      <Separator />

      {/* Messages */}
      {messages.length === 0 && !streamingContent ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <Avatar size="lg" className="mb-4">
            <AvatarFallback>
              <Brain size={28} style={{ color: "#fbbf24" }} />
            </AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-semibold mb-2" style={{ color: t.text }}>
            Welcome to klyro
          </h2>
          <p className="text-sm mb-6 max-w-xs" style={{ color: t.text3 }}>
            Ask me anything about your code. I can help with:
          </p>
          <ul className="text-xs space-y-1 mb-6" style={{ color: t.text3 }}>
            <li>Code reviews and improvements</li>
            <li>Bug detection and fixes</li>
            <li>Performance optimization</li>
            <li>Best practices</li>
          </ul>
          {activeFile && (
            <Button onClick={handleAnalyzeCode} size="sm" className="mt-4">
              <Brain size={14} />
              Analyze Current File
            </Button>
          )}
        </div>
      ) : (
        <MessageScroller className="flex-1">
          {messages.map((message, index) => (
            <MessageBubbleAI
              key={index}
              message={message}
              isUser={message.role === "user"}
            />
          ))}
          {streamingContent && (
            <MessageBubbleAI
              message={{ role: "ai", content: streamingContent }}
              isUser={false}
            />
          )}
          {isLoading && !streamingContent && (
            <div className="flex justify-start mb-4">
              <div
                className="rounded-lg rounded-bl-none px-4 py-3"
                style={{
                  backgroundColor: t.bg3,
                  border: `1px solid ${t.border}`,
                }}
              >
                <Marker variant="typing" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </MessageScroller>
      )}

      <Separator />

      <PromptInput
        onSubmit={handleSubmitMessage}
        isLoading={isLoading}
        placeholder={
          activeFile
            ? `Ask about ${activeFile.name}...`
            : "Ask klyro something..."
        }
      />
    </div>
  );
}

export default AIChat;
