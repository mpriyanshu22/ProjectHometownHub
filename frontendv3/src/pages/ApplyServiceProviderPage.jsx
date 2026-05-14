import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { Users, Briefcase, Wrench, Sparkles, AlertCircle, CheckCircle2, Type } from "lucide-react";

export default function ApplyServiceProviderPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    communityId: "",
    number: "",
    email: "",
  });
  const [userCommunities, setUserCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const rawCommunityIds = user?.joinedCommunities
    ? user.joinedCommunities.map((c) => (typeof c === "string" ? c : c._id)).filter(Boolean)
    : [];

  useEffect(() => {
    const fetchCommunities = async () => {
      if (rawCommunityIds.length === 0) return;
      try {
        const res = await api.get("/communities");
        const allCommunities = res?.data?.communities ?? [];
        const matched = allCommunities.filter((c) => rawCommunityIds.includes(c._id));
        setUserCommunities(matched);
        if (matched.length > 0) {
          setFormData((prev) => ({ ...prev, communityId: matched[0]._id }));
        }
      } catch (err) {
        console.error("Failed to fetch communities", err);
      }
    };
    fetchCommunities();
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!formData.communityId) {
      setError("Please select a community.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        communityId: formData.communityId,
        number: formData.number,
        email: formData.email,
        specialization: formData.specialization
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      await api.post("/service-providers/create", payload);
      setSuccess("Application submitted! Waiting for admin approval.");
      setTimeout(() => navigate(-1), 2500);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to submit application. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user || rawCommunityIds.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <div className="w-full max-w-md overflow-hidden rounded-[2rem] border-2 border-dashed border-zinc-200 bg-white p-10 text-center shadow-xl shadow-zinc-200/50">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-50 ring-1 ring-zinc-200">
            <Users className="h-10 w-10 text-zinc-400" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Community Required</h2>
          <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
            You must be part of a community before offering your services in it.
          </p>
          <button
            onClick={() => navigate("/explore")}
            className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:scale-95"
          >
            Explore Communities
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl shadow-emerald-900/5 ring-1 ring-zinc-200/50">
        
        {/* Header Gradient */}
        <div className="relative bg-gradient-to-br from-teal-600 to-emerald-700 p-8 sm:p-12 overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-[60px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-40 w-40 rounded-full bg-black/10 blur-[40px] pointer-events-none" />
          
          <div className="relative z-10 flex items-start gap-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl shadow-inner ring-1 ring-white/30 text-white">
              <Briefcase className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2 text-teal-100">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Apply Today</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">Service Provider</h1>
              <p className="mt-2 text-base text-emerald-50/90 leading-relaxed font-medium">
                Offer your professional skills, trade, or services to your local community footprint.
              </p>
            </div>
          </div>
        </div>

        {/* Form Area */}
        <div className="p-8 sm:p-12">
          {error && (
            <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-8 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
              <p className="font-medium">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-bold text-zinc-900">
                  Target Community
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-zinc-400" />
                  </div>
                  <select
                    required
                    name="communityId"
                    value={formData.communityId}
                    onChange={handleChange}
                    className="block w-full rounded-2xl border-0 bg-zinc-50 py-4 pl-12 pr-4 text-sm font-medium text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-200 focus:ring-2 focus:ring-inset focus:ring-emerald-600 transition-all cursor-pointer appearance-none"
                  >
                    {userCommunities.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.cityOrVillage})
                      </option>
                    ))}
                    {userCommunities.length === 0 && rawCommunityIds.map((id) => (
                      <option key={id} value={id}>Community ID: {id}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-bold text-zinc-900">
                  Business / Service Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Type className="h-5 w-5 text-zinc-400" />
                  </div>
                  <input
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full rounded-2xl border-0 bg-zinc-50 py-4 pl-12 pr-4 text-sm font-medium text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-200 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 transition-all"
                    placeholder="e.g. John's Certified Plumbing"
                  />
                </div>
              </div>

              <div className="sm:col-span-1">
                <label className="mb-2 block text-sm font-bold text-zinc-900">
                  Contact Number
                </label>
                <div className="relative">
                  <input
                    required
                    type="tel"
                    name="number"
                    value={formData.number}
                    onChange={handleChange}
                    className="block w-full rounded-2xl border-0 bg-zinc-50 py-4 px-4 text-sm font-medium text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-200 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 transition-all"
                    placeholder="e.g. +1 234 567 890"
                  />
                </div>
              </div>

              <div className="sm:col-span-1">
                <label className="mb-2 block text-sm font-bold text-zinc-900">
                  Contact Email
                </label>
                <div className="relative">
                   <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full rounded-2xl border-0 bg-zinc-50 py-4 px-4 text-sm font-medium text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-200 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 transition-all"
                    placeholder="e.g. john@example.com"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-bold text-zinc-900 flex justify-between items-center">
                  <span>Specializations</span>
                  <span className="text-xs font-normal text-zinc-500">Separate with commas</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Wrench className="h-5 w-5 text-zinc-400" />
                  </div>
                  <input
                    required
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="block w-full rounded-2xl border-0 bg-zinc-50 py-4 pl-12 pr-4 text-sm font-medium text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-200 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 transition-all"
                    placeholder="e.g. Plumbing, HVAC, General Repairs"
                  />
                </div>
              </div>

            </div>

            <div className="pt-6 border-t border-zinc-100">
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/25 focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 transition-transform group-hover:scale-125 group-hover:text-emerald-200" />
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
