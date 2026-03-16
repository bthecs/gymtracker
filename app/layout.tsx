import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";
import BottomNav from "@/components/BottomNav";

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
      <body className="min-h-screen bg-zinc-950">
        <MobileHeader />
        <Sidebar />
        <main className="min-h-screen pb-20 pt-14 md:ml-[260px] md:pb-0 md:pt-0">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
