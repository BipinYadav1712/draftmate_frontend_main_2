import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { API_CONFIG } from '../services/endpoints';
import ErrorBoundary from '../components/ErrorBoundary';
import { 
  Search, Bell, LayoutDashboard, FileText, Scale, FolderOpen, 
  Languages, Library, GraduationCap, Eye, Gavel, Wrench, 
  Settings, Menu, X, Zap, ChevronLeft, ChevronRight, LogOut,
  CreditCard, HelpCircle, BookOpen, MessageSquare, Gift, Bug, Copy, Share2, UploadCloud
} from 'lucide-react';

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/home" },
  { icon: Scale, label: "Legal Research", path: "/dashboard/research" },
  { icon: FolderOpen, label: "Document Management", path: "/dashboard/cases" },
  { icon: FileText, label: "My Drafts", path: "/dashboard/drafts" },
  { icon: Languages, label: "Translations", path: "/dashboard/translate" },
  { icon: Library, label: "Legal Library", path: "/dashboard/library" },
  { icon: GraduationCap, label: "Student Mode", path: "/dashboard/academy" },
  { icon: Eye, label: "Visibility & Reach", path: "/dashboard/profile" },
  { icon: Gavel, label: "E-Court Services", path: "/dashboard/ecourt" },
  { icon: Wrench, label: "Tools", path: "/dashboard/tools" },
];

