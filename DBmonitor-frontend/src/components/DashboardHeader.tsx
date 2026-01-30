import { AddDatabaseModal } from "./AddDatabaseModal";
import { DatabaseSelector } from "./DatabaseSelector";

interface Props {
  onRefresh: () => void;
}

export function DashboardHeader({ onRefresh }: Props) {
  return (
    <div className="flex justify-between items-center p-6 border-b border-slate-800 gap-4">
      <h1 className="text-2xl font-bold text-white">System Overview</h1>
      <div className="flex items-center gap-4">
        <DatabaseSelector />
        <AddDatabaseModal onSuccess={onRefresh} />
      </div>
    </div>
  );
}
