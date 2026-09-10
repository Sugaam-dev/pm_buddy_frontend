"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bot, RotateCcw, Send, Sparkles, User } from "lucide-react";
import { AIResponse, StructuredBlock } from "@/types/api";
import { StructuredBlocksRenderer } from "./StructuredBlocks";
import { api } from "@/lib/api";

import { useAuth } from "@/lib/auth-context";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  blocks?: StructuredBlock[];
}

const getInitialMessages = (name?: string): Message[] => [
  {
    id: "initial-1",
    sender: "assistant",
    text: `Hello ${name || "there"}, I'm **PM Buddy**, your AI operational and governance partner. How can I assist with your delivery priorities and portfolio governance today?`,
    blocks: [
      {
        type: "recommendation",
        title: "Suggested Inquiries",
        items: [
          {"label": "What should I do first today?", "action": "my_work"},
          {"label": "Show me active tasks and tickets", "action": "my_work"},
          {"label": "What approvals have breached SLA?", "action": "breached_approvals"},
          {"label": "Find a suitable time for a project sync", "action": "schedule_sync"},
        ],
      },
    ],
  },
];

export function PMBuddyChat() {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string>("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const storageKey = currentUser ? `pm_buddy_chat_${currentUser.organization_id}_${currentUser.user_id}` : null;
  const convKey = currentUser ? `pm_buddy_conv_${currentUser.organization_id}_${currentUser.user_id}` : null;

  // Restore chat messages and conversation ID namespaced strictly by authenticated user
  useEffect(() => {
    if (!currentUser) {
      setMessages([]);
      setConversationId("");
      setIsInitialized(false);
      return;
    }

    const initial = getInitialMessages(currentUser.name);
    try {
      const savedMessages = storageKey ? localStorage.getItem(storageKey) : null;
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        } else {
          setMessages(initial);
        }
      } else {
        setMessages(initial);
      }

      const savedConvId = convKey ? localStorage.getItem(convKey) : null;
      setConversationId(savedConvId || "");
    } catch (err) {
      console.warn("Could not load chat messages from localStorage", err);
      setMessages(initial);
    } finally {
      setIsInitialized(true);
    }
  }, [currentUser?.user_id, currentUser?.organization_id]);

  // Save messages to localStorage namespaced strictly to current user
  useEffect(() => {
    if (!isInitialized || !storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (err) {
      console.warn("Could not save chat messages to localStorage", err);
    }
  }, [messages, isInitialized, storageKey]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleClearChat = () => {
    setConversationId("");
    const initial = getInitialMessages(currentUser?.name);
    setMessages(initial);
    try {
      if (storageKey) localStorage.removeItem(storageKey);
      if (convKey) localStorage.removeItem(convKey);
    } catch {
      // ignore
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = textToSend || input;
    if (!prompt.trim() || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: prompt,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res: AIResponse = await api.sendChatMessage(prompt, conversationId || undefined);
      if (res.conversation_id) {
        setConversationId(res.conversation_id);
        if (convKey) {
          try {
            localStorage.setItem(convKey, res.conversation_id);
          } catch {
            // ignore
          }
        }
      }
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        text: res.text,
        blocks: res.blocks,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      if (err.message && err.message.includes("Conversation not found")) {
        setConversationId("");
        if (convKey) {
          try {
            localStorage.removeItem(convKey);
          } catch {
            // ignore
          }
        }
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "assistant",
          text: `⚠️ **Error**: ${err.message || "Could not reach PM Buddy backend service."}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              PM Buddy Workspace
              <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                Live
              </span>
            </h2>
            <p className="text-xs text-slate-400">Embedded Operational Intelligence & Governance</p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition shadow-sm"
          title="Clear chat and start a new session"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3.5 max-w-3xl ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
          >
            <div
              className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 border border-slate-700 text-blue-400"
              }`}
            >
              {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`rounded-2xl p-4.5 text-sm leading-relaxed shadow-sm ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none"
              }`}
            >
              <div className="prose prose-invert prose-sm max-w-none whitespace-pre-line">
                {msg.text}
              </div>

              {msg.blocks && msg.blocks.length > 0 && (
                <StructuredBlocksRenderer
                  blocks={msg.blocks}
                  onActionTrigger={(actionPrompt) => handleSendMessage(actionPrompt)}
                  onConfirmed={() => {
                    handleSendMessage("What is my schedule now?");
                  }}
                />
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 text-slate-400 text-xs font-mono">
            <Sparkles className="w-4 h-4 animate-spin text-blue-400" />
            <span>PM Buddy is retrieving verified operational metrics...</span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input controls */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask PM Buddy (e.g. 'What approvals are pending?', 'Why is Project Alpha at risk?')..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-medium text-sm flex items-center gap-2 shadow-lg transition"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
