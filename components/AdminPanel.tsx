
import React, { useState, useEffect } from 'react';
import { summarizeContent } from '../services/geminiService.ts';
import { SummaryHistoryItem, TargetBox } from '../types.ts';

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
  "System Maintenance at 2:00 PM 🛠️",
  "Library extended hours start today 📚",
  "New Cafeteria Menu is now live! 🍎"
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ theme, setTheme, history, setHistory, onUpdateBox, onBack }) => {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [error, setError] = useState<{message: string, detail?: string} | null>(null);
  const [targetBox, setTargetBox] = useState<TargetBox>('general');

  // Robust check for injected API key
  const isAiLinked = typeof process.env.API_KEY === 'string' && 
                     !process.env.API_KEY.includes("process.env") && 
                     process.env.API_KEY !== "undefined" &&
                     process.env.API_KEY !== "";

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSync = async () => {
    if (!inputText.trim() && !selectedFile) {
      setError({ message: "Payload Missing", detail: "Provide text or image to synthesize." });
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
          reader.onerror = () => rej(new Error("File conversion failed"));
          reader.readAsDataURL(selectedFile);
        });
        imageBase64 = base64Data;
        mimeType = selectedFile.type;
        persistentImageSrc = `data:${mimeType};base64,${imageBase64}`;
      }

      if (isManualMode) {
        const result = { detailedSummary: inputText, shortSummary: inputText || "Update Applied" };
        updateHistoryAndDashboard(result, persistentImageSrc);
      } else {
        const result = await summarizeContent({ text: inputText, imageBase64, mimeType });
        updateHistoryAndDashboard(result, persistentImageSrc);
      }
      
      setInputText('');
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err: any) {
      setError({ message: "Sync Error", detail: err.message });
    } finally {
      setLoading(false);
    }
  };

  const updateHistoryAndDashboard = (result: any, img?: string) => {
    const newItem: SummaryHistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type: inputText && selectedFile ? 'both' : selectedFile ? 'image' : 'text',
      target: targetBox,
      detailedSummary: result.detailedSummary,
      shortSummary: result.shortSummary,
      imagePreview: img,
    };
    setHistory(prev => [newItem, ...prev].slice(0, 15));
    onUpdateBox(targetBox, result.shortSummary, img);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen p-6 lg:p-10 transition-colors ${isDark ? 'bg-[#020617] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-6xl mx-auto space-y-10">
        <div className={`p-8 rounded-[2rem] border flex flex-col md:flex-row items-center justify-between gap-6 ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center space-x-6">
            <button onClick={onBack} className="p-4 bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-colors">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7"/></svg>
            </button>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-black uppercase italic tracking-tighter">Control <span className="text-indigo-500">Center</span></h1>
                <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${isAiLinked ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500 animate-pulse'}`}>
                  {isAiLinked ? '• AI LINKED' : '• AI OFFLINE'}
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-[0.3em] opacity-40">Network: Node-01</p>
            </div>
          </div>
          <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className="px-4 py-2 border rounded-xl text-[10px] font-black uppercase">
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        {error && (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-200 text-sm">
            <p className="font-black uppercase mb-1">{error.message}</p>
            <p className="opacity-70 font-mono text-xs">{error.detail}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <div className={`p-10 rounded-[2.5rem] border ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xs font-black uppercase tracking-widest text-indigo-500">Deployment Portal</h2>
                 <div className="flex bg-black/20 p-1 rounded-xl">
                   <button onClick={() => setIsManualMode(false)} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase ${!isManualMode ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>AI Sync</button>
                   <button onClick={() => setIsManualMode(true)} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase ${isManualMode ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>Manual</button>
                 </div>
              </div>

              <textarea 
                className={`w-full h-48 p-6 rounded-2xl border outline-none font-medium resize-none mb-8 ${isDark ? 'bg-black/20 border-white/5 text-white' : 'bg-slate-50 border-slate-200'}`}
                placeholder="Paste content here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center relative overflow-hidden ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  {previewUrl ? (
                    <img src={previewUrl} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-black uppercase opacity-30">Add Image</span>
                  )}
                  <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <div className="space-y-4">
                  <select value={targetBox} onChange={(e) => setTargetBox(e.target.value as TargetBox)} className={`w-full p-4 rounded-xl border text-[10px] font-black uppercase tracking-widest outline-none ${isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                    <option value="exam">Exam Corner</option>
                    <option value="updates">Live Feed</option>
                    <option value="event">Campus Events</option>
                    <option value="general">Global Node</option>
                  </select>
                  <button onClick={handleSync} disabled={loading} className="w-full h-14 bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-indigo-500 transition-all disabled:opacity-50">
                    {loading ? 'Processing...' : 'Deploy Update'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <div className={`p-8 rounded-[2.5rem] border flex flex-col h-[600px] ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200'}`}>
              <h3 className="text-xs font-black uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Log Stream</h3>
              <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                {history.map(item => (
                  <div key={item.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex-shrink-0 overflow-hidden">
                       {item.imagePreview && <img src={item.imagePreview} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <p className="text-[8px] font-black uppercase text-indigo-400">{item.target}</p>
                      <p className="text-[10px] font-bold italic line-clamp-1">{item.shortSummary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
