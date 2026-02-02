import { useAppSelector, useAppDispatch } from "../hooks/store";
import type { Database } from "../store/databaseSlice";
import { fetchDatabases } from "../store/databaseSlice";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Database as DatabaseIcon, Trash2, Menu } from "lucide-react";
import { Button } from "../components/ui/button";
import { Sidebar } from "../components/Sidebar";
import axios from "../lib/axiosConfig";
import { AddDatabaseModal } from "../components/AddDatabaseModal";
import { useState, useEffect } from "react";

export function Databases() {
  const dispatch = useAppDispatch();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };
  const { items: databases, status } = useAppSelector(
    (state) => state.databases,
  );
  const [deleting, setDeleting] = useState<number | null>(null);

  // Fetch databases when component mounts
  useEffect(() => {
    dispatch(fetchDatabases());
  }, [dispatch]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this database?")) {
      return;
    }

    setDeleting(id);
    try {
      await axios.delete(`/api/databases/${id}`);
      // Refresh list using Redux action instead of page reload
      dispatch(fetchDatabases());
    } catch (error) {
      console.error("Failed to delete database:", error);
      alert("Failed to delete database");
    } finally {
      setDeleting(null);
    }
  };

  const handleSuccess = () => {
    // Refresh list using Redux action instead of page reload
    dispatch(fetchDatabases());
  };



  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:flex h-screen w-full">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>
        
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="border-b border-[rgba(16,185,129,0.1)] p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--color-emerald)] to-[var(--color-emerald-glow)] bg-clip-text text-transparent">
                Registered Databases
              </h1>
              <AddDatabaseModal onSuccess={handleSuccess} />
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6">
            {status === "loading" ? (
              <div className="text-center text-slate-400">Loading databases...</div>
            ) : databases.length === 0 ? (
              <div className="text-center text-slate-400 py-12">
                <DatabaseIcon size={48} className="mx-auto mb-4 opacity-50 text-emerald-500/50" />
                <p className="text-lg">No databases registered yet</p>
                <p className="text-sm mt-2 text-slate-500">
                  Click "Add Database" to register your first database
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {databases.map((db: Database) => (
                  <Card
                    key={db.id}
                    className="bg-[rgba(16,185,129,0.05)] backdrop-blur-sm border-[rgba(16,185,129,0.1)] hover:border-[rgba(16,185,129,0.2)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] group"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2 text-white">
                            <DatabaseIcon size={18} className="text-emerald-500 group-hover:scale-110 transition-transform duration-300" />
                            {db.name}
                          </CardTitle>
                          <p className="text-xs text-slate-400 mt-1">
                            {db.db_type}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-xs bg-[rgba(0,0,0,0.3)] p-3 rounded-lg border border-[rgba(16,185,129,0.1)] font-mono">
                        <p className="text-emerald-400 break-all">
                          {db.connection_string}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleDelete(db.id)}
                        disabled={deleting === db.id}
                        variant="ghost"
                        size="sm"
                        className="w-full gap-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] border border-red-500/10 transition-all duration-200"
                      >
                        <Trash2 size={14} />
                        {deleting === db.id ? "Deleting..." : "Delete"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col min-h-screen relative">
        {/* Mobile Sidebar - Overlay */}
        <Sidebar 
          isMobile={true} 
          isOpen={isMobileSidebarOpen} 
          onClose={() => setIsMobileSidebarOpen(false)} 
        />
        
        {/* Mobile Content */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="border-b border-[rgba(16,185,129,0.1)] p-6">
            <div className="flex flex-col gap-4 items-start">
              {/* Row 1: Menu Button + Title */}
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleSidebar}
                  className="text-slate-400 hover:text-white"
                >
                  <Menu size={20} />
                </Button>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--color-emerald)] to-[var(--color-emerald-glow)] bg-clip-text text-transparent">
                  Registered Databases
                </h1>
              </div>
              {/* Row 2: Add Database Button */}
              <div className="w-full">
                <AddDatabaseModal onSuccess={handleSuccess} />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6">
            {status === "loading" ? (
              <div className="text-center text-slate-400">Loading databases...</div>
            ) : databases.length === 0 ? (
              <div className="text-center text-slate-400 py-12">
                <DatabaseIcon size={48} className="mx-auto mb-4 opacity-50 text-emerald-500/50" />
                <p className="text-lg">No databases registered yet</p>
                <p className="text-sm mt-2 text-slate-500">
                  Click "Add Database" to register your first database
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {databases.map((db: Database) => (
                  <Card
                    key={db.id}
                    className="bg-[rgba(16,185,129,0.05)] backdrop-blur-sm border-[rgba(16,185,129,0.1)] hover:border-[rgba(16,185,129,0.2)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] group"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2 text-white">
                            <DatabaseIcon size={18} className="text-emerald-500 group-hover:scale-110 transition-transform duration-300" />
                            {db.name}
                          </CardTitle>
                          <p className="text-xs text-slate-400 mt-1">
                            {db.db_type}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-xs bg-[rgba(0,0,0,0.3)] p-3 rounded-lg border border-[rgba(16,185,129,0.1)] font-mono">
                        <p className="text-emerald-400 break-all">
                          {db.connection_string}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleDelete(db.id)}
                        disabled={deleting === db.id}
                        variant="ghost"
                        size="sm"
                        className="w-full gap-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] border border-red-500/10 transition-all duration-200"
                      >
                        <Trash2 size={14} />
                        {deleting === db.id ? "Deleting..." : "Delete"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
