"use client";

import { useState } from "react";
import type { MathVisualizationKind } from "@/data/math-lessons";

type LabKind = "complex-plane" | "matrix-transform" | "probability";

const LABS: ReadonlyArray<{ id: LabKind; label: string; prompt: string }> = [
  {
    id: "complex-plane",
    label: "Complex plane",
    prompt: "Change the real and imaginary parts. Watch magnitude and phase respond.",
  },
  {
    id: "matrix-transform",
    label: "Matrix transform",
    prompt: "Rotate a vector and compare its input and output coordinates.",
  },
  {
    id: "probability",
    label: "Probability",
    prompt: "Split one unit of probability between two possible outcomes.",
  },
];

const formatNumber = (value: number) => {
  const rounded = Math.round(value * 100) / 100;
  return Object.is(rounded, -0) ? "0" : String(rounded);
};

function CoordinatePlane({
  input,
  output,
  title,
  description,
  inputLabel = "Input",
  outputLabel = "Output",
}: {
  input?: readonly [number, number];
  output: readonly [number, number];
  title: string;
  description: string;
  inputLabel?: string;
  outputLabel?: string;
}) {
  const toX = (value: number) => 150 + value * 22;
  const toY = (value: number) => 150 - value * 22;
  const arrow = (point: readonly [number, number], color: string, marker: string, label: string) => (
    <g>
      <line
        x1="150"
        y1="150"
        x2={toX(point[0])}
        y2={toY(point[1])}
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        markerEnd={`url(#${marker})`}
        className="motion-safe:transition-all motion-safe:duration-300"
      />
      <circle
        cx={toX(point[0])}
        cy={toY(point[1])}
        r="5"
        fill={color}
        stroke="#0f2032"
        strokeWidth="2"
        className="motion-safe:transition-all motion-safe:duration-300"
      />
      <text x={toX(point[0]) + 8} y={toY(point[1]) - 8} fill="#eaf4ff" fontSize="11">
        {label}
      </text>
    </g>
  );

  return (
    <figure>
      <svg
        viewBox="0 0 300 300"
        role="img"
        aria-labelledby="math-plane-title math-plane-description"
        className="aspect-square w-full rounded-2xl bg-[#091827]"
      >
        <title id="math-plane-title">{title}</title>
        <desc id="math-plane-description">{description}</desc>
        <defs>
          <marker id="arrow-blue" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#3987e5" />
          </marker>
          <marker id="arrow-orange" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#d95926" />
          </marker>
        </defs>
        {[-4, -2, 2, 4].map((tick) => (
          <g key={tick} stroke="#203449" strokeWidth="1">
            <line x1={toX(tick)} y1="18" x2={toX(tick)} y2="282" />
            <line x1="18" y1={toY(tick)} x2="282" y2={toY(tick)} />
          </g>
        ))}
        <line x1="18" y1="150" x2="282" y2="150" stroke="#52667a" />
        <line x1="150" y1="18" x2="150" y2="282" stroke="#52667a" />
        <text x="274" y="142" fill="#94a3b8" fontSize="11">x</text>
        <text x="158" y="26" fill="#94a3b8" fontSize="11">y</text>
        {input && arrow(input, "#3987e5", "arrow-blue", inputLabel)}
        {arrow(output, "#d95926", "arrow-orange", outputLabel)}
      </svg>
      <figcaption className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
        {input && <span><i className="mr-2 inline-block h-0.5 w-5 bg-[#3987e5] align-middle" />{inputLabel}</span>}
        <span><i className="mr-2 inline-block h-0.5 w-5 bg-[#d95926] align-middle" />{outputLabel}</span>
      </figcaption>
    </figure>
  );
}

function ComplexLab({ compact = false }: { compact?: boolean }) {
  const [real, setReal] = useState(3);
  const [imaginary, setImaginary] = useState(2);
  const magnitude = Math.hypot(real, imaginary);
  const phase = Math.atan2(imaginary, real) * 180 / Math.PI;

  return (
    <div className={compact ? "grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]" : "grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"}>
      <CoordinatePlane
        output={[real, imaginary]}
        title="Complex number on the complex plane"
        description={`The number ${real} plus ${imaginary} i is shown as an arrow from the origin to ${real}, ${imaginary}.`}
        outputLabel="z = a + bi"
      />
      <div className="space-y-5">
        <RangeControl label="Real part, a" value={real} min={-5} max={5} step={1} onChange={setReal} />
        <RangeControl label="Imaginary part, b" value={imaginary} min={-5} max={5} step={1} onChange={setImaginary} />
        <div className="rounded-xl border border-white/10 bg-black/10 p-4" aria-live="polite">
          <p className="font-mono text-lg text-white">z = {real} {imaginary < 0 ? "−" : "+"} {Math.abs(imaginary)}i</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-slate-500">Magnitude</dt><dd className="mt-1 text-slate-100">{formatNumber(magnitude)}</dd></div>
            <div><dt className="text-slate-500">Phase</dt><dd className="mt-1 text-slate-100">{formatNumber(phase)}°</dd></div>
          </dl>
          <p className="mt-4 text-xs leading-5 text-slate-400">Magnitude is the arrow&apos;s length. Phase is its angle from the positive real axis.</p>
        </div>
      </div>
    </div>
  );
}

function RangeControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  displayValue,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  displayValue?: string;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between gap-4 text-sm">
        <span className="text-slate-300">{label}</span>
        <output className="font-mono text-cyan-100">{displayValue ?? formatNumber(value)}</output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 h-6 w-full cursor-pointer accent-cyan-300"
      />
    </label>
  );
}

function MatrixLab({ compact = false }: { compact?: boolean }) {
  const [angle, setAngle] = useState(45);
  const radians = angle * Math.PI / 180;
  const input = [3, 1] as const;
  const output = [
    input[0] * Math.cos(radians) - input[1] * Math.sin(radians),
    input[0] * Math.sin(radians) + input[1] * Math.cos(radians),
  ] as const;
  const cosine = formatNumber(Math.cos(radians));
  const sine = formatNumber(Math.sin(radians));

  return (
    <div className={compact ? "grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]" : "grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"}>
      <CoordinatePlane
        input={input}
        output={output}
        title="Vector transformed by a rotation matrix"
        description={`The input vector 3, 1 is rotated by ${angle} degrees to ${formatNumber(output[0])}, ${formatNumber(output[1])}.`}
        inputLabel="v"
        outputLabel="Av"
      />
      <div className="space-y-5">
        <RangeControl label="Rotation angle" value={angle} min={-180} max={180} step={15} onChange={setAngle} displayValue={`${angle}°`} />
        <div className="rounded-xl border border-white/10 bg-black/10 p-4" aria-live="polite">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Transformation</p>
          <div className="mt-3 overflow-x-auto font-mono text-sm leading-7 text-slate-200">
            <p>A = [[{cosine}, {formatNumber(-Math.sin(radians))}],</p>
            <p className="pl-8">[{sine}, {cosine}]]</p>
            <p className="mt-2">A[3, 1] = [{formatNumber(output[0])}, {formatNumber(output[1])}]</p>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-400">The vector&apos;s length stays fixed because a rotation matrix only changes direction.</p>
        </div>
      </div>
    </div>
  );
}

