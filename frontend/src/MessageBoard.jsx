import React, { useState } from 'react';
import { Send, Heart, MessageCircle, Trash2, User } from 'lucide-react';

export default function MessageBoard() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      author: 'Dr. Sarah Chen',
      department: 'English Literature',
      avatar: 'SC',
      content: 'Just hit 2000 words today with the writing timer! The focused sessions really helped me break through that chapter I was stuck on.',
      timestamp: '2 hours ago',
      likes: 8,
      replies: 2,
      liked: false,
      color: 'from-amber-400 to-orange-400',
    },
    {
      id: 2,
      author: 'Prof. Marcus Johnson',
      department: 'History',
      avatar: 'MJ',
      content: 'Anyone else using the Pomodoro setting? Found it works best for editing my research papers.',
      timestamp: '4 hours ago',
      likes: 12,
      replies: 5,
      liked: false,
      color: 'from-blue-400 to-cyan-400',
    },
    {
      id: 3,
      author: 'Dr. Lisa Rodriguez',
      department: 'Philosophy',
      avatar: 'LR',
      content: 'The accountability aspect of having this shared space is what keeps me coming back. Love seeing everyone\'s progress!',
      timestamp: '6 hours ago',
      likes: 15,
      replies: 3,
      liked: false,
      color: 'from-rose-400 to-pink-400',
    },
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [focusedInput, setFocusedInput] = useState(false);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        author: 'You',
        department: 'Your Department',
        avatar: 'YO',
        content: newMessage,
        timestamp: 'just now',
        likes: 0,
        replies: 0,
        liked: false,
        color: 'from-purple-400 to-violet-400',
      };
      setMessages([message, ...messages]);
      setNewMessage('');
    }
  };

  const toggleLike = (id) => {
    setMessages(
      messages.map((msg) =>
        msg.id === id
          ? { ...msg, liked: !msg.liked, likes: msg.liked ? msg.likes - 1 : msg.likes + 1 }
          : msg
      )
    );
  };

  const deleteMessage = (id) => {
    setMessages(messages.filter((msg) => msg.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="sticky top-0 z-20 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
          <div className="max-w-2xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
                Faculty Commons
              </h1>
              <div className="text-sm text-slate-400 font-medium">
                {messages.length} conversations
              </div>
            </div>
            <p className="text-slate-400 text-sm">
              Share your writing progress, strategies, and celebrate wins together
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-2xl mx-auto px-6 py-8">
          {/* Message input */}
          <div className="mb-12">
            <div
              className={`relative rounded-2xl border transition-all duration-300 backdrop-blur-sm ${
                focusedInput
                  ? 'border-purple-400 bg-slate-800/80 shadow-lg shadow-purple-500/20'
                  : 'border-slate-700 bg-slate-800/40 hover:bg-slate-800/60'
              }`}
            >
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onFocus={() => setFocusedInput(true)}
                onBlur={() => setFocusedInput(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleSendMessage();
                  }
                }}
                placeholder="Share your writing wins, ask for advice, or encourage a colleague..."
                className="w-full px-6 py-4 bg-transparent text-slate-100 placeholder-slate-500 outline-none resize-none text-base leading-relaxed"
                rows="4"
              />
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/30">
                <span className="text-xs text-slate-500">
                  Tip: Press Ctrl+Enter to send
                </span>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    newMessage.trim()
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg hover:shadow-purple-500/40 hover:scale-105'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Send size={16} />
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Messages feed */}
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className="group animate-in fade-in slide-in-from-top-4 duration-500"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative rounded-xl border border-slate-700/50 backdrop-blur-sm bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/50">
                  {/* Author header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${message.color} flex items-center justify-center text-white font-semibold text-sm`}
                      >
                        {message.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-100">
                          {message.author}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {message.department} • {message.timestamp}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteMessage(message.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all duration-200 p-1.5 hover:bg-slate-700/50 rounded-lg"
                      aria-label="Delete message"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Message content */}
                  <p className="text-slate-200 leading-relaxed mb-4 text-sm">
                    {message.content}
                  </p>

                  {/* Actions footer */}
                  <div className="flex items-center gap-4 pt-4 border-t border-slate-700/30">
                    <button
                      onClick={() => toggleLike(message.id)}
                      className={`flex items-center gap-2 text-xs font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
                        message.liked
                          ? 'text-red-400 bg-red-950/30'
                          : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
                      }`}
                    >
                      <Heart
                        size={16}
                        fill={message.liked ? 'currentColor' : 'none'}
                      />
                      <span>{message.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-300 hover:bg-slate-700/30 transition-all duration-200 px-3 py-2 rounded-lg">
                      <MessageCircle size={16} />
                      <span>{message.replies}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state message (hidden when there are messages) */}
          {messages.length === 0 && (
            <div className="text-center py-16">
              <MessageCircle size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400 text-lg">
                No messages yet. Be the first to share!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}