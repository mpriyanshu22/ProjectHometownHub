import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MapPin, Mail, Lock, User, Home, ArrowRight, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [hometown, setHometown] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register({ name, email, hometown, password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[75vh] w-full items-center justify-center p-4">
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-2xl shadow-purple-900/10 ring-1 ring-zinc-200/60 lg:flex-row-reverse">
        
        {/* Right Side / Branding Visual */}
        <div className="relative hidden w-1/2 bg-indigo-950 lg:block overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-purple-900 to-indigo-950" />
          <div className="absolute -top-32 -right-32 h-[30rem] w-[30rem] rounded-full bg-purple-500/20 blur-[100px]" />
          <div className="absolute -bottom-32 -left-32 h-[30rem] w-[30rem] rounded-full bg-indigo-500/20 blur-[100px]" />
          
          <div className="relative z-10 flex h-full flex-col justify-between p-12 lg:p-16 text-white">
            <div className="flex justify-end">
              <Link to="/" className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl ring-1 ring-white/20 transition-transform hover:scale-105">
                <MapPin className="h-7 w-7 text-white" />
              </Link>
            </div>
            <div className="mt-12">
              <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
                Join the <br />
                <span className="text-purple-300">Neighborhood.</span>
              </h2>
              <ul className="mt-8 space-y-4 text-indigo-100/90">
                <li className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                    <User className="h-4 w-4" />
                  </div>
                  <span>Connect with amazing locals</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                    <Home className="h-4 w-4" />
                  </div>
                  <span>Discover hidden town gems</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span>Attend hyperlocal events</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Left Side: Form */}
        <div className="flex w-full flex-col justify-center p-8 sm:p-12 lg:w-1/2 lg:p-16">
          <div className="mx-auto w-full max-w-sm">
            <div className="text-center lg:text-left">
              <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 lg:hidden">
                <MapPin className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Create an account</h1>
              <p className="mt-2 text-sm text-zinc-500">
                Enter your details to get started.
              </p>
            </div>

            {error && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600 animate-in fade-in slide-in-from-top-2">
                <svg className="h-5 w-5 shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p>{error}</p>
              </div>
            )}

            <form className="mt-8 grid gap-4" onSubmit={onSubmit}>
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-zinc-700" htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <User className="h-5 w-5 text-zinc-400" />
                  </div>
                  <input
                    id="name"
                    className="block w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-3 pl-11 pr-4 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-zinc-700" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail className="h-5 w-5 text-zinc-400" />
                  </div>
                  <input
                    id="email"
                    className="block w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-3 pl-11 pr-4 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-zinc-700" htmlFor="hometown">
                  Hometown (City/Village)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Home className="h-5 w-5 text-zinc-400" />
                  </div>
                  <input
                    id="hometown"
                    className="block w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-3 pl-11 pr-4 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
                    type="text"
                    placeholder="e.g., Dharampur / Pune"
                    value={hometown}
                    onChange={(e) => setHometown(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-zinc-700" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="h-5 w-5 text-zinc-400" />
                  </div>
                  <input
                    id="password"
                    className="block w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-3 pl-11 pr-4 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button
                disabled={submitting}
                className="group mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 text-sm font-bold text-white transition-all hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-600/25 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-zinc-600">
              Already have an account?{" "}
              <Link className="font-bold text-purple-600 transition-colors hover:text-purple-500 hover:underline underline-offset-4" to="/login">
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

