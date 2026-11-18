import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import {
  Award, Clock, CheckCircle2, AlertCircle, ArrowRight,
  Code, BookOpen, Sparkles, Trophy
} from 'lucide-react';

export default function TechnicalAssessmentsPage() {
  const [assessments, setAssessments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessmentsData();
  }, []);

  const fetchAssessmentsData = async () => {
    setLoading(true);
    try {
      const [listRes, historyRes] = await Promise.all([
        apiClient.get('/assessments/'),
        apiClient.get('/assessments/history/'),
      ]);
      setAssessments(listRes.data || []);
      setHistory(historyRes.data || []);
    } catch (err) {
      console.error('Error fetching assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-12">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold mb-1">
          <Award className="w-3.5 h-3.5 text-amber-600" />
          <span>Skill Verification & Benchmark</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Technical Skill Assessments
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Validate your programming knowledge in Python, SQL, JavaScript, HTML, and CSS. Passing assessments verifies skills on your profile!
        </p>
      </div>

      {/* Assessments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                  {item.category}
                </span>
                <span className="text-[11px] text-slate-400 font-medium flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.time_limit_minutes} Mins</span>
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>{item.questions_count || 5} Questions</span>
                <span>Pass: {item.passing_percentage}%</span>
              </div>
            </div>

            <Link
              to={`/assessments/${item.id}`}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs transition flex items-center justify-center space-x-1.5"
            >
              <span>Start Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>

      {/* History of Attempts */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-bold text-slate-900">Your Assessment History</h2>
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            You haven't completed any assessments yet. Choose a topic above to begin!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="text-[11px] font-bold text-slate-400 uppercase border-b border-slate-100">
                <tr>
                  <th className="py-2.5">Assessment</th>
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5">Score</th>
                  <th className="py-2.5">Outcome</th>
                  <th className="py-2.5">Date Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((h) => (
                  <tr key={h.id}>
                    <td className="py-3 font-semibold text-slate-900">{h.assessment_title}</td>
                    <td className="py-3">{h.category}</td>
                    <td className="py-3 font-bold text-slate-800">{h.score_percentage}%</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        h.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {h.passed ? 'Passed ✅' : 'Needs Review 🔄'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">
                      {new Date(h.completed_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
