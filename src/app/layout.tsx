import type { Metadata } from "next";
import { Geist, Geist_Mono, Jacquarda_Bastarda_9 } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jacquarda = Jacquarda_Bastarda_9({
  variable: "--font-jacquarda",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Voice Chat - AI Assistant",
  description: "Voice-reactive AI chat interface with 3D blob visualization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jacquarda.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
