"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Users,
  Video,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Search,
  MapPin,
  Lock,
  RotateCw,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { CalendarEvent, CalendarSlot } from "@/types/api";

type ViewMode = "month" | "week" | "day" | "agenda" | "slots";

export function CalendarView() {
  const { currentUser, hasPermission } = useAuth();
  const canWriteCalendar = hasPermission("calendar.write");

  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 7)); // September 7, 2026 baseline
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // New Event Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDate, setNewDate] = useState("2026-09-08");
  const [newStartTime, setNewStartTime] = useState("10:00");
  const [newEndTime, setNewEndTime] = useState("10:30");
  const [newAttendees, setNewAttendees] = useState("alice@acme.com, rahul@acme.com");
  const [newMeetingType, setNewMeetingType] = useState("review");
  const [newLocation, setNewLocation] = useState("Google Meet");
  const [creating, setCreating] = useState(false);

  // Slot Finder State
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [slotAttendees, setSlotAttendees] = useState("alice@acme.com, rahul@acme.com");
  const [slotDuration, setSlotDuration] = useState(30);
  const [searchingSlots, setSearchingSlots] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getCalendarEvents();
      setEvents(data || []);
    } catch (err) {
      console.error("Failed to load calendar events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentUser?.organization_id]);

  const searchSlots = async () => {
    setSearchingSlots(true);
    try {
      const attendeeList = slotAttendees.split(",").map((s) => s.trim()).filter(Boolean);
      const res = await api.getCalendarSlots(attendeeList, slotDuration, currentDate.toISOString());
      setSlots(res || []);
    } catch (err) {
      console.error("Failed to search slots:", err);
    } finally {
      setSearchingSlots(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWriteCalendar) return;

    setCreating(true);
    try {
      const startDateTime = new Date(`${newDate}T${newStartTime}:00Z`).toISOString();
      const endDateTime = new Date(`${newDate}T${newEndTime}:00Z`).toISOString();
      const attendeeList = newAttendees.split(",").map((s) => s.trim()).filter(Boolean);

      await api.createCalendarEvent({
        title: newTitle,
        description: newDescription,
        start_time: startDateTime,
        end_time: endDateTime,
        attendees: attendeeList,
        location: newLocation,
        meeting_type: newMeetingType,
      });

      setShowCreateModal(false);
      // Reset form
      setNewTitle("");
      setNewDescription("");
      await fetchEvents();
    } catch (err) {
      console.error("Failed to create event:", err);
      alert(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setCreating(false);
    }
  };

  const handleCancelMeeting = async (eventId: string) => {
    if (!canWriteCalendar) return;
    if (!confirm("Are you sure you want to cancel this meeting?")) return;

    try {
      await api.cancelCalendarEvent(eventId, "Cancelled by user via Calendar UI");
      setSelectedEvent(null);
      await fetchEvents();
    } catch (err) {
      console.error("Failed to cancel event:", err);
      alert(err instanceof Error ? err.message : "Failed to cancel meeting");
    }
  };

  const nextPeriod = () => {
    const next = new Date(currentDate);
    if (viewMode === "month") next.setMonth(next.getMonth() + 1);
    else if (viewMode === "week") next.setDate(next.getDate() + 7);
    else next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const prevPeriod = () => {
    const prev = new Date(currentDate);
    if (viewMode === "month") prev.setMonth(prev.getMonth() - 1);
    else if (viewMode === "week") prev.setDate(prev.getDate() - 7);
    else prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  const getDateString = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const isEventOnDate = (event: CalendarEvent, targetDate: Date) => {
    const targetStr = getDateString(targetDate);
    if (event.start_time.startsWith(targetStr)) return true;
    const evtDate = new Date(event.start_time);
    const evtUtcStr = `${evtDate.getUTCFullYear()}-${String(evtDate.getUTCMonth() + 1).padStart(2, "0")}-${String(evtDate.getUTCDate()).padStart(2, "0")}`;
    return evtUtcStr === targetStr || getDateString(evtDate) === targetStr;
  };

  const formatEventTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString("en-US", {
        timeZone: "UTC",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const formatEventDateTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const datePart = d.toLocaleDateString("en-US", {
        timeZone: "UTC",
        month: "numeric",
        day: "numeric",
        year: "numeric",
      });
      const timePart = d.toLocaleTimeString("en-US", {
        timeZone: "UTC",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      return `${datePart}, ${timePart}`;
    } catch {
      return isoString;
    }
  };

  const getWeekDays = (baseDate: Date) => {
    const d = new Date(baseDate);
    const day = d.getDay(); // 0 is Sunday
    const sunday = new Date(d);
    sunday.setDate(d.getDate() - day);
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(sunday);
      nextDay.setDate(sunday.getDate() + i);
      week.push(nextDay);
    }
    return week;
  };

  const formatPeriodLabel = () => {
    if (viewMode === "day") {
      return currentDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    if (viewMode === "week") {
      const week = getWeekDays(currentDate);
      const start = week[0].toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const end = week[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      return `${start} – ${end}`;
    }
    return currentDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  // Month grid helpers
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getFirstDayOfMonth(year, month);

  return (
    <div className="space-y-6">
      {/* Top Header & View Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-400" />
            Operational Calendar & Reviews
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronized meeting scheduling, conflict checking, and governance review sessions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Switcher */}
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1">
            {(["month", "week", "day", "agenda", "slots"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  setViewMode(mode);
                  if (mode === "slots") searchSlots();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                  viewMode === mode
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {mode === "slots" ? "Find Slots" : mode}
              </button>
            ))}
          </div>

          {/* New Meeting Button */}
          {canWriteCalendar ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-500/20 transition"
            >
              <Plus className="w-4 h-4" /> Schedule Meeting
            </button>
          ) : (
            <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs font-medium flex items-center gap-1.5 cursor-not-allowed">
              <Lock className="w-3.5 h-3.5" /> Read Only (No Write Perm)
            </div>
          )}
        </div>
      </div>

      {/* Date Navigation Bar */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 px-4 py-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={prevPeriod}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-white px-2">{formatPeriodLabel()}</span>
          <button
            onClick={nextPeriod}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date(2026, 8, 7))}
            className="ml-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20"
          >
            Today
          </button>
          <button
            onClick={fetchEvents}
            disabled={loading}
            title="Refresh events"
            className="ml-1 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5 text-xs font-medium"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-400" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Confirmed ({events.filter(e => e.status === "confirmed").length})
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Google Meet Linked
          </span>
        </div>
      </div>

      {/* VIEW MODES */}

      {/* 1. MONTH VIEW */}
      {viewMode === "month" && (
        <div className="border border-slate-800 rounded-2xl bg-slate-900/40 overflow-hidden shadow-xl">
          <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-900/80 text-center py-2.5 text-xs font-semibold text-slate-400">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>
          <div className="grid grid-cols-7 auto-rows-fr">
            {/* Blank padding days */}
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[105px] border-b border-r border-slate-800/50 bg-slate-950/40 p-2" />
            ))}

            {/* Month Day Cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const cellDate = new Date(year, month, dayNum);
              const dayEvents = events.filter((e) => isEventOnDate(e, cellDate));
              const isToday = dayNum === 7 && month === 8;

              return (
                <div
                  key={dayNum}
                  onClick={() => {
                    setCurrentDate(cellDate);
                    setViewMode("day");
                  }}
                  className={`min-h-[105px] border-b border-r border-slate-800/60 p-2 hover:bg-slate-850/50 cursor-pointer transition flex flex-col justify-between ${
                    isToday ? "bg-indigo-950/20" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40" : "text-slate-300"
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-mono text-indigo-400">
                        {dayEvents.length} mtg
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1 flex-1">
                    {dayEvents.slice(0, 3).map((evt) => (
                      <div
                        key={evt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(evt);
                        }}
                        className="text-[11px] font-medium bg-slate-800/90 hover:bg-indigo-950/60 border border-slate-700/60 hover:border-indigo-500/50 text-slate-200 px-2 py-1 rounded truncate transition"
                      >
                        {evt.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentDate(cellDate);
                          setViewMode("day");
                        }}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium pl-1 hover:underline text-left block w-full"
                      >
                        +{dayEvents.length - 3} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. AGENDA VIEW */}
      {viewMode === "agenda" && (
        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="border border-slate-800 bg-slate-900/40 rounded-2xl p-12 text-center text-slate-400 text-xs">
              No meetings scheduled.
            </div>
          ) : (
            events.map((evt) => {
              const startDt = new Date(evt.start_time);
              const endDt = new Date(evt.end_time);
              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className="p-4 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-indigo-500/50 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex flex-col items-center justify-center text-indigo-300 shrink-0">
                      <span className="text-[10px] uppercase font-bold">{new Date(evt.start_time).toLocaleString("en-US", { timeZone: "UTC", month: "short" })}</span>
                      <span className="text-base font-extrabold leading-none">{new Date(evt.start_time).getUTCDate()}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white">{evt.title}</h4>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          {evt.status}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border bg-slate-800 text-slate-300 border-slate-700">
                          {evt.meeting_type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{evt.description || "No agenda specified."}</p>

                      <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          {formatEventTime(evt.start_time)} - {formatEventTime(evt.end_time)} UTC
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {evt.attendees?.length || 0} attendees
                        </span>
                        {evt.meet_url && (
                          <span className="flex items-center gap-1 text-blue-400">
                            <Video className="w-3.5 h-3.5" /> Google Meet
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {evt.meet_url && (
                      <a
                        href={evt.meet_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Video className="w-3.5 h-3.5" /> Join Meet
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 3. WEEK VIEW */}
      {viewMode === "week" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {getWeekDays(currentDate).map((dayDate, idx) => {
              const dayEvents = events.filter((e) => isEventOnDate(e, dayDate));
              const isSelected = getDateString(dayDate) === getDateString(currentDate);
              const isToday = dayDate.getDate() === 7 && dayDate.getMonth() === 8;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentDate(dayDate);
                    setViewMode("day");
                  }}
                  className={`border rounded-2xl p-3 cursor-pointer transition flex flex-col min-h-[220px] ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-950/20 shadow-md shadow-indigo-900/10"
                      : "border-slate-800 bg-slate-900/60 hover:bg-slate-850/50"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
                    <span className="text-xs font-semibold text-slate-300">
                      {dayDate.toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40"
                          : isSelected
                          ? "bg-slate-700 text-white"
                          : "text-slate-400"
                      }`}
                    >
                      {dayDate.getDate()}
                    </span>
                  </div>

                  <div className="space-y-1.5 flex-1">
                    {dayEvents.length === 0 ? (
                      <div className="text-[10px] text-slate-500 italic py-2 text-center">
                        No events
                      </div>
                    ) : (
                      dayEvents.map((evt) => (
                        <div
                          key={evt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(evt);
                          }}
                          className="p-2 rounded-xl bg-slate-800/90 hover:bg-indigo-950/60 border border-slate-700/60 hover:border-indigo-500/50 transition text-left"
                        >
                          <div className="text-[11px] font-semibold text-white truncate">
                            {evt.title}
                          </div>
                          <div className="text-[10px] text-indigo-300 font-mono mt-0.5">
                            {formatEventTime(evt.start_time)} UTC
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. DAY VIEW TIMELINE */}
      {viewMode === "day" && (
        <div className="border border-slate-800 rounded-2xl bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" /> Day Timeline ({currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })})
            </h3>
            <span className="text-xs text-slate-400 font-mono">Working Hours: 09:00 AM - 06:00 PM UTC</span>
          </div>

          <div className="space-y-2">
            {events.filter((e) => isEventOnDate(e, currentDate)).length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No meetings scheduled on this day.
              </div>
            ) : (
              events
                .filter((e) => isEventOnDate(e, currentDate))
                .map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 hover:border-indigo-500/60 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{evt.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-3">
                        <span>
                          {formatEventTime(evt.start_time)} - {formatEventTime(evt.end_time)} UTC
                        </span>
                        <span>Attendees: {evt.attendees?.join(", ")}</span>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {evt.status}
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* 4. SLOT FINDER VIEW */}
      {viewMode === "slots" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex-1 w-full">
              <label className="text-xs text-slate-400 font-medium block mb-1">Target Attendees</label>
              <input
                type="text"
                value={slotAttendees}
                onChange={(e) => setSlotAttendees(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="w-36">
              <label className="text-xs text-slate-400 font-medium block mb-1">Duration (Min)</label>
              <select
                value={slotDuration}
                onChange={(e) => setSlotDuration(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>
            <button
              onClick={searchSlots}
              disabled={searchingSlots}
              className="w-full sm:w-auto mt-5 sm:mt-0 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition flex items-center gap-1.5 shadow"
            >
              <Sparkles className="w-3.5 h-3.5" /> Find Open Slots
            </button>
          </div>

          {searchingSlots ? (
            <div className="p-12 text-center text-xs font-mono text-slate-400">
              Calculating conflict-free free/busy intervals against database events...
            </div>
          ) : slots.length === 0 ? (
            <div className="border border-slate-800 bg-slate-900/40 rounded-2xl p-8 text-center text-slate-400 text-xs">
              No conflict-free slots found for specified attendees on this date.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {slots.map((slot, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-indigo-500/60 transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> {slot.duration_minutes || slotDuration} mins
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Open Slot
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-white">{slot.label}</div>
                  <div className="text-xs font-mono text-slate-400">
                    {new Date(slot.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                    {new Date(slot.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  {canWriteCalendar && (
                    <button
                      onClick={() => {
                        setNewDate(slot.start_time.slice(0, 10));
                        setNewStartTime(new Date(slot.start_time).toTimeString().slice(0, 5));
                        setNewEndTime(new Date(slot.end_time).toTimeString().slice(0, 5));
                        setNewTitle("Governance Review Meeting");
                        setShowCreateModal(true);
                      }}
                      className="w-full mt-2 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold transition"
                    >
                      Book This Slot
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EVENT DETAILS DRAWER/MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {selectedEvent.meeting_type}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{selectedEvent.title}</h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>
                  {formatEventDateTime(selectedEvent.start_time)} -{" "}
                  {formatEventTime(selectedEvent.end_time)} UTC
                </span>
              </div>

              {selectedEvent.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}

              {selectedEvent.meet_url && (
                <div className="flex items-center gap-2 text-blue-400">
                  <Video className="w-4 h-4 shrink-0" />
                  <a href={selectedEvent.meet_url} target="_blank" rel="noreferrer" className="hover:underline">
                    {selectedEvent.meet_url}
                  </a>
                </div>
              )}

              <div className="pt-2">
                <p className="font-semibold text-slate-400 mb-1">Agenda / Description:</p>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-slate-300 whitespace-pre-wrap">
                  {selectedEvent.description || "No description provided."}
                </div>
              </div>

              <div className="pt-2">
                <p className="font-semibold text-slate-400 mb-1">Attendees & Response Status:</p>
                <div className="space-y-1.5">
                  {selectedEvent.attendees?.map((email) => (
                    <div
                      key={email}
                      className="flex items-center justify-between bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800"
                    >
                      <span className="text-slate-200">{email}</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        Confirmed
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              {canWriteCalendar ? (
                <button
                  onClick={() => handleCancelMeeting(selectedEvent.id)}
                  className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
                >
                  Cancel Meeting
                </button>
              ) : (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Read-only mode
                </span>
              )}

              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MEETING MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreateEvent}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-400" /> Schedule New Meeting
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Meeting Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Architecture Alignment & Cloud Cost Review"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Start Time (UTC) *</label>
                  <input
                    type="time"
                    required
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">End Time (UTC) *</label>
                  <input
                    type="time"
                    required
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Attendees (Comma-separated) *</label>
                <input
                  type="text"
                  required
                  placeholder="alice@acme.com, rahul@acme.com"
                  value={newAttendees}
                  onChange={(e) => setNewAttendees(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Meeting Type</label>
                  <select
                    value={newMeetingType}
                    onChange={(e) => setNewMeetingType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="review">Governance Review</option>
                    <option value="standup">Engineering Standup</option>
                    <option value="architecture">Architecture Sync</option>
                    <option value="incident">Incident Post-Mortem</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Location / Link</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Agenda / Notes</label>
                <textarea
                  rows={3}
                  placeholder="Items to discuss, required deliverables, decision gates..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow transition"
              >
                {creating ? "Scheduling..." : "Create Meeting"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
