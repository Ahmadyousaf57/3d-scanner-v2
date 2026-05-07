import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "3D Scanner — AI Model Generator",
  description: "Upload a photo and get a professional 3D model powered by Meshy AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
