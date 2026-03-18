import { useState, useEffect, useCallback } from "react";
import { Flame } from "lucide-react";
import Timer from "./Timer";
import { apiClient } from "../services/apiClient";

export default function Dashboard() {
  const [streak, setStreak] = useState(null);
  const [semester, setSemester] = useState(null);
  const [todayWritingTime, setTodayWritingTime] = useState(0);
  const [sessionSaved, setSessionSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [streakRes, semesterRes] = await Promise.allSettled([
        apiClient("/streaks/current"),
        apiClient("/semesters/active"),
      ]);
      if (streakRes.status === "fulfilled") setStreak(streakRes.value);
      if (semesterRes.status === "fulfilled") setSemester(semesterRes.value);
    };
    load();
  }, []);

  const handleTimerUpdate = useCallback((seconds) => {
    setTodayWritingTime(seconds);
  }, []);

  const handleSessionSave = useCallback(async (session) => {
    setSessionSaved(true);
    setTodayWritingTime(session.duration);
    try {
      const updated = await apiClient("/streaks/update", { method: "POST" });
      setStreak(updated);
    } catch (err) {
      console.error("Streak update failed:", err);
    }
  }, []);

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const streakCount = streak?.count ?? 0;
  const flameColor =
    streakCount >= 7 ? "text-orange-500" : streakCount > 0 ? "text-amber-400" : "text-slate-300";

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-text">Dashboard</h1>
        {semester && <p className="text-base text-muted mt-1">{semester.name}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {/* Session Status */}
        <div className="bg-background rounded-xl shadow p-6">
          <div className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">
            Session Status
          </div>
          <div className={`text-2xl font-bold ${sessionSaved ? "text-green-600" : todayWritingTime > 0 ? "text-primary" : "text-muted"}`}>
            {sessionSaved ? "Completed" : todayWritingTime > 0 ? "Active" : "Not Started"}
          </div>
        </div>

        {/* Streak */}
        <div className="bg-background rounded-xl shadow p-6">
          <div className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">
            Writing Streak
          </div>
          <div className="flex items-center gap-2">
            <Flame size={26} className={`${flameColor} transition-colors duration-500`} fill={streakCount > 0 ? "currentColor" : "none"} />
            <span className="text-2xl font-bold text-text">
              {streak ? `${streakCount} day${streakCount !== 1 ? "s" : ""}` : "—"}
            </span>
          </div>
          {streakCount >= 7 && (
            <p className="text-xs text-orange-500 mt-1 font-medium">🔥 On fire! Keep it up.</p>
          )}
        </div>

        {/* Today's Time */}
        <div className="bg-background rounded-xl shadow p-6">
          <div className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">
            Today's Writing Time
          </div>
          <div className="text-2xl font-bold text-text font-mono">{formatTime(todayWritingTime)}</div>
        </div>
      </div>

      <div className="bg-background rounded-xl shadow p-10">
        <Timer onTimerUpdate={handleTimerUpdate} onSessionSave={handleSessionSave} />
      </div>
    </div>
  );
}