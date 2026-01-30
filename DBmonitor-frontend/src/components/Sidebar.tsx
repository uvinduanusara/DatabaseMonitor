import {
  LayoutDashboard,
  Database,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { useAppSelector } from "../hooks/store";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";

export function Sidebar() {
  const { user } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0d0d0f] flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-bold text-blue-500 flex items-center gap-2">
          <Database size={22} /> DB Monitor
        </h2>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <Button
          onClick={() => navigate("/")}
          variant="ghost"
          className={`w-full justify-start gap-3 ${
            isActive("/")
              ? "bg-slate-800/40 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <LayoutDashboard size={18} /> Dashboard
        </Button>
        <Button
          onClick={() => navigate("/databases")}
          variant="ghost"
          className={`w-full justify-start gap-3 ${
            isActive("/databases")
              ? "bg-slate-800/40 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Database size={18} /> Databases
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-slate-400 hover:text-white"
        >
          <Bell size={18} /> Alerts
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-slate-400 hover:text-white"
        >
          <Settings size={18} /> Settings
        </Button>
      </nav>

      <div className="p-4 mt-auto">
        <Separator className="mb-4 bg-slate-800" />
        {user && (
          <div className="flex items-center gap-3 px-2">
            <img
              src={user.picture}
              alt="Avatar"
              className="w-8 h-8 rounded-full border border-slate-700"
            />
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-medium truncate">{user.name}</p>
              <a
                href="http://localhost:5037/api/auth/logout"
                className="text-[10px] text-slate-500 hover:text-red-400 flex items-center gap-1 mt-0.5"
              >
                <LogOut size={10} /> Logout
              </a>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
