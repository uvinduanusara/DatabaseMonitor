import { useAppSelector } from "../hooks/store";
import type { Database } from "../store/databaseSlice";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Database as DatabaseIcon, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import axios from "../lib/axiosConfig";
import { AddDatabaseModal } from "../components/AddDatabaseModal";
import { useState } from "react";

export function Databases() {
  const { items: databases, status } = useAppSelector(
    (state) => state.databases,
  );
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this database?")) {
      return;
    }

    setDeleting(id);
    try {
      await axios.delete(`http://localhost:5037/api/databases/${id}`, {
        withCredentials: true,
      });
      // Optionally refresh the list
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete database:", error);
      alert("Failed to delete database");
    } finally {
      setDeleting(null);
    }
  };

  const handleSuccess = () => {
    window.location.reload();
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0b] text-slate-100 overflow-hidden">
      <div className="border-b border-slate-800 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Registered Databases</h1>
          <AddDatabaseModal onSuccess={handleSuccess} />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {status === "loading" ? (
          <div className="text-center text-slate-400">Loading databases...</div>
        ) : databases.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            <DatabaseIcon size={48} className="mx-auto mb-4 opacity-50" />
            <p>No databases registered yet</p>
            <p className="text-sm mt-2">
              Click "Add Database" to register your first database
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {databases.map((db: Database) => (
              <Card
                key={db.id}
                className="bg-slate-900/40 border-slate-800 hover:border-slate-700 transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <DatabaseIcon size={18} className="text-blue-500" />
                        {db.name}
                      </CardTitle>
                      <p className="text-xs text-slate-400 mt-1">
                        {db.db_type}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs space-y-2 bg-slate-800/50 p-2 rounded border border-slate-700">
                    <p className="text-slate-300 break-all font-mono">
                      {db.connection_string}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDelete(db.id)}
                    disabled={deleting === db.id}
                    variant="destructive"
                    size="sm"
                    className="w-full gap-2 bg-red-900/40 hover:bg-red-900/60 text-red-400 border-red-800"
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
  );
}
