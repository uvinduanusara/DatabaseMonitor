import { useAppDispatch, useAppSelector } from "../hooks/store";
import { fetchDatabases } from "../store/databaseSlice";
import { fetchMetrics } from "../store/metricsSlice";
import { Sidebar } from "../components/Sidebar";
import { DashboardHeader } from "../components/DashboardHeader";
import { MetricsGrid } from "../components/MetricsGrid";

export function Dashboard() {
  const dispatch = useAppDispatch();

  const handleRefresh = () => {
    dispatch(fetchDatabases() as any);
    dispatch(fetchMetrics() as any);
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0b] text-slate-100">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader onRefresh={handleRefresh} />
        <MetricsGrid />
      </main>
    </div>
  );
}
