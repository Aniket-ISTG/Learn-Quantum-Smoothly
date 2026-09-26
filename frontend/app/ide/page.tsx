import CodeIDE from "@/components/code-ide";
import { PlatformHeader } from "@/components/platform/header";

export default function HomePage() {
  return (
    <>
      <PlatformHeader />
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_30%),linear-gradient(180deg,#f8fbff_0%,#edf5ff_100%)] px-3 py-5 sm:px-5 lg:px-7 lg:py-6">
        <div className="mx-auto w-full max-w-[1450px]">
          <CodeIDE />
        </div>
      </main>
    </>
  );
}