import Link from "next/link";
import { getMathLessonsByStage, mathLessons, mathStages } from "@/data/math-lessons";
import { MathIntuitionLab } from "@/components/math/math-visualizations";

export function MathFoundations() {
  const totalMinutes = mathLessons.reduce((total, lesson) => total + lesson.estimatedMinutes, 0);

  return (
    <section className="aurora lab-grid min-h-[calc(100vh-64px)] px-5 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <Link href="/learn" className="text-sm text-slate-400 hover:text-cyan-200">← Learning map</Link>

        <div className="mt-9 grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_310px]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">The tools · Beginner path</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">See the math behind every quantum state.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Build the visual intuition you need for quantum computing—from arrows on a plane to probabilities and combined systems. No calculus required.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/learn/math/complex-numbers" className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950">Start with complex numbers →</Link>
              <a href="#intuition-lab" className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-slate-200 hover:border-white/30">Open the intuition lab</a>
            </div>
          </div>

          <aside className="panel rounded-2xl p-5" aria-label="Course summary">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Before you begin</p>
            <p className="mt-3 text-lg font-semibold">Basic arithmetic is enough.</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">We introduce each symbol through a picture, then connect it to the equation.</p>
            <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 text-sm">
              <div><dt className="text-slate-500">Lessons</dt><dd className="mt-1 font-semibold text-white">{mathLessons.length}</dd></div>
              <div><dt className="text-slate-500">Total time</dt><dd className="mt-1 font-semibold text-white">~{Math.round(totalMinutes / 60)} hours</dd></div>
            </dl>
          </aside>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-3">
          {[
            ["01", "Picture it", "Start with an arrow, grid, or set of outcomes."],
            ["02", "Change it", "Move a control and watch the equation respond."],
            ["03", "Use it", "Connect the idea directly to qubits and gates."],
          ].map(([number, title, description]) => (
            <div key={title} className="panel rounded-2xl p-5">
              <span className="font-mono text-xs text-cyan-300">{number}</span>
              <h2 className="mt-6 font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
            </div>
          ))}
        </div>

        <div id="intuition-lab" className="mt-12 scroll-mt-24"><MathIntuitionLab /></div>

        <section aria-labelledby="learning-path-title" className="mt-16">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">Recommended order</p>
          <h2 id="learning-path-title" className="mt-3 text-3xl font-semibold tracking-tight">Your math learning path</h2>
          <p className="mt-3 max-w-2xl leading-7 text-slate-400">Each stage adds one tool. Follow the order the first time; return to any lesson when a quantum idea needs a refresher.</p>

          <div className="mt-9 space-y-10">
            {mathStages.map((stage, stageIndex) => {
              const lessons = getMathLessonsByStage(stage.id);
              return (
                <div key={stage.id}>
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs text-cyan-300">STAGE {stageIndex + 1}</p>
                      <h3 className="mt-1 text-xl font-semibold">{stage.label}</h3>
                    </div>
                    <p className="max-w-md text-sm text-slate-500">{stage.description}</p>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {lessons.map((lesson) => {
                      const lessonNumber = mathLessons.findIndex((item) => item.slug === lesson.slug) + 1;
                      return (
                        <Link key={lesson.slug} href={`/learn/math/${lesson.slug}`} className="panel group flex min-h-40 flex-col rounded-2xl p-5 transition hover:-translate-y-0.5 hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
                          <div className="flex items-center justify-between gap-4">
                            <span className="font-mono text-xs text-cyan-300">{String(lessonNumber).padStart(2, "0")}</span>
                            <span className="text-xs text-slate-500">{lesson.estimatedMinutes} min</span>
                          </div>
                          <h4 className="mt-5 text-lg font-semibold group-hover:text-cyan-100">{lesson.title}</h4>
                          <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">{lesson.summary}</p>
                          <span className="mt-4 text-sm text-slate-500 group-hover:text-white">Explore lesson →</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </section>
  );
}
