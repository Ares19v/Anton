import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BrainCircuit, MessageSquare, History, Send, Clock, Key, Download, BarChart3, FileUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Uses env variable if deployed, otherwise localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/history`);
      setHistory(res.data);
    } catch (err) { console.error(err); }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !file) return;
    
    setLoading(true);
    const formData = new FormData();
    if (inputText) formData.append('original_text', inputText);
    if (file) formData.append('file', file);

    try {
      await axios.post(`${API_BASE_URL}/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setInputText('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchHistory();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (item) => {
    const report = `ANTON INTELLIGENCE REPORT\nGenerated: ${new Date(item.created_at).toLocaleString()}\n\nTEXT:\n${item.original_text}\n\nINSIGHTS:\n- Sentiment: ${item.sentiment_label} (${item.sentiment_score})\n- Word Count: ${item.word_count}\n- Reading Time: ${item.reading_time} min\n- Key Phrases: ${item.key_phrases}`;
    const element = document.createElement("a");
    const blob = new Blob([report], {type: 'text/plain'});
    element.href = URL.createObjectURL(blob);
    element.download = `Anton_Report_${item.id}.txt`;
    element.click();
  };

  const chartData = [...history].reverse().slice(-7).map(item => ({
    time: new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    sentiment: item.sentiment_score
  }));

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex items-center justify-between pb-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg"><BrainCircuit className="w-8 h-8 text-white" /></div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900">ANTON</h1>
          </div>
          <div className="text-xs font-mono bg-slate-200 px-2 py-1 rounded text-slate-500">v3.0.0-PRO</div>
        </header>

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
                  placeholder="Feed Anton raw text or attach a PDF document below..."
                  className="w-full p-4 h-40 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  disabled={loading || file !== null}
                />
                
                <div className="flex items-center space-x-4">
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={(e) => setFile(e.target.files[0])} 
                    className="hidden" 
                    ref={fileInputRef} 
                  />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current.click()}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl border font-semibold transition-all ${file ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    <FileUp className="w-5 h-5" />
                    <span>{file ? file.name : 'Upload PDF'}</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading || (!inputText.trim() && !file)}
                    className="flex-1 flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                  >
                    <span>{loading ? 'Processing...' : 'Execute Analysis'}</span>
                    {!loading && <Send className="w-4 h-4" />}
                  </button>
                </div>
              </form>
            </section>

            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold mb-6 flex items-center space-x-2 text-slate-700">
                <BarChart3 className="w-5 h-5" /><span>Sentiment Velocity</span>
              </h2>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" fontSize={12} tickMargin={10} />
                    <YAxis domain={[-1, 1]} fontSize={12} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="sentiment" stroke="#4f46e5" strokeWidth={3} dot={{ r: 6, fill: '#4f46e5' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full max-h-[850px] overflow-y-auto">
              <h2 className="text-lg font-bold mb-6 flex items-center space-x-2 text-slate-700 sticky top-0 bg-white pb-2">
                <History className="w-5 h-5" /><span>Intelligence Feed</span>
              </h2>
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="group p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-indigo-200 transition-all">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entry #{item.id}</span>
                        <button onClick={() => downloadReport(item)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-all"><Download className="w-4 h-4" /></button>
                    </div>
                    <p className="text-sm text-slate-700 line-clamp-2 mb-3 leading-relaxed italic">"{item.original_text}"</p>
                    <div className="flex flex-wrap gap-2">
                      <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.sentiment_label === 'Positive' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : item.sentiment_label === 'Negative' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {item.sentiment_label}
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[10px] font-bold">
                        <Clock className="w-3 h-3" /> {item.reading_time}m
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
