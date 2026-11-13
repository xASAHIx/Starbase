import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Starbase — Open-source discoveries",
  description: "An editorial directory of open-source projects, automatically synced from GitHub stars.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}