import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  LayoutDashboard,
  Database,
  Bell,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useAppSelector } from "../hooks/store";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "./ui/button";

const navigationVariants = {
  fullWidth: {
    width: "100%",
    maxWidth: "100vw",
    borderRadius: "0rem",
    backgroundColor: "rgba(13, 13, 15, 0.8)",
    backdropFilter: "blur(8px)",
    borderBottom: "1px solid rgba(51, 65, 85, 0.2)",
    padding: "1.5rem 2rem",
    boxShadow: "none",
    borderLeft: "none",
    borderRight: "none",
    borderTop: "none",
  },
  floating: {
    width: "90%",
    maxWidth: "1200px",
    borderRadius: "2rem",
    backgroundColor: "rgba(13, 13, 15, 0.85)",
    backdropFilter: "blur(24px)",
    border: "1px solid rgba(51, 65, 85, 0.3)",
    padding: "1rem 2rem",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  },
};

export function AnimatedNavigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/databases", label: "Databases", icon: Database },
    { path: "/alerts", label: "Alerts", icon: Bell },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      <motion.nav
        className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 flex justify-between items-center"
        variants={navigationVariants}
        initial="fullWidth"
        animate={isScrolled ? "floating" : "fullWidth"}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 300,
          mass: 0.8,
        }}
      >
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Database className="h-8 w-8 text-blue-500" />
          <span className="text-xl font-bold text-blue-500">DB Monitor</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Button
              key={path}
              onClick={() => navigate(path)}
              variant="ghost"
              className={`flex items-center gap-2 transition-all duration-200 ${
                isActive(path)
                  ? "text-blue-400 bg-slate-800/40"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/20"
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Button>
          ))}
        </div>

        {/* User Section */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <img
                src={user.picture}
                alt="Avatar"
                className="w-8 h-8 rounded-full border border-slate-700"
              />
              <span className="text-sm text-slate-300">{user.name}</span>
              <a
                href={`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`}
                className="text-slate-500 hover:text-red-400 transition-colors"
              >
                <LogOut size={18} />
              </a>
            </div>
          ) : (
            <Link to="/login">
              <Button className="bg-blue-500 hover:bg-blue-600">
                Login
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-slate-400 hover:text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </motion.nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 w-[90%] max-w-md backdrop-blur-lg bg-slate-900/90 border border-slate-700/50 rounded-2xl p-6"
        >
          <div className="space-y-4">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Button
                key={path}
                onClick={() => {
                  navigate(path);
                  setIsMobileMenuOpen(false);
                }}
                variant="ghost"
                className={`w-full justify-start gap-3 ${
                  isActive(path)
                    ? "bg-slate-800/40 text-blue-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Button>
            ))}
            
            {user ? (
              <div className="pt-4 border-t border-slate-700">
                <div className="flex items-center gap-3 px-3">
                  <img
                    src={user.picture}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full border border-slate-700"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-300">{user.name}</p>
                    <a
                      href={`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`}
                      className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 mt-1"
                    >
                      <LogOut size={10} /> Logout
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full bg-blue-500 hover:bg-blue-600">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
}