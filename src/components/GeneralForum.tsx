import React, { useState, useEffect, useRef } from 'react';
import { ForumMessage, User } from '../types';
import {
  MessageSquare, AlertTriangle, Send, ShieldAlert, Loader,
  Image as ImageIcon, Mic, MicOff, X
} from 'lucide-react';
import { checkForForbiddenLinks } from '../utils/urlValidator';

interface GeneralForumProps {
  currentUser: User | null;
}

export const GeneralForum: React.FC<GeneralForumProps> = ({ currentUser }) => {
  const [messages, setMessages] = useState<ForumMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);

  // Media state
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [pendingAudio, setPendingAudio] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Staff forum access check
  const isStaffBlocked =
    currentUser?.role === 'staff' && !currentUser?.isForumApproved;

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/forum');
      const data = await res.json();
      if (data.success && data.data) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Image handler ────────────────────────────────────────────────────────
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPendingImage(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ── Voice recording ──────────────────────────────────────────────────────
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!currentUser) {
      setErrorMessage('You must be logged in to post.');
      return;
    }

    if (isStaffBlocked) {
      setErrorMessage('Your forum access is pending admin approval.');
      return;
    }

    const textToSubmit = inputText.trim();
    if (!textToSubmit && !pendingImage && !pendingAudio) return;

    if (textToSubmit && checkForForbiddenLinks(textToSubmit)) {
      setErrorMessage('Web links are strictly forbidden.');
      return;
    }

    // Optimistic local add
    const newMsg: ForumMessage = {
      id: `msg-${Date.now()}`,
      author: currentUser.name,
      role: currentUser.role,
      text: textToSubmit || undefined,
      imageUrl: pendingImage || undefined,
      audioUrl: pendingAudio || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setPendingImage(null);
    setPendingAudio(null);

    setIsSending(true);
    try {
      const res = await fetch('/api/forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSubmit || '',
          authorId: currentUser.id,
          imageUrl: newMsg.imageUrl,
          audioUrl: newMsg.audioUrl,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setErrorMessage(data.error || 'Failed to post message.');
      }
    } catch {
      setErrorMessage('Network error occurred.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto space-y-6 pb-20 md:pb-6">
      {/* Warning Banner */}
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-red-100 text-red-500 border border-red-200 flex-shrink-0 animate-pulse">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-red-600 uppercase tracking-wider">
            Academic Forum Security Rule
          </h3>
          <p className="text-xs text-red-500 font-semibold mt-0.5">"Web links are strictly forbidden."</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Posts containing HTTP/HTTPS links, domain extensions (.com, .org, .edu), or www prefixes will be blocked.
          </p>
        </div>
      </div>

      {/* Staff access blocked banner */}
      {isStaffBlocked && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          Your forum access is pending admin approval. You can read messages but cannot post until approved.
        </div>
      )}

      {/* Main Forum Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[580px]">
        {/* Header */}
        <div className="p-4 bg-slate-800 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold">HICM General Forum</h2>
              <p className="text-xs text-slate-400">Moderated academic discussion wall</p>
            </div>
          </div>
          <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            {messages.length} Messages
          </span>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border-b border-red-200 text-red-600 text-xs font-bold flex items-center justify-between px-4 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage('')} className="text-red-400 hover:text-red-700 font-bold">✕</button>
          </div>
        )}

        {/* Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-slate-400 space-x-2">
              <Loader className="w-5 h-5 animate-spin" />
              <span className="text-sm font-semibold">Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
              No messages yet. Start the discussion!
            </div>
          ) : (
            messages.map((msg) => {
              const isStaff = msg.role === 'staff' || msg.role === 'admin';
              const isMe = currentUser && currentUser.name === msg.author;

              return (
                <div key={msg.id} className={`flex space-x-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-sm md:max-w-lg rounded-2xl p-3 space-y-2 shadow-sm border ${
                      isMe
                        ? 'bg-emerald-500 border-emerald-400 text-white rounded-br-none'
                        : isStaff
                        ? 'bg-amber-50 border-amber-200 text-slate-800 rounded-bl-none'
                        : 'bg-white border-slate-200 text-slate-800 rounded-bl-none'
                    }`}
                  >
                    <div className={`flex items-center justify-between gap-4 pb-1 text-xs border-b ${isMe ? 'border-emerald-400/30' : 'border-slate-100'}`}>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold">{msg.author}</span>
                        <span
                          className={`text-[10px] font-bold uppercase px-1.5 rounded border ${
                            isStaff
                              ? 'bg-amber-100 text-amber-700 border-amber-200'
                              : isMe
                              ? 'bg-emerald-600 text-white border-emerald-500'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {msg.role}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono ${isMe ? 'text-emerald-100' : 'text-slate-400'}`}>{msg.timestamp}</span>
                    </div>
                    {msg.text && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                    {msg.imageUrl && (
                      <img
                        src={msg.imageUrl}
                        alt="Shared"
                        className="w-full max-w-xs rounded-xl object-cover cursor-pointer"
                      />
                    )}
                    {msg.audioUrl && (
                      <audio controls src={msg.audioUrl} className="w-full h-8" />
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Pending media preview strip */}
        {(pendingImage || pendingAudio) && (
          <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center gap-3 flex-shrink-0">
            {pendingImage && (
              <div className="relative">
                <img src={pendingImage} alt="preview" className="w-12 h-12 rounded-lg object-cover border border-slate-300" />
                <button
                  onClick={() => setPendingImage(null)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center"
                ><X className="w-2.5 h-2.5" /></button>
              </div>
            )}
            {pendingAudio && (
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-600">
                <Mic className="w-3.5 h-3.5 text-emerald-500" />
                <span>Voice note ready</span>
                <button onClick={() => setPendingAudio(null)}><X className="w-3 h-3 text-red-400" /></button>
              </div>
            )}
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-200 flex gap-2 items-center flex-shrink-0">
          {/* Image picker */}
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isStaffBlocked}
            className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors disabled:opacity-40"
            title="Attach photo"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* Voice recorder */}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isStaffBlocked}
            className={`p-2.5 rounded-xl transition-colors disabled:opacity-40 ${
              isRecording
                ? 'text-red-500 bg-red-50 animate-pulse'
                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
            title={isRecording ? 'Stop recording' : 'Record voice note'}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              if (errorMessage) setErrorMessage('');
            }}
            disabled={!currentUser || isSending || isStaffBlocked}
            placeholder={
              isStaffBlocked
                ? 'Forum access pending admin approval...'
                : currentUser
                ? `Post as ${currentUser.name}... (No web links!)`
                : 'Please login to post.'
            }
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 placeholder:text-slate-400 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={(!inputText.trim() && !pendingImage && !pendingAudio) || !currentUser || isSending || isStaffBlocked}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-colors shadow flex items-center space-x-1.5"
          >
            {isSending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
