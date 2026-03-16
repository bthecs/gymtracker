import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";
import BottomNav from "@/components/BottomNav";

export default function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <MobileHeader />
      <Sidebar />
      <main className="min-h-screen pb-20 pt-14 md:ml-[260px] md:pb-0 md:pt-0">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
