import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import {
  User, GraduationCap, Building, Link as LinkIcon, Plus,
  Trash2, CheckCircle2, Award, Sparkles, AlertCircle, Edit3, X
} from 'lucide-react';

export default function StudentProfilePage() {
  const { user, updateUser } = useAuth();

  const [skills, setSkills] = useState([]);
  const [allSkillsList, setAllSkillsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);

  // Edit form state
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    college_name: '',
    degree: '',
    field_of_study: '',
    graduation_year: '',
    bio: '',
    linkedin_url: '',
    github_url: '',
  });

  // New Skill form state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('LANGUAGE');
  const [newSkillProficiency, setNewSkillProficiency] = useState('INTERMEDIATE');

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const [skillsRes, allSkillsRes] = await Promise.all([
        apiClient.get('/careers/student-skills/'),
        apiClient.get('/careers/skills/'),
      ]);
      setSkills(skillsRes.data || []);
      setAllSkillsList(allSkillsRes.data || []);

      if (user) {
        setProfileForm({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          college_name: user.student_profile?.college_name || '',
          degree: user.student_profile?.degree || '',
          field_of_study: user.student_profile?.field_of_study || '',
          graduation_year: user.student_profile?.graduation_year || '',
          bio: user.student_profile?.bio || '',
          linkedin_url: user.student_profile?.linkedin_url || '',
          github_url: user.student_profile?.github_url || '',
        });
      }
    } catch (err) {
      console.error('Failed to load profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient.patch('/auth/me/', profileForm);
      updateUser(res.data);
      setEditingProfile(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    try {
      const res = await apiClient.post('/careers/student-skills/', {
        skill_name: newSkillName.trim(),
        category: newSkillCategory,
        proficiency: newSkillProficiency,
      });
      setSkills((prev) => [res.data, ...prev]);
      setShowAddSkillModal(false);
      setNewSkillName('');
    } catch (err) {
      console.error('Failed to add skill:', err);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    try {
      await apiClient.delete('/careers/student-skills/', { data: { skill_id: skillId } });
      setSkills((prev) => prev.filter((s) => s.skill !== skillId && s.id !== skillId));
    } catch (err) {
      console.error('Failed to delete skill:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Header Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80'}
            alt="Profile Avatar"
            className="w-20 h-20 rounded-2xl object-cover ring-4 ring-sky-100 shadow-sm"
          />
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
              </h1>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                Student Account
              </span>
            </div>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <p className="text-xs text-slate-600 font-medium">
              {user?.student_profile?.degree || 'Undergraduate'} • {user?.student_profile?.college_name || 'College Student'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setEditingProfile(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shrink-0"
        >
          <Edit3 className="w-4 h-4 text-slate-500" />
          <span>Edit Profile Details</span>
        </button>
      </div>

      {/* Main Grid: Details & Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Academic & Bio */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-sky-600" />
              <span>Academic Background</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">College / University</span>
                <span className="font-semibold text-slate-800">{user?.student_profile?.college_name || 'Not set'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Degree Program</span>
                <span className="font-semibold text-slate-800">{user?.student_profile?.degree || 'Not set'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Branch / Specialization</span>
                <span className="font-semibold text-slate-800">{user?.student_profile?.field_of_study || 'Computer Science'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Expected Graduation</span>
                <span className="font-semibold text-slate-800">{user?.student_profile?.graduation_year || '2026'}</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <LinkIcon className="w-4 h-4 text-sky-600" />
              <span>Professional Links</span>
            </h3>

            <div className="space-y-2 text-xs">
              {user?.student_profile?.linkedin_url ? (
                <a
                  href={user.student_profile.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-sky-700 font-medium block truncate"
                >
                  🔗 LinkedIn Profile
                </a>
              ) : (
                <p className="text-slate-400 text-xs">No LinkedIn URL added</p>
              )}

              {user?.student_profile?.github_url ? (
                <a
                  href={user.student_profile.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium block truncate"
                >
                  💻 GitHub Portfolio
                </a>
              ) : (
                <p className="text-slate-400 text-xs">No GitHub URL added</p>
              )}
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Registered Skills Manager */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Award className="w-4 h-4 text-sky-600" />
                  <span>My Technical Skills Portfolio</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Extracted from your resume, confirmed manually, or verified through technical assessments.
                </p>
              </div>

              <button
                onClick={() => setShowAddSkillModal(true)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Skill</span>
              </button>
            </div>

            {/* Skills Badges */}
            {skills.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">No skills registered yet.</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Upload your resume in the Resume Analyzer or click Add Skill above!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {skills.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">{item.skill_name}</span>
                        {item.is_verified && (
                          <span className="inline-flex items-center space-x-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 mr-0.5" />
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-medium">
                        <span className="capitalize">{item.proficiency.toLowerCase()}</span>
                        <span>•</span>
                        <span>Source: {item.source}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteSkill(item.skill || item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Remove skill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Edit Profile Modal */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Profile Details</h3>
              <button onClick={() => setEditingProfile(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={profileForm.first_name}
                    onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={profileForm.last_name}
                    onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">College / University</label>
                <input
                  type="text"
                  value={profileForm.college_name}
                  onChange={(e) => setProfileForm({ ...profileForm, college_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Degree Program</label>
                  <input
                    type="text"
                    value={profileForm.degree}
                    onChange={(e) => setProfileForm({ ...profileForm, degree: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Graduation Year</label>
                  <input
                    type="number"
                    value={profileForm.graduation_year}
                    onChange={(e) => setProfileForm({ ...profileForm, graduation_year: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  value={profileForm.linkedin_url}
                  onChange={(e) => setProfileForm({ ...profileForm, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">GitHub URL</label>
                <input
                  type="url"
                  value={profileForm.github_url}
                  onChange={(e) => setProfileForm({ ...profileForm, github_url: e.target.value })}
                  placeholder="https://github.com/username"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProfile(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Skill Modal */}
      {showAddSkillModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Technical Skill</h3>
              <button onClick={() => setShowAddSkillModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSkill} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. Docker, TypeScript, Redis"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="LANGUAGE">Programming Language</option>
                  <option value="FRAMEWORK">Framework & Library</option>
                  <option value="DATABASE">Database & Storage</option>
                  <option value="CLOUD_DEVOPS">Cloud & DevOps</option>
                  <option value="DATA_AI">Data & AI</option>
                  <option value="CYBERSECURITY">Cybersecurity</option>
                  <option value="TOOLS">Tools & Platforms</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Proficiency Level</label>
                <select
                  value={newSkillProficiency}
                  onChange={(e) => setNewSkillProficiency(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="BEGINNER">Beginner (Foundational understanding)</option>
                  <option value="INTERMEDIATE">Intermediate (Built projects / practical experience)</option>
                  <option value="ADVANCED">Advanced (Production scale / deep optimization)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSkillModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-xs"
                >
                  Add to Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
