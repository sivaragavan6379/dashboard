
import React, { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { summarizeContent } from '../services/geminiService';
import { SummaryHistoryItem, SummaryResult, TargetBox } from '../types';

interface AdminPanelProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  history: SummaryHistoryItem[];
  setHistory: React.Dispatch<React.SetStateAction<SummaryHistoryItem[]>>;
  onUpdateBox: (target: TargetBox, summary: string, imageSrc?: string) => void;
  onBack: () => void;
}

const PRESET_COMMANDS = [
  "Tomorrow is a Campus Holiday! 🏖️",
  "System Maintenance scheduled for 2:00 PM 🛠️",
  "Library extended hours start today 📚",
  "Emergency Drill at 11:00 AM - Remain Calm 🚨",
  "New Cafeteria Menu is now live! 🍎",
  "Stay Hydrated! Campus Water Day 💧"
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ theme, setTheme, history, setHistory, onUpdateBox, onBack }) => {
  const [inputText, setInputText] = useState('');
  const [tickerInput, setTickerInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [error, setError] = useState<{message: string, detail?: string} | null>(null);
  const [targetBox, setTargetBox] = useState<TargetBox>('general');

  // Check if API key is likely injected
  const isAiLinked = !process.env.API_KEY?.includes("process.env") && process.env.API_KEY !== undefined;

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError(null);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const pushToTicker = (msg: string) => {
    if (!msg.trim()) return;
    onUpdateBox('updates', msg);
    setTickerInput('');
  };

  const handleSync = async () => {
    if (!inputText.trim() && !selectedFile) {
      setError({ message: "Payload Missing", detail: "Enter text or upload an image to begin synthesis." });
      return;
    }

    setError(null);
    setLoading(true);

    try {
      let persistentImageSrc: string | undefined = undefined;
      let imageBase64: string | undefined = undefined;
      let mimeType: string | undefined = undefined;

      if (selectedFile) {
        const reader = new FileReader();
        const base64Data = await new Promise<string>((res, rej) => {
          reader.onload = () => res((reader.result as string).split(',')[1]);
          reader.onerror = () => rej(new Error("Image serialization failure"));
          reader.readAsDataURL(selectedFile);
        });
        imageBase64 = base64Data;
        mimeType = selectedFile.type;
        persistentImageSrc = `data:${mimeType};base64,${imageBase64}`;
      }

      if (isManualMode) {
        const newItem: SummaryHistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          type: inputText && selectedFile ? 'both' : selectedFile ? 'image' : 'text',
          target: targetBox,
          detailedSummary: inputText,
          shortSummary: inputText || "Manual Update Applied",
          imagePreview: persistentImageSrc,
        };
        
        setHistory(prev => [newItem, ...prev].slice(0, 15));
        onUpdateBox(targetBox, inputText || "Update Applied", persistentImageSrc);
        setInputText('');
        setSelectedFile(null);
        setPreviewUrl(null);
      } else {
        const result = await summarizeContent({ text: inputText, imageBase64, mimeType });
        
        const newItem: SummaryHistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          type: inputText && selectedFile ? 'both' : selectedFile ? 'image' : 'text',
          target: targetBox,
          detailedSummary: result.detailedSummary,
          shortSummary: result.shortSummary,
          imagePreview: persistentImageSrc,
        };
        
        setHistory(prev => [newItem, ...prev].slice(0, 15));
        onUpdateBox(targetBox, result.shortSummary, persistentImageSrc);
        setInputText('');
        setSelectedFile(null);
        setPreviewUrl(null);
      }
    } catch (err: any) {
      setError({ 
        message: "AI Sync Error", 
        detail: err.message || "Failed to communicate with Gemini API." 
      });
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans p-6 lg:p-10 ${isDark ? 'bg-[#020617] text-slate-300' : 'bg-slate-50 text-slate-700'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Navigation & Theme Toggle */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 p-8 rounded-[2.5rem] border backdrop-blur-xl transition-all ${isDark ? 'bg-slate-900/40 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-md'}`}>
          <div className="flex items-center space-x-6">
            <button onClick={onBack} className="p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all shadow-lg active:scale-95">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className={`text-3xl font-black tracking-tighter uppercase italic transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Control <span className="text-indigo-500">Center</span></h1>
                <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${isAiLinked ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500 animate-pulse'}`}>
                  {isAiLinked ? 'AI LINKED' : 'AI OFFLINE'}
                </div>
              </div>
              <p className={`text-[10px] font-black uppercase tracking-[0.4em] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>System: NODE-ALPHA-01</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
             <button 
                onClick={toggleTheme} 
                className={`flex items-center space-x-2 px-4 py-2 rounded-2xl border transition-all ${isDark ? 'bg-slate-800 border-white/10 text-white hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
             >
                {isDark ? (
                    <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707ZM12 7a5 5 0 100 10 5 5 0 000-10z" /></svg><span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Light</span></>
                ) : (
                    <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg><span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Dark</span></>
                )}
             </button>
          </div>
        </div>

        {error && (
          <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className={`p-8 rounded-[2.5rem] border-2 flex items-start space-x-5 ${isDark ? 'bg-red-500/10 border-red-500/30 text-red-200' : 'bg-red-50 border-red-200 text-red-800'}`}>
              <div className="p-3 bg-red-500/20 rounded-2xl">
                <svg className="w-8 h-8 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div className="flex-1">
                <p className="font-black uppercase text-sm tracking-widest mb-2">{error.message}</p>
                <p className="text-sm opacity-80 leading-relaxed font-medium">{error.detail}</p>
                {error.detail?.includes("Netlify") && (
                   <div className="mt-4 space-y-2">
                     <p className="text-[10px] font-black uppercase tracking-wider opacity-60">Apply this build command in Netlify:</p>
                     <div className={`p-4 rounded-xl font-mono text-xs overflow-x-auto ${isDark ? 'bg-black/40' : 'bg-white/50'}`}>
                        sed -i "s|process.env.API_KEY|'$API_KEY'|g" services/geminiService.ts
                     </div>
                   </div>
                )}
              </div>
              <button onClick={() => setError(null)} className="opacity-50 hover:opacity-100 transition-opacity"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            <div className={`border rounded-[3rem] p-10 shadow-2xl relative overflow-hidden transition-all ${isDark ? 'bg-slate-900/80 border-white/10' : 'bg-white border-slate-200'}`}>
              <div className="relative z-10 space-y-8">
                <div className={`flex items-center justify-between border-b pb-6 transition-colors ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
                    <h2 className={`text-sm font-black uppercase tracking-[0.2em] ${isDark ? 'text-white' : 'text-slate-900'}`}>Deployment Portal</h2>
                  </div>
                  <div className={`flex p-1.5 rounded-2xl border transition-colors ${isDark ? 'bg-black/40 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
                    <button onClick={() => setIsManualMode(false)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isManualMode ? 'bg-indigo-600 text-white shadow-lg' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>AI Sync</button>
                    <button onClick={() => setIsManualMode(true)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isManualMode ? (isDark ? 'bg-slate-700' : 'bg-slate-400') + ' text-white shadow-lg' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>Manual</button>
                  </div>
                </div>
                
                <textarea
                  className={`w-full h-44 p-8 border rounded-[2rem] focus:ring-4 outline-none font-medium transition-all text-xl resize-none custom-scrollbar ${isDark ? 'bg-black/40 border-white/5 text-white placeholder:text-slate-700' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-300'}`}
                  placeholder={isManualMode ? "Enter manual text update..." : "Paste long text or upload image for AI summary..."}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className={`relative h-32 border-2 border-dashed rounded-[2rem] transition-all group overflow-hidden cursor-pointer ${isDark ? 'border-white/10 bg-black/30' : 'border-slate-200 bg-slate-50'}`}>
                    {previewUrl ? (
                      <div className="w-full h-full relative">
                        <img src={previewUrl} className="w-full h-full object-cover" alt="Asset" />
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                          <button onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setPreviewUrl(null); }} className="px-6 py-2 bg-red-600 text-white rounded-full text-xs font-black">Clear Asset</button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center space-y-2">
                        <svg className="w-6 h-6 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Add Image</p>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-between space-y-4">
                    <select 
                      value={targetBox} 
                      onChange={(e) => setTargetBox(e.target.value as TargetBox)} 
                      className={`w-full p-4 border rounded-[1.5rem] text-sm font-black uppercase tracking-widest outline-none ${isDark ? 'bg-black/40 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    >
                      <option value="exam">Target: Exam Corner</option>
                      <option value="updates">Target: Live Feed</option>
                      <option value="event">Target: Campus Events</option>
                      <option value="quote">Target: Daily Wisdom</option>
                      <option value="general">Target: Core Node</option>
                    </select>
                    <button 
                      onClick={handleSync} 
                      disabled={loading}
                      className={`w-full h-16 rounded-[1.5rem] font-black uppercase tracking-widest text-white transition-all active:scale-95 flex items-center justify-center space-x-3 disabled:opacity-50 ${isManualMode ? 'bg-amber-600' : 'bg-indigo-600'}`}
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Syncing...</span>
                        </>
                      ) : (
                        <span>Deploy Update</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Ticker Management */}
            <div className={`border rounded-[3rem] p-10 shadow-2xl relative overflow-hidden transition-all ${isDark ? 'bg-slate-900/80 border-white/10' : 'bg-white border-slate-200'}`}>
              <div className="space-y-8">
                <div className="flex items-center space-x-3 border-b pb-6 border-white/5">
                    <div className="w-2 h-6 bg-orange-500 rounded-full"></div>
                    <h2 className={`text-sm font-black uppercase tracking-[0.2em] ${isDark ? 'text-white' : 'text-slate-900'}`}>Ticker Stream Controls</h2>
                </div>

                <div className="space-y-6">
                   <div className="flex flex-wrap gap-3">
                      {PRESET_COMMANDS.map((cmd, idx) => (
                        <button 
                          key={idx}
                          onClick={() => pushToTicker(cmd)}
                          className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${isDark ? 'bg-white/5 border border-white/10 text-white hover:bg-orange-500/20 hover:border-orange-500/50' : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-orange-50 hover:border-orange-200'}`}
                        >
                          {cmd}
                        </button>
                      ))}
                   </div>
                   <div className="flex space-x-4">
                      <input 
                        type="text" 
                        value={tickerInput}
                        onChange={(e) => setTickerInput(e.target.value)}
                        placeholder="Push custom ticker notice..."
                        className={`flex-1 p-5 rounded-[1.5rem] border outline-none font-bold text-sm transition-all focus:ring-2 ${isDark ? 'bg-black/40 border-white/5 text-white focus:ring-orange-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-orange-200'}`}
                      />
                      <button 
                        onClick={() => pushToTicker(tickerInput)}
                        className="px-8 bg-orange-600 hover:bg-orange-500 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-lg shadow-orange-600/20 active:scale-95"
                      >
                        Push Live
                      </button>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className={`border rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-2xl flex flex-col h-full max-h-[1000px] transition-all ${isDark ? 'bg-slate-900/60 border-white/10' : 'bg-white border-slate-200'}`}>
               <div className={`p-8 border-b ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/50'}`}><h3 className="text-[11px] font-black uppercase tracking-[0.3em]">Deployment History</h3></div>
               <div className="flex-1 overflow-y-auto custom-scrollbar">
                 {history.map(item => (
                   <div key={item.id} className={`p-6 flex space-x-5 border-b last:border-0 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                      <div className="w-12 h-12 rounded-xl bg-slate-500 overflow-hidden flex-shrink-0">
                        {item.imagePreview ? <img src={item.imagePreview} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-indigo-500/20 text-indigo-500 text-xs font-bold uppercase tracking-tighter">Text</div>}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{item.target}</p>
                        <p className={`text-xs font-bold line-clamp-2 italic leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.shortSummary}</p>
                        <p className="text-[8px] opacity-40 mt-1 uppercase font-bold">{new Date(item.timestamp).toLocaleTimeString()}</p>
                      </div>
                   </div>
                 ))}
                 {history.length === 0 && (
                   <div className="p-20 text-center opacity-20"><p className="text-[10px] font-black uppercase tracking-widest">No Recent Logs</p></div>
                 )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
