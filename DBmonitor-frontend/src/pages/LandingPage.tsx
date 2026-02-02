import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Database, Activity, Zap, BarChart3, Shield, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const heroTextVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      damping: 12,
      stiffness: 100,
      duration: 0.8
    }
  }
};

const slideUpVariants = {
  hidden: { y: 60, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      damping: 15,
      stiffness: 80,
      duration: 0.6
    }
  }
};

const floatAnimation = {
  initial: { 
    y: 0, 
    rotateX: 0, 
    rotateY: 0 
  },
  animate: {
    y: [-20, 20, -20],
    rotateX: [2, -2, 2],
    rotateY: [-3, 3, -3],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }
};

const navigationVariants = {
  fullWidth: {
    width: "100%",
    maxWidth: "100%", // Explicitly reset to prevent stuck narrow state
    backgroundColor: "transparent",
    backdropFilter: "blur(0px)",
    borderRadius: "0", // Explicitly reset to prevent stuck rounded corners
    padding: "1.5rem 2rem",
    boxShadow: "none",
    border: "none",
  },
  floating: {
    width: "90%",
    maxWidth: "80rem", // max-w-5xl equivalent (80rem = 1280px)
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(24px) saturate(180%)",
    borderRadius: "2rem",
    padding: "1rem 3rem",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
};

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll event for navigation transformation
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

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hero text split for stagger animation
  const heroLine1 = "Monitor every query,";
  const heroLine2 = "optimize every connection";



  return (
    <div className="min-h-screen bg-[var(--color-charcoal)] text-white relative overflow-hidden">
      {/* Aurora Background Effects */}
      <div className="aurora-bg fixed inset-0" />
      <div className="aurora-emerald fixed inset-0" />
      
      {/* Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center">
        <motion.nav
          className="flex justify-between items-center w-full"
          variants={navigationVariants}
          initial="fullWidth"
          animate={isScrolled ? "floating" : "fullWidth"}
          transition={{ 
            type: "spring",
            damping: 25,
            stiffness: 300,
            mass: 0.8,
            velocity: 2
          }}
        >
          {/* Logo - Left side */}
          <div className="flex items-center space-x-2">
            <Database className="h-8 w-8 text-[var(--color-emerald)]" />
            <span className="text-2xl font-bold bg-gradient-to-r from-[var(--color-emerald)] to-[var(--color-emerald-glow)] bg-clip-text text-transparent">
              DbMonitor
            </span>
          </div>
          
          {/* Desktop Navigation - Right side */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-[var(--color-emerald)] transition-colors">Features</a>
            <a href="#integrations" className="text-gray-300 hover:text-[var(--color-emerald)] transition-colors">Integrations</a>
            <a href="#pricing" className="text-gray-300 hover:text-[var(--color-emerald)] transition-colors">Pricing</a>
            <Link 
              to="/login" 
              className="px-4 py-2 bg-[var(--color-emerald)] hover:bg-[var(--color-emerald-glow)] text-white rounded-lg transition-all duration-200 font-medium"
            >
              Login
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-300 hover:text-[var(--color-emerald)]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </motion.nav>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ 
                type: "spring",
                damping: 20,
                stiffness: 300,
                duration: 0.3
              }}
              className="absolute top-full left-0 right-0 mt-4 p-6 backdrop-blur-sm bg-[rgba(11,14,17,0.9)] border border-[rgba(16,185,129,0.1)] rounded-xl"
            >
              <div className="flex flex-col space-y-3">
                <a href="#features" className="text-gray-300 hover:text-[var(--color-emerald)] transition-colors">Features</a>
                <a href="#integrations" className="text-gray-300 hover:text-[var(--color-emerald)] transition-colors">Integrations</a>
                <a href="#pricing" className="text-gray-300 hover:text-[var(--color-emerald)] transition-colors">Pricing</a>
                <Link 
                  to="/login" 
                  className="px-4 py-2 bg-[var(--color-emerald)] hover:bg-[var(--color-emerald-glow)] text-white rounded-lg transition-all duration-200 font-medium text-center"
                >
                  Login
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20 md:py-32">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <div className="block">
              {heroLine1.split('').map((char, index) => (
                <motion.span
                  key={index}
                  variants={heroTextVariants}
                  transition={{ delay: index * 0.03 }}
                >
                  {char}
                </motion.span>
              ))}
            </div>
            <span className="block bg-gradient-to-r from-[var(--color-emerald)] to-[var(--color-emerald-glow)] bg-clip-text text-transparent">
              {heroLine2.split('').map((char, index) => (
                <motion.span
                  key={index}
                  variants={heroTextVariants}
                  transition={{ delay: 0.5 + index * 0.03 }}
                >
                  {char}
                </motion.span>
              ))}
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            Deep insights into your database performance with real-time monitoring, 
            query optimization, and comprehensive analytics—all in one sleek dashboard.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            initial="hidden"
            animate="visible"
            variants={slideUpVariants}
          >
            <motion.div variants={slideUpVariants} transition={{ delay: 1.4 }}>
              <Link 
                to="/login" 
                className="px-8 py-4 bg-[var(--color-emerald)] hover:bg-[var(--color-emerald-glow)] text-white rounded-lg transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-[var(--color-emerald)]/25 transform hover:scale-105"
              >
                Get Started Free
              </Link>
            </motion.div>
          </motion.div>
          
          {/* 3D Dashboard Mockup */}
          <motion.div 
            className="relative max-w-5xl mx-auto perspective-1000"
            initial="initial"
            animate="animate"
            variants={floatAnimation}
          >
            <div className="relative transform-gpu hover:rotate-y-3 transition-transform duration-700 preserve-3d">
              <div className="bg-[rgba(16,185,129,0.1)] backdrop-blur-xl border border-[rgba(16,185,129,0.2)] rounded-2xl p-8 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-[rgba(11,14,17,0.8)] border border-[rgba(16,185,129,0.2)] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Active Queries</span>
                      <Activity className="h-4 w-4 text-[var(--color-emerald)]" />
                    </div>
                    <div className="text-2xl font-bold text-white">247</div>
                    <div className="text-xs text-[var(--color-emerald)]">↑ 12% from last hour</div>
                  </div>
                  
                  <div className="bg-[rgba(11,14,17,0.8)] border border-[rgba(16,185,129,0.2)] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Response Time</span>
                      <Zap className="h-4 w-4 text-[var(--color-emerald)]" />
                    </div>
                    <div className="text-2xl font-bold text-white">42ms</div>
                    <div className="text-xs text-[var(--color-emerald)]">↑ 8% faster</div>
                  </div>
                  
                  <div className="bg-[rgba(11,14,17,0.8)] border border-[rgba(16,185,129,0.2)] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Connections</span>
                      <Database className="h-4 w-4 text-[var(--color-emerald)]" />
                    </div>
                    <div className="text-2xl font-bold text-white">1,284</div>
                    <div className="text-xs text-gray-400">89% available</div>
                  </div>
                </div>
                
                <div className="bg-[rgba(11,14,17,0.8)] border border-[rgba(16,185,129,0.2)] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-medium">Query Performance</h3>
                    <BarChart3 className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">SELECT users.*</span>
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-24 bg-[rgba(16,185,129,0.2)] rounded-full overflow-hidden">
                          <div className="h-full w-3/4 bg-[var(--color-emerald)] rounded-full"></div>
                        </div>
                        <span className="text-xs text-gray-400">28ms</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">UPDATE orders</span>
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-24 bg-[rgba(16,185,129,0.2)] rounded-full overflow-hidden">
                          <div className="h-full w-1/2 bg-[var(--color-emerald)] rounded-full"></div>
                        </div>
                        <span className="text-xs text-gray-400">45ms</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20 bg-[rgba(11,14,17,0.6)]">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <span className="bg-gradient-to-r from-[var(--color-emerald)] to-[var(--color-emerald-glow)] bg-clip-text text-transparent">
              Deep insights, powerful features
            </span>
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div 
              className="bg-[rgba(16,185,129,0.05)] backdrop-blur-sm border border-[rgba(16,185,129,0.1)] rounded-xl p-6 hover:border-[var(--color-emerald)] transition-all duration-300 group"
              initial={{ y: 60, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="w-12 h-12 bg-[var(--color-emerald)]/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[var(--color-emerald)]/30 transition-colors">
                <Activity className="h-6 w-6 text-[var(--color-emerald)]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Real-time Monitoring</h3>
              <p className="text-gray-400 leading-relaxed">Track every query as it happens with sub-second latency monitoring and instant alerts.</p>
            </motion.div>
            
            <motion.div 
              className="bg-[rgba(16,185,129,0.05)] backdrop-blur-sm border border-[rgba(16,185,129,0.1)] rounded-xl p-6 hover:border-[var(--color-emerald)] transition-all duration-300 group"
              initial={{ y: 60, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="w-12 h-12 bg-[var(--color-emerald)]/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[var(--color-emerald)]/30 transition-colors">
                <Shield className="h-6 w-6 text-[var(--color-emerald)]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Security Insights</h3>
              <p className="text-gray-400 leading-relaxed">Detect anomalous queries and potential security threats with AI-powered pattern recognition.</p>
            </motion.div>
            
            <motion.div 
              className="bg-[rgba(16,185,129,0.05)] backdrop-blur-sm border border-[rgba(16,185,129,0.1)] rounded-xl p-6 hover:border-[var(--color-emerald)] transition-all duration-300 group"
              initial={{ y: 60, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="w-12 h-12 bg-[var(--color-emerald)]/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[var(--color-emerald)]/30 transition-colors">
                <Cpu className="h-6 w-6 text-[var(--color-emerald)]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Performance Optimization</h3>
              <p className="text-gray-400 leading-relaxed">Get actionable recommendations to optimize query performance and reduce database load.</p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <motion.footer 
        className="relative z-10 px-6 py-12 border-t border-[rgba(16,185,129,0.1)]"
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Database className="h-6 w-6 text-[var(--color-emerald)]" />
            <span className="text-xl font-bold bg-gradient-to-r from-[var(--color-emerald)] to-[var(--color-emerald-glow)] bg-clip-text text-transparent">
              DbMonitor
            </span>
          </div>
          <p className="text-gray-400">© 2026 DbMonitor. All rights reserved.</p>
        </div>
      </motion.footer>
    </div>
  );
}