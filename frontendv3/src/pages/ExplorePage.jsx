import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { Search, MapPin, Compass, Users, CheckCircle } from "lucide-react";

export default function ExplorePage() {
  const [cityOrVillage, setCityOrVillage] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingJoin, setLoadingJoin] = useState(null);

  const handleJoin = async (id) => {
    setLoadingJoin(id);
    try {
      await api.post(`/communities/${id}/join`);
      alert("Successfully joined the community!");
      // Optionally update user context or re-fetch
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to join community");
    } finally {
      setLoadingJoin(null);
    }
  };

  const search = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.get("/communities", {
        params: cityOrVillage ? { cityOrVillage } : {},
      });
      setResults(res?.data?.communities ?? []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch communities");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-indigo-950 to-zinc-900 p-8 sm:p-12 shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-2.5 mb-3">
              <Compass className="h-5 w-5 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Network Directory</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Explore Communities
            </h1>
            <p className="mt-4 text-lg text-zinc-300 leading-relaxed">
              Find and join verified local neighborhoods, villages, and city networks to start connecting with your roots.
            </p>
            
            {/* Search Form inside Header */}
            <form onSubmit={search} className="relative max-w-md mt-8">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-zinc-400" />
              </div>
              <input
                className="block w-full rounded-2xl border-0 bg-white py-4 pl-12 pr-32 text-sm font-medium text-zinc-900 shadow-xl outline-none transition-all placeholder:text-zinc-500 focus:ring-4 focus:ring-indigo-500/20"
                value={cityOrVillage}
                onChange={(e) => setCityOrVillage(e.target.value)}
                placeholder="Type a city or village name..."
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute inset-y-1.5 right-1.5 flex items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white transition-all hover:bg-indigo-500 active:scale-95 disabled:opacity-70 disabled:active:scale-100 shadow-md"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></div>
                ) : (
                  "Search"
                )}
              </button>
            </form>
          </div>
          
          <Link
            to="/create-community"
            className="group relative inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white/10 backdrop-blur-md px-6 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:bg-white/20 hover:scale-105 border border-white/20 select-none shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-zinc-900 mt-6 sm:mt-0"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover:bg-white/30 text-white font-black text-xs">
              +
            </div>
            Create New
          </Link>
        </div>
        
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-purple-500/20 blur-[100px]" />
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600 animate-in fade-in slide-in-from-top-2">
          <svg className="h-5 w-5 shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p>{error}</p>
        </div>
      )}

      {/* Content Area */}
      <div className="min-h-[400px]">
        {loading && results.length === 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex h-48 flex-col justify-between rounded-3xl bg-zinc-100 animate-pulse border border-zinc-200 p-6">
                <div className="space-y-3">
                  <div className="h-6 w-1/2 rounded-full bg-zinc-200" />
                  <div className="h-4 w-1/3 rounded-full bg-zinc-200" />
                </div>
                <div className="h-10 w-full rounded-xl bg-zinc-200" />
              </div>
            ))}
          </div>
        ) : results.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 p-16 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-zinc-200/50">
              <Search className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900">No communities found</h3>
            <p className="mt-2 text-base text-zinc-500 max-w-sm">Try searching for a different city or village, or create a new community yourself!</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Search Results</h2>
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-600 ring-1 ring-inset ring-indigo-500/10">
                {results.length} found
              </span>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((c) => (
                <div
                  key={c._id}
                  className="group flex flex-col justify-between overflow-hidden rounded-3xl bg-white border border-zinc-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-indigo-200 p-6"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                       <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600 ring-1 ring-inset ring-emerald-500/20">
                         <CheckCircle className="w-3 h-3 mr-1" /> Approved
                       </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {c.name}
                    </h3>
                    
                    <div className="mt-2 flex items-center text-sm font-medium text-zinc-600">
                      <MapPin className="w-4 h-4 mr-1.5 text-zinc-400" />
                      {c.cityOrVillage}
                    </div>
                    
                    {c.description && (
                      <p className="mt-4 text-sm text-zinc-500 line-clamp-2 leading-relaxed">
                        {c.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-8">
                    <button
                      onClick={() => handleJoin(c._id)}
                      disabled={loadingJoin === c._id}
                      className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 text-sm font-bold text-white transition-all duration-300 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 active:scale-95"
                    >
                      {loadingJoin === c._id ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></div>
                          Joining...
                        </>
                      ) : (
                        <>
                          <Users className="w-4 h-4" />
                          Join Community
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
