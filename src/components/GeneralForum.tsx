import React, { useState, useEffect, useRef } from 'react';
import { ForumMessage, User } from '../types';
import {
  Send, Image as ImageIcon, Mic, MicOff, X,
  AlertTriangle, Loader, Reply, Trash2, CornerDownRight
} from 'lucide-react';

interface GeneralForumProps {
  currentUser: User | null;
  forumType?: 'general' | 'department';
  departmentName?: string;
  customUsername?: string;
}

// Notification sound (short beep via Web Audio API)
const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch {}
};

const formatTimestamp = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
  if (diffWeeks === 1) return '1 week ago';
  if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

interface LocalMessage extends ForumMessage {
  replyTo?: { id: string; author: string; text?: string };
  deleted?: boolean;
  createdAt: string;
}

export const GeneralForum: React.FC<GeneralForumProps> = ({
  currentUser,
  forumType = 'general',
  departmentName,
  customUsername,
}) => {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<LocalMessage | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [pendingAudio, setPendingAudio] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const isStaffBlocked = currentUser?.role === 'staff' && !currentUser?.isForumApproved;

  const forumTitle = forumType === 'department' && departmentName
    ? `${departmentName} Department Forum`
    : 'HICM General Forum';

  const fetchMessages = async () => {
    try {
      const endpoint = forumType === 'department'
        ? `/api/forum?department=${encodeURIComponent(departmentName || '')}`
        : '/api/forum';
      const res = await fetch(endpoint);
      const data = await res.json();
      if (data.success && data.data) {
        setMessages(data.data.map((m: any) => ({ ...m, createdAt: m.createdAt || new Date().toISOString() })));
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [forumType, departmentName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPendingImage(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = (ev) => setPendingAudio(ev.target?.result as string);
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      setErrorMessage('Microphone access denied.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleDelete = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => m.id === msgId ? { ...m, deleted: true, text: undefined, imageUrl: undefined, audioUrl: undefined } : m)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!currentUser || isStaffBlocked) return;
    const text = inputText.trim();
    if (!text && !pendingImage && !pendingAudio) return;

    const newMsg: LocalMessage = {
      id: `msg-${Date.now()}`,
      author: customUsername || currentUser.name,
      role: currentUser.role,
      text: text || undefined,
      imageUrl: pendingImage || undefined,
      audioUrl: pendingAudio || undefined,
      timestamp: formatTimestamp(new Date().toISOString()),
      createdAt: new Date().toISOString(),
      replyTo: replyingTo
        ? { id: replyingTo.id, author: replyingTo.author, text: replyingTo.text }
        : undefined,
    };

    // Notify the person being replied to
    if (replyingTo && replyingTo.author !== currentUser.name) {
      playNotificationSound();
    }

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setPendingImage(null);
    setPendingAudio(null);
    setReplyingTo(null);

    setIsSending(true);
    fetch('/api/forum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text || '', authorId: currentUser.id, imageUrl: newMsg.imageUrl, audioUrl: newMsg.audioUrl }),
    })
      .catch(() => {})
      .finally(() => setIsSending(false));
  };

  return (
    <div className="max-w-4xl w-full mx-auto space-y-4 pb-20 md:pb-6">
      {isStaffBlocked && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          Your forum access is pending admin approval. You can read but cannot post.
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col" style={{ height: '70vh', minHeight: '500px' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-800 text-white flex-shrink-0">
          <div>
            <h2 className="text-sm font-bold">{forumTitle}</h2>
            <p className="text-xs text-slate-400">{messages.length} messages</p>
          </div>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" title="Live" />
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="px-4 py-2 bg-red-50 border-b border-red-100 flex items-center justify-between text-xs text-red-600 flex-shrink-0">
            <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errorMessage}</span>
            <button onClick={() => setErrorMessage('')}><X className="w-3 h-3" /></button>
          </div>
        )}

        {/* Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {isLoading ? (
            <div className="h-full flex items-center justify-center gap-2 text-slate-400">
              <Loader className="w-5 h-5 animate-spin" /><span className="text-sm">Loading...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              No messages yet. Start the discussion!
            </div>
          ) : (
            messages.map((msg) => {
              const currentName = customUsername || currentUser?.name;
              const isMe = currentName === msg.author || currentUser?.name === msg.author;
              const isStaffMsg = msg.role === 'staff' || msg.role === 'admin';

              if (msg.deleted) {
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <p className="text-xs text-slate-400 italic px-4 py-2 bg-slate-100 rounded-full border border-slate-200">
                      This message was deleted
                    </p>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                  <div className={`max-w-[80%] md:max-w-lg space-y-1.5 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    {/* Reply context */}
                    {msg.replyTo && (
                      <div className={`flex items-start gap-1 px-3 py-1.5 rounded-xl border text-xs text-slate-500 bg-slate-100 border-slate-200 max-w-full ${isMe ? 'self-end' : 'self-start'}`}>
                        <CornerDownRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-slate-400" />
                        <span className="font-bold text-slate-600 mr-1">{msg.replyTo.author}:</span>
                        <span className="truncate">{msg.replyTo.text || '(media)'}</span>
                      </div>
                    )}

                    <div className={`rounded-2xl p-3 shadow-sm ${
                      isMe
                        ? 'bg-emerald-500 text-white rounded-br-none'
                        : isStaffMsg
                        ? 'bg-amber-50 border border-amber-200 text-slate-800 rounded-bl-none'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                    }`}>
                      <div className={`flex items-center justify-between gap-3 mb-1 text-[10px] ${isMe ? 'text-emerald-100' : 'text-slate-400'}`}>
                        <span className="font-bold">{msg.author}</span>
                        <span>{formatTimestamp(msg.createdAt)}</span>
                      </div>
                      {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}
                      {msg.imageUrl && <img src={msg.imageUrl} alt="Shared" className="w-full max-w-xs rounded-xl mt-1 object-cover" />}
                      {msg.audioUrl && <audio controls src={msg.audioUrl} className="w-full h-8 mt-1" />}
                    </div>

                    {/* Actions */}
                    <div className={`flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <button
                        onClick={() => setReplyingTo(msg)}
                        className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-700 px-2 py-0.5 rounded-full bg-white border border-slate-200 shadow-sm"
                      >
                        <Reply className="w-3 h-3" /> Reply
                      </button>
                      {isMe && (
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-600 px-2 py-0.5 rounded-full bg-white border border-red-100 shadow-sm"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply strip */}
        {replyingTo && (
          <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-100 flex items-center justify-between text-xs text-emerald-700 flex-shrink-0">
            <div className="flex items-center gap-2">
              <CornerDownRight className="w-3.5 h-3.5" />
              <span>Replying to <strong>{replyingTo.author}</strong>: {replyingTo.text?.slice(0, 50) || '(media)'}...</span>
            </div>
            <button onClick={() => setReplyingTo(null)}><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {/* Pending media */}
        {(pendingImage || pendingAudio) && (
          <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center gap-3 flex-shrink-0">
            {pendingImage && (
              <div className="relative">
                <img src={pendingImage} alt="preview" className="w-12 h-12 rounded-lg object-cover border border-slate-300" />
                <button onClick={() => setPendingImage(null)} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center">
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            )}
            {pendingAudio && (
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-600">
                <Mic className="w-3.5 h-3.5 text-emerald-500" /> Voice note ready
                <button onClick={() => setPendingAudio(null)}><X className="w-3 h-3 text-red-400" /></button>
              </div>
            )}
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="px-3 py-3 bg-white border-t border-slate-200 flex gap-2 items-center flex-shrink-0">
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isStaffBlocked}
            className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors disabled:opacity-40" title="Attach photo">
            <ImageIcon className="w-4 h-4" />
          </button>
          <button type="button" onClick={isRecording ? stopRecording : startRecording} disabled={isStaffBlocked}
            className={`p-2.5 rounded-xl transition-colors disabled:opacity-40 ${isRecording ? 'text-red-500 bg-red-50 animate-pulse' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}>
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => { setInputText(e.target.value); if (errorMessage) setErrorMessage(''); }}
            disabled={!currentUser || isSending || isStaffBlocked}
            placeholder={isStaffBlocked ? 'Forum access pending...' : `Message ${forumTitle}...`}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 placeholder:text-slate-400 disabled:opacity-50"
          />
          <button type="submit"
            disabled={(!inputText.trim() && !pendingImage && !pendingAudio) || !currentUser || isSending || isStaffBlocked}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-1.5">
            {isSending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
