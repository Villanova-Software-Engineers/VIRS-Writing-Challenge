import { useState } from "react";
import {
  Trophy,
  TrendingUp,
  Send,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Pencil,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ── Dummy Data ────────────────────────────────────────────────────────────────
const CURRENT_USER = {
  uid: "user-1",
  name: "You",
};

const INITIAL_MESSAGES = [
  {
    id: "m1",
    author_uid: "user-1",
    author_name: "You",
    category: "win",
    content: "Finally finished the first draft of my journal article after 3 weeks of grinding. Submitting to peer review next week!",
    created_at: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    likes: ["user-2"],
    dislikes: [],
    comments: [
      {
        id: "c1",
        author_uid: "user-2",
        author_name: "Dr. Sarah Chen",
        content: "That's huge! Which journal are you targeting?",
        created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      },
    ],
  },
  {
    id: "m2",
    author_uid: "user-2",
    author_name: "Dr. Sarah Chen",
    category: "gain",
    content: "Discovered the Pomodoro technique finally works for me when I set the timer to 40 minutes instead of 25. Game changer for deep writing sessions.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    likes: ["user-1", "user-3"],
    dislikes: [],
    comments: [],
  },
  {
    id: "m3",
    author_uid: "user-3",
    author_name: "Prof. James Okafor",
    category: "win",
    content: "Hit a 12-day writing streak this morning. Consistency is everything — even 20 minutes a day compounds over a semester.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    likes: ["user-1", "user-2", "user-4"],
    dislikes: [],
    comments: [
      {
        id: "c2",
        author_uid: "user-1",
        author_name: "You",
        content: "Inspiring! What time of day do you write?",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      },
      {
        id: "c3",
        author_uid: "user-3",
        author_name: "Prof. James Okafor",
        content: "6am before the rest of the house wakes up. Non-negotiable.",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      },
    ],
  },
  {
    id: "m4",
    author_uid: "user-4",
    author_name: "Dr. Maria Santos",
    category: "gain",
    content: "Realized I write better with a hard deadline for a rough draft, even a self-imposed one. Treating my own milestones like external deadlines.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    likes: ["user-2"],
    dislikes: ["user-3"],
    comments: [],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
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

function getInitials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ── Comment ───────────────────────────────────────────────────────────────────
function Comment({ comment }) {
  return (
    <div className="flex gap-2 mt-2">
      <div className="shrink-0 w-7 h-7 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-xs font-bold">
        {getInitials(comment.author_name)}
      </div>
      <div className="bg-slate-50 rounded-xl px-3 py-2 flex-1">
        <span className="font-semibold text-xs text-slate-700 mr-2">{comment.author_name}</span>
        <span className="text-xs text-slate-600">{comment.content}</span>
        <div className="text-xs text-slate-400 mt-0.5">{timeAgo(comment.created_at)}</div>
      </div>
    </div>
  );
}

// ── Message Card ──────────────────────────────────────────────────────────────
function MessageCard({ msg, onLike, onDislike, onEdit, onAddComment }) {
  const meta = CATEGORY_META[msg.category] ?? CATEGORY_META.win;
  const isOwner = msg.author_uid === CURRENT_USER.uid;
  const hasLiked = msg.likes.includes(CURRENT_USER.uid);
  const hasDisliked = msg.dislikes.includes(CURRENT_USER.uid);

  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(msg.content);
  const [showComments, setShowComments] = useState(msg.comments.length > 0);
  const [commentInput, setCommentInput] = useState("");

  const handleSaveEdit = () => {
    if (editValue.trim()) {
      onEdit(msg.id, editValue.trim());
      setEditing(false);
    }
  };

  const handlePostComment = () => {
    if (commentInput.trim()) {
      onAddComment(msg.id, commentInput.trim());
      setCommentInput("");
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-100 border-l-4 ${meta.border} p-5 hover:shadow-md transition-shadow duration-200`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <div className="shrink-0 w-9 h-9 rounded-full bg-[#003366] text-white flex items-center justify-center text-sm font-bold">
            {getInitials(msg.author_name)}
          </div>
          <div>
            <div className="font-semibold text-slate-800 text-sm">{msg.author_name}</div>
            <div className="text-xs text-slate-400">{timeAgo(msg.created_at)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${meta.pill}`}>
            {meta.label}
          </span>
          {isOwner && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#003366] hover:bg-slate-100 transition-colors"
              title="Edit"
            >
              <Pencil size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Content / Edit */}
      {editing ? (
        <div className="mb-3">
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl border border-[#003366] bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#003366]"
            autoFocus
          />
          <div className="flex gap-2 mt-2 justify-end">
            <button
              onClick={() => { setEditing(false); setEditValue(msg.content); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 text-xs font-medium transition-colors"
            >
              <X size={13} /> Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#003366] text-white text-xs font-medium hover:bg-[#002244] transition-colors"
            >
              <Check size={13} /> Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-slate-700 text-sm leading-relaxed mb-3">{msg.content}</p>
      )}

      {/* Actions Row */}
      <div className="flex items-center gap-1 border-t border-slate-100 pt-3">
        {/* Like */}
        <button
          onClick={() => onLike(msg.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            hasLiked
              ? "bg-[#003366] text-white"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          <ThumbsUp size={13} />
          {msg.likes.length > 0 && <span>{msg.likes.length}</span>}
        </button>

        {/* Dislike */}
        <button
          onClick={() => onDislike(msg.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            hasDisliked
              ? "bg-red-100 text-red-600"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          <ThumbsDown size={13} />
          {msg.dislikes.length > 0 && <span>{msg.dislikes.length}</span>}
        </button>

        {/* Comments toggle */}
        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors ml-1"
        >
          <MessageSquare size={13} />
          {msg.comments.length > 0 && <span>{msg.comments.length}</span>}
          {showComments ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-3 pl-2 border-l-2 border-slate-100">
          {msg.comments.map((c) => (
            <Comment key={c.id} comment={c} />
          ))}

          {/* Add Comment */}
          <div className="flex gap-2 mt-3">
            <div className="shrink-0 w-7 h-7 rounded-full bg-[#003366] text-white flex items-center justify-center text-xs font-bold">
              {getInitials(CURRENT_USER.name)}
            </div>
            <div className="flex-1 flex gap-2">
              <input
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
                placeholder="Add a comment..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent transition"
              />
              <button
                onClick={handlePostComment}
                disabled={!commentInput.trim()}
                className="p-1.5 rounded-lg bg-[#003366] disabled:bg-slate-200 text-white transition-colors"
              >
                <Send size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MessageBoard() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("win");

  const handlePost = () => {
    if (!content.trim()) return;
    const newMsg = {
      id: `m${Date.now()}`,
      author_uid: CURRENT_USER.uid,
      author_name: CURRENT_USER.name,
      category,
      content: content.trim(),
      created_at: new Date().toISOString(),
      likes: [],
      dislikes: [],
      comments: [],
    };
    setMessages((prev) => [newMsg, ...prev]);
    setContent("");
  };

  const handleEdit = (id, newContent) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, content: newContent } : m))
    );
  };

  const handleLike = (id) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const hasLiked = m.likes.includes(CURRENT_USER.uid);
        return {
          ...m,
          likes: hasLiked
            ? m.likes.filter((u) => u !== CURRENT_USER.uid)
            : [...m.likes, CURRENT_USER.uid],
          dislikes: m.dislikes.filter((u) => u !== CURRENT_USER.uid),
        };
      })
    );
  };

  const handleDislike = (id) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const hasDisliked = m.dislikes.includes(CURRENT_USER.uid);
        return {
          ...m,
          dislikes: hasDisliked
            ? m.dislikes.filter((u) => u !== CURRENT_USER.uid)
            : [...m.dislikes, CURRENT_USER.uid],
          likes: m.likes.filter((u) => u !== CURRENT_USER.uid),
        };
      })
    );
  };

  const handleAddComment = (msgId, text) => {
    const newComment = {
      id: `c${Date.now()}`,
      author_uid: CURRENT_USER.uid,
      author_name: CURRENT_USER.name,
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, comments: [...m.comments, newComment] } : m
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <MessageSquare className="text-[#003366]" size={28} />
            <h1 className="text-3xl font-bold text-[#003366]">Message Board</h1>
          </div>
          <p className="text-slate-500 text-sm ml-10">
            Share your writing wins and gains with the community.
          </p>
        </div>

        {/* Compose */}
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
            onKeyDown={(e) => e.key === "Enter" && (e.metaKey || e.ctrlKey) && handlePost()}
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
              disabled={!content.trim()}
              className="flex items-center gap-2 bg-[#003366] hover:bg-[#002244] disabled:bg-slate-300 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors duration-150"
            >
              <Send size={15} />
              Post
            </button>
          </div>
        </div>

        {/* Feed */}
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <MessageCard
              key={msg.id}
              msg={msg}
              onLike={handleLike}
              onDislike={handleDislike}
              onEdit={handleEdit}
              onAddComment={handleAddComment}
            />
          ))}
        </div>
      </div>
    </div>
  );
}