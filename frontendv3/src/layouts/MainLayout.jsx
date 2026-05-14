import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Calendar, Home, MapPin, ShieldCheck, Users, LogOut, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const linkBase =
  "group relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300";

const linkClass = ({ isActive }) =>
  `${linkBase} ${
    isActive
      ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-inset ring-indigo-200/50"
      : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900"
  }`;

const mobileLinkClass = ({ isActive }) =>
  `flex flex-col items-center justify-center gap-1.5 p-2 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
    isActive
      ? "text-indigo-600 scale-105"
      : "text-zinc-400 hover:text-zinc-700"
  }`;

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-dvh bg-zinc-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Desktop & Main Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200/50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 shadow-sm">
        <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo Region */}
          <div className="flex items-center gap-3 transition-transform duration-300 hover:scale-[1.02]">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 ring-1 ring-inset ring-white/20">
              <MapPin className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-zinc-900 leading-none">
                Hometown Hub
              </h1>
              <span className="text-[10px] sm:text-xs font-medium uppercase tracking-widest text-indigo-500 mt-1">
                Hyperlocal Community
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5 md:gap-2">
            <NavLink to="/" className={linkClass} end>
              <Home className="h-4 w-4 transition-transform group-hover:scale-110" />
              Home
            </NavLink>
            <NavLink to="/explore" className={linkClass}>
              <MapPin className="h-4 w-4 transition-transform group-hover:scale-110" />
              Explore
            </NavLink>
            <NavLink to="/events" className={linkClass}>
              <Calendar className="h-4 w-4 transition-transform group-hover:scale-110" />
              Events
            </NavLink>
            <NavLink to="/service-providers" className={linkClass}>
              <Users className="h-4 w-4 transition-transform group-hover:scale-110" />
              Services
            </NavLink>
            {user?.role?.toLowerCase() === "admin" && (
              <NavLink to="/admin" className={linkClass}>
                <ShieldCheck className="h-4 w-4 text-emerald-500 transition-transform group-hover:scale-110" />
                Admin
              </NavLink>
            )}
          </nav>

          {/* User Account / Auth Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {!user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/login")}
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-transparent px-4 py-2 sm:px-5 sm:py-2.5 text-sm font-bold text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 hidden sm:flex"
                >
                  <LogIn className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600" />
                  Login
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 sm:px-5 sm:py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-600/25 active:scale-95"
                >
                  <UserPlus className="h-4 w-4 sm:hidden" />
                  <span className="hidden sm:inline">Get Started</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4 border-l border-zinc-200/60 pl-4 sm:gap-6 sm:pl-6">
                <div className="hidden sm:flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 ring-2 ring-white shadow-sm font-bold text-sm">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-900 leading-none">{user.name}</span>
                    <span className="text-xs font-medium text-zinc-500 mt-1">{user.hometown}</span>
                  </div>
                </div>
                
                {/* Mobile avatar fallback */}
                <div className="flex sm:hidden h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 ring-2 ring-white shadow-sm font-bold text-xs ring-offset-1">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>

                <button
                  onClick={onLogout}
                  className="group inline-flex h-9 w-9 sm:h-auto sm:w-auto items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white p-2 sm:px-4 sm:py-2 text-sm font-bold text-zinc-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 shadow-sm"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 pb-24 lg:pb-8 animate-in fade-in duration-500">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200/60 bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] pb-safe">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
          <NavLink to="/" className={mobileLinkClass} end>
            <Home className="h-5 w-5" />
            <span>Home</span>
          </NavLink>
          <NavLink to="/explore" className={mobileLinkClass}>
            <MapPin className="h-5 w-5" />
            <span>Explore</span>
          </NavLink>
          <NavLink to="/events" className={mobileLinkClass}>
            <Calendar className="h-5 w-5" />
            <span>Events</span>
          </NavLink>
          <NavLink to="/service-providers" className={mobileLinkClass}>
            <Users className="h-5 w-5" />
            <span>Services</span>
          </NavLink>
          {user?.role?.toLowerCase() === "admin" && (
            <NavLink to="/admin" className={mobileLinkClass}>
              <ShieldCheck className="h-5 w-5" />
              <span>Admin</span>
            </NavLink>
          )}
        </div>
      </div>
    </div>
  );
}

