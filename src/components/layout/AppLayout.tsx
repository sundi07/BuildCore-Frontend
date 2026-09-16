import { useState, type ReactNode } from "react";
import { DesktopSidebar, MobileSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export function AppLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <DesktopSidebar />
      <MobileSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onOpenMenu={() => setMenuOpen(true)} />
        <main className="flex-1 p-3 sm:p-4 lg:p-6">
          <div className="mx-auto w-full max-w-[1560px] space-y-5">{children}</div>
        </main>
        <footer className="border-t px-4 py-3 text-center text-xs text-muted-foreground">
          BUILDCORE · Construction Management · Procurement · Inventory · Finance · Sales · CRM —
          all in one platform
        </footer>
      </div>
    </div>
  );
}
