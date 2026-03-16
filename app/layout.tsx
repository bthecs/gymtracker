import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitTrack - Rutinas de Gimnasio",
  description: "Gestiona tus rutinas de gimnasio",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-zinc-950">{children}</body>
    </html>
  );
}
