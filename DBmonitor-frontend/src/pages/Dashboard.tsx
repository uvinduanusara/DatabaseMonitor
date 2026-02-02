import { useAppDispatch } from "../hooks/store";
import { useState } from "react";
import { fetchDatabases } from "../store/databaseSlice";
import { fetchMetrics } from "../store/metricsSlice";
import { Sidebar } from "../components/Sidebar";
import { DashboardHeader } from "../components/DashboardHeader";
import { MetricsGrid } from "../components/MetricsGrid";

export function Dashboard() {
  const dispatch = useAppDispatch();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleRefresh = () => {
    dispatch(fetchDatabases());
    dispatch(fetchMetrics());
  };

  const handleToggleSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="min-h-screen w-full text-slate-100 relative z-10">
      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col">
        {/* Mobile Sidebar - Overlay */}
        <Sidebar 
          isMobile={true} 
          isOpen={isMobileSidebarOpen} 
          onClose={() => setIsMobileSidebarOpen(false)} 
        />
        
        {/* Mobile Main Content */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          <DashboardHeader onRefresh={handleRefresh} onToggleSidebar={handleToggleSidebar} />
          <MetricsGrid />
        </main>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex h-screen w-full">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>
        
        {/* Desktop Main Content */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          <DashboardHeader onRefresh={handleRefresh} onToggleSidebar={handleToggleSidebar} />
          <MetricsGrid />
        </main>
      </div>
    </div>
  );
}
