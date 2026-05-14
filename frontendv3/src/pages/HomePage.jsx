import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { MapPin, Sparkles, Compass, Users } from "lucide-react";
import Feed from "../components/Feed";
import api from "../api/axios";

export default function HomePage() {
  const { user } = useAuth();
  const [userCommunities, setUserCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Identify the user's community IDs here
  const rawCommunityIds = user?.joinedCommunities
    ? user.joinedCommunities.map((c) => (typeof c === "string" ? c : c._id)).filter(Boolean)
    : [];

  useEffect(() => {
    // Fetch all communities to match names
    const fetchCommunitiesInfo = async () => {
      if (rawCommunityIds.length === 0) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/communities");
        const allCommunities = res?.data?.communities ?? [];
        const matched = allCommunities.filter((c) => rawCommunityIds.includes(c._id));
        setUserCommunities(matched);
      } catch (err) {
        console.error("Failed to fetch communities for feed");
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchCommunitiesInfo();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <div className="flex w-full max-w-3xl flex-col items-center justify-center rounded-[2.5rem] bg-indigo-950 p-8 sm:p-16 text-center shadow-2xl shadow-indigo-900/10 ring-1 ring-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-zinc-900/50" />
          <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-white/10 blur-[80px]" />
          <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-indigo-500/20 blur-[80px]" />
          
          <div className="relative z-10 w-full max-w-xl mx-auto">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-xl ring-1 ring-white/20 shadow-xl shadow-black/20 transition-transform hover:scale-110 hover:rotate-3 duration-500">
              <MapPin className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              Welcome to <br />Hometown Hub
            </h1>
            <p className="text-lg sm:text-xl text-indigo-100/90 mb-10 leading-relaxed font-medium">
              The premier hyper-local network to connect with your community, discover local services, and join hometown events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login" className="inline-flex h-14 items-center justify-center rounded-xl bg-white px-8 text-sm font-bold tracking-wide text-zinc-900 transition-all hover:bg-zinc-100 hover:scale-105 shadow-lg active:scale-95">
                Log in to your account
              </Link>
              <Link to="/register" className="inline-flex h-14 items-center justify-center rounded-xl bg-indigo-500 px-8 text-sm font-bold tracking-wide text-white transition-all hover:bg-indigo-400 hover:scale-105 shadow-lg shadow-indigo-500/25 active:scale-95">
                Create new account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logged-in view
  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 max-w-3xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[2rem] bg-white p-8 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-zinc-200/50">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-indigo-50 blur-[60px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-40 w-40 rounded-full bg-purple-50 blur-[60px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">Your Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 leading-none">
              Welcome back, {user.name.split(' ')[0]}
            </h1>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-zinc-50 border border-zinc-200/60 px-4 py-2 font-medium">
              <MapPin className="h-4 w-4 text-zinc-400" />
              <span className="text-sm text-zinc-600">Connected to <span className="text-zinc-900 font-bold">{user.hometown}</span></span>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600"></div>
          <p className="text-sm font-medium text-zinc-500">Loading your feed...</p>
        </div>
      ) : rawCommunityIds.length === 0 ? (
        <div className="flex flex-col items-center justify-center overflow-hidden rounded-[2rem] border-2 border-dashed border-zinc-200 bg-zinc-50/50 p-12 sm:p-16 text-center transition-all hover:bg-zinc-50 hover:border-indigo-200">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-md shadow-zinc-200/50 ring-1 ring-zinc-200/60 transition-transform duration-500 hover:scale-110 hover:rotate-3">
            <Compass className="h-10 w-10 text-indigo-500" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-3">Your feed is currently empty</h2>
          <p className="text-base text-zinc-500 max-w-md mb-10 leading-relaxed font-medium">
            You haven't joined any communities yet! Discover and join local groups to see posts, events, and find service providers in your neighborhood.
          </p>
          <Link
            to="/explore"
            className="group inline-flex items-center justify-center gap-2.5 rounded-2xl bg-zinc-900 px-8 py-4 text-sm font-bold tracking-wide text-white transition-all duration-300 hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-600/25 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-95"
          >
            <Compass className="h-5 w-5 transition-transform group-hover:rotate-45" />
            Explore Communities
          </Link>
        </div>
      ) : (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-200/60">
            <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 tracking-tight">
              <Users className="h-5 w-5 text-indigo-500" />
              Community Updates
            </h2>
          </div>
          <Feed userCommunities={userCommunities} />
        </div>
      )}
    </div>
  );
}
