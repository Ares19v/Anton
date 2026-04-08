import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { jsPDF } from "jspdf";
import { BrainCircuit, MessageSquare, History, Send, Clock, Download, BarChart3, FileUp, LogOut, User as UserIcon, ShieldCheck, Users, FileText, Scale, ChevronDown, ChevronUp, Activity, Sparkles } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('anton_user')) || null);
  const [authMode, setAuthMode] = useState('login');
  const [authData, setAuthData] = useState({ username: '', password: '' });
  const [view, setView] = useState('dashboard');
  const [allUsers, setAllUsers] = useState([]);
  const [inputText, setInputText] = useState('');
  const [files, setFiles] = useState([]); // CHANGED: Now an array for Batch Uploads
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTelemetry, setShowTelemetry] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { 
    if (user) fetchHistory();
    if (view === 'admin') fetchAllUsers();
  }, [user, view]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/history/${user.id}`);
      setHistory(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/users`);
      setAllUsers(res.data);
    } catch (err) { console.error(err); }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const endpoint = authMode === 'login' ? '/login' : '/register';
      const res = await axios.post(`${API_BASE_URL}${endpoint}`, authData);
      setUser(res.data);
      localStorage.setItem('anton_user', JSON.stringify(res.data));
    } catch (err) { alert(err.response?.data?.detail || "Auth failed"); }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('user_id', user.id);
    if (inputText) formData.append('original_text', inputText);
    
    // NEW: Append multiple files to the payload
    if (files.length > 0) {
      files.forEach(file => {
        formData.append('files', file);
      });
    }

    try {
      await axios.post(`${API_BASE_URL}/analyze`, formData);
      setInputText(''); 
      setFiles([]); // Clear batch after upload
      fetchHistory();
      if (!showTelemetry) setShowTelemetry(true);
    } catch (err) { 
      alert(`Analysis Failed: ${err.response?.data?.detail || err.message}`);
    } finally { setLoading(false); }
  };

  const downloadProfessionalPDF = (item) => {
    const doc = new jsPDF();
    doc.setFillColor(79, 70, 229); doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(24); doc.setFont("helvetica", "bold"); doc.text("ANTON", 20, 25);
    doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.text("INTELLIGENCE ENGINE REPORT", 60, 25);
    doc.setTextColor(100, 100, 100); doc.text(`Generated: ${new Date(item.created_at).toLocaleString()}`, 20, 50); doc.text(`Analyst: ${user.username}`, 150, 50);
    doc.setDrawColor(226, 232, 240); doc.line(20, 55, 190, 55);
    doc.setTextColor(0, 0, 0); doc.setFontSize(16); doc.setFont("helvetica", "bold"); doc.text("Executive Summary", 20, 70);
    doc.setFontSize(11); doc.setFont("helvetica", "normal");
    
    // Core Metrics
    doc.text(`Sentiment Classification: ${item.sentiment_label} (${item.sentiment_score})`, 20, 80);
    doc.text(`Subjectivity Index: ${item.subjectivity > 0.5 ? 'Opinion-Based' : 'Factual/Objective'} (${item.subjectivity})`, 20, 90);
    doc.text(`Reading Complexity: ${item.readability_grade}`, 20, 100);
    
    // AI Action Summary (If it exists)
    if (item.ai_summary) {
        doc.setTextColor(79, 70, 229);
        doc.text("AI ACTION SUMMARY:", 20, 110);
        doc.setTextColor(0, 0, 0);
        const splitAi = doc.splitTextToSize(item.ai_summary, 170);
        doc.text(splitAi, 20, 115);
    }

    doc.line(20, 135, 190, 135); doc.setFontSize(16); doc.setFont("helvetica", "bold"); doc.text("Source Document", 20, 150);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    const splitText = doc.splitTextToSize(item.original_text, 170); doc.text(splitText, 20, 160);
    doc.save(`Anton_Report_${item.id}.pdf`);
  };

  const chartData = [...history].reverse().slice(-10).map(i => ({
    time: new Date(i.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), 
    sentiment: i.sentiment_score,
    subjectivity: i.subjectivity
  }));

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 font-sans p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md text-center">
            <div className="inline-block bg-indigo-600 p-3 rounded-2xl mb-4"><BrainCircuit className="w-10 h-10 text-white" /></div>
            <h1 className="text-3xl font-black text-slate-900">ANTON</h1>
            <p className="text-slate-500 text-sm mb-8">Intelligence Engine v6.0 PRO</p>
          <form onSubmit={handleAuth} className="space-y-4 text-left">
            <input type="text" placeholder="Username" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" onChange={e => setAuthData({...authData, username: e.target.value})} />
            <input type="password" placeholder="Password" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" onChange={e => setAuthData({...authData, password: e.target.value})} />
            <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all uppercase tracking-widest shadow-lg shadow-indigo-200">
              {authMode === 'login' ? 'Enter System' : 'Initialize Profile'}
            </button>
          </form>
          <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="mt-6 text-slate-400 font-bold uppercase text-xs hover:text-indigo-600 transition-colors">
            {authMode === 'login' ? 'Create New Identity' : 'Existing User Login'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800 selection:bg-indigo-100">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setView('dashboard')}>
            <div className="bg-indigo-600 p-2 rounded-xl shadow-md"><BrainCircuit className="w-8 h-8 text-white" /></div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900">ANTON</h1>
          </div>
          <nav className="flex items-center space-x-2 bg-white p-1.5 rounded-xl shadow-sm border border-slate-200">
            <button onClick={() => setView('dashboard')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'dashboard' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>Dashboard</button>
            <button onClick={() => setView('admin')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${view === 'admin' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}><ShieldCheck className="w-4 h-4" /> Admin</button>
          </nav>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm">
                <UserIcon className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-bold text-slate-700">{user.username}</span>
            </div>
            <button onClick={() => {setUser(null); localStorage.removeItem('anton_user');}} className="p-2.5 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all shadow-sm"><LogOut className="w-4 h-4" /></button>
          </div>
        </header>

        {view === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              
              <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold mb-4 flex items-center space-x-2 text-slate-800">
                  <MessageSquare className="w-5 h-5 text-indigo-500" /><span>Data Ingestion</span>
                </h2>
                <form onSubmit={handleAnalyze} className="space-y-4">
                  <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Feed Anton raw text or attach a batch of PDFs..." className="w-full p-4 h-40 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none" disabled={loading || files.length > 0} />
                  
                  <div className="flex items-center space-x-4">
                    {/* NEW BATCH INPUT */}
                    <input type="file" accept=".pdf" multiple multiple onChange={(e) => setFiles(Array.from(e.target.files))} className="hidden" ref={fileInputRef} />
                    
                    <button type="button" onClick={() => fileInputRef.current.click()} className={`flex items-center space-x-2 px-6 py-3.5 rounded-2xl border font-bold transition-all ${files.length > 0 ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}>
                        <FileUp className="w-5 h-5" />
                        <span>{files.length > 0 ? `${files.length} File(s) Ready` : 'Batch PDFs'}</span>
                    </button>
                    
                    <button type="submit" disabled={loading || (!inputText.trim() && files.length === 0)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-2xl font-black tracking-wide transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/30 active:scale-[0.98]">
                        {loading ? 'Processing Batch / Generating AI Summaries...' : 'Execute Deep Analysis'}
                    </button>
                  </div>
                </form>
              </section>

              <button onClick={() => setShowTelemetry(!showTelemetry)} className="w-full flex items-center justify-between p-4 bg-slate-100/50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-slate-600 font-bold transition-colors">
                <div className="flex items-center gap-2"><Activity className="w-5 h-5 text-indigo-500" /> System Telemetry & Charts</div>
                {showTelemetry ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              {showTelemetry && history.length > 0 && (
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-500 ease-out fill-mode-both">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-wider">Sentiment Velocity</h3>
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="time" fontSize={10} tickMargin={10} stroke="#94a3b8" />
                          <YAxis domain={[-1, 1]} fontSize={10} stroke="#94a3b8" />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                          <Line type="monotone" dataKey="sentiment" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-wider">Fact vs Opinion Index</h3>
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="time" fontSize={10} tickMargin={10} stroke="#94a3b8" />
                          <YAxis domain={[0, 1]} fontSize={10} stroke="#94a3b8" />
                          <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                          <Bar dataKey="subjectivity" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </section>
              )}
            </div>

            <div className="lg:col-span-1">
              <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 h-full max-h-[850px] overflow-y-auto custom-scrollbar">
                <h2 className="text-lg font-black mb-6 flex items-center justify-between text-slate-800 sticky top-0 bg-white pb-4 border-b border-slate-100 z-10">
                  <span>Intelligence Feed</span>
                  <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-md font-bold">{history.length}</span>
                </h2>
                <div className="space-y-5 mt-2">
                  {history.map((item) => (
                    <div key={item.id} className="group p-5 bg-white border-2 border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-md transition-all duration-300 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: 0x0{item.id}</span>
                        <button onClick={() => downloadProfessionalPDF(item)} className="text-indigo-600 hover:text-white hover:bg-indigo-600 transition-all flex items-center gap-1 text-[10px] font-bold bg-indigo-50 px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 duration-200"><Download className="w-3 h-3" /> Report</button>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed font-medium">"{item.original_text}"</p>
                      
                      {/* NEW: AI ACTION SUMMARY DISPLAY */}
                      {item.ai_summary && (
                        <div className="mb-4 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                          <h4 className="flex items-center gap-1 text-[10px] font-black uppercase text-indigo-800 mb-1 tracking-wider"><Sparkles className="w-3 h-3" /> AI Action Summary</h4>
                          <p className="text-xs text-indigo-900 font-semibold leading-relaxed">{item.ai_summary}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                          <div className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wide border ${item.sentiment_label === 'Positive' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : item.sentiment_label === 'Negative' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>{item.sentiment_label}</div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md text-[10px] font-bold"><FileText className="w-3 h-3" /> {item.readability_grade}</div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-md text-[10px] font-bold"><Scale className="w-3 h-3" /> {item.subjectivity > 0.5 ? 'Opinion' : 'Factual'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        ) : (
          <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
                <div><h2 className="text-2xl font-black flex items-center gap-3"><Users className="w-8 h-8 text-indigo-400" /> System Registry</h2></div>
                <div className="text-5xl font-black text-indigo-500/50">{allUsers.length}</div>
            </div>
            <div className="p-8">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-slate-400 text-xs uppercase tracking-widest border-b border-slate-100">
                            <th className="pb-4 font-black">UUID</th>
                            <th className="pb-4 font-black">Intelligence Identity</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {allUsers.map((u) => (
                            <tr key={u.id} className="group hover:bg-slate-50 transition-all">
                                <td className="py-4 font-mono text-xs text-slate-400">0x0{u.id}</td>
                                <td className="py-4 font-bold text-slate-800">{u.username}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default App;
