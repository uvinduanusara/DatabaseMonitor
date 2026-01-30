import { useAppDispatch, useAppSelector } from "../hooks/store";
import { setSelectedDatabase } from "../store/selectedDatabaseSlice";
import type { Database } from "../store/databaseSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Database as DatabaseIcon } from "lucide-react";

export function DatabaseSelector() {
  const dispatch = useAppDispatch();
  const { items: databases } = useAppSelector((state) => state.databases);
  const { selectedId } = useAppSelector((state) => state.selectedDatabase);

  const handleSelect = (value: string) => {
    const id = value === "all" ? null : parseInt(value, 10);
    dispatch(setSelectedDatabase(id));
  };

  return (
    <div className="flex items-center gap-2">
      <DatabaseIcon size={18} className="text-slate-400" />
      <Select
        value={selectedId ? selectedId.toString() : "all"}
        onValueChange={handleSelect}
      >
        <SelectTrigger className="w-[250px] bg-slate-800 border-slate-700 text-white">
          <SelectValue placeholder="Select a database..." />
        </SelectTrigger>
        <SelectContent className="bg-slate-900 border-slate-700 text-white">
          <SelectItem value="all">All Databases</SelectItem>
          {databases.map((db: Database) => (
            <SelectItem key={db.id} value={db.id.toString()}>
              {db.name} ({db.db_type})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
