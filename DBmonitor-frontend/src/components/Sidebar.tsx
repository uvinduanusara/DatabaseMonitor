import {
  LayoutDashboard,
  Database,
  X,
  LogOut,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector, useAppDispatch } from "../hooks/store";
import { useLocation, useNavigate } from "react-router-dom";
import { performLogout } from "../store/authSlice";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export function Sidebar({ isOpen = true, onClose, isMobile = false }: SidebarProps = {}) {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleNavClick = (path: string) => {
    navigate(path);
    // Close mobile sidebar when navigation item is clicked
    if (isMobile && onClose) {
      onClose();
    }
  };

  const sidebarVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  };

  const sidebarContent = (
    <aside className="w-64 border-r border-[rgba(16,185,129,0.1)] bg-transparent backdrop-blur-md flex flex-col h-full">
      <div className="p-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-emerald-500 flex items-center gap-2">
          <Database size={22} className="text-emerald-500" /> DB Monitor
        </h2>
        {isMobile && onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X size={20} />
          </Button>
        )}
      </div>
      <nav className="flex-1 px-4 space-y-2">
        <Button
          onClick={() => handleNavClick("/dashboard")}
          variant="ghost"
          className={`w-full justify-start gap-3 transition-all duration-200 ${
            isActive("/dashboard")
              ? "bg-[rgba(16,185,129,0.15)] text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              : "text-slate-400 hover:text-emerald-400 hover:bg-[rgba(16,185,129,0.05)]"
          }`}
        >
          <LayoutDashboard size={18} className={isActive("/dashboard") ? "text-emerald-400" : ""} /> Dashboard
        </Button>
        <Button
          onClick={() => handleNavClick("/databases")}
          variant="ghost"
          className={`w-full justify-start gap-3 transition-all duration-200 ${
            isActive("/databases")
              ? "bg-[rgba(16,185,129,0.15)] text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              : "text-slate-400 hover:text-emerald-400 hover:bg-[rgba(16,185,129,0.05)]"
          }`}
        >
          <Database size={18} className={isActive("/databases") ? "text-emerald-400" : ""} /> Databases
        </Button>
      </nav>
      
      {/* Footer with User Info */}
      <div className="mt-auto p-4 space-y-3">
        <Separator className="bg-[rgba(16,185,129,0.1)]" />
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] flex items-center justify-center">
            <User size={16} className="text-slate-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-300 truncate">
              {user?.name || "Admin User"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          onClick={() => {
            dispatch(performLogout());
          }}
        >
          <LogOut size={16} />
          Logout
        </Button>
      </div>
    </aside>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Fixed Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={onClose}
            />
            {/* Sidebar Container - Fixed positioning */}
            <motion.aside
              initial="hidden"
              animate={isOpen ? "visible" : "hidden"}
              exit="hidden"
              variants={sidebarVariants}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-64"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  return sidebarContent;
}