const UTILITY_ITEMS = [
  { icon: HelpCircle, label: "Help & Support", path: "/dashboard/help" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
  { icon: CreditCard, label: "Billing & Plans", path: "/dashboard/billing" },
];

export default function MainLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Modal States
  const [isReferOpen, setIsReferOpen] = useState(false);
  const [isBugOpen, setIsBugOpen] = useState(false);

  const [userProfile, setUserProfile] = useState({
      firstName: 'Devendra',
      lastName: 'Gupta',
      workplace: 'DraftMate Legal'
  });

  useEffect(() => {
      const loadProfile = () => {
          const saved = localStorage.getItem('user_profile');
          if (saved) {
              const parsed = JSON.parse(saved);
              setUserProfile(prev => ({ ...prev, ...parsed }));
          }
      };
      loadProfile(); // Initial load
      window.addEventListener('user_profile_updated', loadProfile);
      return () => window.removeEventListener('user_profile_updated', loadProfile);
  }, []);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    const sessionId = localStorage.getItem('session_id');
    try {
        if (sessionId) {
            const logoutUrl = `${API_CONFIG.AUTH.BASE_URL}${API_CONFIG.AUTH.ENDPOINTS.LOGOUT}`;
            await fetch(logoutUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId })
            });
        }
    } catch (error) {
        console.error('Logout failed:', error);
    } finally {
        toast.success('Logged out successfully');
        navigate('/login');
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display antialiased overflow-hidden h-screen flex w-full">
      <aside className={`hidden md:flex flex-col ${isCollapsed ? 'w-12' : 'w-64'} bg-white dark:bg-[#151f2e] border-r border-slate-200 dark:border-slate-800 h-full flex-shrink-0 transition-all duration-300`}>
        <div className={`p-6 flex flex-col h-full ${isCollapsed ? 'px-0 py-4 items-center' : ''}`}>
          {/* Logo */}
          <Link to="/" className={`flex items-center gap-3 px-2 mb-8 ${isCollapsed ? 'justify-center px-0' : ''}`}>
            <img
              src={isCollapsed ? smallLogo : fullLogo}
              alt="DraftMate"
              className={`object-contain transition-all ${isCollapsed ? 'w-8 h-8' : 'h-12'}`}
            />
          </Link>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 -mx-4 scrollbar-none flex flex-col gap-2 min-h-0">
            <div className="space-y-1">
              <NavItem to="/dashboard/home" icon="dashboard" label="Dashboard" />
              <NavItem to="/dashboard/tools" icon="build" label="Tools" />
              <NavItem to="/dashboard/drafts" icon="article" label="My Drafts" />
              <NavItem to="/dashboard/research" icon="balance" label="AI Research" />

              <NavItem to="/dashboard/settings" icon="settings" label="Settings" />
            </div>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.img 
                  initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 130 }} exit={{ opacity: 0, width: 0 }}
                  src="/text-removebg-preview.png" alt="DraftMate" className="h-8 object-contain mix-blend-multiply" 
                />
              )}
            </AnimatePresence>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 scrollbar-hide">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <Link key={item.label} to={item.path} className="block">
                <motion.div 
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                    isActive ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-500 hover:bg-blue-50 hover:text-blue-600 font-medium"
                  }`}
                >
                  {isActive && <motion.div layoutId="activeNav" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-600 rounded-r-full" />}
                  <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500 transition-colors"}`} />
                  {isSidebarOpen && <span className="text-[13px] whitespace-nowrap">{item.label}</span>}
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Footer Utilities */}
        <div className="p-3 border-t border-slate-100 max-h-[220px] overflow-y-auto scrollbar-hide space-y-1">
          {UTILITY_ITEMS.map((item) => {
             const isActive = location.pathname.includes(item.path);
             return (
               <Link key={item.label} to={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'}`}>
                 <item.icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`} />
                 {isSidebarOpen && <span className={`text-xs ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>}
               </Link>
             );
          })}
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors group mt-2 border border-transparent hover:border-red-100">
            <LogOut className="w-4 h-4 shrink-0 text-red-400 group-hover:text-red-500" />
            {isSidebarOpen && <span className="text-xs font-semibold">Logout</span>}
          </button>
        </div>

        {/* User Profile in Sidebar with Plan Indicator */}
        <div onClick={() => navigate('/dashboard/settings')} className="p-4 border-t border-slate-100 bg-slate-50/50 hover:bg-blue-50 transition-colors cursor-pointer flex items-center gap-3 overflow-hidden group">
           <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-9 h-9 rounded-full shadow-sm shrink-0 border border-slate-200 group-hover:border-blue-300 transition-colors" />
           <AnimatePresence>
             {isSidebarOpen && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col overflow-hidden">
                 <span className="text-sm font-bold text-[#0F1C2E] truncate group-hover:text-blue-700 transition-colors">
                     {userProfile.firstName} {userProfile.lastName}
                 </span>
                 <span className="text-[10px] font-medium text-slate-500 truncate mb-1.5">
                     {userProfile.workplace || 'DraftMate Legal'}
                 </span>
                 <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider w-max">Pro Plan</span>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        <button 
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-300 shadow-sm z-50 transition-colors"
        >
          {isSidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
      </motion.aside>

      {/* ── MOBILE DRAWER ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" />
            <motion.aside 
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-white z-50 shadow-2xl flex flex-col lg:hidden"
            >
              <div className="h-[70px] flex items-center justify-between px-6 border-b border-slate-100">
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <img src="/logo.png" alt="DraftMate" className="w-6 h-6 object-contain" />
                    </div>
                    <img src="/text-removebg-preview.png" alt="DraftMate" className="h-8 object-contain mix-blend-multiply" />
                 </div>
                 <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 rounded-full"><X className="w-4 h-4" /></button>
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{userProfile?.name || 'Attorney Davis'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userProfile?.email || 'View Profile'}</p>
                </div>
              )}
              {!isCollapsed && (
                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">chevron_right</span>
              )}
            </Link>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative bg-background-light dark:bg-background-dark">
        {/* Top Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#151f2e] border-b border-slate-200 dark:border-slate-800 z-10">
          <button className="md:hidden p-2 text-slate-600 dark:text-slate-300">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div></div>
          <div className="flex items-center gap-6">
            {location.pathname === '/dashboard/home' && (
              <>
                <Link
                  to="/dashboard/notifications"
                  className="relative text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  <span className="material-symbols-outlined text-[22px]">notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 text-[8px] font-bold text-white items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    </span>
                  )}
                </Link>
                <Link to="/dashboard/help" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  Help Center
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Content Area */}
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;