function ProbabilityLab({ compact = false }: { compact?: boolean }) {
  const [probabilityZero, setProbabilityZero] = useState(70);
  const rows = [
    { outcome: "0", probability: probabilityZero, amplitude: Math.sqrt(probabilityZero / 100) },
    { outcome: "1", probability: 100 - probabilityZero, amplitude: Math.sqrt((100 - probabilityZero) / 100) },
  ];

  return (
    <div className={compact ? "grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]" : "grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"}>
      <figure className="rounded-2xl bg-[#091827] p-5">
        <figcaption className="text-sm font-semibold text-slate-100">Measurement probability</figcaption>
        <p className="mt-1 text-xs text-slate-500">Bar length shows chance out of 100 repeated measurements.</p>
        <div className="mt-8 space-y-6">
          {rows.map((row, index) => (
            <div key={row.outcome} tabIndex={0} aria-label={`Outcome ${row.outcome}: ${row.probability} percent`} className="group rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-300">Outcome |{row.outcome}⟩</span>
                <strong className="text-white">{row.probability}%</strong>
              </div>
              <div className="h-6 rounded-r bg-white/[.06] p-[2px]">
                <div
                  className={`h-full rounded-r motion-safe:transition-[width] motion-safe:duration-300 ${index === 0 ? "bg-[#3987e5]" : "bg-[#d95926]"}`}
                  style={{ width: `${row.probability}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <table className="mt-8 w-full text-left text-xs">
          <caption className="sr-only">Probability values shown in the chart</caption>
          <thead className="text-slate-500"><tr><th className="pb-2 font-medium">Outcome</th><th className="pb-2 font-medium">Amplitude</th><th className="pb-2 text-right font-medium">Probability</th></tr></thead>
          <tbody className="divide-y divide-white/10 text-slate-200">
            {rows.map((row) => <tr key={row.outcome}><td className="py-2">|{row.outcome}⟩</td><td className="py-2 font-mono">{formatNumber(row.amplitude)}</td><td className="py-2 text-right">{row.probability}%</td></tr>)}
          </tbody>
        </table>
      </figure>
      <div className="space-y-5">
        <RangeControl label="Chance of outcome 0" value={probabilityZero} min={0} max={100} step={5} onChange={setProbabilityZero} displayValue={`${probabilityZero}%`} />
        <div className="rounded-xl border border-white/10 bg-black/10 p-4" aria-live="polite">
          <p className="font-mono text-sm leading-7 text-slate-100">|ψ⟩ = {formatNumber(rows[0].amplitude)}|0⟩ + {formatNumber(rows[1].amplitude)}|1⟩</p>
          <p className="mt-3 text-xs leading-5 text-slate-400">Born rule: square each amplitude. The two probabilities always sum to 100%.</p>
        </div>
      </div>
    </div>
  );
}

function ConceptDiagram({ kind }: { kind: MathVisualizationKind }) {
  const items: Record<Exclude<MathVisualizationKind, LabKind>, { title: string; equation: string; blocks: readonly string[]; note: string }> = {
    vector: {
      title: "Components become direction",
      equation: "v = [3, 4]  →  ‖v‖ = 5  →  v̂ = [0.6, 0.8]",
      blocks: ["x = 3", "y = 4", "length = 5"],
      note: "Normalization preserves direction while making the vector's length equal to one.",
    },
    "matrix-multiplication": {
      title: "Transformations compose right to left",
      equation: "(AB)v = A(Bv)",
      blocks: ["v", "Bv", "A(Bv)"],
      note: "Each output becomes the next input. Swapping A and B can produce a different result.",
    },
    "inner-product": {
      title: "Overlap becomes one number",
      equation: "a · b = a₁b₁ + a₂b₂",
      blocks: ["same direction: 1", "perpendicular: 0", "opposite: −1"],
      note: "For unit vectors, the inner product tracks how closely their directions agree.",
    },
    eigenvector: {
      title: "A direction that does not turn",
      equation: "Av = λv",
      blocks: ["input v", "scale by λ", "output λv"],
      note: "The output stays on the same line as the input; only its length or sign changes.",
    },
    "tensor-product": {
      title: "Every component pairs with every other",
      equation: "[a, b] ⊗ [c, d] = [ac, ad, bc, bd]",
      blocks: ["|00⟩", "|01⟩", "|10⟩", "|11⟩"],
      note: "Two two-component systems combine into one four-component state.",
    },
  };
  const item = items[kind as Exclude<MathVisualizationKind, LabKind>];

  return (
    <figure className="rounded-2xl bg-[#091827] p-6">
      <figcaption className="text-sm font-semibold text-slate-100">{item.title}</figcaption>
      <p className="mt-5 overflow-x-auto rounded-xl border border-white/10 bg-black/10 p-4 font-mono text-sm text-cyan-100">{item.equation}</p>
      <div className={`mt-6 grid gap-2 ${item.blocks.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "sm:grid-cols-3"}`}>
        {item.blocks.map((block, index) => (
          <div key={block} className="relative rounded-xl border border-white/10 bg-white/[.03] px-3 py-4 text-center text-xs text-slate-300">
            <span className="mb-2 block font-mono text-[10px] text-slate-500">{String(index + 1).padStart(2, "0")}</span>
            {block}
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm leading-6 text-slate-400">{item.note}</p>
    </figure>
  );
}

export function MathVisualization({ kind, compact = false }: { kind: MathVisualizationKind; compact?: boolean }) {
  if (kind === "complex-plane") return <ComplexLab compact={compact} />;
  if (kind === "matrix-transform") return <MatrixLab compact={compact} />;
  if (kind === "probability") return <ProbabilityLab compact={compact} />;
  return <ConceptDiagram kind={kind} />;
}

export function MathIntuitionLab() {
  const [active, setActive] = useState<LabKind>("complex-plane");
  const selected = LABS.find((lab) => lab.id === active) ?? LABS[0];

  return (
    <section aria-labelledby="math-lab-title" className="panel overflow-hidden rounded-3xl">
      <div className="border-b border-white/10 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-300">Try before you memorize</p>
            <h2 id="math-lab-title" className="mt-2 text-2xl font-semibold tracking-tight">Math intuition lab</h2>
          </div>
          <span className="rounded-full border border-cyan-300/20 px-3 py-1 font-mono text-[10px] text-cyan-200">INTERACTIVE</span>
        </div>
        <div role="tablist" aria-label="Choose a math visualization" className="mt-6 flex gap-2 overflow-x-auto pb-1">
          {LABS.map((lab) => (
            <button
              key={lab.id}
              id={`math-tab-${lab.id}`}
              role="tab"
              aria-selected={active === lab.id}
              aria-controls="math-lab-panel"
              onClick={() => setActive(lab.id)}
              className={`min-h-11 shrink-0 rounded-xl border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${active === lab.id ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100" : "border-white/10 text-slate-400 hover:border-white/25 hover:text-white"}`}
            >
              {lab.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-400">{selected.prompt}</p>
      </div>
      <div id="math-lab-panel" role="tabpanel" aria-labelledby={`math-tab-${active}`} className="p-5 sm:p-7">
        <MathVisualization kind={active} />
      </div>
    </section>
  );
}
