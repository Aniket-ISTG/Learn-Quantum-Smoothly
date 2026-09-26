import CodeIDE from "@/components/code-ide";
import { PlatformHeader } from "@/components/platform/header";

export default function HomePage() {
  return (
    <>
      <PlatformHeader />
      <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto w-full max-w-[1600px]">
          <CodeIDE />
        </div>
      </main>
    </>
  );
}