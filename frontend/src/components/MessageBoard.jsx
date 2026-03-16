import { useState, useEffect, useCallback } from "react";
import { Trophy, TrendingUp, Send, Loader2, MessageSquare } from "lucide-react";
import { apiClient } from "../services/apiClient";

const CATEGORY_META = {
  win: {
    label: "Win 🏆",
    pill: "bg-[#003366] text-white",
    border: "border-l-[#003366]",
  },
  gain: {
    label: "Gain 📈",
    pill: "bg-slate-200 text-slate-700",
    border: "border-l-slate-400",
  },
};

function timeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function MessageCard({ msg }) {
  const meta = CATEGORY_META[msg.category] ?? CATEGORY_META.win;
  const initials = msg.author_name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-100 border-l-4 ${meta.border} p-5 flex gap-4 hover:shadow-md transition-shadow duration-200`}>
      <div className="shrink-0 w-10 h-10 rounded-full bg-[#003366] text-white flex items-center justify-center text-sm font-bold">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
          <span className="font-semibold text-slate-800 text-sm">{msg.author_name}</span>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${meta.pill}`}>
              {meta.label}
            </span>
            <span className="text-xs text-slate-400">{timeAgo(msg.created_at)}</span>
          </div>
        </div>
        <p className="text-slate-700 text-sm leading-relaxed break-words">{msg.content}</p>
      </div>
    </div>
  );
}

export default function MessageBoard() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("win");

  const fetchMessages = useCallback(async () => {
    try {
      const data = await apiClient("/messages");
      setMessages(data);
    } catch {
      setError("Could not load messages. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handlePost = async () => {
    if (!content.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const newMsg = await apiClient("/messages", {
        method: "POST",
        body: { content: content.trim(), category },
      });
      setMessages((prev) => [newMsg, ...prev]);
      setContent("");
    } catch {
      setError("Failed to post message. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-2xl mx-auto">

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <MessageSquare className="text-[#003366]" size={28} />
            <h1 className="text-3xl font-bold text-[#003366]">Message Board</h1>
          </div>
          <p className="text-slate-500 text-sm ml-10">
            Share your writing wins and gains with the community.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-8">
          <div className="flex gap-2 mb-3">
            {Object.entries(CATEGORY_META).map(([key, meta]) => (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                  category === key
                    ? meta.pill + " ring-2 ring-offset-1 ring-[#003366]"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {meta.label}
              </button>
            ))}
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              category === "win"
                ? "Share a writing win — finished a chapter, hit a word goal..."
                : "Share a gain — a new insight, habit improvement, or skill learned..."
            }
            rows={3}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent transition"
          />

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-slate-400">⌘ + Enter to post</span>
            <button
              onClick={handlePost}
              disabled={posting || !content.trim()}
              className="flex items-center gap-2 bg-[#003366] hover:bg-[#002244] disabled:bg-slate-300 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors duration-150"
            >
              {posting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              Post
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#003366]" size={32} />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No messages yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <MessageCard key={msg.id} msg={msg} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}