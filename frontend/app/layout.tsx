import type { Metadata } from "next";
import "./globals.css";
import Chat from "@/components/chat";

export const metadata: Metadata = {
  title: "Qubit Lab — Learn quantum by doing",
  description: "An interactive quantum computing laboratory.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        {children}
        <Chat />
      </body>
    </html>
  );
}
