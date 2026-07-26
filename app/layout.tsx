import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sano — NYC restaurant inspection context",
  description:
    "Explore NYC restaurants through public inspection history, clear trajectories, and honest data limitations."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
