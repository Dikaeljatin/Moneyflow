import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-rose-50 via-white to-rose-100/50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
          <div className="p-5 md:p-7 lg:p-10 max-w-[1440px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
