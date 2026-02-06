
import React from 'react';
import { Page } from '../types';

interface WelcomeProps {
  theme: 'light' | 'dark';
  onNavigate: (page: Page) => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ theme, onNavigate }) => {
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden relative transition-colors duration-500 ${isDark ? 'bg-[#020617]' : 'bg-slate-50'}`}>
      {/* Dynamic Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className={`absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full blur-[160px] animate-pulse duration-[8s] ${isDark ? 'bg-indigo-600/20' : 'bg-indigo-400/10'}`}></div>
        <div className={`absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full blur-[160px] animate-pulse duration-[10s] ${isDark ? 'bg-violet-600/20' : 'bg-violet-400/10'}`} style={{ animationDelay: '2s' }}></div>
        {isDark && <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>}
      </div>

      <div className="z-10 text-center max-w-5xl space-y-16">
        <div className="space-y-6">
          <div className={`inline-flex items-center space-x-3 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] animate-in fade-in slide-in-from-top duration-1000 ${isDark ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border border-indigo-100 text-indigo-600'}`}>
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
            <span>Intelligence System V.3.0</span>
          </div>
          <h1 className={`text-7xl md:text-9xl font-black tracking-tighter leading-none italic uppercase transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Insight<span className="text-indigo-600 drop-shadow-[0_0_20px_rgba(79,70,229,0.4)]">Dash</span>
          </h1>
          <p className={`text-xl md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed tracking-tight transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Next-gen <span className={`${isDark ? 'text-white' : 'text-indigo-600'} font-bold italic`}>Digital Notice Boards</span> powered by adaptive AI content synthesis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-4 max-w-4xl mx-auto">
          <button 
            onClick={() => onNavigate('testing')}
            className={`group relative backdrop-blur-xl p-10 rounded-[3rem] border shadow-2xl transition-all text-left overflow-hidden active:scale-95 ${
              isDark 
              ? 'bg-slate-900/40 border-white/10 hover:shadow-indigo-500/20 hover:border-indigo-500/50' 
              : 'bg-white border-slate-200 hover:shadow-indigo-100 hover:border-indigo-300'
            }`}
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
               <svg className={`w-40 h-40 ${isDark ? 'text-indigo-500' : 'text-indigo-600'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/></svg>
            </div>
            <div className={`w-16 h-16 rounded-[1.5rem] border flex items-center justify-center mb-8 transition-all duration-500 ${
              isDark 
              ? 'bg-indigo-600/10 text-indigo-500 border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white' 
              : 'bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white'
            }`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className={`text-2xl font-black mb-3 uppercase tracking-tight italic transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Testing Board</h3>
            <p className={`font-medium leading-relaxed text-sm transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Monitor the live digital notice board in high-definition. View real-time schedules and AI updates.</p>
          </button>

          <button 
            onClick={() => onNavigate('admin')}
            className={`group relative backdrop-blur-xl p-10 rounded-[3rem] border shadow-2xl transition-all text-left overflow-hidden active:scale-95 ${
              isDark 
              ? 'bg-white/[0.03] border-white/5 hover:shadow-white/5 hover:border-slate-500' 
              : 'bg-white border-slate-200 hover:shadow-slate-200 hover:border-slate-400'
            }`}
          >
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
               <svg className={`w-40 h-40 ${isDark ? 'text-white' : 'text-slate-900'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>
            </div>
            <div className={`w-16 h-16 rounded-[1.5rem] border flex items-center justify-center mb-8 transition-all duration-500 ${
              isDark 
              ? 'bg-white/5 text-white border-white/10 group-hover:bg-white group-hover:text-black' 
              : 'bg-slate-100 text-slate-900 border-slate-200 group-hover:bg-slate-900 group-hover:text-white'
            }`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <h3 className={`text-2xl font-black mb-3 uppercase tracking-tight italic transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Admin Console</h3>
            <p className={`font-medium leading-relaxed text-sm transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Deploy new insights, schedules, and event notices to the digital board nodes instantly.</p>
          </button>
        </div>

        <div className="pt-10 flex flex-col items-center space-y-2 opacity-30 animate-pulse">
           <div className={`w-px h-12 ${isDark ? 'bg-indigo-500' : 'bg-indigo-300'}`}></div>
           <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Satellite Link Established</p>
        </div>
      </div>
    </div>
  );
};
