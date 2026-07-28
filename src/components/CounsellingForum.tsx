import React, { useState, useEffect, useRef } from 'react';
import { ForumMessage, User, CounsellingSession } from '../types';
import {
  MessageSquare, Send, Image as ImageIcon, Mic, MicOff, X,
  ShieldAlert, AlertTriangle, Loader, Eye, EyeOff, PhoneCall
} from 'lucide-react';

interface CounsellingForumProps {
  currentUser: User | null;
  session: CounsellingSession;
  onClose?: () => void;
}

export const CounsellingForum: React.FC<CounsellingForumProps> = ({
  currentUser,
  session,
  onClose,
}) => {
  const [messages, setMessages] = useState<ForumMessage[]>(session.messages || []);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [pendingAudio, setPendingAudio] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Removed auto-scroll on mount/update to prevent page jump
  }, [messages]);

  const displayName = session.isAnonymous && currentUser?.role === 'student'
    ? 'Anonymous Student'
    : currentUser?.name || 'Unknown';

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPendingImage(ev.target?.result as string);
    };
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
        reader.onload = (ev) => {
          setPendingAudio(ev.target?.result as string);
        };
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

  const clearPending = () => {
    setPendingImage(null);
    setPendingAudio(null);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const text = inputText.trim();
    if (!text && !pendingImage && !pendingAudio) return;

    const newMsg: ForumMessage = {
      id: `msg-${Date.now()}`,
      author: displayName,
      role: currentUser.role,
      text: text || undefined,
      imageUrl: pendingImage || undefined,
      audioUrl: pendingAudio || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    clearPending();
  };

  const isMe = (msg: ForumMessage) => {
    return msg.author === displayName || msg.author === currentUser?.name;
  };

  return (
    <div className="flex flex-col h-[600px] bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-white text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
            <PhoneCall className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold">Counselling Session</p>
            <div className="flex items-center gap-1.5 text-xs text-black mt-0.5">
              {session.isAnonymous ? (
                <><EyeOff className="w-3 h-3" /><span>Anonymous mode</span></>
              ) : (
                <><Eye className="w-3 h-3" /><span>Identity revealed</span></>
              )}
              <span>·</span>
              <span className="capitalize">{session.mode}</span>
            </div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Privacy notice */}
      <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2 text-xs text-blue-700">
        <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
        <span>This is a private, confidential counselling session. Only you and your counsellor can see these messages.</span>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-100 flex items-center justify-between text-xs text-red-600">
          <div className="flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5" />{errorMessage}</div>
          <button onClick={() => setErrorMessage('')}><X className="w-3 h-3" /></button>
        </div>
      )}

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-black text-sm font-medium">
            Start your counselling session by sending a message.
          </div>
        ) : (
          messages.map((msg) => {
            const mine = isMe(msg);
            return (
              <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-sm rounded-2xl p-3 space-y-2 shadow-sm ${
                    mine
                      ? 'bg-emerald-500 text-white rounded-br-sm'
                      : 'bg-white border border-slate-200 text-black rounded-bl-sm'
                  }`}
                >
                  <div className={`text-[10px] font-bold ${mine ? 'text-emerald-100' : 'text-black'}`}>
                    {msg.author} · {msg.timestamp}
                  </div>
                  {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}
                  {msg.imageUrl && (
                    <img
                      src={msg.imageUrl}
                      alt="Shared image"
                      className="w-full max-w-xs rounded-xl object-cover cursor-pointer"
                    />
                  )}
                  {msg.audioUrl && (
                    <audio controls src={msg.audioUrl} className="w-full h-8 rounded-xl" />
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Pending media preview */}
      {(pendingImage || pendingAudio) && (
        <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center gap-3">
          {pendingImage && (
            <div className="relative">
              <img src={pendingImage} alt="preview" className="w-12 h-12 rounded-lg object-cover" />
              <button
                onClick={() => setPendingImage(null)}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px]"
              ><X className="w-2.5 h-2.5" /></button>
            </div>
          )}
          {pendingAudio && (
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-black">
              <Mic className="w-3.5 h-3.5 text-emerald-500" />
              <span>Voice note ready</span>
              <button onClick={() => setPendingAudio(null)}><X className="w-3 h-3 text-red-400" /></button>
            </div>
          )}
        </div>
      )}

      {/* Input Bar */}
      <form onSubmit={handleSend} className="px-4 py-3 bg-white border-t border-slate-200 flex gap-2 items-center">
        {/* Image */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 text-black hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
          title="Attach image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        {/* Voice */}
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-2.5 rounded-xl transition-colors ${
            isRecording
              ? 'text-red-500 bg-red-50 hover:bg-red-100 animate-pulse'
              : 'text-black hover:text-emerald-600 hover:bg-emerald-50'
          }`}
          title={isRecording ? 'Stop recording' : 'Record voice note'}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={!currentUser || isSending}
          placeholder="Type your message..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 placeholder:text-black"
        />

        <button
          type="submit"
          disabled={(!inputText.trim() && !pendingImage && !pendingAudio) || isSending}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-black font-bold rounded-xl text-sm transition-colors flex items-center gap-1.5"
        >
          {isSending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
};
