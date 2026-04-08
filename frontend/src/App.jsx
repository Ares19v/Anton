import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BrainCircuit, MessageSquare, History, Send, Clock, Download, BarChart3, FileUp, LogOut, User as UserIcon, ShieldCheck, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('anton_user')) || null);
  const [authMode, setAuthMode] = useState('login');
  const [authData, setAuthData] = useState({ username: '', password: '' });
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'admin'
  const [allUsers, setAllUsers] = useState([]);
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
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
    if (file) formData.append('file', file);

    try {
      await axios.post(`${API_BASE_URL}/analyze`, formData);
      setInputText(''); setFile(null); fetchHistory();
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 font-sans p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md text-center">
            <div className="inline-block bg-indigo-600 p-3 rounded-2xl mb-4"><BrainCircuit className="w-10 h-10 text-white" /></div>
            <h1 className="text-3xl font-black text-slate-900">ANTON</h1>
            <p className="text-slate-500 text-sm mb-8">Intelligence Engine v3.0</p>
          <form onSubmit={handleAuth} className="space-y-4 text-left">
            <input type="text" placeholder="Username" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                   onChange={e => setAuthData({...authData, username: e.target.value})} />
            <input type="password" placeholder="Password" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                   onChange={e => setAuthData({...authData, password: e.target.value})} />
            <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all uppercase tracking-widest">
              {authMode === 'login' ? 'Enter System' : 'Initialize Profile'}
            </button>
          </form>
          <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="mt-6 text-slate-400 font-bold uppercase text-xs hover:text-indigo-600">
            {authMode === 'login' ? 'Create New Identity' : 'Existing User Login'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setView('dashboard')}>
            <div className="bg-indigo-600 p-2 rounded-lg"><BrainCircuit className="w-8 h-8 text-white" /></div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900">ANTON</h1>
          </div>
          
          <nav className="flex items-center space-x-2 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <button onClick={() => setView('dashboard')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>Dashboard</button>
            <button onClick={() => setView('admin')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${view === 'admin' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>
                <ShieldCheck className="w-4 h-4" /> Admin
            </button>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-full">
                <UserIcon className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-bold text-slate-700">{user.username}</span>
            </div>
            <button onClick={() => {setUser(null); localStorage.removeItem('anton_user');}} className="p-2 text-slate-400 hover:text-rose-600 transition-all">
                <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {view === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold mb-4 flex items-center space-x-2 text-slate-700">
                  <MessageSquare className="w-5 h-5" /><span>Input Stream</span>
                </h2>
                <form onSubmit={handleAnalyze} className="space-y-4">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Feed Anton raw text or attach a PDF..."
                    className="w-full p-4 h-40 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    disabled={loading || file !== null}
                  />
                  <div className="flex items-center space-x-4">
                    <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} className="hidden" ref={fileInputRef} />
                    <button type="button" onClick={() => fileInputRef.current.click()}
                      className={`flex items-center space-x-2 px-4 py-3 rounded-xl border font-semibold transition-all ${file ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                    >
                      <FileUp className="w-5 h-5" />
                      <span>{file ? file.name : 'PDF'}</span>
                    </button>
                    <button type="submit" disabled={loading || (!inputText.trim() && !file)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                      {loading ? 'Analyzing...' : 'Execute Analysis'}
                    </button>
                  </div>
                </form>
              </section>

              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold mb-6 flex items-center space-x-2 text-slate-700">
                  <BarChart3 className="w-5 h-5" /><span>Sentiment Velocity</span>
                </h2>
                <div className="h-64 w-full min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[...history].reverse().slice(-7).map(i => ({time: new Date(i.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), sentiment: i.sentiment_score}))}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="time" fontSize={12} />
                      <YAxis domain={[-1, 1]} fontSize={12} />
                      <Tooltip />
                      <Line type="monotone" dataKey="sentiment" stroke="#4f46e5" strokeWidth={3} dot={{ r: 6, fill: '#4f46e5' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>

            <div className="lg:col-span-1">
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full max-h-[750px] overflow-y-auto">
                <h2 className="text-lg font-bold mb-6 flex items-center space-x-2 text-slate-700 sticky top-0 bg-white pb-2 underline decoration-indigo-500 decoration-4">Intelligence Feed</h2>
                <div className="space-y-4">
                  {history.map((item) => (
                    <div key={item.id} className="group p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-indigo-200 transition-all">
                      <p className="text-sm text-slate-700 line-clamp-2 mb-3 italic">"{item.original_text}"</p>
                      <div className="flex gap-2">
                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.sentiment_label === 'Positive' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>{item.sentiment_label}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{new Date(item.created_at).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        ) : (
          <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black flex items-center gap-3"><Users className="w-8 h-8 text-indigo-400" /> System Registry</h2>
                    <p className="text-slate-400 text-sm mt-1">Total active intelligence modules connected to Anton Core.</p>
                </div>
                <div className="text-5xl font-black text-indigo-500 opacity-50">{allUsers.length}</div>
            </div>
            <div className="p-8">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-slate-400 text-xs uppercase tracking-widest border-b border-slate-100">
                            <th className="pb-4 font-black">UUID</th>
                            <th className="pb-4 font-black">Intelligence Identity</th>
                            <th className="pb-4 font-black text-right">Access Level</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {allUsers.map((u) => (
                            <tr key={u.id} className="group hover:bg-slate-50 transition-all">
                                <td className="py-4 font-mono text-xs text-slate-400">0x0{u.id}</td>
                                <td className="py-4 font-bold text-slate-800 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    {u.username}
                                </td>
                                <td className="py-4 text-right">
                                    <span className="px-2 py-1 rounded bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-tighter group-hover:bg-indigo-600 group-hover:text-white transition-all">Standard</span>
                                </td>
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
