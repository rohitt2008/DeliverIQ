'use client';

import React, { useState } from 'react';
import { Volume2, Play, Check } from 'lucide-react';
import { speakPrompt, VOICE_PROMPTS, VoiceLanguage } from './VoiceGuide';

export default function AudioVoiceTester() {
  const [lang, setLang] = useState<VoiceLanguage>('mr');
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const prompts = [
    { key: 'takePhotoGuide', label: 'Photo Instructions' },
    { key: 'analyzingPhoto', label: 'AI Verifying...' },
    { key: 'successVerified', label: 'Success Approved' },
    { key: 'stampMissingRetake', label: 'Stamp Missing Prompt' },
    { key: 'shortageNoted', label: 'Shortage Discrepancy Note' },
    { key: 'retakeLimitReached', label: 'Retake Cap Reached' },
  ] as const;

  const handlePlay = (key: any) => {
    setActiveKey(key);
    speakPrompt(key, lang);
    setTimeout(() => setActiveKey(null), 2500);
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-brand-600" />
          <h3 className="font-extrabold text-xs text-slate-800">
            Interactive Driver Audio Prompts (Web Speech API)
          </h3>
        </div>

        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs">
          <button
            onClick={() => setLang('mr')}
            className={`px-2 py-0.5 rounded font-bold ${lang === 'mr' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
          >
            मराठी
          </button>
          <button
            onClick={() => setLang('hi')}
            className={`px-2 py-0.5 rounded font-bold ${lang === 'hi' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
          >
            हिन्दी
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-2 py-0.5 rounded font-bold ${lang === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
          >
            ENG
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        {prompts.map((p) => (
          <button
            key={p.key}
            onClick={() => handlePlay(p.key)}
            className={`p-2 rounded-xl border text-left flex items-center justify-between transition ${
              activeKey === p.key
                ? 'bg-brand-50 border-brand-500 text-brand-900 font-bold'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <span className="truncate pr-1">{p.label}</span>
            <Play className="w-3 h-3 text-brand-600 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
