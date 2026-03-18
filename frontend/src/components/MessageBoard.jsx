import { useState } from "react";
import {
  MessageSquare,
  Send,
  ThumbsUp,
  Pencil,
  Trash2,
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
    content: "Finally finished the first draft of my journal article after 3 weeks of grinding. Submitting to peer review next week!",
    created_at: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    likes: ["user-2"],
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
    content: "Discovered the Pomodoro technique finally works for me when I set the timer to 40 minutes instead of 25. Game changer for deep writing sessions.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    likes: ["user-1", "user-3"],
    comments: [],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
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

// ── Comment Component ─────────────────────────────────────────────────────────
function Comment({ comment }) {
  return (
    <div className="flex gap-2 mt-2">
      <div className="shrink-0 w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
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
function MessageCard({ msg, onLike, onEdit, onDelete, onAddComment }) {
  const isOwner = msg.author_uid === CURRENT_USER.uid;
  const hasLiked = msg.likes.includes(CURRENT_USER.uid);

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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow duration-200">
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
        
        {isOwner && !editing && (
          <div className="flex gap-1">
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#003366] hover:bg-slate-100 transition-colors"
              title="Edit"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDelete(msg.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

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
        <p className="text-slate-700 text-sm leading-relaxed mb-4">{msg.content}</p>
      )}

      <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
        <button
          onClick={() => onLike(msg.id)}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            hasLiked
              ? "bg-[#003366] text-white"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          <ThumbsUp size={13} />
          <span>{msg.likes.length || "Like"}</span>
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <MessageSquare size={13} />
          <span>{msg.comments.length || "Comment"}</span>
          {showComments ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {showComments && (
        <div className="mt-3 pl-2 border-l-2 border-slate-100">
          {msg.comments.map((c) => (
            <Comment key={c.id} comment={c} />
          ))}

          <div className="flex gap-2 mt-3">
            <div className="shrink-0 w-7 h-7 rounded-full bg-[#003366] text-white flex items-center justify-center text-xs font-bold">
              {getInitials(CURRENT_USER.name)}
            </div>
            <div className="flex-1 flex gap-2">
              <input
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
                placeholder="Write a comment..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#003366]"
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

  const handlePost = () => {
    if (!content.trim()) return;
    const newMsg = {
      id: `m${Date.now()}`,
      author_uid: CURRENT_USER.uid,
      author_name: CURRENT_USER.name,
      content: content.trim(),
      created_at: new Date().toISOString(),
      likes: [],
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

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }
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
            <h1 className="text-3xl font-bold text-[#003366]">Community Board</h1>
          </div>
          <p className="text-slate-500 text-sm ml-10">Share updates and connect with others.</p>
        </div>

        {/* Compose */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-8">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.metaKey || e.ctrlKey) && handlePost()}
            placeholder="What's on your mind?"
            rows={3}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#003366] transition"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-slate-400">⌘ + Enter to post</span>
            <button
              onClick={handlePost}
              disabled={!content.trim()}
              className="flex items-center gap-2 bg-[#003366] hover:bg-[#002244] disabled:bg-slate-300 text-white text-sm font-semibold px-6 py-2 rounded-xl transition-colors"
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
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddComment={handleAddComment}
            />
          ))}
        </div>
      </div>
    </div>
  );
}