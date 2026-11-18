import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  Compass, CheckCircle2, Circle, Clock, ExternalLink,
  BookOpen, Code, Sparkles, FolderGit2, ArrowRight
} from 'lucide-react';

export default function LearningRoadmapPage() {
  const { user } = useAuth();

  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/careers/roadmap/');
      setRoadmap(res.data);
    } catch (err) {
      console.error('Failed to load roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      const res = await apiClient.post(`/careers/roadmap/tasks/${taskId}/toggle/`);
      setRoadmap((prev) => {
        if (!prev) return prev;
        const updated = prev.tasks.map((t) => (t.id === taskId ? res.data.task : t));
        const allCompleted = updated.every((t) => t.is_completed);

        if (allCompleted) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }

        return {
          ...prev,
          progress_percentage: res.data.roadmap_progress_percentage,
          tasks: updated,
        };
      });
    } catch (err) {
      console.error('Failed to toggle task completion:', err);
    }
  };

  // Group tasks by stage
  const stages = {};
  (roadmap?.tasks || []).forEach((t) => {
    if (!stages[t.stage_name]) stages[t.stage_name] = [];
    stages[t.stage_name].push(t);
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold mb-1">
            <Compass className="w-3.5 h-3.5 text-sky-600" />
            <span>Personalized Learning Pathway</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {roadmap?.career_role_title} Mastery Roadmap
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tailored step-by-step curriculum addressing your specific skill gaps with exercises and resources.
          </p>
        </div>

        <Link
          to="/projects"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition shrink-0"
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Recommended Projects</span>
        </Link>
      </div>

      {/* Roadmap Progress Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-800">Overall Track Progress</span>
          <span className="text-sky-600 font-extrabold">{roadmap?.progress_percentage || 0}% Completed</span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-sky-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${roadmap?.progress_percentage || 0}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>{roadmap?.completed_tasks || 0} of {roadmap?.total_tasks || 0} tasks checked</span>
          <span>Estimated Duration: {roadmap?.estimated_weeks || 12} Weeks</span>
        </div>
      </div>

      {/* Stages & Tasks */}
      <div className="space-y-8">
        {Object.entries(stages).map(([stageName, tasks], sIdx) => (
          <div key={sIdx} className="space-y-4">
            
            {/* Stage Title Banner */}
            <div className="flex items-center space-x-3">
              <span className="w-7 h-7 rounded-xl bg-sky-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                {sIdx + 1}
              </span>
              <h3 className="text-base font-bold text-slate-900">{stageName}</h3>
            </div>

            {/* Task Items in Stage */}
            <div className="space-y-3 pl-3 sm:pl-10 border-l-2 border-sky-100">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    task.is_completed
                      ? 'bg-emerald-50/40 border-emerald-200/70'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    
                    {/* Interactive Completion Toggle Checkbox */}
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className="mt-0.5 text-slate-400 hover:text-sky-600 focus:outline-none transition shrink-0"
                      aria-label="Toggle task status"
                    >
                      {task.is_completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 hover:text-sky-500" />
                      )}
                    </button>

                    <div className="space-y-2 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4 className={`text-sm font-bold ${task.is_completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {task.title}
                        </h4>
                        <span className="text-[10px] font-semibold text-slate-400 flex items-center space-x-1 shrink-0">
                          <Clock className="w-3 h-3" />
                          <span>~{task.estimated_hours} Hours</span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {task.description}
                      </p>

                      {/* Practical Exercise Challenge Box */}
                      {task.exercise && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 flex items-start space-x-2">
                          <Code className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-semibold text-slate-900">Hands-on Exercise: </strong>
                            <span>{task.exercise}</span>
                          </div>
                        </div>
                      )}

                      {/* Curated External Resources */}
                      {task.resources && task.resources.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-2">
                          {task.resources.map((res, rIdx) => (
                            <a
                              key={rIdx}
                              href={res.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-[11px] font-semibold transition"
                            >
                              <BookOpen className="w-3 h-3" />
                              <span>{res.title}</span>
                              <ExternalLink className="w-3 h-3 text-sky-500" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
