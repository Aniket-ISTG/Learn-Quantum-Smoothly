"use client";

import React, { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const AI_BACKEND_URL =
  process.env.NEXT_PUBLIC_AI_BACKEND_URL ?? "http://localhost:4000";

export default function Chat() {
  const [isOpen, setIsOpen] = useState(false);
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

    if (!text || loading) return;

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
        "\n\n**Error:** Unable to contact the AI service."
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
    <>
      {/* =====================================================
          DRAGGABLE + RESIZABLE CHAT WINDOW
          ===================================================== */}

      {isOpen && (
        <Rnd
          default={{
            x:
              typeof window !== "undefined"
                ? window.innerWidth - 405
                : 20,
            y:
              typeof window !== "undefined"
                ? window.innerHeight - 675
                : 20,
            width: 380,
            height: 600,
          }}
          minWidth={300}
          minHeight={400}
          maxWidth={
            typeof window !== "undefined"
              ? window.innerWidth - 20
              : 1000
          }
          maxHeight={
            typeof window !== "undefined"
              ? window.innerHeight - 20
              : 1000
          }
          bounds="window"
          dragHandleClassName="chat-drag-handle"
          enableResizing={{
            top: true,
            right: true,
            bottom: true,
            left: true,
            topRight: true,
            bottomRight: true,
            bottomLeft: true,
            topLeft: true,
          }}
          className="z-[9999]"
        >
          <div
            className="
              h-full
              w-full
              bg-slate-900
              text-slate-100
              rounded-2xl
              shadow-2xl
              flex
              flex-col
              overflow-hidden
              border
              border-slate-700
            "
          >
            {/* =================================================
                HEADER
                ================================================= */}

            <div
              className="
                chat-drag-handle
                px-3
                py-2
                border-b
                border-slate-700
                flex
                items-center
                justify-between
                shrink-0
                cursor-move
                select-none
              "
            >
              <div className="flex items-center gap-2">
                {/* AI ICON */}
                <div
                  className="
                    h-8
                    w-8
                    rounded-lg
                    bg-cyan-400/10
                    border
                    border-cyan-400/20
                    flex
                    items-center
                    justify-center
                    text-cyan-300
                  "
                >
                  ✦
                </div>

                <div className="text-sm font-medium">
                  AI Tutor
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* CLEAR */}
                <button
                  className="
                    text-xs
                    text-slate-400
                    hover:text-slate-200
                    transition
                  "
                  onClick={(e) => {
                    e.stopPropagation();
                    setMessages([]);
                  }}
                >
                  Clear
                </button>

                {/* MINIMIZE */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                  className="
                    h-7
                    w-7
                    rounded-md
                    flex
                    items-center
                    justify-center
                    text-slate-400
                    hover:bg-slate-800
                    hover:text-white
                    transition
                    cursor-pointer
                  "
                  aria-label="Minimize AI Tutor"
                >
                  ×
                </button>
              </div>
            </div>

            {/* =================================================
                MESSAGES
                ================================================= */}

            <div
              ref={scrollRef}
              className="
                flex-1
                overflow-y-auto
                overflow-x-hidden
                p-3
                space-y-3
                text-sm
              "
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === "user"
                      ? "flex justify-end"
                      : "flex justify-start"
                  }
                >
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[88%] bg-slate-700 px-3 py-2 rounded-lg text-left break-words"
                        : "max-w-[92%] bg-slate-800 px-3 py-3 rounded-lg text-left break-words"
                    }
                  >
                    {m.role === "assistant" ? (
                      <div className="ai-markdown text-sm leading-6 text-slate-200">
                        <ReactMarkdown
                          remarkPlugins={[
                            remarkGfm,
                            remarkMath,
                          ]}
                          rehypePlugins={[
                            rehypeKatex,
                          ]}
                          components={{
                            /* PARAGRAPH */
                            p: ({ children }) => (
                              <p className="mb-3 last:mb-0 leading-6">
                                {children}
                              </p>
                            ),

                            /* HEADINGS */
                            h1: ({ children }) => (
                              <h1 className="text-lg font-bold text-white mt-1 mb-3">
                                {children}
                              </h1>
                            ),

                            h2: ({ children }) => (
                              <h2 className="text-base font-bold text-white mt-4 mb-2">
                                {children}
                              </h2>
                            ),

                            h3: ({ children }) => (
                              <h3 className="text-sm font-semibold text-cyan-300 mt-3 mb-2">
                                {children}
                              </h3>
                            ),

                            /* UNORDERED LIST */
                            ul: ({ children }) => (
                              <ul className="list-disc ml-5 mb-3 space-y-1.5">
                                {children}
                              </ul>
                            ),

                            /* ORDERED LIST */
                            ol: ({ children }) => (
                              <ol className="list-decimal ml-5 mb-3 space-y-1.5">
                                {children}
                              </ol>
                            ),

                            /* LIST ITEM */
                            li: ({ children }) => (
                              <li className="pl-1 leading-6">
                                {children}
                              </li>
                            ),

                            /* BOLD */
                            strong: ({ children }) => (
                              <strong className="font-semibold text-white">
                                {children}
                              </strong>
                            ),

                            /* ITALIC */
                            em: ({ children }) => (
                              <em className="italic text-slate-300">
                                {children}
                              </em>
                            ),

                            /* BLOCKQUOTE */
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-2 border-cyan-400 pl-3 my-3 text-slate-300">
                                {children}
                              </blockquote>
                            ),

                            /* INLINE CODE */
                            code: ({
                              children,
                              className,
                            }) => {
                              const isCodeBlock =
                                className?.includes(
                                  "language-"
                                );

                              if (isCodeBlock) {
                                return (
                                  <code className="text-cyan-300">
                                    {children}
                                  </code>
                                );
                              }

                              return (
                                <code className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-cyan-300 text-xs">
                                  {children}
                                </code>
                              );
                            },

                            /* CODE BLOCK */
                            pre: ({ children }) => (
                              <pre className="bg-slate-950 border border-slate-700 rounded-lg p-3 my-3 overflow-x-auto text-xs leading-5">
                                {children}
                              </pre>
                            ),

                            /* LINKS */
                            a: ({
                              children,
                              href,
                            }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-400 hover:text-cyan-300 hover:underline"
                              >
                                {children}
                              </a>
                            ),

                            /* HORIZONTAL RULE */
                            hr: () => (
                              <hr className="my-4 border-slate-700" />
                            ),

                            /* TABLE */
                            table: ({ children }) => (
                              <div className="overflow-x-auto my-3">
                                <table className="w-full border-collapse text-xs">
                                  {children}
                                </table>
                              </div>
                            ),

                            th: ({ children }) => (
                              <th className="border border-slate-700 bg-slate-900 px-2 py-1.5 text-left font-semibold text-white">
                                {children}
                              </th>
                            ),

                            td: ({ children }) => (
                              <td className="border border-slate-700 px-2 py-1.5 text-slate-300">
                                {children}
                              </td>
                            ),
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap break-words leading-6">
                        {m.content}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* =================================================
                INPUT
                ================================================= */}

            <div className="p-2 border-t border-slate-700 shrink-0">
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
                className="
                  w-full
                  resize-none
                  h-20
                  bg-slate-900
                  text-slate-100
                  placeholder-slate-500
                  rounded-md
                  p-2
                  border
                  border-slate-700
                  outline-none
                  focus:border-cyan-500
                  focus:ring-1
                  focus:ring-cyan-500
                  transition
                "
                disabled={loading}
              />

              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setInput("");
                  }}
                  className="
                    text-xs
                    px-2
                    py-1
                    rounded
                    bg-slate-700
                    hover:bg-slate-600
                    transition
                  "
                >
                  Reset
                </button>

                <button
                  onClick={handleSend}
                  disabled={
                    loading || !input.trim()
                  }
                  className="
                    text-xs
                    px-3
                    py-1
                    rounded
                    bg-emerald-500
                    text-black
                    hover:brightness-95
                    disabled:opacity-50
                    transition
                  "
                >
                  {loading
                    ? "Thinking…"
                    : "Send"}
                </button>
              </div>
            </div>
          </div>
        </Rnd>
      )}

      {/* =====================================================
          FLOATING AI BUTTON
          ===================================================== */}

      <button
        onClick={() =>
          setIsOpen((prev) => !prev)
        }
        aria-label={
          isOpen
            ? "Close AI Tutor"
            : "Open AI Tutor"
        }
        className="
          fixed
          right-5
          bottom-5
          z-[10000]
          h-14
          w-14
          rounded-full
          bg-cyan-400
          text-slate-950
          text-2xl
          font-bold
          flex
          items-center
          justify-center
          shadow-[0_0_30px_rgba(34,211,238,0.35)]
          transition-all
          duration-200
          hover:scale-105
          hover:bg-cyan-300
          active:scale-95
        "
      >
        {isOpen ? "×" : "✦"}
      </button>
    </>
  );
}