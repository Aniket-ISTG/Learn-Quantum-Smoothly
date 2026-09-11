import Link from "next/link";
import { getMathLesson, mathLessons, mathStages } from "@/data/math-lessons";
import { MathVisualization } from "@/components/math/math-visualizations";

export function MathLesson({ lessonSlug }: { lessonSlug: string }) {
  const lesson = getMathLesson(lessonSlug);

  if (!lesson) {
    return (
      <section className="lab-grid grid min-h-[calc(100vh-64px)] place-items-center px-5 py-16">
        <div className="panel max-w-lg rounded-3xl p-8 text-center">
          <p className="font-mono text-xs text-cyan-300">LESSON NOT FOUND</p>
          <h1 className="mt-3 text-3xl font-semibold">This math lesson is not available.</h1>
          <p className="mt-3 leading-7 text-slate-400">Choose one of the beginner lessons in the math foundations path.</p>
          <Link href="/learn/math" className="mt-7 inline-block rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950">Back to math foundations</Link>
        </div>
      </section>
    );
  }

  const lessonIndex = mathLessons.findIndex((item) => item.slug === lesson.slug);
  const stage = mathStages.find((item) => item.id === lesson.stage);
  const previous = mathLessons[lessonIndex - 1];
  const next = mathLessons[lessonIndex + 1];

  return (
    <section className="lab-grid min-h-[calc(100vh-64px)] px-5 py-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/learn/math" className="text-sm text-slate-400 hover:text-cyan-200">← Math foundations</Link>
          <span className="rounded-full border border-cyan-300/20 px-3 py-1 font-mono text-[11px] text-cyan-200">LESSON {String(lessonIndex + 1).padStart(2, "0")} · {lesson.estimatedMinutes} MIN</span>
        </div>

        <header className="mt-9 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">{stage?.label ?? "Math foundations"}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">{lesson.title}</h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">{lesson.summary}</p>
        </header>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_290px]">
          <main className="min-w-0 space-y-6">
            <section className="panel overflow-hidden rounded-3xl" aria-labelledby="explore-title">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
                <h2 id="explore-title" className="font-semibold">Explore the idea</h2>
                <span className="font-mono text-[10px] text-cyan-200">VISUAL FIRST</span>
              </div>
              <div className="p-5 sm:p-7"><MathVisualization kind={lesson.visualization} compact /></div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <div className="panel rounded-2xl p-5 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">Intuition</p>
                <h2 className="mt-2 text-lg font-semibold">What should I picture?</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">{lesson.intuition}</p>
              </div>
              <div className="panel rounded-2xl p-5 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-violet-300">Quantum connection</p>
                <h2 className="mt-2 text-lg font-semibold">Why does this matter?</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">{lesson.quantumConnection}</p>
              </div>
            </section>

            <section className="panel rounded-3xl p-5 sm:p-7" aria-labelledby="worked-example-title">
              <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">Worked example</p>
              <h2 id="worked-example-title" className="mt-2 text-xl font-semibold">{lesson.example.prompt}</h2>
              <ol className="mt-6 space-y-3">
                {lesson.example.steps.map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm leading-6 text-slate-300">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cyan-300/10 font-mono text-[10px] text-cyan-200">{index + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-6 rounded-xl border border-cyan-300/20 bg-cyan-300/[.06] p-4 text-sm leading-6 text-cyan-50"><strong>Answer:</strong> {lesson.example.answer}</div>
            </section>
          </main>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <section className="panel rounded-2xl p-5" aria-labelledby="outcomes-title">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Lesson goal</p>
              <h2 id="outcomes-title" className="mt-2 font-semibold">By the end, you can…</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                {lesson.outcomes.map((outcome) => <li key={outcome} className="flex gap-2"><span aria-hidden="true" className="text-cyan-300">✓</span><span>{outcome}</span></li>)}
              </ul>
            </section>
            <section className="panel rounded-2xl p-4 text-sm">
              <p className="px-1 text-xs font-bold uppercase tracking-wider text-slate-500">In this stage</p>
              <div className="mt-3 space-y-1">
                {mathLessons.filter((item) => item.stage === lesson.stage).map((item) => (
                  <Link key={item.slug} href={`/learn/math/${item.slug}`} aria-current={item.slug === lesson.slug ? "page" : undefined} className={`block rounded-lg px-3 py-2 ${item.slug === lesson.slug ? "bg-cyan-300/10 text-cyan-100" : "text-slate-400 hover:bg-white/[.04] hover:text-white"}`}>{item.title}</Link>
                ))}
              </div>
            </section>
          </aside>
        </div>

        <nav aria-label="Lesson navigation" className="mt-10 grid gap-3 sm:grid-cols-2">
          {previous ? <Link href={`/learn/math/${previous.slug}`} className="panel rounded-2xl p-5 text-sm text-slate-300 hover:border-white/25">← <span className="text-slate-500">Previous</span><strong className="mt-1 block text-white">{previous.title}</strong></Link> : <div />}
          {next ? <Link href={`/learn/math/${next.slug}`} className="panel rounded-2xl p-5 text-right text-sm text-slate-300 hover:border-white/25"><span className="text-slate-500">Next</span> →<strong className="mt-1 block text-white">{next.title}</strong></Link> : <Link href="/learn/fundamentals" className="panel rounded-2xl p-5 text-right text-sm text-slate-300 hover:border-white/25"><span className="text-slate-500">Next track</span> →<strong className="mt-1 block text-white">Quantum foundations</strong></Link>}
        </nav>
      </div>
    </section>
  );
}
