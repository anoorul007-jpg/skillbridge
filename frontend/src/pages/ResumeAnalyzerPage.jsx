import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import {
  FileText, UploadCloud, CheckCircle2, AlertCircle, Sparkles,
  Trash2, Plus, X, ArrowRight, ShieldCheck, Clock
} from 'lucide-react';

export default function ResumeAnalyzerPage() {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editable parsed fields
  const [candidateName, setCandidateName] = useState('');
  const [editableSkills, setEditableSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [editableEducation, setEditableEducation] = useState([]);
  const [editableProjects, setEditableProjects] = useState([]);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await apiClient.get('/resumes/');
      setResumes(res.data || []);
      if (res.data?.length > 0) {
        loadResumeDetails(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to load resumes:', err);
    }
  };

  const loadResumeDetails = (resume) => {
    setSelectedResume(resume);
    const parsed = resume.parsed_data || {};
    setCandidateName(parsed.candidate_name || '');
    setEditableSkills(parsed.skills || []);
    setEditableEducation(parsed.education || []);
    setEditableProjects(parsed.projects || []);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');

    // Check extension
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx'].includes(ext)) {
      setError('Please upload a PDF or Microsoft Word (.docx) file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB limit.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await apiClient.post('/resumes/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Resume analyzed successfully! Please review the extracted data below.');
      setResumes((prev) => [res.data.resume, ...prev]);
      loadResumeDetails(res.data.resume);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to parse resume. Please ensure the file contains extractable text.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddSkillChip = (e) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    if (!editableSkills.includes(newSkillInput.trim())) {
      setEditableSkills([...editableSkills, newSkillInput.trim()]);
    }
    setNewSkillInput('');
  };

  const handleRemoveSkillChip = (skillName) => {
    setEditableSkills(editableSkills.filter((s) => s !== skillName));
  };

  const handleConfirmAndSync = async () => {
    if (!selectedResume) return;

    setConfirming(true);
    setError('');
    setSuccess('');

    try {
      const res = await apiClient.post(`/resumes/${selectedResume.id}/confirm/`, {
        candidate_name: candidateName,
        skills: editableSkills,
        education: editableEducation,
        projects: editableProjects,
      });

      setSuccess(res.data.message || 'Skills verified and synced to your student profile!');
      setSelectedResume(res.data.resume);
      // Refresh list
      setResumes((prev) =>
        prev.map((r) => (r.id === selectedResume.id ? res.data.resume : r))
      );
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to sync skills.');
    } finally {
      setConfirming(false);
    }
  };

  const handleDeleteResume = async (id) => {
    try {
      await apiClient.delete(`/resumes/${id}/`);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      if (selectedResume?.id === id) {
        setSelectedResume(null);
      }
    } catch (err) {
      console.error('Failed to delete resume:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>PyMuPDF & Technical NLP Parser</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            AI Resume Analyzer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upload your PDF or DOCX resume to extract technical skills, projects, and education for instant gap analysis.
          </p>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div className="p-8 rounded-3xl bg-white border-2 border-dashed border-slate-200 hover:border-sky-400 transition-colors text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
          <UploadCloud className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800">
            {uploading ? 'Parsing Resume with PyMuPDF & NLP...' : 'Upload your Resume'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Supports PDF (.pdf) and Microsoft Word (.docx) up to 5MB.
          </p>
        </div>

        <div className="pt-2">
          <label className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-md shadow-sky-600/20 cursor-pointer transition">
            <FileText className="w-4 h-4" />
            <span>{uploading ? 'Processing File...' : 'Select File from Device'}</span>
            <input
              type="file"
              accept=".pdf,.docx"
              disabled={uploading}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Extracted Review Workspace */}
      {selectedResume && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">Extracted Information Review</h3>
                {selectedResume.is_confirmed_by_user ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Confirmed
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Needs Confirmation
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                File: {selectedResume.file_name} • {(selectedResume.file_size / 1024).toFixed(1)} KB
              </p>
            </div>

            <button
              onClick={handleConfirmAndSync}
              disabled={confirming}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition disabled:opacity-50 shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{confirming ? 'Syncing...' : 'Confirm & Sync Skills'}</span>
            </button>
          </div>

          {/* Candidate Name Review */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Candidate Name</label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="w-full max-w-md px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Detected Skills Chips */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Detected Technical Skills ({editableSkills.length})
              </label>
              <span className="text-[11px] text-slate-400">Click ✕ to remove any misclassified skill</span>
            </div>

            <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-100 min-h-[80px]">
              {editableSkills.map((s, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-xs"
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkillChip(s)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add missing skill manually */}
            <form onSubmit={handleAddSkillChip} className="flex gap-2 max-w-md">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                placeholder="Add missing skill (e.g. Docker, Redis)"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 transition"
              >
                Add Chip
              </button>
            </form>
          </div>

          {/* Education & Projects Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-800 block">Education Highlights</span>
              {editableEducation.length === 0 ? (
                <p className="text-xs text-slate-400">No education entries found.</p>
              ) : (
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                  {editableEducation.map((item, idx) => (
                    <li key={idx} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-800 block">Project / Experience Highlights</span>
              {editableProjects.length === 0 ? (
                <p className="text-xs text-slate-400">No project titles identified.</p>
              ) : (
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                  {editableProjects.map((item, idx) => (
                    <li key={idx} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resume History */}
      {resumes.length > 0 && (
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Uploaded Resumes History</h3>
          <div className="divide-y divide-slate-100">
            {resumes.map((r) => (
              <div key={r.id} className="py-3 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-800">{r.file_name}</p>
                  <p className="text-[10px] text-slate-400">
                    Uploaded on {new Date(r.uploaded_at).toLocaleDateString()} • {(r.file_size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => loadResumeDetails(r)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
                  >
                    Inspect
                  </button>
                  <button
                    onClick={() => handleDeleteResume(r.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Delete resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ethical AI & Privacy Notice */}
      <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-100 flex items-start space-x-3 text-xs text-slate-600">
        <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-900">Privacy & Accuracy Guarantee: </strong>
          Resumes are parsed securely via server-side PyMuPDF and NLP without fabricating achievements. Extracted skills require your confirmation before updating your profile. Resume scoring represents technical alignment and is not a guarantee of employment.
        </div>
      </div>

    </div>
  );
}
