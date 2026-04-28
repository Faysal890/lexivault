import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface">
      <TopNav />
      <SideNav />
      <main className="pt-16 pb-24 lg:pt-0 lg:pb-0 lg:pl-64 lg:min-h-dvh">
        <div className="px-4 max-w-2xl mx-auto lg:max-w-7xl lg:px-10 lg:py-8">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
