import Link from "next/link";
import { getMathLesson, mathLessons, mathStages } from "@/data/math-lessons";
import { MathVisualization } from "@/components/math/math-visualizations";

export function MathLesson({ lessonSlug }: { lessonSlug: string }) {
  const lesson = getMathLesson(lessonSlug);

  if (!lesson) {
    return (
      <section className="book-shell grid min-h-[calc(100vh-64px)] place-items-center px-5 py-16">
        <div className="panel max-w-lg rounded-3xl p-8 text-center">
          <p className="font-mono text-xs text-[#a75b39]">LESSON NOT FOUND</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">This math lesson is not available.</h1>
          <p className="mt-3 leading-7 text-slate-600">Choose one of the beginner lessons in the math foundations path.</p>
          <Link href="/learn/math" className="mt-7 inline-block rounded-xl bg-[#b8643e] px-5 py-3 text-sm font-bold text-white">Back to math foundations</Link>
        </div>
      </section>
    );
  }

  const lessonIndex = mathLessons.findIndex((item) => item.slug === lesson.slug);
  const stage = mathStages.find((item) => item.id === lesson.stage);
  const previous = mathLessons[lessonIndex - 1];
  const next = mathLessons[lessonIndex + 1];

  return (
    <section className="book-shell min-h-[calc(100vh-64px)] px-4 py-6 lg:px-6">
      <div className="mx-auto max-w-[1500px]">
        <div className="doc-layout">
          <aside className="doc-sidebar" aria-label="Math lesson navigation">
            <div className="doc-sidebar-header">
              <Link href="/learn/math" className="text-sm text-slate-500 hover:text-[#a75b39]">← Math foundations</Link>
            </div>

            <nav className="doc-nav">
              <div className="doc-section-title">{stage?.label ?? "Math foundations"}</div>
              <ul>
                {mathLessons
                  .filter((item) => item.stage === lesson.stage)
                  .map((item) => (
                    <li key={item.slug}>
                      <a href={`/learn/math/${item.slug}`} className={item.slug === lesson.slug ? "is-active" : ""}>
                        {item.title}
                      </a>
                    </li>
                  ))}
              </ul>
            </nav>
          </aside>

          <main className="doc-article">
            <article className="book-article">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="book-kicker">{stage?.label ?? "Math foundations"}</span>
                <span className="rounded-full border border-[#eadfce] bg-white/70 px-3 py-1 font-mono text-[11px] text-[#a75b39]">
                  LESSON {String(lessonIndex + 1).padStart(2, "0")} · {lesson.estimatedMinutes} MIN
                </span>
              </div>

              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                {lesson.title}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{lesson.summary}</p>

              <section className="mt-10 panel overflow-hidden rounded-3xl" aria-labelledby="explore-title">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eadfce] px-5 py-4 sm:px-6">
                  <h2 id="explore-title" className="text-xl font-semibold text-slate-900">Visual anchor</h2>
                  <span className="font-mono text-[10px] text-[#a75b39]">START HERE</span>
                </div>
                <div className="p-5 sm:p-7"><MathVisualization kind={lesson.visualization} compact /></div>
              </section>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="panel rounded-2xl p-5 sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a75b39]">Key idea</p>
                  <h2 className="mt-2 text-lg font-semibold text-slate-900">What do I picture?</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{lesson.intuition}</p>
                </div>
                <div className="panel rounded-2xl p-5 sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a75b39]">Why it matters</p>
                  <h2 className="mt-2 text-lg font-semibold text-slate-900">How does this show up in quantum computing?</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{lesson.quantumConnection}</p>
                </div>
              </div>

              <section className="mt-8 panel rounded-3xl p-5 sm:p-7" aria-labelledby="worked-example-title">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a75b39]">Worked example</p>
                <h2 id="worked-example-title" className="mt-2 text-xl font-semibold text-slate-900">{lesson.example.prompt}</h2>
                <ol className="mt-6 space-y-3">
                  {lesson.example.steps.map((step, index) => (
                    <li key={step} className="flex gap-3 text-sm leading-6 text-slate-600">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#f4e2d4] font-mono text-[10px] text-[#a75b39]">{index + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-6 rounded-xl border border-[#eddcc5] bg-[#fffaf5] p-4 text-sm leading-6 text-slate-700">
                  <strong className="font-semibold text-slate-900">Answer:</strong> {lesson.example.answer}
                </div>
              </section>

              <section className="mt-8 panel rounded-3xl p-5 sm:p-7" aria-labelledby="quiz-title">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a75b39]">Quick check</p>
                <h2 id="quiz-title" className="mt-2 text-xl font-semibold text-slate-900">Test your understanding</h2>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {[
                    "What should the visualization help you see first?",
                    "What does the formula represent in plain language?",
                    "Which outcome is the most important to explain?",
                  ].map((question) => (
                    <div key={question} className="rounded-2xl border border-[#eadfce] bg-[#fffaf5] p-4 text-sm leading-6 text-slate-600">
                      {question}
                    </div>
                  ))}
                </div>
              </section>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {previous ? (
                  <Link href={`/learn/math/${previous.slug}`} className="panel rounded-2xl p-5 text-sm text-slate-600 hover:border-[#d9a27d]">
                    <span className="text-slate-500">← Previous</span>
                    <strong className="mt-1 block text-slate-900">{previous.title}</strong>
                  </Link>
                ) : <div />}
                {next ? (
                  <Link href={`/learn/math/${next.slug}`} className="panel rounded-2xl p-5 text-right text-sm text-slate-600 hover:border-[#d9a27d]">
                    <span className="text-slate-500">Next →</span>
                    <strong className="mt-1 block text-slate-900">{next.title}</strong>
                  </Link>
                ) : (
                  <Link href="/learn/fundamentals" className="panel rounded-2xl p-5 text-right text-sm text-slate-600 hover:border-[#d9a27d]">
                    <span className="text-slate-500">Next track →</span>
                    <strong className="mt-1 block text-slate-900">Quantum foundations</strong>
                  </Link>
                )}
              </div>
            </article>
          </main>
        </div>
      </div>
    </section>
  );
}
