"use client";

import React, { useEffect, useRef, useState } from "react";

export interface QuirkCircuitProps {
  initialCircuit?: string;
  onCircuitChange?: (circuitJson: string) => void;
  className?: string;
  onAdvancedGatesChanged?: () => void;
  onReady?: () => void;
}

export function QuirkCircuit({
  initialCircuit,
  onCircuitChange,
  className = "",
  onAdvancedGatesChanged,
  onReady,
}: QuirkCircuitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedGates, setShowAdvancedGates] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isAnyPanelOpen, setIsAnyPanelOpen] = useState(false);

  useEffect(() => {
    const savedValue = localStorage.getItem("quirk_show_all_gates") === "true";
    setShowAdvancedGates(savedValue);
  }, []);

  useEffect(() => {
    const panels = [
      document.getElementById("circuits-div"),
      document.getElementById("export-div"),
      document.getElementById("import-div"),
      document.getElementById("gate-forge-div"),
    ];

    let dragState: { panel: HTMLElement; startX: number; startY: number; originX: number; originY: number } | null = null;

    panels.forEach((panel) => {
      if (!panel) return;

      panel.dataset.floatingPanel = "true";
      panel.style.position = "fixed";
      panel.style.left = "24px";
      panel.style.top = "72px";
      panel.style.width = "min(760px, calc(100vw - 48px))";
      panel.style.maxWidth = "calc(100vw - 48px)";
      panel.style.maxHeight = "calc(100vh - 96px)";
      panel.style.height = "min(72vh, 720px)";
      panel.style.resize = "both";
      panel.style.overflow = "auto";
      panel.style.zIndex = "50";
      panel.style.borderRadius = "20px";
      panel.style.boxShadow = "0 24px 80px rgba(15, 23, 42, 0.18)";
      panel.style.background = "rgba(255,255,255,0.96)";
      panel.style.border = "1px solid rgba(148, 163, 184, 0.35)";
      panel.style.backdropFilter = "none";

      const overlay = panel.querySelector("[data-overlay]") as HTMLElement | null;
      if (overlay) {
        overlay.style.pointerEvents = "none";
        overlay.style.background = "transparent";
        overlay.style.backdropFilter = "none";
        overlay.style.filter = "none";
      }

      const header = panel.querySelector("[data-panel-header]") as HTMLElement | null;
      if (header) {
        header.style.cursor = "grab";
        header.style.userSelect = "none";
      }
    });

    const onPointerMove = (event: Event) => {
      if (!dragState) return;
      const pointerEvent = event as PointerEvent;
      const nextLeft = Math.max(12, Math.min(window.innerWidth - 220, dragState.originX + (pointerEvent.clientX - dragState.startX)));
      const nextTop = Math.max(12, Math.min(window.innerHeight - 160, dragState.originY + (pointerEvent.clientY - dragState.startY)));
      dragState.panel.style.left = `${nextLeft}px`;
      dragState.panel.style.top = `${nextTop}px`;
    };

    const onPointerUp = () => {
      dragState = null;
    };

    const onPointerDown = (event: Event) => {
      const pointerEvent = event as PointerEvent;
      const header = pointerEvent.target as HTMLElement;
      const panel = header.closest("[data-floating-panel]") as HTMLElement | null;
      if (!panel) return;
      dragState = {
        panel,
        startX: pointerEvent.clientX,
        startY: pointerEvent.clientY,
        originX: panel.offsetLeft,
        originY: panel.offsetTop,
      };
    };

    document.querySelectorAll("[data-panel-header]").forEach((header) => {
      header.addEventListener("pointerdown", onPointerDown);
    });

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      document.querySelectorAll("[data-panel-header]").forEach((header) => {
        header.removeEventListener("pointerdown", onPointerDown);
      });
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  useEffect(() => {
    const panelIds = ["circuits-div", "export-div", "import-div", "gate-forge-div"];
    const syncOpenState = () => {
      const activePanel = panelIds.find((id) => {
        const panel = document.getElementById(id);
        return !!panel && panel.style.display !== "none";
      });
      setIsAnyPanelOpen(Boolean(activePanel));
    };

    syncOpenState();

    const observer = new MutationObserver(() => {
      syncOpenState();
    });

    panelIds.forEach((id) => {
      const panel = document.getElementById(id);
      if (panel) {
        observer.observe(panel, { attributes: true, attributeFilter: ["style", "class"] });
      }
    });

    const blockOutsideInteractions = (event: Event) => {
      const activePanelId = panelIds.find((id) => {
        const panel = document.getElementById(id);
        return !!panel && panel.style.display !== "none";
      });

      if (!activePanelId) return;

      const activePanel = document.getElementById(activePanelId);
      const target = event.target as HTMLElement | null;
      if (!activePanel || !target) return;

      const isWithinActivePanel = activePanel.contains(target) || target.closest("[data-floating-panel]") === activePanel;
      if (!isWithinActivePanel) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener("pointerdown", blockOutsideInteractions, true);
    document.addEventListener("click", blockOutsideInteractions, true);
    document.addEventListener("keydown", (event) => {
      if (isAnyPanelOpen && event.key === "Escape") {
        panelIds.forEach((id) => {
          const panel = document.getElementById(id);
          if (panel) panel.style.display = "none";
        });
      }
    });

    return () => {
      observer.disconnect();
      document.removeEventListener("pointerdown", blockOutsideInteractions, true);
      document.removeEventListener("click", blockOutsideInteractions, true);
    };
  }, [isAnyPanelOpen, reloadKey]);

  useEffect(() => {
    const saveButton = document.getElementById("download-options-button");
    const saveMenu = document.getElementById("download-options-menu");

    if (!saveButton || !saveMenu) {
      return;
    }

    const toggleMenu = (button: HTMLElement, menu: HTMLElement) => {
      const shouldOpen = menu.style.display !== "block";
      menu.style.display = shouldOpen ? "block" : "none";
      if (shouldOpen) {
        const rect = button.getBoundingClientRect();
        menu.style.position = "absolute";
        menu.style.top = `${rect.bottom + 6}px`;
        menu.style.left = `${rect.left}px`;
      }
    };

    const closeMenu = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!saveButton.contains(target) && !saveMenu.contains(target)) {
        saveMenu.style.display = "none";
      }
    };

    const saveClickHandler = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleMenu(saveButton, saveMenu);
    };

    saveButton.addEventListener("click", saveClickHandler);
    document.addEventListener("click", closeMenu);

    return () => {
      saveButton.removeEventListener("click", saveClickHandler);
      document.removeEventListener("click", closeMenu);
    };
  }, [reloadKey]);

  useEffect(() => {
    let quirkInstance: any = null;
    let isCancelled = false;

    // Every reload starts from a clean loading state.
    setIsLoaded(false);
    setError(null);

    // Load FontAwesome for Quirk-E toolbar icons if not already present
    if (!document.getElementById("font-awesome-cdn")) {
      const link = document.createElement("link");
      link.id = "font-awesome-cdn";
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css";
      document.head.appendChild(link);
    }

    async function mount() {
      try {
        // Dynamically import the native Quirk-E ES modules from frontend/lib/quirk/main.js
        const { initQuirk } = await import("@/lib/quirk/main.js");
        if (isCancelled) return;

        quirkInstance = initQuirk({
          initialCircuit,
          onCircuitChange: (json: string) => {
            if (onCircuitChange) {
              onCircuitChange(json);
            }
          },
        });

        setIsLoaded(true);
        onReady?.();
      } catch (err: any) {
        console.error("Failed to initialize Quirk-E component:", err);
        setError(err?.message || "Failed to load quantum simulator");
      }
    }

    mount();

    return () => {
      isCancelled = true;
      if (quirkInstance && typeof quirkInstance.destroy === "function") {
        quirkInstance.destroy();
      }
    };
  }, [initialCircuit, onCircuitChange, reloadKey]);

  return (
    <div ref={containerRef} className={`relative flex flex-col w-full min-w-0 max-w-full overflow-visible bg-white dark:bg-slate-900 select-none ${className}`}>
      {/* Loading state indicator */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
            Loading your circuit environment
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm border-b border-red-200">
          <strong>Simulator Error:</strong> {error}
        </div>
      )}

      {/* Main Quirk-E Top Navigation & Action Controls */}
      <div id="inspectorDiv" style={{ display: "none", pointerEvents: isAnyPanelOpen ? "none" : "auto" }} className="relative z-20 w-full border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-4 py-2.5">
        <div id="menu-row" className="relative z-30 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left Group: Circuit Operations */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              id="circuits-button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-medium shadow-sm transition"
              title="Circuit Gallery & Examples"
            >
              <i className="fa-solid fa-list text-[11px]" />
              <span>Examples</span>
            </button>

            <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

            <button
              id="undo-button"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title="Undo (Ctrl+Z)"
            >
              <i className="fa-solid fa-rotate-left text-[11px]" />
              <span>Undo</span>
            </button>

            <button
              id="redo-button"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title="Redo (Ctrl+Y)"
            >
              <i className="fa-solid fa-rotate-right text-[11px]" />
              <span>Redo</span>
            </button>

            <button
              id="clear-circuit-button"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title="Clear circuit gates"
            >
              <i className="fa-solid fa-eraser text-[11px]" />
              <span>Clear</span>
            </button>

            <button
              id="clear-all-button"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title="Reset everything to default"
            >
              <span>Reset All</span>
            </button>

            <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

            {/* Inspector Toggle */}
            <button
              id="enable-inspector-button"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition font-medium"
              title="Step-by-step circuit inspector"
            >
              <i className="fa-solid fa-magnifying-glass text-[11px]" />
              <span>Inspector</span>
            </button>

            <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <span>Advance Gates</span>
              <span className="relative inline-flex h-5 w-9 items-center rounded-full bg-slate-200 transition-colors dark:bg-slate-700">
                <input
                  id="show-all-gates-toggle"
                  type="checkbox"
                  checked={showAdvancedGates}
                  onChange={(event) => {
                    const nextValue = event.target.checked;

                    window.dispatchEvent(new Event("quirk-reset-overlays"));
                    document.querySelectorAll("[data-floating-panel]").forEach((panel) => {
                      const el = panel as HTMLElement;
                      el.style.display = "none";
                    });

                    localStorage.setItem("quirk_show_all_gates", String(nextValue));
                    setShowAdvancedGates(nextValue);
                    setIsLoaded(false);
                    setError(null);
                    setReloadKey((value) => value + 1);
                    onAdvancedGatesChanged?.();
                  }}
                  className="peer sr-only"
                />
                <span className="absolute left-1 h-3 w-3 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
              </span>
            </label>
          </div>

          {/* Right Group: Export, Import, Custom Gates & Settings */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              id="gate-forge-button"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title="Custom Matrix Gate Forge"
            >
              <i className="fa-solid fa-wand-magic-sparkles text-[11px] text-amber-500" />
              <span>Gate Forge</span>
            </button>

            <button
              id="import-button"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title="Import circuit (QASM, Quirk JSON, Quil, Qobj)"
            >
              <i className="fa-solid fa-file-import text-[11px] text-blue-500" />
              <span>Import</span>
            </button>

            <button
              id="export-button"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title="Export circuit (QASM, Qiskit, Cirq, JSON)"
            >
              <i className="fa-solid fa-file-export text-[11px] text-emerald-500" />
              <span>Export</span>
            </button>

            <div className="relative">
              <button
                type="button"
                id="download-options-button"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-100 transition"
                title="Download Circuit Image or PDF"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  const menu = document.getElementById("download-options-menu");
                  if (!menu) return;
                  const shouldOpen = menu.style.display !== "block";
                  menu.style.display = shouldOpen ? "block" : "none";
                  if (shouldOpen) {
                    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
                    menu.style.position = "absolute";
                    menu.style.top = `${rect.bottom + 6}px`;
                    menu.style.left = `${rect.left}px`;
                  }
                }}
              >
                <i className="fa-solid fa-download text-[11px] text-slate-700" />
                <span>Save</span>
              </button>
              <div
                id="download-options-menu"
                style={{ display: "none" }}
                className="absolute right-0 top-full mt-1.5 z-50 min-w-[150px] rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
                onClick={(event) => {
                  const target = event.target as HTMLElement;
                  if (target.closest("button")) {
                    const menu = document.getElementById("download-options-menu");
                    if (menu) menu.style.display = "none";
                  }
                }}
              >
                <button type="button" id="export-png-button" className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-100 text-xs font-medium text-slate-700">
                  Export PNG
                </button>
                <button type="button" id="export-svg-button" className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-100 text-xs font-medium text-slate-700">
                  Export SVG
                </button>
                <button type="button" id="export-pdf-button" className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-100 text-xs font-medium text-slate-700">
                  Export PDF
                </button>
                <button type="button" id="export-jpg-button" className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-100 text-xs font-medium text-slate-700">
                  Export JPG
                </button>
                <button type="button" id="export-webp-button" className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-100 text-xs font-medium text-slate-700">
                  Export WebP
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas Area where Quirk draws the Circuit and Gates */}
      <div
        id="canvasDiv"
        tabIndex={0}
        className="relative z-10 w-full min-w-0 max-w-full flex-1 overflow-x-auto overflow-y-hidden bg-white dark:bg-slate-900 focus:outline-none min-h-[680px]"
        style={{ position: "relative", pointerEvents: isAnyPanelOpen ? "none" : "auto" }}
      >
        <canvas id="drawCanvas" className="block outline-none" />

        {/* Right-click Context Menu on Gates */}
        <div id="gate-context-menu" style={{ position: "absolute", display: "none", zIndex: 1000 }}>
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 p-1.5 shadow-2xl backdrop-blur-md ring-1 ring-slate-200/70 dark:ring-slate-700/60">
            <button id="delete-gate-button" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition">
              <i className="fa-solid fa-trash text-[11px]" />
              <span>Delete</span>
            </button>
            <button id="duplicate-gate-button" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
              <i className="fa-solid fa-clone text-[11px]" />
              <span>Duplicate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Step-by-Step Inspector Bar Overlay */}
      <div id="circuit-inspector" style={{ display: "none" }}>
        <div id="circuit-inspector-overlay" style={{ position: "fixed", left: 0, top: 0, height: "100vh", width: "100vw" }} />
        <div
          id="circuit-inspector-menu"
          className="fixed bottom-7 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-5 py-3.5 shadow-2xl ring-1 ring-slate-200"
          style={{ minWidth: "440px" }}
        >
          <span className="text-xs font-semibold text-slate-600 mr-1">Inspect:</span>
          <button id="inspector-start" className="h-10 w-10 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 flex items-center justify-center text-sm shadow-sm">
            <i className="fa-solid fa-angles-left" />
          </button>
          <button id="inspector-step-left" className="h-10 w-10 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 flex items-center justify-center text-sm shadow-sm">
            <i className="fa-solid fa-angle-left" />
          </button>
          <button id="inspector-play" className="h-10 w-10 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center text-sm shadow-sm">
            <i className="fa-solid fa-play" />
          </button>
          <button id="inspector-pause" style={{ display: "none" }} className="h-10 w-10 rounded-lg bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center text-sm shadow-sm">
            <i className="fa-solid fa-pause" />
          </button>
          <button id="inspector-step-right" className="h-10 w-10 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 flex items-center justify-center text-sm shadow-sm">
            <i className="fa-solid fa-angle-right" />
          </button>
          <button id="inspector-end" className="h-10 w-10 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 flex items-center justify-center text-sm shadow-sm">
            <i className="fa-solid fa-angles-right" />
          </button>
        </div>
      </div>

      {/* Circuit Gallery (Examples) Modal */}
      <div id="circuits-div" data-floating-panel style={{ display: "none" }} className="fixed z-50">
        <div id="circuits-overlay" data-overlay className="fixed inset-0 pointer-events-none bg-transparent" />
        <div className="relative z-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
          <div data-panel-header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600">
                <i className="fa-solid fa-atom text-base" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Example Circuit Gallery</h3>
                <p className="text-xs text-slate-500">Select an algorithm to load it into the playground</p>
              </div>
            </div>
            <button
              id="close-circuits-button"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition"
            >
              <i className="fa-solid fa-xmark text-lg" />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1 text-sm">
            <div className="space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-600 mb-2">Core Algorithms</div>
              <a id="example-anchor-grover" className="block p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 cursor-pointer font-medium text-black dark:text-black transition">
                Grover Search
              </a>
              <a id="example-anchor-shor" className="block p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 cursor-pointer font-medium text-black dark:text-black transition">
                Shor Period Finding
              </a>
              <a id="example-qft" className="block p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 cursor-pointer font-medium text-black dark:text-black transition">
                Quantum Fourier Transform (QFT)
              </a>
              <a id="example-anchor-teleport" className="block p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 cursor-pointer font-medium text-black dark:text-black transition">
                Quantum Teleportation
              </a>
              <a id="example-superdense-coding" className="block p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 cursor-pointer font-medium text-black dark:text-black transition">
                Superdense Coding
              </a>
              <a id="example-chsh-test" className="block p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 cursor-pointer font-medium text-black dark:text-black transition">
                Bell Inequality Test (CHSH)
              </a>
              <a id="example-symmetry-break" className="block p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 cursor-pointer font-medium text-black dark:text-black transition">
                Symmetry Breaking
              </a>
              <a id="example-anchor-distill" className="block p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 cursor-pointer font-medium text-black dark:text-black transition">
                Magic State Distillation
              </a>
              <a id="example-addition" className="block p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 cursor-pointer font-medium text-black dark:text-black transition">
                Reversible Quantum Addition
              </a>
              <a id="example-anchor-delayed-eraser" className="block p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 cursor-pointer font-medium text-black dark:text-black transition">
                Quantum Delayed Choice Eraser
              </a>
              <a id="example-schrodingers-cat" className="block p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 cursor-pointer font-medium text-black dark:text-black transition">
                Schrödinger&apos;s Cat on 6 Qubits
              </a>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-600 mb-2">Entanglement, Gates &amp; QFT</div>
              <a id="example-epr-pair" className="block p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 cursor-pointer font-medium text-black dark:text-black transition">
                Bell State (EPR Pair)
              </a>
              <a id="example-epr-pair-detailed" className="block p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 cursor-pointer font-medium text-black dark:text-black transition">
                Bell State (Detailed)
              </a>
              <a id="example-ccnot" className="block p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 cursor-pointer font-medium text-black dark:text-black transition">
                Toffoli (CCNOT) Gate
              </a>
              <a id="example-ccnot-decomposition" className="block p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 cursor-pointer font-medium text-black dark:text-black transition">
                Toffoli Decomposition
              </a>
              <a id="example-two-qubit-qft" className="block p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 cursor-pointer font-medium text-black dark:text-black transition">
                2-Qubit QFT
              </a>
              <a id="example-three-qubit-qft" className="block p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 cursor-pointer font-medium text-black dark:text-black transition">
                3-Qubit QFT
              </a>
              <a id="example-four-qubit-qft" className="block p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 cursor-pointer font-medium text-black dark:text-black transition">
                4-Qubit QFT
              </a>
              <a id="example-right-shift" className="block p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 cursor-pointer font-medium text-black dark:text-black transition">
                State Right-Shift
              </a>
              <a id="example-left-shift" className="block p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 cursor-pointer font-medium text-black dark:text-black transition">
                State Left-Shift
              </a>
              <a id="example-optimized-state-5-qubits" className="block p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 cursor-pointer font-medium text-black dark:text-black transition">
                5-Qubit Optimized State Shift
              </a>
              <a id="example-optimized-state-6-qubits" className="block p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 cursor-pointer font-medium text-black dark:text-black transition">
                6-Qubit Optimized State Shift
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Export Dialog Modal */}
      <div id="export-div" data-floating-panel style={{ display: "none" }} className="fixed z-50">
        <div id="export-overlay" data-overlay className="fixed inset-0 pointer-events-none bg-transparent" />
        <div className="relative z-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
          <div data-panel-header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 id="export-title" className="text-base font-semibold text-slate-900 dark:text-white">Export Quantum Circuit</h3>
            <button
              onClick={() => {
                window.dispatchEvent(new Event("quirk-reset-overlays"));
                const el = document.getElementById("export-div");
                if (el) el.style.display = "none";
              }}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <i className="fa-solid fa-xmark text-base" />
            </button>
          </div>

          <div className="mt-4 space-y-4 max-h-[65vh] overflow-y-auto pr-1 text-xs">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">Select Export Format:</label>
              <div className="flex items-center gap-2">
                <select id="export-format-select" className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs">
                  <option value="QASM2.0">OpenQASM 2.0</option>
                  <option value="Qiskit">Qiskit (Python)</option>
                  <option value="Cirq">Cirq (Python)</option>
                  <option value="PyQuil">PyQuil (Python)</option>
                  <option value="Quil">Quil (Rigetti)</option>
                  <option value="Braket">Amazon Braket</option>
                  <option value="QSharp">Q# (Microsoft)</option>
                  <option value="QuEST">QuEST (C/C++)</option>
                  <option value="TFQ">Tensorflow Quantum</option>
                  <option value="Qobj">Qobj (JSON)</option>
                </select>
                <button id="export-circuit-format" className="btn-primary !py-2 !px-3 text-xs">
                  Generate &amp; Copy
                </button>
                <span id="export-format-result" className="text-emerald-600 font-medium ml-2" />
              </div>
              <pre id="export-circuit-formats-pre" className="mt-2.5 max-h-48 overflow-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 font-mono text-[11px] text-slate-800 dark:text-slate-200" />
              <span id="export-format-error" className="text-rose-500 font-medium block mt-1" />
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Circuit JSON:</label>
              <div className="flex items-center gap-2 mb-1.5">
                <button id="export-json-copy-button" className="btn-secondary !py-1.5 !px-3 text-xs">
                  Copy Circuit JSON
                </button>
                <span id="export-json-copy-result" className="text-emerald-600 font-medium" />
              </div>
              <pre id="export-circuit-json-pre" className="max-h-28 overflow-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 font-mono text-[11px]" />
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">State Vector &amp; Amplitudes Data:</label>
              <div className="flex items-center gap-2 mb-1.5">
                <button id="export-amplitudes-button" className="btn-secondary !py-1.5 !px-3 text-xs">
                  Generate Output Amplitudes
                </button>
                <input type="checkbox" id="export-amplitudes-use-amps" className="accent-cyan-600" />
                <label htmlFor="export-amplitudes-use-amps" className="text-slate-600 dark:text-slate-400">Skip zero amplitudes</label>
                <span id="export-amplitudes-result" className="text-emerald-600 font-medium" />
              </div>
              <pre id="export-amplitudes-pre" className="max-h-28 overflow-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 font-mono text-[11px]" />
            </div>

            {/* Hidden fallback anchors for Quirk-E exports */}
            <div style={{ display: "none" }}>
              <button id="download-offline-copy-button">Download</button>
              <button id="export-link-copy-button">Copy</button>
              <span id="export-link-copy-result" />
              <div id="link-box"><a id="export-escaped-anchor" /></div>
              <a id="gates-link" href="#" />
            </div>
          </div>
        </div>
      </div>

      {/* Import Dialog Modal */}
      <div id="import-div" data-floating-panel style={{ display: "none" }} className="fixed z-50">
        <div id="import-overlay" data-overlay className="fixed inset-0 pointer-events-none bg-transparent" />
        <div className="relative z-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
          <div data-panel-header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 id="import-title" className="text-base font-semibold text-slate-900 dark:text-white">Import Quantum Circuit</h3>
            <button
              onClick={() => {
                window.dispatchEvent(new Event("quirk-reset-overlays"));
                const el = document.getElementById("import-div");
                if (el) el.style.display = "none";
              }}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <i className="fa-solid fa-xmark text-base" />
            </button>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">Source Format:</label>
              <select id="import-format-select" className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs w-full">
                <option value="quirk-json">Quirk-E JSON</option>
                <option value="QASM2.0">OpenQASM 2.0</option>
                <option value="QUIL2.0">QUIL 2.0</option>
                <option value="Qobj">Qiskit Qobj</option>
                <option value="IONQ">IONQ (JSON)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">Paste Circuit Code / JSON:</label>
              <textarea
                id="import-circuit-textarea"
                rows={8}
                placeholder="Paste OpenQASM or Quirk JSON here..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button id="import-circuit-button" className="btn-primary !py-2 !px-4 text-xs font-semibold">
                Import to Circuit
              </button>
              <span id="import-error-message" className="text-rose-500 font-medium text-xs" style={{ display: "none" }}>
                Import failed. Check format syntax.
              </span>
            </div>
            <p className="text-[11px] text-amber-600 dark:text-amber-400">
              * Note: Importing will replace your active circuit layout.
            </p>
          </div>
        </div>
      </div>

      {/* Gate Forge Modal */}
      <div id="gate-forge-div" data-floating-panel style={{ display: "none" }} className="fixed z-50">
        <div id="gate-forge-overlay" data-overlay className="fixed inset-0 pointer-events-none bg-transparent" />
        <div className="relative z-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
          <div data-panel-header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Custom Gate Forge</h3>
            <button
              onClick={() => {
                window.dispatchEvent(new Event("quirk-reset-overlays"));
                const el = document.getElementById("gate-forge-div");
                if (el) el.style.display = "none";
              }}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <i className="fa-solid fa-xmark text-base" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-950">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">From Rotation</h4>
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] text-slate-500">Rotation Axis (e.g. X+Z):</label>
                  <input id="gate-forge-rotation-axis" placeholder="X+Z" className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500">Angle (° degrees):</label>
                  <input id="gate-forge-rotation-angle" placeholder="45" className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500">Global Phase (°):</label>
                  <input id="gate-forge-rotation-phase" placeholder="0" className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500">Gate Symbol / Name:</label>
                  <input id="gate-forge-rotation-name" placeholder="R" className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs" />
                </div>
                <canvas id="gate-forge-rotation-canvas" width={40} height={40} className="hidden" />
                <button id="gate-forge-rotation-button" className="btn-primary !w-full !py-2 text-xs mt-2">
                  Create Rotation Gate
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-950">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">From Unitary Matrix</h4>
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] text-slate-500">Matrix Entries (comma-separated):</label>
                  <textarea id="gate-forge-matrix" rows={4} placeholder="1, 0, 0, -1" className="w-full mt-1 p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500">Gate Symbol / Name:</label>
                  <input id="gate-forge-matrix-name" placeholder="U" className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs" />
                </div>
                <div className="flex items-center gap-1.5">
                  <input type="checkbox" id="gate-forge-matrix-fix" className="accent-cyan-600" />
                  <label htmlFor="gate-forge-matrix-fix" className="text-[11px] text-slate-600 dark:text-slate-400">Orthogonalize to Unitary</label>
                </div>
                <canvas id="gate-forge-matrix-canvas" width={40} height={40} className="hidden" />
                <button id="gate-forge-matrix-button" className="btn-primary !w-full !py-2 text-xs mt-2">
                  Create Matrix Gate
                </button>
              </div>
            </div>

            {/* Hidden fallback fields for composite circuit gates */}
            <div style={{ display: "none" }}>
              <input id="gate-forge-circuit-name" />
              <input id="gate-forge-circuit-cols" />
              <input id="gate-forge-circuit-rows" />
              <canvas id="gate-forge-circuit-canvas" />
              <button id="gate-forge-circuit-button" />
            </div>
          </div>
        </div>
      </div>

      {/* Error Div for Quirk runtime notices */}
      <div id="error-div" style={{ display: "none" }} className="p-3 bg-rose-50 text-rose-700 text-xs border-t border-rose-200">
        <div id="error-happened-div" className="font-semibold">Notice</div>
        <div id="error-message-div" />
        <div style={{ display: "none" }}>
          <div id="error-known-div"><a id="error-known-issue-anchor" /></div>
          <div id="error-report-div"><a id="error-github-anchor" /><a id="error-mailto-anchor" /><div id="error-description-div" /><img id="error-image-pre" alt="" /><img id="error-image-post" alt="" /></div>
        </div>
      </div>

      {/* Hidden dummy elements needed by legacy listeners */}
      <div style={{ display: "none" }}>
        <div id="noscript-div" />
        <button id="about-button" />
        <button id="guide-button" />
        <img id="moon-image" alt="" />
        <img id="sun-image" alt="" />
        <img id="color-image" alt="" />
        <img id="bw-image" alt="" />
        <img id="yellow-image" alt="" />
        <img id="trash-image" alt="" />
        <img id="duplicate-image" alt="" />
      </div>
    </div>
  );
}

export default QuirkCircuit;
