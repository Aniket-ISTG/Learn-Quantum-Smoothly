import Link from "next/link";
import { getMathLessonsByStage, mathLessons, mathStages } from "@/data/math-lessons";
import { MathIntuitionLab } from "@/components/math/math-visualizations";

export function MathFoundations() {
  const totalMinutes = mathLessons.reduce((total, lesson) => total + lesson.estimatedMinutes, 0);

  return (
    <section className="book-shell min-h-[calc(100vh-64px)] px-4 py-6 lg:px-6">
      <div className="mx-auto max-w-[1500px]">
        <div className="doc-layout">
          <aside className="doc-sidebar" aria-label="Math chapter navigation">
            <div className="doc-sidebar-header">
              <Link href="/learn" className="text-sm text-slate-500 hover:text-[#a75b39]">← Learning map</Link>
            </div>

            <nav className="doc-nav">
              <div className="doc-section-title">Math foundations</div>
              <ul>
                <li><a href="#overview" className="is-active">Overview</a></li>
                <li><a href="#visual-guide">Visual guide</a></li>
                {mathStages.map((stage, index) => (
                  <li key={stage.id}>
                    <a href={`#stage-${stage.id}`}>
                      {index + 1}. {stage.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <main className="doc-article">
            <article id="overview" className="book-article">
              <p className="book-kicker">Math foundations</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Learn the language behind quantum states.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                This section is written like a book: first the intuition, then the picture, then the rule. Quantum computing becomes much easier to follow when each concept is introduced as a visual object you can reason about before it becomes notation.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/learn/math/complex-numbers" className="btn-primary">Start with complex numbers →</Link>
                <a href="#visual-guide" className="btn-secondary">Open the visual guide</a>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {[
                  ["01", "Picture it", "Look for the geometry before the algebra."],
                  ["02", "Translate it", "Turn the picture into a symbolic rule."],
                  ["03", "Use it", "Apply the idea to states, gates, and measurement."],
                ].map(([n, title, text]) => (
                  <div key={title} className="rounded-2xl border border-[#efe1d2] bg-[#fffaf5] p-4">
                    <p className="font-mono text-[11px] text-[#a75b39]">{n}</p>
                    <h2 className="mt-2 text-lg font-semibold text-slate-900">{title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 rounded-3xl border border-[#e8d9c8] bg-white/80 p-6 shadow-[0_10px_30px_rgba(53,36,27,0.05)]">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a75b39]">Before you begin</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xl font-semibold text-slate-900">A little arithmetic is enough.</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Each chapter starts with a concrete picture and then narrows to the exact idea you need for quantum mechanics.
                    </p>
                  </div>
                  <dl className="grid grid-cols-2 gap-3 border-l border-[#eadfce] pl-4 text-sm">
                    <div>
                      <dt className="text-slate-500">Lessons</dt>
                      <dd className="mt-1 font-semibold text-slate-900">{mathLessons.length}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Study time</dt>
                      <dd className="mt-1 font-semibold text-slate-900">~{Math.round(totalMinutes / 60)} h</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </article>

            <section id="visual-guide" className="mt-16 scroll-mt-24">
              <p className="book-kicker">Visual guide</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Build intuition before formalism</h2>
              <div className="mt-6"><MathIntuitionLab /></div>
            </section>

            <section className="mt-16" aria-labelledby="learning-path-title">
              <p className="book-kicker">Recommended order</p>
              <h2 id="learning-path-title" className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">The chapters in this book</h2>
              <div className="mt-8 space-y-8">
                {mathStages.map((stage, stageIndex) => {
                  const lessons = getMathLessonsByStage(stage.id);
                  return (
                    <div key={stage.id} id={`stage-${stage.id}`} className="book-section">
                      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#eadfce] pb-3">
                        <div>
                          <p className="font-mono text-[11px] tracking-[0.18em] text-[#a75b39]">CHAPTER {stageIndex + 1}</p>
                          <h3 className="mt-1 text-xl font-semibold text-slate-900">{stage.label}</h3>
                        </div>
                        <p className="max-w-md text-sm text-slate-500">{stage.description}</p>
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {lessons.map((lesson) => {
                          const lessonNumber = mathLessons.findIndex((item) => item.slug === lesson.slug) + 1;
                          return (
                            <Link
                              key={lesson.slug}
                              href={`/learn/math/${lesson.slug}`}
                              className="panel panel-hover group flex min-h-[190px] flex-col rounded-2xl p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d9986e]"
                            >
                              <div className="flex items-center justify-between gap-4">
                                <span className="font-mono text-[11px] text-[#a75b39]">{String(lessonNumber).padStart(2, "0")}</span>
                                <span className="text-xs text-slate-500">{lesson.estimatedMinutes} min</span>
                              </div>
                              <h4 className="mt-5 text-lg font-semibold text-slate-900 group-hover:text-[#a75b39]">{lesson.title}</h4>
                              <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">{lesson.summary}</p>
                              <span className="mt-4 text-sm font-medium text-[#a75b39]">Read chapter →</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </main>
        </div>
      </div>
    </section>
  );
}
