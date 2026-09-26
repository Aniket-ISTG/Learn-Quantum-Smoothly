"use client";

import Editor from "@monaco-editor/react";

type CodeEditorProps = {
  code: string;
  language: string;
  onChange: (code: string) => void;
};

const languageMap: Record<string, string> = {
  javascript: "javascript",
  python: "python",
  c: "c",
  cpp: "cpp",
  java: "java",
};

export default function CodeEditor({
  code,
  language,
  onChange,
}: CodeEditorProps) {
  return (
    <div className="min-h-[420px] overflow-hidden rounded-xl border border-slate-700 bg-[#1e1e1e] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] shadow-slate-950/30 transition duration-200 hover:border-cyan-400/60">
      <Editor
        height="420px"
        language={languageMap[language] ?? "javascript"}
        value={code}
        theme="vs"
        onChange={(value) => onChange(value ?? "")}
        options={{
          automaticLayout: true,
          minimap: {
            enabled: false,
          },
          fontSize: 13,
          lineHeight: 22,
          fontFamily: "Fira Code, Consolas, monospace",
          fontLigatures: true,
          tabSize: 4,
          insertSpaces: true,
          wordWrap: "on",
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          padding: {
            top: 16,
            bottom: 16,
          },
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          glyphMargin: false,
          lineNumbersMinChars: 3,
          renderLineHighlight: "all",
          roundedSelection: true,
        }}
      />
    </div>
  );
}   