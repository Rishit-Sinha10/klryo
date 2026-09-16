import { useState, useRef } from "react";
import { Send, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AttachmentList } from "@/components/ui/attachment";

function PromptInput({
  onSubmit,
  isLoading,
  placeholder = "Ask klyro...",
  onAttach,
}) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSubmit(input, attachments.length ? attachments : undefined);
    setInput("");
    setAttachments([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const newAttachments = files.map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
      file: f,
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const t = {
    bg3: "var(--bg-tertiary)",
    text: "var(--text-primary)",
    text3: "var(--text-tertiary)",
    border: "var(--border)",
  };

  return (
    <div
      className="p-4"
      style={{ borderTop: `1px solid ${t.border}`, backgroundColor: t.bg3 }}
    >
      <AttachmentList attachments={attachments} onRemove={removeAttachment} />

      <form onSubmit={handleSubmit} className="min-w-0">
        <div className="flex gap-3 items-end sm:flex-row flex-col">
          <div className="flex-1 w-full min-w-0">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              rows={3}
              className="resize-none text-sm min-h-[80px]"
            />
          </div>
          <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
            {onAttach && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Attach file</TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  size="sm"
                  className="h-9"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  <span className="hidden sm:inline">
                    {isLoading ? "Thinking..." : "Ask AI"}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send message (Enter)</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <p className="text-xs mt-2" style={{ color: t.text3 }}>
          Shift+Enter for line breaks, Enter to send
        </p>
      </form>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}

export default PromptInput;
