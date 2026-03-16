import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "FitTrack - Rutinas de Gimnasio",
  description: "Gestiona tus rutinas de gimnasio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen">
        <Sidebar />
        <main className="ml-[260px] min-h-screen">{children}</main>
      </body>
    </html>
  );
}
