import React, { useState, useEffect } from 'react';
import { PlagiarismDoc, MatchingSource, User } from '../types';
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
import { useNavigate } from 'react-router-dom';

interface PlagiarismTestProps {
  user: User | null;
}

export const PlagiarismTest: React.FC<PlagiarismTestProps> = ({ user }) => {
  const navigate = useNavigate();
  const [tokens, setTokens] = useState<number>(0);
  const [tests, setTests] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  // Analysis simulation state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentStage, setCurrentStage] = useState<string>('');
  const [report, setReport] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isRequestingTokens, setIsRequestingTokens] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/plagiarism?studentId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setTokens(data.tokens);
        setTests(data.tests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleAddTokens = async (amount: number) => {
    if (!user) return;
    setIsRequestingTokens(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: user.id, amount, amountPaid: amount * 1000 })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`Requested ${amount} tokens. Awaiting admin approval.`);
      } else {
        setErrorMessage(data.error || 'Failed to request tokens');
      }
    } catch (err) {
      setErrorMessage('Network error');
    } finally {
      setIsRequestingTokens(false);
    }
  };

  const startAnalysis = async () => {
    if (!selectedFile || !user) {
      setErrorMessage('Please select a file to analyze.');
      return;
    }

    if (tokens < 1) {
      setErrorMessage('Insufficient plagiarism tokens. Please redeem tokens to continue.');
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setErrorMessage('');

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
      }
    }, 800);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('studentId', user.id);

      const res = await fetch('/api/plagiarism', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      clearInterval(interval);
      setProgress(100);
      setCurrentStage('Analysis complete!');
      
      setTimeout(() => {
        setIsAnalyzing(false);
        if (data.success) {
          setReport({
            ...data.data,
            size: `${(selectedFile.size / 1024).toFixed(1)} KB`,
            uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          });
          setTokens(data.data.remainingTokens);
          fetchData(); // Refresh history
        } else {
          setErrorMessage(data.error || 'Analysis failed');
        }
      }, 500);

    } catch (err) {
      clearInterval(interval);
      setIsAnalyzing(false);
      setErrorMessage('Network error during analysis');
    }
  };

  return (
    <div className="max-w-3xl w-full mx-auto space-y-6 pb-16 md:pb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigate('/student/dashboard')}
          className="flex items-center space-x-2 text-slate-300 hover:text-white text-xs font-semibold px-3 py-2 bg-navy-800 border border-slate-700/60 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center space-x-3 bg-navy-800 border border-slate-700/60 p-1.5 pl-3 rounded-xl shadow-sm">
          <div className="flex items-center space-x-2 text-xs">
            <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-slate-300">Tokens:</span>
            <strong className="text-emerald-400 font-mono text-sm">{tokens}</strong>
          </div>
          <button
            onClick={() => handleAddTokens(3)}
            disabled={isRequestingTokens}
            className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-navy-900 font-bold text-[11px] rounded-lg transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Request 3 Tokens</span>
          </button>
        </div>
      </div>

      <div className="bg-navy-800 border border-slate-700/60 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-offwhite">Plagiarism & Originality Test</h2>
              <p className="text-xs text-slate-400">Institutional similarity scanner for assignments.</p>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/40 rounded-xl text-red-400 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        
        {successMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-emerald-400 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

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
                isDragOver ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]' :
                selectedFile ? 'border-emerald-500/50 bg-navy-900/90' : 'border-slate-700 bg-navy-900/60 hover:border-slate-500'
              }`}
            >
              <input type="file" id="file-upload" accept=".pdf,.docx,.txt" onChange={handleFileInputChange} className="hidden" />
              <label htmlFor="file-upload" className="cursor-pointer block space-y-3">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                {selectedFile ? (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-emerald-400 truncate max-w-md mx-auto">📄 {selectedFile.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{(selectedFile.size / 1024).toFixed(1)} KB • Ready for Analysis</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-bold text-offwhite">Drag & Drop assignment file or <span className="text-emerald-400 underline">Browse</span></p>
                    <p className="text-xs text-slate-400 mt-1">Supports PDF, DOCX, TXT (Max 10MB)</p>
                  </div>
                )}
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={startAnalysis}
                disabled={!selectedFile || tokens < 1}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-navy-900 font-extrabold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2"
              >
                <FileCheck className="w-4 h-4" />
                <span>Run Plagiarism Test (1 Token)</span>
              </button>
            </div>
          </div>
        )}

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
              <div className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">{progress}% Completed</span>
          </div>
        )}

        {report && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="p-5 bg-navy-900 border border-slate-700/60 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Document Name</span>
                <h4 className="text-base font-bold text-offwhite truncate max-w-sm">{report.name}</h4>
                <p className="text-xs text-slate-400">Size: {report.size} • Checked: {report.uploadDate}</p>
              </div>
              <div className="flex items-center space-x-3 bg-navy-800 p-3 rounded-xl border border-slate-700/50">
                <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-extrabold text-lg font-mono ${(report.score || 0) < 15 ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-amber-400 text-amber-300 bg-amber-400/10'}`}>
                  {report.score}%
                </div>
                <div className="text-left text-xs">
                  <span className="font-bold text-offwhite">Similarity Score</span>
                  <p className="text-[11px] text-emerald-400 font-semibold">{(report.score || 0) < 15 ? '✓ Low Risk (Acceptable)' : '⚠️ Moderate Match'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-offwhite flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                Identified Matching Academic Sources ({report.matchingSources?.length || 0})
              </h4>
              <div className="space-y-2.5">
                {report.matchingSources?.map((src: any, idx: number) => (
                  <div key={idx} className="p-4 bg-navy-900/90 border border-slate-700/50 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-offwhite flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        {src.source}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[11px]">{src.similarity}% Match</span>
                    </div>
                    {src.snippet && <p className="text-slate-400 text-[11px] font-mono italic bg-navy-800 p-2 rounded border border-slate-700/30">"{src.snippet}"</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => { setReport(null); setSelectedFile(null); }}
                className="flex-1 py-2.5 bg-navy-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs border border-slate-700 transition-colors"
              >
                Test Another File
              </button>
            </div>
          </div>
        )}
      </div>

      {/* History */}
      {!isLoading && tests.length > 0 && !report && !isAnalyzing && (
        <div className="bg-navy-800 border border-slate-700/60 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-offwhite">Past Analyses</h3>
          <div className="space-y-3">
            {tests.map(test => (
              <div key={test.id} className="p-3 bg-navy-900 border border-slate-700/50 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-offwhite">{test.fileName}</h4>
                  <p className="text-[10px] text-slate-400">{new Date(test.createdAt).toLocaleDateString()}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold ${test.score < 15 ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                  {test.score}% Match
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
