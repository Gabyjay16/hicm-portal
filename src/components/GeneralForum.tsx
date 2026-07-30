import React, { useState, useEffect, useRef } from 'react';
import { ForumMessage, User } from '../types';
import {
  Send, Image as ImageIcon, Mic, MicOff, X,
  AlertTriangle, Loader, Reply, Trash2, CornerDownRight
} from 'lucide-react';
import { checkForForbiddenLinks } from '../utils/urlValidator';

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

const formatTimestamp = (iso: string): string => {
  try {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return 'Just now';
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Just now';
  }
};

interface LocalMessage {
  id: string;
  author: string;
  role?: string;
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  timestamp?: string;
  createdAt: string; // always ISO
  replyTo?: { id: string; author: string; text?: string };
  deleted?: boolean;
  isLocal?: boolean; // true = only stored locally, not yet confirmed by server
}

const getStorageKey = (forumType: string, departmentName?: string) => {
  if (forumType === 'department' && departmentName) {
    return `forum_msgs_dept_${departmentName.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }
  return 'forum_msgs_general';
};

const saveMessages = (key: string, msgs: LocalMessage[]) => {
  try {
    // Only save last 200 messages to avoid quota issues
    const toSave = msgs.slice(-200);
    localStorage.setItem(key, JSON.stringify(toSave));
  } catch {}
};

const loadMessages = (key: string): LocalMessage[] => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Ensure all messages have createdAt
    return parsed.map((m: any) => ({
      ...m,
      createdAt: m.createdAt || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
};

export const GeneralForum: React.FC<GeneralForumProps> = ({
  currentUser,
  forumType = 'general',
  departmentName,
  customUsername,
}) => {
  const storageKey = getStorageKey(forumType, departmentName);
  
  // Initialize from localStorage immediately
  const [messages, setMessages] = useState<LocalMessage[]>(() => loadMessages(storageKey));
  const [inputText, setInputText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(messages.length === 0);
  const [isSending, setIsSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<LocalMessage | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [pendingAudio, setPendingAudio] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const prevIdsRef = useRef<Set<string>>(new Set(messages.map(m => m.id)));

  const isStaffBlocked = currentUser?.role === 'staff' && !currentUser?.isForumApproved;
  const forumTitle = forumType === 'department' && departmentName
    ? `${departmentName} Forum`
    : 'HICM General Forum';

  // Persist to localStorage whenever messages change
  useEffect(() => {
    saveMessages(storageKey, messages);
  }, [messages, storageKey]);

  // Fetch from API and merge with local (server is source of truth)
  const fetchMessages = async () => {
    try {
      const endpoint = forumType === 'department'
        ? `/api/forum?department=${encodeURIComponent(departmentName || '')}`
        : '/api/forum';
      const res = await fetch(endpoint);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        // Fix: If server returns empty but we have local messages, keep local messages
        // This prevents MSW resets from wiping out local storage persistence
        if (data.data.length === 0 && prevIdsRef.current.size > 0) {
          return;
        }
        const serverMsgs: LocalMessage[] = data.data.map((m: any) => ({
          id: m.id || `srv-${Date.now()}-${Math.random()}`,
          author: m.author || 'Unknown',
          role: m.role,
          text: m.text,
          imageUrl: m.imageUrl,
          audioUrl: m.audioUrl,
          createdAt: m.createdAt || new Date().toISOString(),
          timestamp: m.timestamp,
          replyTo: m.replyTo,
          deleted: m.deleted || false,
          isLocal: false,
        }));

        setMessages(prev => {
          const serverIds = new Set(serverMsgs.map(m => m.id));
          // Keep local-only messages not yet confirmed by server
          const localOnly = prev.filter(m => m.isLocal && !serverIds.has(m.id));
          const merged = [...serverMsgs, ...localOnly].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          
          // Check for new messages from others and play sound
          const newIds = merged.filter(m => !prevIdsRef.current.has(m.id));
          const hasNewFromOther = newIds.some(
            m => m.author !== (customUsername || currentUser?.name)
          );
          if (hasNewFromOther) {
            const forumNotifs = localStorage.getItem('forum_notifications') !== 'false';
            const soundEnabled = localStorage.getItem('notification_sound') !== 'false';
            if (forumNotifs && soundEnabled) playNotificationSound();
          }
          newIds.forEach(m => prevIdsRef.current.add(m.id));
          return merged;
        });
      }
    } catch {
      // silent — local state still shows
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [forumType, departmentName]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPendingImage(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = ev => setPendingAudio(ev.target?.result as string);
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(t => t.stop());
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
    setMessages(prev =>
      prev.map(m => m.id === msgId
        ? { ...m, deleted: true, text: undefined, imageUrl: undefined, audioUrl: undefined }
        : m
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!currentUser || isStaffBlocked) return;
    const text = inputText.trim();
    if (!text && !pendingImage && !pendingAudio) return;

    if (checkForForbiddenLinks(text)) {
      setErrorMessage('Web links are not allowed in this forum.');
      return;
    }

    const now = new Date().toISOString();
    const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const newMsg: LocalMessage = {
      id: localId,
      author: customUsername || currentUser.name,
      role: currentUser.role,
      text: text || undefined,
      imageUrl: pendingImage || undefined,
      audioUrl: pendingAudio || undefined,
      timestamp: 'Just now',
      createdAt: now,
      replyTo: replyingTo
        ? { id: replyingTo.id, author: replyingTo.author, text: replyingTo.text }
        : undefined,
      isLocal: true,
    };

    prevIdsRef.current.add(localId);
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setPendingImage(null);
    setPendingAudio(null);
    setReplyingTo(null);

    // Post to server in background
    setIsSending(true);
    fetch('/api/forum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text || '',
        authorId: currentUser.id,
        author: customUsername || currentUser.name,
        role: currentUser.role,
        imageUrl: pendingImage || undefined,
        audioUrl: pendingAudio || undefined,
        department: forumType === 'department' ? departmentName : undefined,
        createdAt: now,
      }),
    })
      .then(async res => {
        if (res.ok) {
          const data = await res.json();
          if (data.id) {
            // Replace local id with server id
            setMessages(prev => prev.map(m =>
              m.id === localId ? { ...m, id: data.id, isLocal: false } : m
            ));
            prevIdsRef.current.add(data.id);
          }
        }
      })
      .catch(() => {})
      .finally(() => setIsSending(false));
  };

  return (
    <div className="w-full mx-auto space-y-4">
      {isStaffBlocked && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          Your forum access is pending admin approval. You can read but cannot post.
        </div>
      )}

      <div
        className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col"
        style={{ height: 'calc(100dvh - 220px)', minHeight: '400px', maxHeight: '80vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-blue-600 flex-shrink-0">
          <div>
            <h2 className="text-sm font-bold text-white">{forumTitle}</h2>
            <p className="text-xs text-blue-100">
              {messages.filter(m => !m.deleted).length} messages
            </p>
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

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-slate-50" style={{ overflowAnchor: 'none' }}>
          {isLoading && messages.length === 0 ? (
            <div className="h-full flex items-center justify-center gap-2 text-slate-500">
              <Loader className="w-5 h-5 animate-spin" /><span className="text-sm">Loading...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              No messages yet. Start the discussion!
            </div>
          ) : (
            messages.map(msg => {
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
                  <div className={`max-w-[85%] sm:max-w-md space-y-1.5 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    {msg.replyTo && (
                      <div className={`flex items-start gap-1 px-3 py-1.5 rounded-xl border text-xs text-slate-600 bg-slate-100 border-slate-200 max-w-full ${isMe ? 'self-end' : 'self-start'}`}>
                        <CornerDownRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-slate-400" />
                        <span className="font-bold text-slate-700 mr-1">{msg.replyTo.author}:</span>
                        <span className="truncate">{msg.replyTo.text || '(media)'}</span>
                      </div>
                    )}
                    <div className={`rounded-2xl px-3 py-2.5 shadow-sm ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : isStaffMsg
                        ? 'bg-amber-50 border border-amber-200 text-slate-900 rounded-bl-none'
                        : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none'
                    }`}>
                      <div className={`flex items-center justify-between gap-3 mb-1 text-[10px] ${isMe ? 'text-blue-100' : 'text-slate-500'}`}>
                        <span className="font-bold">{msg.author}</span>
                        <span>{formatTimestamp(msg.createdAt)}</span>
                      </div>
                      {msg.text && <p className="text-sm leading-relaxed break-words">{msg.text}</p>}
                      {msg.imageUrl && (
                        <img src={msg.imageUrl} alt="Shared" className="w-full max-w-[200px] sm:max-w-xs rounded-xl mt-1 object-cover" />
                      )}
                      {msg.audioUrl && (
                        <audio controls src={msg.audioUrl} className="w-full mt-1" style={{ maxWidth: '240px', height: '36px' }} />
                      )}
                      {msg.isLocal && (
                        <span className="text-[9px] text-blue-200 block text-right mt-0.5">Sending...</span>
                      )}
                    </div>
                    {/* Action buttons — always visible on touch */}
                    <div className={`flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <button
                        onClick={() => setReplyingTo(msg)}
                        className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-blue-600 px-2 py-1 rounded-full bg-white border border-slate-200 shadow-sm"
                      >
                        <Reply className="w-3 h-3" /> Reply
                      </button>
                      {isMe && (
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-600 px-2 py-1 rounded-full bg-white border border-red-100 shadow-sm"
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
          <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 flex items-center justify-between text-xs text-blue-700 flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <CornerDownRight className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">Replying to <strong>{replyingTo.author}</strong>: {replyingTo.text?.slice(0, 40) || '(media)'}...</span>
            </div>
            <button onClick={() => setReplyingTo(null)} className="flex-shrink-0 ml-2"><X className="w-3.5 h-3.5" /></button>
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
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-700">
                <Mic className="w-3.5 h-3.5 text-blue-500" /> Voice note ready
                <button onClick={() => setPendingAudio(null)}><X className="w-3 h-3 text-red-400" /></button>
              </div>
            )}
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="px-1.5 sm:px-3 py-3 bg-white border-t border-slate-200 flex gap-2 items-center flex-shrink-0 w-full overflow-hidden">
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isStaffBlocked}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-40 flex-shrink-0"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isStaffBlocked}
            className={`p-2 rounded-xl transition-colors disabled:opacity-40 flex-shrink-0 ${isRecording ? 'text-red-500 bg-red-50 animate-pulse' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'}`}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <input
            type="text"
            value={inputText}
            onChange={e => { setInputText(e.target.value); if (errorMessage) setErrorMessage(''); }}
            disabled={!currentUser || isSending || isStaffBlocked}
            placeholder={isStaffBlocked ? 'Forum access pending...' : `Message ${forumTitle}...`}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-base focus:outline-none focus:border-blue-500 placeholder:text-slate-400 disabled:opacity-50 min-w-0"
          />
          <button
            type="submit"
            disabled={(!inputText.trim() && !pendingImage && !pendingAudio) || !currentUser || isSending || isStaffBlocked}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-1.5 flex-shrink-0"
          >
            {isSending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
