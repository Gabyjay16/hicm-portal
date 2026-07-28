import React, { useState } from 'react';
import { User } from '../types';
import { FileUp, Image, Send, CheckCircle, AlertCircle } from 'lucide-react';

interface VotingRequestFormProps {
  user: User | null;
}

export const VotingRequestForm: React.FC<VotingRequestFormProps> = ({ user }) => {
  const [formData, setFormData] = useState({
    position: '',
    pitch: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Request Submitted</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Your request to be placed on the election ballot has been submitted to administration. You will be notified once it is approved.
        </p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-colors"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Voting Poll Application</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Submit your profile and pitch to run for a student government position.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Intended Position <span className="text-red-500">*</span>
              </label>
              <select 
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
              >
                <option value="">Select a position...</option>
                <option value="president">HICMSA President</option>
                <option value="vice-president">Vice President</option>
                <option value="secretary">Secretary General</option>
                <option value="financial">Financial Secretary</option>
                <option value="social">Social Coordinator</option>
                <option value="sports">Sports Coordinator</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Campaign Pitch / Manifesto <span className="text-red-500">*</span>
              </label>
              <textarea 
                required
                rows={4}
                placeholder="Tell the students why they should vote for you..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                value={formData.pitch}
                onChange={(e) => setFormData({...formData, pitch: e.target.value})}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                This will be displayed on your voting card if approved. Keep it concise and impactful.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Profile Picture <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <input 
                  type="file"
                  id="profile-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
                <label 
                  htmlFor="profile-upload"
                  className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-xl appearance-none cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <span className="flex items-center space-x-2">
                    <Image className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                    <span className="font-medium text-slate-600 dark:text-slate-300 group-hover:text-blue-600">
                      {file ? file.name : 'Click to upload a clear headshot'}
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800 dark:text-blue-300">
              By submitting this form, you request to be officially listed as a candidate. Administration will verify your eligibility before your profile appears on the ballot.
            </p>
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" /> Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
