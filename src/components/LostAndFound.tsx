import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { ArrowLeft, Search, PlusCircle, MapPin, Phone, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LostAndFoundProps {
  user: User | null;
}

export const LostAndFound: React.FC<LostAndFoundProps> = ({ user }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'browse' | 'report'>('browse');
  
  const [type, setType] = useState('lost');
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchItems = async () => {
    try {
      const res = await fetch(`/api/lost-and-found`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!itemName.trim() || !description.trim()) {
      setMessage('Item Name and Description are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/lost-and-found', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId: user.id,
          type,
          itemName,
          description,
          location,
          contactInfo
        })
      });
      const data = await res.json();
      if (data.success) {
        setItemName('');
        setDescription('');
        setLocation('');
        setContactInfo('');
        setMessage(`Successfully reported ${type} item.`);
        setActiveTab('browse');
        fetchItems();
      } else {
        setMessage(data.error || 'Failed to submit report.');
      }
    } catch (err) {
      setMessage('Network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto space-y-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-black hover:text-white text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Back</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-black">Lost & Found</h2>
              <p className="text-xs text-black">Report or find missing items on campus.</p>
            </div>
          </div>
          <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'browse' ? 'bg-amber-500 text-navy-900 shadow-sm' : 'text-black hover:text-white'
              }`}
            >
              Browse Items
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'report' ? 'bg-amber-500 text-navy-900 shadow-sm' : 'text-black hover:text-white'
              }`}
            >
              Report Item
            </button>
          </div>
        </div>

        {message && activeTab === 'report' && (
          <div className="p-3 bg-slate-50/80 rounded-xl border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            {message}
          </div>
        )}

        {activeTab === 'browse' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {isLoading ? (
                <div className="text-xs text-black col-span-2">Loading items...</div>
              ) : items.length === 0 ? (
                <div className="text-xs text-black text-center py-8 col-span-2">No lost or found items reported yet.</div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-black">{item.itemName}</h4>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          item.type === 'lost' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {item.type}
                        </span>
                      </div>
                      <span className="text-[10px] text-black">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <p className="text-xs text-black leading-relaxed">{item.description}</p>
                    
                    <div className="space-y-1.5 pt-2 border-t border-slate-200">
                      {item.location && (
                        <div className="flex items-center space-x-2 text-[11px] text-black">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{item.location}</span>
                        </div>
                      )}
                      {item.contactInfo && (
                        <div className="flex items-center space-x-2 text-[11px] text-black">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{item.contactInfo}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 text-[11px] text-black">
                        <Info className="w-3.5 h-3.5" />
                        <span>Reported by: {item.reporterName}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-xl mx-auto space-y-4">
            <h3 className="text-sm font-bold text-black">File a Report</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-black mb-1.5">Report Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 text-sm text-black cursor-pointer">
                    <input type="radio" value="lost" checked={type === 'lost'} onChange={(e) => setType(e.target.value)} className="accent-amber-500" />
                    <span>I lost something</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm text-black cursor-pointer">
                    <input type="radio" value="found" checked={type === 'found'} onChange={(e) => setType(e.target.value)} className="accent-amber-500" />
                    <span>I found something</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-black mb-1.5">Item Name *</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Blue Dell Laptop, Student ID Card"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-black focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black mb-1.5">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide distinguishing features, colors, brands..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-black focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black mb-1.5">Location (Optional)</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Where was it lost/found? (e.g. Library 2nd Floor)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-black focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black mb-1.5">Contact Info (Optional)</label>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="How can someone reach you? (Phone, Email, etc.)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-black focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !user}
                className="w-full flex items-center justify-center space-x-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-navy-900 font-bold rounded-xl text-xs transition-colors shadow"
              >
                <span>{isSubmitting ? 'Submitting...' : 'Submit Report'}</span>
                {!isSubmitting && <PlusCircle className="w-4 h-4" />}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
