import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import PageContainer from "@/components/layout/PageContainer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-muted/30">
      <AppSidebar />

      <div className="flex flex-1 flex-col">
        <AppHeader />

        <PageContainer>{children}</PageContainer>
      </div>
    </div>
  );
}
