import React, { useState } from 'react';
import { Settings, ShieldAlert, CreditCard, Save, Upload, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { AdminSettingsConfig } from '../types';

interface AdminSettingsProps {
  settings: AdminSettingsConfig;
  onUpdateSettings: (newSettings: AdminSettingsConfig) => void;
  onEnforceMatricules: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ settings, onUpdateSettings, onEnforceMatricules }) => {
  const [localSettings, setLocalSettings] = useState<AdminSettingsConfig>(settings);
  const [isSaved, setIsSaved] = useState(false);
  const [rawMatricules, setRawMatricules] = useState(settings.validMatricules.join('\n'));

  const handleSave = () => {
    const matricules = rawMatricules.split('\n').map(m => m.trim()).filter(m => m.length > 0);
    const newSettings = { ...localSettings, validMatricules: matricules };
    onUpdateSettings(newSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleFileUploadMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Simulate reading a file and getting matricules
      const mockParsed = 'HICM-2024-001\nHICM-2024-002\nHICM-2024-003\nHICM-2024-089\nHICM-2024-090';
      setRawMatricules(mockParsed);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 md:pb-6 font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-500" />
          System Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">Configure plagiarism payment details and matricule verification.</p>
      </div>

      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-5 h-5" /> Settings saved successfully.
        </div>
      )}

      {/* Payment Configuration */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><CreditCard className="w-5 h-5" /></div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Plagiarism Payment Info</h2>
            <p className="text-xs text-slate-500">Set the payment numbers and names shown to students.</p>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Primary (MTN MoMo)</h3>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">MoMo Number</label>
              <input
                type="text"
                value={localSettings.plagiarismPayment.primaryNumber}
                onChange={e => setLocalSettings(s => ({ ...s, plagiarismPayment: { ...s.plagiarismPayment, primaryNumber: e.target.value } }))}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Account Name</label>
              <input
                type="text"
                value={localSettings.plagiarismPayment.primaryName}
                onChange={e => setLocalSettings(s => ({ ...s, plagiarismPayment: { ...s.plagiarismPayment, primaryName: e.target.value } }))}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Secondary (Orange Money) - Optional</h3>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Orange Number</label>
              <input
                type="text"
                value={localSettings.plagiarismPayment.secondaryNumber || ''}
                onChange={e => setLocalSettings(s => ({ ...s, plagiarismPayment: { ...s.plagiarismPayment, secondaryNumber: e.target.value } }))}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Account Name</label>
              <input
                type="text"
                value={localSettings.plagiarismPayment.secondaryName || ''}
                onChange={e => setLocalSettings(s => ({ ...s, plagiarismPayment: { ...s.plagiarismPayment, secondaryName: e.target.value } }))}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Matricule Verification */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><ShieldAlert className="w-5 h-5" /></div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Matricule Verification</h2>
              <p className="text-xs text-slate-500">Restrict registration to a pre-approved list of matricules.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Enabled</span>
            <button
              onClick={() => setLocalSettings(s => ({ ...s, matriculeVerificationEnabled: !s.matriculeVerificationEnabled }))}
              className={`w-11 h-6 rounded-full transition-colors relative ${localSettings.matriculeVerificationEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <span className={`block w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${localSettings.matriculeVerificationEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
        
        {localSettings.matriculeVerificationEnabled && (
          <div className="p-6 space-y-4 bg-slate-50">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block mb-1">Verification is Active</strong>
                New student registrations will fail if their matricule is not in the list below. You can paste matricules manually (one per line) or simulate uploading a file.
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Valid Matricules (One per line)</label>
              <textarea
                value={rawMatricules}
                onChange={e => setRawMatricules(e.target.value)}
                rows={6}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-emerald-500"
                placeholder="HICM-2024-001&#10;HICM-2024-002"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <input type="file" accept=".pdf,.xlsx,.csv" id="matricule-upload" className="hidden" onChange={handleFileUploadMock} />
                <label htmlFor="matricule-upload" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                  <Upload className="w-4 h-4" /> Simulate File Upload
                </label>
              </div>

              <button
                onClick={() => {
                  if (confirm("This will suspend any registered user whose matricule is not in the updated list. Are you sure?")) {
                    handleSave(); // Save first
                    setTimeout(onEnforceMatricules, 100); // Then enforce
                  }
                }}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl text-sm transition-colors flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" /> Enforce Matricule Rule
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-2 transition-colors shadow-lg"
        >
          <Save className="w-5 h-5" /> Save All Settings
        </button>
      </div>

    </div>
  );
};
