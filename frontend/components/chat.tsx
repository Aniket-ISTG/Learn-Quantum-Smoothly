"use client";

import React, { useState, useRef } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const AI_BACKEND_URL =
  process.env.NEXT_PUBLIC_AI_BACKEND_URL ?? "http://localhost:4000";

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const pushUserMessage = (text: string) => {
    setMessages((m) => [...m, { role: "user", content: text }]);
  };

  const pushAssistantMessage = (initial = "") => {
    setMessages((m) => [
      ...m,
      { role: "assistant", content: initial },
    ]);
  };

  const appendToLastAssistant = (chunk: string) => {
    setMessages((prev) => {
      const copy = prev.slice();

      for (let i = copy.length - 1; i >= 0; i--) {
        if (copy[i].role === "assistant") {
          copy[i] = {
            ...copy[i],
            content: (copy[i].content || "") + chunk,
          };
          break;
        }
      }

      return copy;
    });
  };

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop =
          scrollRef.current.scrollHeight;
      }
    });
  };

  const handleSend = async () => {
    const text = input.trim();

    if (!text) return;

    const previousMessages = messages;

    setInput("");
    pushUserMessage(text);
    pushAssistantMessage("");
    setLoading(true);

    try {
      const context = {
        page: {
          pathname: window.location.pathname,
          kind: "other",
        },
      };

      const res = await fetch(
        `${AI_BACKEND_URL}/api/ai/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: text,
            messages: previousMessages,
            context,
          }),
        }
      );

      if (!res.ok || !res.body) {
        throw new Error("AI service error");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let done = false;
      let streamBuffer = "";

      while (!done) {
        const { value, done: d } = await reader.read();

        done = Boolean(d);

        if (!value) continue;

        const chunk = decoder.decode(value, {
          stream: true,
        });

        streamBuffer += chunk;

        const lines = streamBuffer.split(/\r?\n/);

        streamBuffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();

          if (!trimmed) continue;

          if (!trimmed.startsWith("data:")) {
            if (
              trimmed &&
              !trimmed.startsWith(":")
            ) {
              appendToLastAssistant(trimmed);
            }

            continue;
          }

          const payload = trimmed.slice(5).trim();

          if (
            !payload ||
            payload === "[DONE]"
          ) {
            continue;
          }

          try {
            const parsed = JSON.parse(payload) as {
              choices?: Array<{
                delta?: {
                  content?: string;
                };
              }>;
            };

            const content =
              parsed.choices?.[0]?.delta?.content;

            if (content) {
              appendToLastAssistant(content);
            }
          } catch {
            appendToLastAssistant(payload);
          }
        }

        scrollToBottom();
      }

      if (streamBuffer.trim()) {
        const fallback = streamBuffer.trim();

        if (fallback.startsWith("data:")) {
          const payload = fallback.slice(5).trim();

          if (
            payload &&
            payload !== "[DONE]"
          ) {
            try {
              const parsed = JSON.parse(payload) as {
                choices?: Array<{
                  delta?: {
                    content?: string;
                  };
                }>;
              };

              const content =
                parsed.choices?.[0]?.delta?.content;

              if (content) {
                appendToLastAssistant(content);
              }
            } catch {
              appendToLastAssistant(payload);
            }
          }
        } else {
          appendToLastAssistant(fallback);
        }
      }
    } catch (err) {
      appendToLastAssistant(
        "\n[Error contacting AI service]"
      );
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const handleKey = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed right-4 top-16 w-80 max-h-[80vh] bg-slate-900 text-slate-100 rounded-lg shadow-lg flex flex-col overflow-hidden">
      <div className="px-3 py-2 border-b border-slate-700 flex items-center justify-between">
        <div className="text-sm font-medium">
          AI Tutor
        </div>

        <button
          className="text-xs text-slate-400 hover:text-slate-200"
          onClick={() => {
            setMessages([]);
          }}
        >
          Clear
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-auto p-3 space-y-3 text-sm"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "text-right"
                : "text-left"
            }
          >
            <div
              className={
                m.role === "user"
                  ? "inline-block bg-slate-700 px-3 py-1 rounded-md"
                  : "inline-block bg-slate-800 px-3 py-1 rounded-md"
              }
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <div className="p-2 border-t border-slate-700">
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          onKeyDown={handleKey}
          placeholder={
            loading
              ? "Waiting for response…"
              : "Ask a question"
          }
          className="w-full resize-none h-20 bg-slate-900 text-slate-100 placeholder-slate-500 rounded-md p-2 border border-slate-700"
          disabled={loading}
        />

        <div className="mt-2 flex items-center justify-end gap-2">
          <button
            onClick={() => {
              setInput("");
            }}
            className="text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600"
          >
            Reset
          </button>

          <button
            onClick={handleSend}
            disabled={loading}
            className="text-xs px-3 py-1 rounded bg-emerald-500 text-black hover:brightness-95 disabled:opacity-50"
          >
            {loading ? "Thinking…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}