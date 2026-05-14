import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { ShieldCheck, Building2, Briefcase, CheckCircle2, XCircle, Clock, MapPin } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [serviceProviders, setServiceProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const run = async () => {
      try {
        const [communitiesRes, providersRes] = await Promise.all([
          api.get("/communities/admin/pending"),
          api.get("/service-providers/pending"),
        ]);

        setCommunities(communitiesRes?.data?.communities ?? []);
        const allProviders = providersRes?.data?.serviceProviders ?? [];
        setServiceProviders(allProviders);
      } catch (err) {
        toast.error(
          err?.response?.data?.message ||
            "Failed to load pending items for review"
        );
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const handleCommunityStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.patch(`/communities/${id}/status`, { status });
      setCommunities((prev) => prev.filter((c) => c._id !== id));
      toast.success(`Community ${status} successfully`);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          `Failed to ${status.toLowerCase()} community`
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleServiceProviderStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.patch(`/service-providers/${id}/status`, { status });
      setServiceProviders((prev) => prev.filter((sp) => sp._id !== id));
      toast.success(`Service provider ${status} successfully`);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          `Failed to ${status.toLowerCase()} service provider`
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (!user || user.role !== "Admin") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-red-200 bg-red-50 p-10 text-center shadow-xl shadow-red-900/5">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white ring-1 ring-red-200">
            <ShieldCheck className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-red-900 mb-2">Access Denied</h2>
          <p className="text-sm text-red-700 leading-relaxed font-medium">
            You do not have administrative privileges to access this control panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Premium Dashboard Header */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-950 p-8 sm:p-12 shadow-2xl border border-zinc-800">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-80 w-80 rounded-full bg-indigo-500/20 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-[60px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-xl shadow-inner ring-1 ring-white/20 text-white">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                System Active
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">Admin Control Panel</h1>
            <p className="mt-3 text-base text-zinc-400 font-medium">
              Review and moderate pending communities and service providers before they go live.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid gap-8 lg:grid-cols-2">
        
        {/* Communities Section */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200/60">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Building2 className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Communities</h2>
            </div>
            <span className="flex h-8 min-w-[32px] items-center justify-center rounded-full bg-zinc-100 px-3 text-sm font-bold text-zinc-600">
              {communities.length}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-indigo-600" />
            </div>
          ) : communities.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center">
              <Clock className="mb-4 h-12 w-12 text-zinc-300" />
              <h3 className="text-lg font-bold text-zinc-900">All caught up</h3>
              <p className="mt-1 text-sm text-zinc-500">No pending communities to review.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {communities.map((c) => (
                <div
                  key={c._id}
                  className="group relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-indigo-200"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900 line-clamp-1">{c.name}</h3>
                      <div className="mt-1 flex items-center text-sm font-medium text-zinc-500">
                        <MapPin className="mr-1 h-3.5 w-3.5" />
                        {c.cityOrVillage}
                      </div>
                    </div>
                  </div>
                  
                  {c.description && (
                    <p className="mb-6 text-sm text-zinc-600 leading-relaxed bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                      {c.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 pt-4 border-t border-zinc-100">
                    <button
                      disabled={updatingId === c._id}
                      onClick={() => handleCommunityStatus(c._id, "Approved")}
                      className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold transition-colors hover:bg-emerald-100 hover:text-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingId === c._id ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-600" /> : <CheckCircle2 className="h-4 w-4" />}
                      Approve
                    </button>
                    <button
                      disabled={updatingId === c._id}
                      onClick={() => handleCommunityStatus(c._id, "Rejected")}
                      className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-50 text-red-700 text-sm font-bold transition-colors hover:bg-red-100 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingId === c._id ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500/30 border-t-red-600" /> : <XCircle className="h-4 w-4" />}
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Service Providers Section */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200/60">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Briefcase className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Service Providers</h2>
            </div>
            <span className="flex h-8 min-w-[32px] items-center justify-center rounded-full bg-zinc-100 px-3 text-sm font-bold text-zinc-600">
              {serviceProviders.length}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-purple-600" />
            </div>
          ) : serviceProviders.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center">
              <Clock className="mb-4 h-12 w-12 text-zinc-300" />
              <h3 className="text-lg font-bold text-zinc-900">All caught up</h3>
              <p className="mt-1 text-sm text-zinc-500">No pending providers to review.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {serviceProviders.map((sp) => (
                <div
                  key={sp._id}
                  className="group relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-purple-200"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900">{sp.name}</h3>
                      <div className="mt-1 flex items-center text-sm font-medium text-zinc-500">
                        <MapPin className="mr-1 h-3.5 w-3.5" />
                        {sp.community?.name} • {sp.community?.cityOrVillage}
                      </div>
                    </div>
                  </div>
                  
                  {sp.specialization?.length > 0 && (
                    <div className="mb-6">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Specializations</p>
                      <div className="flex flex-wrap gap-2 flex-1">
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

                  <div className="flex items-center gap-3 pt-4 border-t border-zinc-100">
                    <button
                      disabled={updatingId === sp._id}
                      onClick={() => handleServiceProviderStatus(sp._id, "Approved")}
                      className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold transition-colors hover:bg-emerald-100 hover:text-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingId === sp._id ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-600" /> : <CheckCircle2 className="h-4 w-4" />}
                      Approve
                    </button>
                    <button
                      disabled={updatingId === sp._id}
                      onClick={() => handleServiceProviderStatus(sp._id, "Rejected")}
                      className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-50 text-red-700 text-sm font-bold transition-colors hover:bg-red-100 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingId === sp._id ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500/30 border-t-red-600" /> : <XCircle className="h-4 w-4" />}
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

