import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "EasySchema — Describe it, we draw the database",
  description: "Plain-English specs become validated tables, foreign keys, seed inserts and a live ER diagram — exportable in three SQL dialects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${spaceGrotesk.variable} ${plexMono.variable} font-sans bg-background text-ink min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
