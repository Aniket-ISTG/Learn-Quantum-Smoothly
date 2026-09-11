import Link from "next/link";

export function CircuitEditor() {
  return (
    <div className="panel rounded-2xl p-8 text-center">
      <p className="text-slate-600">
        The circuit editor is available in the full playground experience.
      </p>
      <Link href="/playground" className="btn-primary mt-4">
        Open playground →
      </Link>
    </div>
  );
}
