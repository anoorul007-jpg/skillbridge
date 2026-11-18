import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Bot, Send, Sparkles, User, Trash2, ArrowRight,
  ShieldCheck, HelpCircle, Code, Briefcase, RefreshCw
} from 'lucide-react';

export default function AICareerMentorPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const fetchSessions = async () => {
    setLoadingSession(true);
    try {
      const res = await apiClient.get('/chat/sessions/');
      setSessions(res.data || []);
      if (res.data?.length > 0) {
        const session = res.data[0];
        setActiveSession(session);
        setMessages(session.messages || []);
      }
    } catch (err) {
      console.error('Failed to load chat session:', err);
    } finally {
      setLoadingSession(false);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || !activeSession) return;

    setInputMessage('');
    
    // Optimistic user message
    const tempUserMsg = {
      id: Date.now(),
      sender: 'USER',
      message: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await apiClient.post(`/chat/sessions/${activeSession.id}/send/`, {
        message: text,
      });

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        res.data.user_message,
        res.data.ai_message,
      ]);
    } catch (err) {
      console.error('Failed to send chat message:', err);
      // Fallback message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'AI',
          message: "I encountered a network hiccup. Please try again or explore our Roadmap and Assessments tab directly!",
          created_at: new Date().toISOString(),
          suggested_actions: ["Take Assessment", "View Roadmap"],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action) => {
    const act = action.toLowerCase();
    if (act.includes('assessment') || act.includes('test') || act.includes('sql') || act.includes('python')) {
      navigate('/assessments');
    } else if (act.includes('roadmap')) {
      navigate('/roadmap');
    } else if (act.includes('project')) {
      navigate('/projects');
    } else if (act.includes('job') || act.includes('intern')) {
      navigate('/jobs');
    } else if (act.includes('resume')) {
      navigate('/resume-analyzer');
    } else if (act.includes('role') || act.includes('career')) {
      navigate('/careers');
    } else {
      handleSendMessage(`Tell me more about ${action}`);
    }
  };

  const handleClearChat = async () => {
    if (!activeSession) return;
    try {
      await apiClient.delete(`/chat/sessions/${activeSession.id}/`);
      fetchSessions();
    } catch (err) {
      console.error('Failed to clear chat:', err);
    }
  };

  const starterPrompts = [
    "How to prepare for a Python technical interview?",
    "What projects stand out for a Full Stack Developer?",
    "How can I optimize my resume for ATS filters?",
    "What are the top required skills for an AI Engineer in 2026?",
  ];

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col space-y-4 pb-4">
      
      {/* Top Mentor Banner */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-700 text-white flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-slate-900">SkillBridge AI Career Mentor</h2>
              <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
                Active 24/7
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Personalized career advice • Interview prep • Project ideas • Skill gap guidance
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          title="Reset conversation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4 sm:p-6 overflow-y-auto space-y-5">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Ask Your Career Mentor Anything</h3>
              <p className="text-xs text-slate-500 max-w-md mt-1">
                Receive contextual technical advice tailored to your target track, learning progress, and resume profile.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isUser = msg.sender === 'USER';
            return (
              <div
                key={idx}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  isUser ? 'bg-slate-900 text-white' : 'bg-sky-600 text-white'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`space-y-2 max-w-[85%] sm:max-w-[75%]`}>
                  <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-sky-600 text-white rounded-tr-xs'
                      : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-xs whitespace-pre-line'
                  }`}>
                    {msg.message}
                  </div>

                  {/* Suggested Action Pills under AI message */}
                  {!isUser && msg.suggested_actions && msg.suggested_actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggested_actions.map((action, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleActionClick(action)}
                          className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 text-[11px] font-semibold border border-sky-200/60 transition flex items-center space-x-1"
                        >
                          <span>{action}</span>
                          <ArrowRight className="w-3 h-3 text-sky-600" />
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 block px-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {loading && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-500 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
              <span>Thinking and compiling career insights...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts Horizontal Scroll */}
      <div className="flex items-center space-x-2 overflow-x-auto py-1 shrink-0 no-scrollbar">
        {starterPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-white hover:bg-sky-50 border border-slate-200 text-slate-700 text-xs font-medium transition shadow-2xs shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center space-x-2 shrink-0"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask a question about careers, interview prep, roadmaps, or projects..."
          className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
        />
        <button
          type="submit"
          disabled={loading || !inputMessage.trim()}
          className="p-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/30 transition disabled:opacity-50"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
