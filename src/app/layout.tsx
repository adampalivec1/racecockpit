import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Race Cockpit",
  description: "Real-time coach dashboard for half marathon monitoring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className="dark h-full antialiased">
      <body className="min-h-full bg-[#1a1a2e] text-slate-200">{children}</body>
    </html>
  );
}
