import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';
import confetti from 'canvas-confetti';
import {
  Award, Clock, CheckCircle2, XCircle, ArrowRight,
  ArrowLeft, RotateCcw, AlertTriangle, Sparkles, BookOpen
} from 'lucide-react';

export default function AssessmentRunnerPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    fetchAssessment();
  }, [id]);

  const fetchAssessment = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/assessments/${id}/`);
      setAssessment(res.data);
      const initialSeconds = (res.data.time_limit_minutes || 15) * 60;
      setSecondsRemaining(initialSeconds);
    } catch (err) {
      console.error('Failed to load assessment:', err);
    } finally {
      setLoading(false);
    }
  };

  // Timer Countdown
  useEffect(() => {
    if (!assessment || resultData || secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
      setTimeTaken((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [assessment, resultData, secondsRemaining]);

  const handleSelectOption = (questionId, optionId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await apiClient.post(`/assessments/${id}/submit/`, {
        answers: selectedAnswers,
        time_taken_seconds: timeTaken,
      });

      setResultData(res.data);

      if (res.data.passed) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
        });
      }
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <p className="text-sm font-semibold text-slate-500">Loading assessment questions...</p>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
        <p className="text-base font-bold text-slate-800">Assessment not found.</p>
        <Link to="/assessments" className="text-xs text-sky-600 font-semibold underline">
          Return to Assessment Library
        </Link>
      </div>
    );
  }

  // --- RESULT SCREEN ---
  if (resultData) {
    const { passed, result, breakdown, verified_skill } = resultData;
    return (
      <div className="max-w-3xl mx-auto space-y-8 pb-16">
        
        {/* Result Summary Card */}
        <div className={`p-8 rounded-3xl border text-center space-y-4 ${
          passed ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-white shadow-md">
            {passed ? (
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-10 h-10 text-amber-500" />
            )}
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Assessment Results
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
              You Scored {result?.score_percentage}%
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {passed
                ? 'Congratulations! You met the passing threshold and verified this skill.'
                : 'Good attempt! Review the educational explanations below and try again to verify.'}
            </p>
          </div>

          {verified_skill && (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Skill Verified: {verified_skill}</span>
            </div>
          )}

          <div className="flex justify-center gap-3 pt-2">
            <Link
              to="/assessments"
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-xs"
            >
              All Assessments
            </Link>
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>

        {/* Detailed Question Breakdown */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Educational Review & Breakdown</h2>
          
          <div className="space-y-4">
            {breakdown?.map((item, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border ${
                  item.is_correct ? 'bg-white border-emerald-100' : 'bg-white border-rose-100'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                    item.is_correct ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {idx + 1}
                  </span>

                  <div className="space-y-2 flex-1">
                    <p className="text-xs font-bold text-slate-900">{item.question_text}</p>
                    
                    {item.code_snippet && (
                      <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
                        {item.code_snippet}
                      </pre>
                    )}

                    <div className="text-xs space-y-1">
                      <p className="text-slate-600">
                        Your answer: <span className="font-semibold text-slate-900">{item.user_choice || 'None'}</span>{' '}
                        {item.is_correct ? (
                          <span className="text-emerald-600 font-bold ml-1">✓ Correct</span>
                        ) : (
                          <span className="text-rose-600 font-bold ml-1">✗ Incorrect (Correct: {item.correct_option})</span>
                        )}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                      <strong className="font-semibold text-slate-900 block mb-0.5">Why:</strong>
                      <p className="leading-relaxed">{item.explanation}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  }

  // --- ACTIVE TEST RUNNER ---
  const questions = assessment.questions || [];
  const currentQ = questions[currentIndex];
  const progressPct = questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      
      {/* Test Runner Top Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
            {assessment.category} Test
          </span>
          <h2 className="text-sm font-bold text-slate-900">{assessment.title}</h2>
        </div>

        {/* Live Timer */}
        <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold ${
          secondsRemaining < 120 ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-slate-100 text-slate-700'
        }`}>
          <Clock className="w-4 h-4" />
          <span>{formatTime(secondsRemaining)}</span>
        </div>
      </div>

      {/* Progress Bar & Jump Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold text-slate-500">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{progressPct}% Answered</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-sky-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      {currentQ && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-6">
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 leading-relaxed">
              {currentQ.question_text}
            </h3>

            {currentQ.code_snippet && (
              <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                {currentQ.code_snippet}
              </pre>
            )}
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {(currentQ.options || []).map((opt) => {
              const isSelected = selectedAnswers[currentQ.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(currentQ.id, opt.id)}
                  className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center space-x-3.5 ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50/60 ring-2 ring-sky-200 text-slate-900'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    isSelected ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {opt.id}
                  </span>
                  <span className="flex-1 leading-snug">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition flex items-center space-x-1"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm flex items-center space-x-1.5"
              >
                <span>{submitting ? 'Grading...' : 'Submit Assessment'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
