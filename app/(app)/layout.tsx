import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface">
      <TopNav />
      <main className="pt-16 pb-24 max-w-2xl mx-auto px-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
