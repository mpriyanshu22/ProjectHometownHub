import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Compass, MapPin, AlignLeft, Sparkles, AlertCircle, CheckCircle2, Type } from "lucide-react";

export default function CreateCommunityPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    cityOrVillage: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/communities/create", formData);
      setSuccess("Community created! Waiting for admin approval.");
      setTimeout(() => navigate(-1), 2000);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to create community. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl shadow-indigo-900/5 ring-1 ring-zinc-200/50">
        
        {/* Header Gradient */}
        <div className="relative bg-gradient-to-br from-indigo-600 to-purple-800 p-8 sm:p-12 overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-[60px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-40 w-40 rounded-full bg-black/10 blur-[40px] pointer-events-none" />
          
          <div className="relative z-10 flex items-start gap-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl shadow-inner ring-1 ring-white/30 text-white">
              <Compass className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2 text-indigo-200">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Start a Hub</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">Create Community</h1>
              <p className="mt-2 text-base text-indigo-100/90 leading-relaxed font-medium">
                Establish a verified digital neighborhood for your city, town, or village to bring locals together.
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
                  Community Name
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
                    className="block w-full rounded-2xl border-0 bg-zinc-50 py-4 pl-12 pr-4 text-sm font-medium text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-200 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 transition-all"
                    placeholder="e.g. Springfield Master Hub"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-bold text-zinc-900">
                  City or Village
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-zinc-400" />
                  </div>
                  <input
                    required
                    name="cityOrVillage"
                    value={formData.cityOrVillage}
                    onChange={handleChange}
                    className="block w-full rounded-2xl border-0 bg-zinc-50 py-4 pl-12 pr-4 text-sm font-medium text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-200 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 transition-all"
                    placeholder="e.g. Springfield"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-bold text-zinc-900">
                  Description
                </label>
                <div className="relative">
                  <div className="absolute top-4 left-4 pointer-events-none">
                    <AlignLeft className="h-5 w-5 text-zinc-400" />
                  </div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="block w-full rounded-2xl border-0 bg-zinc-50 py-4 pl-12 pr-4 text-sm font-medium text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-200 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 transition-all resize-none"
                    placeholder="Tell everyone what this community is intended for..."
                  />
                </div>
              </div>

            </div>

            <div className="pt-6 border-t border-zinc-100">
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-500/25 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 transition-transform group-hover:scale-125 group-hover:text-indigo-200" />
                    Create Community
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
