import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Mail, Phone, ArrowLeft, Send, CheckCircle2, User, Wrench, MapPin } from "lucide-react";
import emailjs from '@emailjs/browser';
import { useAuth } from "../context/AuthContext";
export default function ContactProviderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dummy message state for UX (Doesn't actively send to backend if no messaging route exists)
  const [message, setMessage] = useState("");
  const [sentStatus, setSentStatus] = useState(false);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const res = await api.get(`/service-providers/${id}`);
        setProvider(res?.data?.serviceProvider);
      } catch (err) {
        setError("Failed to load provider details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProvider();
  }, [id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !provider?.email) return;

    // Prepare the template parameters using data from fetchProvider
    const templateParams = {
      to_email: provider.email, // Data coming directly from fetched provider
      from_name: user?.name || "A neighbor",
      message: message,
    };

    try {
      // 2. Send email directly using your EmailJS Public Key
      await emailjs.send(
        'service_01u3vos',
        'template_0e05lgf',
        templateParams,
        '7Q7_MHYMCvpscDH6e'
      );

      setSentStatus(true);
      setMessage("");

      setTimeout(() => {
        setSentStatus(false);
      }, 3000);
    } catch (err) {
      console.error("Email failed:", err);
      alert("Failed to send message. Please try again later.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-purple-600" />
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="flex h-[70vh] items-center justify-center p-4">
        <div className="rounded-3xl border-2 border-dashed border-red-200 bg-red-50 p-12 text-center max-w-sm">
          <p className="text-sm font-bold text-red-600 mb-4">{error || "Provider not found"}</p>
          <button onClick={() => navigate(-1)} className="text-sm font-bold text-red-700 hover:underline">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-12">

      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Directory
      </button>

      <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-2xl shadow-indigo-900/5 ring-1 ring-zinc-200/50">

        {/* Header Section */}
        <div className="relative bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 p-8 sm:p-12">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-[50px]" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-3xl font-extrabold text-white ring-1 ring-white/20 shadow-inner">
              {provider.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{provider.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm font-medium text-purple-100">
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                  <MapPin className="h-4 w-4 text-purple-300" />
                  {provider.community?.name}
                </span>
                {provider.onboardingStatus === "Approved" && (
                  <span className="flex items-center gap-1.5 bg-emerald-500/20 px-3 py-1.5 rounded-full border border-emerald-500/30 text-emerald-200">
                    <CheckCircle2 className="h-4 w-4" />
                    Verified Provider
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid sm:grid-cols-5 gap-8 p-8 sm:p-12">

          {/* Contact Details Column */}
          <div className="sm:col-span-2 space-y-8">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-zinc-400 mb-4">Direct Contact</h3>

              <div className="space-y-4">
                {provider.number ? (
                  <a href={`tel:${provider.number}`} className="group flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 hover:bg-purple-50 ring-1 ring-zinc-200 hover:ring-purple-200 transition-all">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm text-purple-600 group-hover:scale-110 transition-transform">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-500">Phone Number</div>
                      <div className="text-sm font-bold text-zinc-900 group-hover:text-purple-700 transition-colors">{provider.number}</div>
                    </div>
                  </a>
                ) : (
                  <div className="flex items-center gap-3 text-sm font-medium text-zinc-400 p-2">
                    <Phone className="h-4 w-4" /> No phone provided
                  </div>
                )}

                {provider.email ? (
                  <a href={`mailto:${provider.email}`} className="group flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 hover:bg-purple-50 ring-1 ring-zinc-200 hover:ring-purple-200 transition-all">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm text-purple-600 group-hover:scale-110 transition-transform">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-500">Email Address</div>
                      <div className="text-sm font-bold text-zinc-900 group-hover:text-purple-700 transition-colors break-all">{provider.email}</div>
                    </div>
                  </a>
                ) : (
                  <div className="flex items-center gap-3 text-sm font-medium text-zinc-400 p-2">
                    <Mail className="h-4 w-4" /> No email provided
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-zinc-400 mb-4">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {provider.specialization?.map(s => (
                  <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 text-xs font-bold text-zinc-700 border border-zinc-200">
                    <Wrench className="h-3.5 w-3.5 text-zinc-400" /> {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Message Form */}
          <div className="sm:col-span-3">
            <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-zinc-900">Send a quick inquiry</h2>
                <p className="text-sm text-zinc-500 mt-1">Get in touch to check availability, request quotes, or ask a question.</p>
              </div>

              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder={`Hi ${provider.name}, I'm looking for help with...`}
                    className="block w-full rounded-2xl border-0 bg-white p-4 text-sm font-medium text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-200 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 outline-none resize-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sentStatus || !message.trim()}
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-purple-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-600/20 transition-all hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 disabled:opacity-50 disabled:shadow-none"
                >
                  {sentStatus ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" /> Message Sent
                    </>
                  ) : (
                    <>
                      Send Message <Send className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
