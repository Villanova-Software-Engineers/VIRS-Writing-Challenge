import React, { useState, useEffect } from 'react';
import { Send, Heart, MessageCircle, Trash2, Edit2, X } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8001/api';
const CURRENT_USER = 'You';

export default function MessageBoard() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [focusedInput, setFocusedInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [expandedReplies, setExpandedReplies] = useState(new Set());

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        const response = await fetch(`${API_BASE_URL}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            author: CURRENT_USER,
            department: 'Your Department',
            avatar: 'YO',
            content: newMessage,
            color: 'from-blue-600 to-blue-700',
          }),
        });

        if (response.ok) {
          const newMsg = await response.json();
          setMessages([newMsg, ...messages]);
          setNewMessage('');
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const toggleLike = async (id, currentLiked) => {
    try {
      const method = currentLiked ? 'DELETE' : 'POST';
      const response = await fetch(`${API_BASE_URL}/messages/${id}/like`, {
        method: method,
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(
          messages.map((msg) =>
            msg.id === id
              ? { ...msg, liked: !currentLiked, likes: data.likes }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const confirmDelete = (id) => {
    setDeleteConfirm(id);
  };

  const deleteMessage = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessages(messages.filter((msg) => msg.id !== id));
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const startEdit = (message) => {
    setEditingId(message.id);
    setEditContent(message.content);
  };

  const saveEdit = async (id) => {
    if (!editContent.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/messages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent,
        }),
      });

      if (response.ok) {
        const updatedMsg = await response.json();
        setMessages(
          messages.map((msg) =>
            msg.id === id ? updatedMsg : msg
          )
        );
        setEditingId(null);
        setEditContent('');
      }
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const addReply = async (messageId) => {
    if (!replyContent.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/messages/${messageId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          author: CURRENT_USER,
          department: 'Your Department',
          avatar: 'YO',
          content: replyContent,
          color: 'from-blue-600 to-blue-700',
        }),
      });

      if (response.ok) {
        const newReply = await response.json();
        setMessages(
          messages.map((msg) =>
            msg.id === messageId
              ? { ...msg, replies: [...msg.replies, newReply] }
              : msg
          )
        );
        setReplyingTo(null);
        setReplyContent('');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const deleteReply = async (replyId, messageId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/replies/${replyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessages(
          messages.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  replies: msg.replies.filter((r) => r.id !== replyId),
                }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
    }
  };

  const toggleRepliesExpanded = (messageId) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId);
    } else {
      newExpanded.add(messageId);
    }
    setExpandedReplies(newExpanded);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-blue-900">
              Faculty Commons
            </h1>
            <div className="text-sm text-gray-600 font-medium">
              {messages.length} conversations
            </div>
          </div>
          <p className="text-gray-700 text-sm">
            Share your writing progress, strategies, and celebrate wins together
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Message input */}
        <div className="mb-10">
          <div
            className={`relative border transition-all duration-300 ${
              focusedInput
                ? 'border-blue-900 bg-blue-50 shadow-md'
                : 'border-gray-300 bg-white hover:border-gray-400'
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
              className="w-full px-6 py-4 bg-transparent text-gray-900 placeholder-gray-500 outline-none resize-none text-base leading-relaxed font-normal"
              rows="4"
            />
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-300 bg-gray-50">
              <span className="text-xs text-gray-600">
                Tip: Press Ctrl+Enter to send
              </span>
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className={`flex items-center gap-2 px-5 py-2 font-medium transition-all duration-200 ${
                  newMessage.trim()
                    ? 'bg-blue-900 text-white hover:bg-blue-800'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
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
              <div className="relative border border-gray-300 bg-white p-6 hover:border-gray-400 hover:shadow-md transition-all duration-300">
                {/* Author header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${message.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                    >
                      {message.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900">
                        {message.author}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {message.department} • {new Date(message.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {message.author === CURRENT_USER && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button
                        onClick={() => startEdit(message)}
                        className="text-white bg-blue-900 hover:bg-blue-800 transition-all duration-200 p-1.5 rounded"
                        aria-label="Edit message"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => confirmDelete(message.id)}
                        className="text-white bg-red-600 hover:bg-red-700 transition-all duration-200 p-1.5 rounded"
                        aria-label="Delete message"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Message content or edit form */}
                {editingId === message.id ? (
                  <div className="mb-4">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 text-gray-900 rounded border border-gray-300 outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                      rows="3"
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => saveEdit(message.id)}
                        className="px-4 py-2 bg-blue-900 text-white rounded font-medium hover:bg-blue-800"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 bg-gray-400 text-white rounded font-medium hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-800 leading-relaxed mb-4 text-sm font-normal">
                    {message.content}
                  </p>
                )}

                {/* Actions footer */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => toggleLike(message.id, message.liked)}
                    className={`flex items-center gap-2 text-xs font-medium transition-all duration-200 px-3 py-2 rounded ${
                      message.liked
                        ? 'text-white bg-red-600 hover:bg-red-700'
                        : 'text-white bg-gray-400 hover:bg-gray-500'
                    }`}
                  >
                    <Heart
                      size={16}
                      fill={message.liked ? 'currentColor' : 'none'}
                    />
                    <span>{message.likes}</span>
                  </button>
                  <button
                    onClick={() => toggleRepliesExpanded(message.id)}
                    className="flex items-center gap-2 text-xs font-medium text-white bg-gray-400 hover:bg-gray-500 transition-all duration-200 px-3 py-2 rounded"
                  >
                    <MessageCircle size={16} />
                    <span>{message.replies.length}</span>
                  </button>
                </div>

                {/* Replies section */}
                {expandedReplies.has(message.id) && (
                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                    {/* Existing replies */}
                    {message.replies.map((reply) => (
                      <div key={reply.id} className="ml-4 p-4 bg-gray-50 rounded border border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-8 h-8 rounded-full bg-gradient-to-br ${reply.color} flex items-center justify-center text-white font-semibold text-xs flex-shrink-0`}
                            >
                              {reply.avatar}
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-blue-900">
                                {reply.author}
                              </h4>
                              <p className="text-xs text-gray-600">
                                {new Date(reply.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {reply.author === CURRENT_USER && (
                            <button
                              onClick={() => deleteReply(reply.id, message.id)}
                              className="text-white bg-red-600 hover:bg-red-700 transition-all p-1 rounded"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-800">{reply.content}</p>
                      </div>
                    ))}

                    {/* Reply input */}
                    {replyingTo === message.id ? (
                      <div className="ml-4 p-4 bg-gray-50 rounded border border-gray-200">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Write a reply..."
                          className="w-full px-3 py-2 bg-white text-gray-900 rounded border border-gray-300 outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 text-sm"
                          rows="2"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => addReply(message.id)}
                            className="px-3 py-1 bg-blue-900 text-white rounded text-xs font-medium hover:bg-blue-800"
                          >
                            Reply
                          </button>
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyContent('');
                            }}
                            className="px-3 py-1 bg-gray-400 text-white rounded text-xs font-medium hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReplyingTo(message.id)}
                        className="ml-4 text-xs text-blue-900 hover:text-blue-800 font-medium"
                      >
                        + Add reply
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Delete confirmation modal */}
              {deleteConfirm === message.id && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-lg">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">
                      Delete message?
                    </h3>
                    <p className="text-gray-700 mb-6">
                      Are you sure you want to delete this message? This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => deleteMessage(message.id)}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="flex-1 px-4 py-2 bg-gray-400 text-white rounded font-medium hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty state message */}
        {messages.length === 0 && (
          <div className="text-center py-16">
            <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-base">
              No messages yet. Be the first to share!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}