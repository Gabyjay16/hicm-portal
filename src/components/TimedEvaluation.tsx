import React, { useState, useEffect } from 'react';
import { QuizQuestion, User } from '../types';
import { Clock, AlertTriangle, CheckCircle2, XCircle, ArrowLeft, RefreshCw, Award, HelpCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TimedEvaluationProps {
  user: User | null;
}

export const TimedEvaluation: React.FC<TimedEvaluationProps> = ({ user }) => {
  const navigate = useNavigate();
  // Timer state: 10 minutes = 600 seconds
  const [timeLeft, setTimeLeft] = useState<number>(600);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [evaluationId, setEvaluationId] = useState<string>('eval-midterm-1');

  // AI MCQ Generation State
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [aiTopic, setAiTopic] = useState<string>('Human Resource Management');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch('/api/evaluations');
        const data = await res.json();
        if (data.success) {
          setQuestions(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleGenerateAIMCQs = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are an academic exam generator. Generate 5 multiple-choice questions on the topic provided. Return ONLY a valid JSON array of 5 objects (no markdown, no code fences):
[
  {
    "id": "q1",
    "question": "<question string>",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "<explanation string>"
  }
]`
            },
            {
              role: 'user',
              content: `Generate 5 academic MCQs for subject: ${aiTopic}`
            }
          ]
        })
      });
      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content || data.content || '[]';
      const cleanJson = raw.replace(/```json?/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setQuestions(parsed);
        setSelectedAnswers({});
        setCurrentQuestionIndex(0);
        setTimeLeft(600);
        setIsSubmitted(false);
      }
    } catch (err) {
      console.error('AI MCQ generation error:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Countdown effect
  useEffect(() => {
    if (isSubmitted || isLoading || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); // Auto-submit when time's up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, isLoading, questions]);

  // Format time mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isUnderWarningThreshold = timeLeft <= 120; // Under 2 minutes warning

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        score += 1;
      }
    });
    return score;
  };

  const handleSubmit = async () => {
    setIsSubmitted(true);
    if (!user) return; // Wait, guest can't submit officially
    const score = calculateScore();
    const timeSpent = 600 - timeLeft;

    try {
      await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.id,
          evaluationId,
          score,
          answers: selectedAnswers,
          timeSpent,
        })
      });
    } catch (err) {
      console.error('Failed to submit evaluation to backend:', err);
    }
  };

  const handleRestart = () => {
    setTimeLeft(600);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setIsSubmitted(false);
  };


  const score = calculateScore();
  const accuracy = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  
  if (isLoading) {
    return <div className="text-center text-black py-10 text-xs">Loading evaluation module...</div>;
  }
  
  if (questions.length === 0) {
    return <div className="text-center text-black py-10 text-xs">No active evaluation found.</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="max-w-3xl w-full mx-auto space-y-6 pb-16 md:pb-6">
      {/* AI MCQ Generator Banner */}
      <div className="glass-panel p-4 rounded-2xl border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-2.5 text-xs text-black">
          <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse flex-shrink-0" />
          <div>
            <span className="font-bold text-black block text-sm">OpenRouter AI MCQ Generator</span>
            <span className="text-[11px] text-black">Generate fresh evaluation questions on any subject</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            placeholder="e.g. Corporate Finance"
            className="bg-black/60 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-400 w-full sm:w-48"
          />
          <button
            type="button"
            onClick={handleGenerateAIMCQs}
            disabled={isGeneratingAI}
            className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>{isGeneratingAI ? 'Generating...' : 'Generate MCQs'}</span>
          </button>
        </div>
      </div>

      {/* Top Controls & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/student/dashboard')}
          className="flex items-center space-x-2 text-black hover:text-white text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Back to Dashboard</span>
        </button>

        {/* Countdown Timer Widget */}
        <div
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl border text-xs font-mono font-bold transition-all shadow-md ${
            isUnderWarningThreshold
              ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse'
              : 'bg-white text-amber-400 border-amber-500/40'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{isSubmitted ? 'TIME EXPIRED' : `Timer: ${formatTime(timeLeft)}`}</span>
          {isUnderWarningThreshold && !isSubmitted && (
            <span className="flex items-center gap-1 text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded uppercase tracking-wider font-sans font-extrabold ml-1">
              <AlertTriangle className="w-3 h-3" /> Warning &lt; 2m
            </span>
          )}
        </div>
      </div>

      {/* Main View Container */}
      {!isSubmitted ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/20">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <h3 className="text-base font-bold text-black mt-2">
                HICM Business & Management Evaluation
              </h3>
            </div>
            <span className="text-xs text-black font-mono">
              Answered: {Object.keys(selectedAnswers).length}/{questions.length}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden border border-slate-200">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>

          {/* Question Prompt */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-black leading-relaxed">
              {currentQuestion.question}
            </h4>

            {/* Options List */}
            <div className="space-y-2.5">
              {currentQuestion.options.map((option, optionIdx) => {
                const isSelected = selectedAnswers[currentQuestionIndex] === optionIdx;
                return (
                  <button
                    key={optionIdx}
                    onClick={() => handleSelectOption(currentQuestionIndex, optionIdx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold shadow-sm'
                        : 'bg-slate-50/80 border-slate-200 text-black hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-[11px] ${
                          isSelected ? 'bg-emerald-500 text-navy-900 font-bold' : 'bg-white text-black border border-slate-200'
                        }`}
                      >
                        {String.fromCharCode(65 + optionIdx)}
                      </span>
                      <span>{option}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 bg-slate-50 text-black rounded-xl text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white border border-slate-200"
            >
              Previous
            </button>

            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-navy-900 font-bold rounded-xl text-xs transition-colors shadow"
              >
                Next Question
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-navy-900 font-extrabold rounded-xl text-xs transition-colors shadow"
              >
                Submit Evaluation
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Results View Card */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <div className="inline-flex p-4 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Award className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-black">Evaluation Completed</h3>
            <p className="text-xs text-black">
              Your results have been computed against standard evaluation criteria.
            </p>
          </div>

          {/* Score Stats Grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs text-black">Final Score</span>
              <p className="text-xl font-extrabold text-emerald-400">
                {score} / {questions.length}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs text-black">Accuracy</span>
              <p className="text-xl font-extrabold text-amber-400">{accuracy}%</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs text-black">Time Taken</span>
              <p className="text-xl font-extrabold text-black">{formatTime(600 - timeLeft)}</p>
            </div>
          </div>

          {/* Per-Question Explanations Breakdown */}
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-bold text-black uppercase tracking-wider border-b border-slate-200 pb-2">
              Question Review & Explanations
            </h4>
            <div className="space-y-3">
              {questions.map((q, idx) => {
                const userChoice = selectedAnswers[idx];
                const isCorrect = userChoice === q.correctAnswer;
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border text-xs space-y-2 ${
                      isCorrect
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-black'
                        : 'bg-red-500/10 border-red-500/40 text-black'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <p className="font-semibold text-black">
                        {idx + 1}. {q.question}
                      </p>
                      {isCorrect ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                          <CheckCircle2 className="w-4 h-4" /> Correct
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-400 font-bold text-[11px]">
                          <XCircle className="w-4 h-4" /> Incorrect
                        </span>
                      )}
                    </div>
                    <div className="text-black">
                      <span>Your Answer: </span>
                      <strong className={isCorrect ? 'text-emerald-400' : 'text-red-400'}>
                        {userChoice !== undefined ? q.options[userChoice] : 'Not Answered'}
                      </strong>
                    </div>
                    {!isCorrect && (
                      <div className="text-emerald-400">
                        <span>Correct Answer: </span>
                        <strong>{q.options[q.correctAnswer]}</strong>
                      </div>
                    )}
                    <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200 text-black text-[11px] leading-relaxed">
                      💡 <strong>Explanation:</strong> {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-3 pt-2">
            <button
              onClick={handleRestart}
              className="flex-1 py-2.5 bg-slate-50 hover:bg-white border border-slate-200 text-black font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              <span>Retake Quiz</span>
            </button>
            <button
              onClick={() => navigate('/student/dashboard')}
              className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-navy-900 font-bold rounded-xl text-xs transition-colors shadow"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
