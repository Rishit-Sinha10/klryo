import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, MessageSquare, Brain, Loader2 } from "lucide-react";
import Navbar from "../common/navbar";
import MessageBubbleAI from "../ai/MessageBubble";
import PromptInput from "../ai/PromptInput";
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

const API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api`;

function ChatWindow() {
  const { isSignedIn, getToken } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isSignedIn) fetchChats();
    else {
      setLoadingChats(false);
      const local = JSON.parse(localStorage.getItem("zeco_chats") || "[]");
      setChats(local);
    }
  }, [isSignedIn]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchChats = async () => {
    setLoadingChats(true);
    try {
      const token = await getToken();
      if (!token) {
        setLoadingChats(false);
        return;
      }
      const res = await fetch(`${API_BASE}/chats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setChats(data.chats || []);
      }
    } catch (err) {
      console.error("Failed to fetch chats:", err);
    } finally {
      setLoadingChats(false);
    }
  };

  const createNewChat = async () => {
    const newChat = {
      _id: `local_${Date.now()}`,
      title: "New Chat",
      messages: [],
      createdAt: new Date().toISOString(),
    };

    if (isSignedIn) {
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/chats`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ messages: [] }),
        });
        if (res.ok) {
          const data = await res.json();
          newChat._id = data.chat._id;
          newChat.title = data.chat.title;
        }
      } catch (err) {
        console.error("Failed to create chat on server:", err);
      }
    }

    setChats((prev) => [newChat, ...prev]);
    setActiveChat(newChat);
    setMessages([]);
    if (!isSignedIn) {
      const updated = [newChat, ...chats];
      localStorage.setItem("zeco_chats", JSON.stringify(updated));
    }
  };

  const selectChat = async (chat) => {
    setActiveChat(chat);

    if (isSignedIn && !chat._id.startsWith("local_")) {
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/chats/${chat._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data.chat.messages || []);
          return;
        }
      } catch (err) {
        console.error("Failed to load chat:", err);
      }
    }
    setMessages(chat.messages || []);
  };

  const deleteChat = async (chatId, e) => {
    e.stopPropagation();
    if (!confirm("Delete this chat?")) return;

    if (isSignedIn && !chatId.startsWith("local_")) {
      try {
        const token = await getToken();
        await fetch(`${API_BASE}/chats/${chatId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error("Failed to delete on server:", err);
      }
    }

    setChats((prev) => prev.filter((c) => c._id !== chatId));
    if (activeChat?._id === chatId) {
      setActiveChat(null);
      setMessages([]);
    }
    if (!isSignedIn) {
      const updated = chats.filter((c) => c._id !== chatId);
      localStorage.setItem("zeco_chats", JSON.stringify(updated));
    }
  };

  const callAI = async (prompt) => {
    try {
      const headers = { "Content-Type": "application/json" };
      const token = await getToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!res.ok) {
        const error = await res
          .json()
          .catch(() => ({ message: res.statusText }));
        return `Error: ${error.message || "AI request failed"}`;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) break;
              if (data.error) return `Error: ${data.error}`;
              if (data.chunk) fullResponse += data.chunk;
            } catch {
              // skip parse errors
            }
          }
        }
      }

      return fullResponse || "No response from AI";
    } catch (err) {
      return `Error: ${err.message}`;
    }
  };

  const handleSubmitMessage = async (userInput) => {
    if (!userInput.trim() || !activeChat) return;

    const userMsg = { role: "user", content: userInput, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const aiResponse = await callAI(userInput);
      const aiMsg = {
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      const updatedMessages = [...messages, userMsg, aiMsg];

      if (isSignedIn && !activeChat._id.startsWith("local_")) {
        try {
          const token = await getToken();
          await fetch(`${API_BASE}/chats/${activeChat._id}/message`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ role: "user", content: userInput }),
          });
          await fetch(`${API_BASE}/chats/${activeChat._id}/message`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ role: "assistant", content: aiResponse }),
          });
        } catch (err) {
          console.error("Failed to persist messages:", err);
        }
      }

      const updatedChat = {
        ...activeChat,
        messages: updatedMessages,
        title:
          activeChat.title === "New Chat"
            ? userInput.substring(0, 50)
            : activeChat.title,
      };
      setActiveChat(updatedChat);
      setChats((prev) =>
        prev.map((c) => (c._id === activeChat._id ? updatedChat : c)),
      );

      if (!isSignedIn) {
        const allChats = chats.map((c) =>
          c._id === activeChat._id ? updatedChat : c,
        );
        localStorage.setItem("zeco_chats", JSON.stringify(allChats));
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${err.message}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const t = {
    bg: "var(--bg-primary)",
    bg2: "var(--bg-secondary)",
    bg3: "var(--bg-tertiary)",
    text: "var(--text-primary)",
    text2: "var(--text-secondary)",
    text3: "var(--text-tertiary)",
    border: "var(--border)",
    accent: "var(--accent)",
  };

  return (
    <div
      className="h-screen w-screen flex flex-col"
      style={{ backgroundColor: t.bg }}
    >
      <Navbar />
      <div className="flex-1 flex overflow-hidden pt-16">
        <div className="flex-1 flex overflow-hidden">
          {/* Chat list sidebar */}
          <div
            className="w-64 flex flex-col shrink-0"
            style={{
              borderRight: `1px solid ${t.border}`,
              backgroundColor: t.bg2,
            }}
          >
            <div
              className="p-3"
              style={{ borderBottom: `1px solid ${t.border}` }}
            >
              <Button onClick={createNewChat} className="w-full" size="sm">
                <Plus size={16} />
                New Chat
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto py-1">
              {loadingChats ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2
                    size={16}
                    className="animate-spin"
                    style={{ color: t.text3 }}
                  />
                </div>
              ) : chats.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <MessageSquare
                    size={24}
                    className="mx-auto mb-2"
                    style={{ color: t.text3, opacity: 0.3 }}
                  />
                  <p className="text-xs" style={{ color: t.text3 }}>
                    No chats yet
                  </p>
                </div>
              ) : (
                chats.map((chat) => (
                  <div
                    key={chat._id}
                    onClick={() => selectChat(chat)}
                    className="flex items-center gap-2 px-3 py-2.5 mx-1 rounded-md cursor-pointer transition-colors group"
                    style={{
                      backgroundColor:
                        activeChat?._id === chat._id
                          ? "var(--accent-light)"
                          : "transparent",
                      color:
                        activeChat?._id === chat._id
                          ? "var(--accent)"
                          : "var(--text-secondary)",
                    }}
                    onMouseEnter={(e) => {
                      if (activeChat?._id !== chat._id)
                        e.currentTarget.style.backgroundColor =
                          "var(--bg-tertiary)";
                    }}
                    onMouseLeave={(e) => {
                      if (activeChat?._id !== chat._id)
                        e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <MessageSquare size={14} className="shrink-0" />
                    <span className="text-sm truncate flex-1">
                      {chat.title || "New Chat"}
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => deleteChat(chat._id, e)}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete chat</TooltipContent>
                    </Tooltip>
                  </div>
                ))
              )}
            </div>
          </div>

          <Separator orientation="vertical" />

          {/* Main chat area */}
          <div className="flex-1 flex flex-col min-w-0">
            {!activeChat ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <Avatar size="lg" className="mb-4">
                  <AvatarFallback>
                    <Brain size={32} style={{ color: "#fbbf24" }} />
                  </AvatarFallback>
                </Avatar>
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{ color: t.text }}
                >
                  klyro Chat
                </h2>
                <p className="text-sm mb-6 max-w-md" style={{ color: t.text3 }}>
                  Ask questions, get code explanations, debug errors, or
                  brainstorm ideas.
                </p>
                <Button onClick={createNewChat} size="lg">
                  <Plus size={18} />
                  Start a Conversation
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <Avatar className="mb-3">
                        <AvatarFallback>
                          <Brain size={24} style={{ color: "#fbbf24" }} />
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm" style={{ color: t.text3 }}>
                        Ask me anything about code...
                      </p>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg, i) => (
                        <MessageBubbleAI
                          key={i}
                          message={msg}
                          isUser={msg.role === "user"}
                        />
                      ))}
                      {isLoading && (
                        <div className="flex justify-start mb-4">
                          <div
                            className="rounded-lg px-4 py-3"
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
                    </>
                  )}
                </div>
                <Separator />
                <PromptInput
                  onSubmit={handleSubmitMessage}
                  isLoading={isLoading}
                  placeholder="Ask klyro something..."
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
