import React, { useState } from 'react';
import { Search, FileCheck, CheckCircle2, XCircle, AlertTriangle, Loader2, ShieldAlert, ExternalLink } from 'lucide-react';

interface LookupResult {
  checkCode: string;
  studentName: string;
  studentId: string;
  fileName: string;
  plagiarismPct: number;
  aiWritingPct: number;
  combinedPct: number;
  passed: boolean;
  analyzedAt: string;
  details: string[];
}

// Mock database of plagiarism results keyed by code
// In production this comes from the real D1 database
const MOCK_RESULTS: Record<string, LookupResult> = {
  'ABCD1234': {
    checkCode: 'ABCD1234',
    studentName: 'Jane Doe',
    studentId: 'HICM-2024-089',
    fileName: 'Marketing_Assignment_1.pdf',
    plagiarismPct: 18,
    aiWritingPct: 12,
    combinedPct: 15,
    passed: true,
    analyzedAt: '27 Jul 2026, 14:32',
    details: [
      'Introduction paragraph shows 18% overlap with published journal articles.',
      'Methodology section is original and well-cited.',
      'AI writing patterns detected in the conclusion section (12%).',
    ],
  },
  'XYZ78901': {
    checkCode: 'XYZ78901',
    studentName: 'Paul Nkemdirim',
    studentId: 'HICM-2024-090',
    fileName: 'Research_Paper_Final.pdf',
    plagiarismPct: 42,
    aiWritingPct: 25,
    combinedPct: 34,
    passed: false,
    analyzedAt: '26 Jul 2026, 09:15',
    details: [
      'Literature review section shows significant overlap with online sources (42%).',
      'Introduction section was likely AI-generated based on structural patterns.',
      'References appear correctly formatted but insufficiently cited.',
    ],
  },
};

const PlagiarismGauge: React.FC<{ label: string; pct: number }> = ({ label, pct }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center text-xs">
      <span className="font-semibold text-slate-700">{label}</span>
      <span className={`font-bold font-mono ${pct > 30 ? 'text-red-600' : 'text-emerald-600'}`}>{pct}%</span>
    </div>
    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${pct > 30 ? 'bg-red-500' : pct > 20 ? 'bg-amber-400' : 'bg-emerald-500'}`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  </div>
);

export const PlagiarismCodeLookup: React.FC = () => {
  const [code, setCode] = useState('');
  const [isLooking, setIsLooking] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState('');

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setError('');
    setResult(null);
    setIsLooking(true);

    await new Promise((r) => setTimeout(r, 900)); // simulate network

    // Try API first, fallback to mock
    try {
      const res = await fetch(`/api/plagiarism/lookup?code=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (data.success && data.data) {
        setResult(data.data);
        setIsLooking(false);
        return;
      }
    } catch {}

    // Fallback mock
    const mock = MOCK_RESULTS[trimmed];
    if (mock) {
      setResult(mock);
    } else {
      setError(`No result found for code "${trimmed}". Ask the student to share the exact code shown on their report.`);
    }
    setIsLooking(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16 md:pb-6 font-sans">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Plagiarism Report Lookup</h2>
        <p className="text-sm text-slate-500 mt-1">Enter the unique check code from a student's plagiarism report to view their results.</p>
      </div>

      {/* Lookup form */}
      <form onSubmit={handleLookup} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Check Code</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); setResult(null); }}
              placeholder="e.g. ABCD1234"
              maxLength={8}
              className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-base font-mono font-bold text-slate-800 tracking-widest focus:outline-none focus:border-emerald-500 bg-slate-50"
            />
            <button
              type="submit"
              disabled={!code.trim() || isLooking}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-2"
            >
              {isLooking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {isLooking ? 'Searching...' : 'Look Up'}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}
      </form>

      {/* Result */}
      {result && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden space-y-0">
          {/* Header */}
          <div className="p-5 bg-slate-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                <FileCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-mono">Code: {result.checkCode}</p>
                <h3 className="text-sm font-bold">{result.studentName}</h3>
                <p className="text-xs text-slate-400">{result.studentId} · {result.analyzedAt}</p>
              </div>
            </div>
            <div className={`text-center px-4 py-2 rounded-xl border-2 ${result.passed ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'}`}>
              {result.passed
                ? <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-0.5" />
                : <XCircle className="w-5 h-5 text-red-600 mx-auto mb-0.5" />
              }
              <span className={`text-sm font-extrabold ${result.passed ? 'text-emerald-700' : 'text-red-700'}`}>
                {result.passed ? 'PASS' : 'FAIL'}
              </span>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* File info */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <FileCheck className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-sm font-semibold text-slate-800">{result.fileName}</p>
                <p className="text-xs text-slate-400">Combined score: <strong>{result.combinedPct}%</strong> {result.passed ? '(≤ 30% — Acceptable)' : '(> 30% — Exceeds Threshold)'}</p>
              </div>
            </div>

            {/* Gauges */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Score Breakdown</h4>
              <PlagiarismGauge label="Plagiarism Detected" pct={result.plagiarismPct} />
              <PlagiarismGauge label="AI-Written Content" pct={result.aiWritingPct} />
              <PlagiarismGauge label="Combined Score" pct={result.combinedPct} />
            </div>

            {/* Findings */}
            {result.details.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-500" /> AI Findings
                </h4>
                <ul className="space-y-2">
                  {result.details.map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <ExternalLink className="w-3 h-3 mt-0.5 text-slate-400 flex-shrink-0" /> {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Try demo codes hint */}
      {!result && !error && (
        <div className="text-center text-xs text-slate-400 space-y-1">
          <p>Try demo codes: <button onClick={() => setCode('ABCD1234')} className="font-mono text-emerald-600 hover:underline">ABCD1234</button> or <button onClick={() => setCode('XYZ78901')} className="font-mono text-red-500 hover:underline">XYZ78901</button></p>
        </div>
      )}
    </div>
  );
};
