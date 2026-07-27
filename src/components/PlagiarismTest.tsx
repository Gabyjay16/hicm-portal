import React, { useState } from 'react';
import { PlagiarismDoc, MatchingSource } from '../types';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Coins,
  ArrowLeft,
  Loader2,
  ShieldAlert,
  FileCheck,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';

interface PlagiarismTestProps {
  tokens: number;
  onUseToken: () => boolean;
  onAddTokens: (amount: number) => void;
  onBackToDashboard: () => void;
}

export const PlagiarismTest: React.FC<PlagiarismTestProps> = ({
  tokens,
  onUseToken,
  onAddTokens,
  onBackToDashboard,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Analysis simulation state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentStage, setCurrentStage] = useState<string>('');
  const [report, setReport] = useState<PlagiarismDoc | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage('');
    const validTypes = ['.pdf', '.docx', '.txt'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validTypes.includes(ext)) {
      setErrorMessage('Invalid file format. Please upload a .pdf, .docx, or .txt file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds 10MB limit.');
      return;
    }
    setSelectedFile(file);
    setReport(null);
  };

  const startAnalysis = () => {
    if (!selectedFile) {
      setErrorMessage('Please select a file to analyze.');
      return;
    }

    // Check token balance
    if (tokens < 1) {
      setErrorMessage('Insufficient plagiarism tokens. Please redeem tokens to continue.');
      return;
    }

    // Deduct 1 token
    const success = onUseToken();
    if (!success) {
      setErrorMessage('Failed to process token deduction.');
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setErrorMessage('');

    // Simulate analysis stages
    const stages = [
      { pct: 20, label: 'Parsing document structure & extracting text...' },
      { pct: 45, label: 'Cross-referencing HICM Institutional Repository...' },
      { pct: 75, label: 'Checking global web index & academic journals...' },
      { pct: 95, label: 'Generating similarity percentage & matching report...' },
      { pct: 100, label: 'Analysis complete!' },
    ];

    let currentStageIdx = 0;
    const interval = setInterval(() => {
      if (currentStageIdx < stages.length) {
        setProgress(stages[currentStageIdx].pct);
        setCurrentStage(stages[currentStageIdx].label);
        currentStageIdx += 1;
      } else {
        clearInterval(interval);
        setIsAnalyzing(false);

        // Generate report results
        const mockScore = Math.floor(Math.random() * 18) + 4; // 4% to 22% similarity
        const mockSources: MatchingSource[] = [
          {
            source: 'HICM Academic Archive - Research Vol 4 (2023)',
            similarity: Math.floor(mockScore * 0.6),
            snippet: '...strategic management frameworks applied to West African commercial enterprises...',
          },
          {
            source: 'Global Business Review Journal (ISSN 0972-1509)',
            similarity: Math.ceil(mockScore * 0.4),
            snippet: '...financial ratio analysis demonstrates consistent liquidity trends across quarters...',
          },
        ];

        setReport({
          id: `doc-${Date.now()}`,
          name: selectedFile.name,
          size: `${(selectedFile.size / 1024).toFixed(1)} KB`,
          uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: 'completed',
          score: mockScore,
          tokenCost: 1,
          matchingSources: mockSources,
        });
      }
    }, 800);
  };

  return (
    <div className="max-w-3xl w-full mx-auto space-y-6 pb-16 md:pb-6">
      {/* Navigation & Token Balance Bar */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onBackToDashboard}
          className="flex items-center space-x-2 text-slate-300 hover:text-white text-xs font-semibold px-3 py-2 bg-navy-800 border border-slate-700/60 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Back to Dashboard</span>
        </button>

        {/* Token Counter Widget */}
        <div className="flex items-center space-x-3 bg-navy-800 border border-slate-700/60 p-1.5 pl-3 rounded-xl shadow-sm">
          <div className="flex items-center space-x-2 text-xs">
            <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-slate-300">Tokens:</span>
            <strong className="text-emerald-400 font-mono text-sm">{tokens}</strong>
          </div>
          <button
            onClick={() => onAddTokens(3)}
            className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-navy-900 font-bold text-[11px] rounded-lg transition-colors"
            title="Redeem 3 Tokens"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Redeem Tokens</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-navy-800 border border-slate-700/60 rounded-2xl p-6 shadow-xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-offwhite">Plagiarism & Originality Test</h2>
              <p className="text-xs text-slate-400">
                Institutional similarity scanner for assignments & dissertations.
              </p>
            </div>
          </div>

          {/* Payment Status Badge */}
          <div className="flex flex-col items-end">
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                tokens >= 1
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
              }`}
            >
              {tokens >= 1 ? 'Token Ready' : 'Token Required'}
            </span>
            <span className="text-[10px] text-slate-400 mt-1">Cost: 1 Token / Document</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/40 rounded-xl text-red-400 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Drag & Drop File Upload Zone */}
        {!isAnalyzing && !report && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                isDragOver
                  ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]'
                  : selectedFile
                  ? 'border-emerald-500/50 bg-navy-900/90'
                  : 'border-slate-700 bg-navy-900/60 hover:border-slate-500'
              }`}
            >
              <input
                type="file"
                id="file-upload"
                accept=".pdf,.docx,.txt"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer block space-y-3">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                {selectedFile ? (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-emerald-400 truncate max-w-md mx-auto">
                      📄 {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Ready for Analysis
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-bold text-offwhite">
                      Drag & Drop assignment file or <span className="text-emerald-400 underline">Browse</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Supports PDF, DOCX, TXT (Max 10MB)</p>
                  </div>
                )}
              </label>
            </div>

            {/* Launch Check Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={startAnalysis}
                disabled={!selectedFile}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-navy-900 font-extrabold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2"
              >
                <FileCheck className="w-4 h-4" />
                <span>Run Plagiarism Test (1 Token)</span>
              </button>
            </div>
          </div>
        )}

        {/* Progress Bar View */}
        {isAnalyzing && (
          <div className="p-8 bg-navy-900 rounded-2xl border border-slate-700/60 text-center space-y-6">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <div className="space-y-2">
              <h4 className="text-base font-bold text-offwhite">Analyzing Document Originality...</h4>
              <p className="text-xs text-slate-400 font-mono">{currentStage}</p>
            </div>
            <div className="w-full bg-navy-800 h-3 rounded-full overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">{progress}% Completed</span>
          </div>
        )}

        {/* Plagiarism Analysis Report Card */}
        {report && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Summary Ribbon */}
            <div className="p-5 bg-navy-900 border border-slate-700/60 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Document Name</span>
                <h4 className="text-base font-bold text-offwhite truncate max-w-sm">{report.name}</h4>
                <p className="text-xs text-slate-400">
                  Size: {report.size} • Checked: {report.uploadDate}
                </p>
              </div>

              {/* Similarity Score Circle */}
              <div className="flex items-center space-x-3 bg-navy-800 p-3 rounded-xl border border-slate-700/50">
                <div
                  className={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-extrabold text-lg font-mono ${
                    (report.score || 0) < 15
                      ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                      : 'border-amber-400 text-amber-300 bg-amber-400/10'
                  }`}
                >
                  {report.score}%
                </div>
                <div className="text-left text-xs">
                  <span className="font-bold text-offwhite">Similarity Score</span>
                  <p className="text-[11px] text-emerald-400 font-semibold">
                    {(report.score || 0) < 15 ? '✓ Low Risk (Acceptable)' : '⚠️ Moderate Match'}
                  </p>
                </div>
              </div>
            </div>

            {/* Matching Sources Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-offwhite flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                Identified Matching Academic Sources ({report.matchingSources?.length || 0})
              </h4>
              <div className="space-y-2.5">
                {report.matchingSources?.map((src, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-navy-900/90 border border-slate-700/50 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-offwhite flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        {src.source}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[11px]">
                        {src.similarity}% Match
                      </span>
                    </div>
                    {src.snippet && (
                      <p className="text-slate-400 text-[11px] font-mono italic bg-navy-800 p-2 rounded border border-slate-700/30">
                        "{src.snippet}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => {
                  setReport(null);
                  setSelectedFile(null);
                }}
                className="flex-1 py-2.5 bg-navy-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs border border-slate-700 transition-colors"
              >
                Test Another File
              </button>
              <button
                onClick={onBackToDashboard}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-navy-900 font-bold rounded-xl text-xs transition-colors shadow"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
