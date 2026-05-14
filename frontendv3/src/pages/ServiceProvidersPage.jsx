import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Users, MapPin, Briefcase, ChevronRight } from "lucide-react";

export default function ServiceProvidersPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      if (!user || !user.joinedCommunities?.length) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // 1. Get the raw IDs in an array format
        const communityIds = user.joinedCommunities
          .map(c => (typeof c === 'string' ? c : c._id))
          .filter(Boolean);

        // 2. Initialize an empty array to collect results
        let allProviders = [];

        // 3. Loop through each ID and fetch data individually
        for (const id of communityIds) {
          console.log(`Fetching providers for community: ${id}`);
          
          // Using the route: /community/:communityId
          const res = await api.get(`/service-providers/community/${id}`);
          
          // Safely extract the data (adjusting based on your API response structure)
          const providers = res?.data?.serviceProviders || res?.data || [];
          
          // Combine with previous results
          allProviders = [...allProviders, ...providers];
        }

        // 4. Update state once with the full collected list
        setItems(allProviders);
        
      } catch (err) {
        console.error("Failed to fetch providers:", err);
        setError("Failed to load service providers.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [user]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 p-8 sm:p-12 shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-2.5 mb-3">
              <Briefcase className="h-5 w-5 text-purple-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Local Directory</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Service Providers
            </h1>
            <p className="mt-4 text-lg text-indigo-100/90 leading-relaxed">
              Discover verified local helpers, technicians, pandits, and essential service providers directly within your joined communities.
            </p>
          </div>
          
          <Link
            to="/apply-service-provider"
            className="group relative inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white/10 backdrop-blur-md px-6 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:bg-white/20 hover:scale-105 border border-white/20 select-none shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-indigo-900 mt-6 sm:mt-0"
          >
            Become a Provider
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-purple-500/30 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-[100px]" />
      </div>

      {error ? (
        <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600 animate-in fade-in slide-in-from-top-2">
          <svg className="h-5 w-5 shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p>{error}</p>
        </div>
      ) : null}

      {/* Content Area */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col justify-between rounded-3xl bg-zinc-100 animate-pulse border border-zinc-200 p-6 min-h-[200px]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-2xl bg-zinc-200 shrink-0" />
                  <div className="space-y-3 flex-1">
                    <div className="h-5 w-2/3 rounded-full bg-zinc-200" />
                    <div className="h-3 w-1/2 rounded-full bg-zinc-200" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 rounded-full bg-zinc-200" />
                  <div className="h-6 w-20 rounded-full bg-zinc-200" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 p-16 text-center transition-colors hover:border-zinc-300 hover:bg-zinc-50">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-zinc-200/50">
              <Users className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900">No providers found</h3>
            <p className="mt-2 text-base text-zinc-500 max-w-sm">There are no approved service providers in your joined communities yet. Be the first to apply!</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((sp) => (
              <div
                key={sp._id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl bg-white border border-zinc-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-purple-200 p-6"
              >
                <div>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 text-purple-600 font-extrabold text-xl ring-1 ring-inset ring-purple-100/50 group-hover:scale-105 transition-transform duration-300">
                      {sp.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900 group-hover:text-purple-600 transition-colors line-clamp-1">
                        {sp.name}
                      </h3>
                      <div className="mt-1 flex items-center text-xs font-semibold text-zinc-500">
                        <MapPin className="h-3.5 w-3.5 mr-1 text-zinc-400" />
                        <span className="truncate">{sp.community?.name} • {sp.community?.cityOrVillage}</span>
                      </div>
                    </div>
                  </div>
                  
                  {sp.specialization?.length > 0 && (
                    <div className="mt-6">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Specializations</p>
                      <div className="flex flex-wrap gap-2">
                        {sp.specialization.map((s) => (
                          <span
                            key={s}
                            className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 ring-1 ring-inset ring-purple-500/20"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-8 pt-4 border-t border-zinc-100 flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600 ring-1 ring-inset ring-emerald-500/20">
                    Verified
                  </span>
                  
                  {/* Contact Action */}
                  <Link 
                    to={`/contact-provider/${sp._id}`} 
                    className="text-sm font-bold text-purple-600 hover:text-purple-500 transition-colors flex items-center gap-1 group-hover:translate-x-1 duration-300"
                  >
                    Contact <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

