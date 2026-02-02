import { AddDatabaseModal } from "./AddDatabaseModal";
import { DatabaseSelector } from "./DatabaseSelector";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  onRefresh: () => void;
  onToggleSidebar?: () => void;
}

export function DashboardHeader({ onRefresh, onToggleSidebar }: Props) {
  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:flex flex-row justify-between items-center p-6 border-b border-[rgba(16,185,129,0.1)]">
        {/* Title - Far Left */}
        <h1 className="text-2xl font-bold text-white font-inter">System Overview</h1>
        
        {/* Controls Group - Far Right */}
        <div className="flex items-center gap-4">
          {/* Database Selector and Add Database - h-10 for perfect alignment */}
          <div className="h-10 flex items-center gap-4">
            <DatabaseSelector />
            <AddDatabaseModal onSuccess={onRefresh} />
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col gap-4 p-4 border-b border-[rgba(16,185,129,0.1)]">
        {/* Header Row - Menu Toggle + Title */}
        <div className="flex flex-row items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="text-slate-400 hover:text-white"
          >
            <Menu size={20} />
          </Button>
          <h1 className="text-xl font-bold text-white font-inter">System Overview</h1>
        </div>
        
        {/* Controls Row - Stacked vertically, w-full for easier tapping */}
        <div className="flex flex-col w-full gap-3">
          <DatabaseSelector />
          <AddDatabaseModal onSuccess={onRefresh} />
        </div>
      </div>
    </>
  );
}
