import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { CalendarDays, MapPin, Users, CheckCircle2, PlusCircle, Clock, CalendarHeart, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joiningId, setJoiningId] = useState(null);

  const fetchEvents = async () => {
    try {
      const res = await api.get("/events");
      setEvents(res?.data?.events ?? []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleJoin = async (id) => {
    setJoiningId(id);
    try {
      await api.post(`/events/${id}/join`);
      fetchEvents();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to join event");
    } finally {
      setJoiningId(null);
    }
  };

  const formatEventDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return {
        month: format(d, 'MMM'),
        day: format(d, 'dd'),
        time: format(d, 'h:mm a')
      };
    } catch (e) {
      return { month: '???', day: '??', time: '' };
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-950 p-8 sm:p-12 shadow-2xl border border-zinc-800">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-80 w-80 rounded-full bg-rose-500/20 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-violet-500/10 blur-[60px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-xl shadow-inner ring-1 ring-white/20 text-white">
              <CalendarHeart className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">Local Events</h1>
              <p className="mt-3 text-base text-zinc-400 font-medium max-w-lg">
                Discover unmissable local gatherings, workshops, and community meetups happening near you.
              </p>
            </div>
          </div>
          <Link
            to="/create-event"
            className="group relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-zinc-900 shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-100 to-violet-100 opacity-0 transition-opacity group-hover:opacity-100" />
            <PlusCircle className="relative z-10 h-5 w-5 text-rose-500 transition-transform group-hover:rotate-90" />
            <span className="relative z-10">Host Event</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse flex flex-col rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm min-h-[350px]">
              <div className="h-32 w-full rounded-2xl bg-zinc-100 mb-6" />
              <div className="h-6 w-3/4 rounded-lg bg-zinc-200 mb-4" />
              <div className="h-4 w-1/2 rounded-lg bg-zinc-100 mb-2" />
              <div className="h-4 w-2/3 rounded-lg bg-zinc-100 mt-auto" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center justify-center rounded-3xl border-2 border-dashed border-red-200 bg-red-50 p-12 text-center">
          <p className="text-sm font-bold text-red-600">{error}</p>
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-zinc-200 bg-zinc-50/50 p-16 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white shadow-sm ring-1 ring-zinc-200/50 text-rose-500">
             <Calendar className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900">No upcoming events</h3>
          <p className="mt-2 text-sm text-zinc-500 max-w-sm">
            There are no events scheduled right now. Be the first to host a gathering in your community!
          </p>
          <Link
            to="/create-event"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-colors"
          >
            <PlusCircle className="h-5 w-5" />
            Create Event
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => {
            const dateInfo = formatEventDate(e.eventDate);
            return (
              <div
                key={e._id}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-200/50 min-h-[400px]"
              >
                {/* Visual Header Placeholder */}
                <div className="h-32 w-full bg-gradient-to-br from-rose-50 to-violet-50 relative border-b border-zinc-100">
                  {/* Date Badge */}
                  <div className="absolute top-4 right-4 flex flex-col items-center justify-center min-w-[3.5rem] rounded-xl bg-white shadow-md p-2 border border-zinc-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-500">{dateInfo.month}</span>
                    <span className="text-xl font-black text-zinc-900 leading-none mt-1">{dateInfo.day}</span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500">
                    <Clock className="h-3.5 w-3.5 text-rose-400" />
                    {dateInfo.time}
                  </div>
                  
                  <h3 className="text-xl font-extrabold text-zinc-900 line-clamp-2 leading-snug mb-3 group-hover:text-rose-600 transition-colors">
                    {e.title}
                  </h3>
                  
                  {e.location && (
                    <div className="flex items-start gap-2 text-sm font-medium text-zinc-600 mb-4">
                      <MapPin className="h-4 w-4 shrink-0 text-zinc-400 mt-0.5" />
                      <span className="line-clamp-2 leading-relaxed">{e.location}</span>
                    </div>
                  )}

                  {e.description && (
                    <p className="text-sm text-zinc-500 line-clamp-3 leading-relaxed mb-6 flex-1">
                      {e.description}
                    </p>
                  )}

                  <div className="mt-auto pt-5 flex items-center justify-between border-t border-zinc-100">
                    <div className="flex items-center gap-2 text-sm font-bold text-zinc-600 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200">
                      <Users className="h-4 w-4 text-zinc-400" />
                      {e.attendees?.length || 0} attending
                    </div>
                    
                    <button
                      onClick={() => handleJoin(e._id)}
                      disabled={joiningId === e._id}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-rose-50 text-rose-700 px-5 py-2.5 text-sm font-bold hover:bg-rose-100 hover:text-rose-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {joiningId === e._id ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-500/30 border-t-rose-600" />
                          Joining...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Join
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
