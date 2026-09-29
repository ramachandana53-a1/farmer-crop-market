import React, { useState, useMemo } from 'react';
import { SUPPORTED_LANGUAGES, t } from '../utils/translations';
import { LanguageCode } from '../types';
import { Languages, Search, X, Check, Globe } from 'lucide-react';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: LanguageCode;
  onSelectLanguage: (code: LanguageCode) => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onSelectLanguage,
}) => {
  const [search, setSearch] = useState('');

  const filteredLanguages = useMemo(() => {
    if (!search.trim()) return SUPPORTED_LANGUAGES;
    const q = search.toLowerCase();
    return SUPPORTED_LANGUAGES.filter(
      (lang) =>
        lang.name.toLowerCase().includes(q) ||
        lang.nativeName.toLowerCase().includes(q) ||
        lang.region.toLowerCase().includes(q) ||
        lang.code.toLowerCase().includes(q)
    );
  }, [search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden text-stone-800"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#1B4332] text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-[#E9C46A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-[#E9C46A]/50 flex items-center justify-center text-[#E9C46A] shrink-0">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Select Your Language / भाषा चुनें / భాషను ఎంచుకోండి
              </h2>
              <p className="text-xs text-emerald-200">
                22 Official Indian Languages (8th Schedule) + English
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-stone-200 bg-stone-50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search language, state, or script (e.g., Telugu, हिन्दी, Tamil, Punjab)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-[#2D6A4F] text-sm bg-white"
              autoFocus
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs px-1.5 py-0.5"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Language Grid */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-stone-100 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredLanguages.map((lang) => {
              const isSelected = lang.code === currentLanguage;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    onSelectLanguage(lang.code);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 border-[#2D6A4F] text-[#1B4332] shadow-xs ring-2 ring-[#2D6A4F]/20'
                      : 'bg-white border-stone-200 hover:border-emerald-300 hover:bg-stone-50 text-stone-700'
                  }`}
                  title={`Switch language to ${lang.name} (${lang.nativeName})`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base sm:text-lg leading-tight text-[#1B4332]">
                        {lang.nativeName}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] bg-[#2D6A4F] text-white px-2 py-0.5 rounded-full font-semibold">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-medium text-stone-600 flex items-center gap-1.5 mt-0.5">
                      <span>{lang.name}</span>
                      <span className="text-stone-300">&bull;</span>
                      <span className="text-[11px] text-stone-500 truncate">{lang.region}</span>
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    {isSelected ? (
                      <div className="w-7 h-7 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full border border-stone-300 flex items-center justify-center text-stone-400 group-hover:border-emerald-400">
                        <Globe className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {filteredLanguages.length === 0 && (
            <div className="text-center py-8 text-stone-500 text-sm">
              No language found matching &quot;{search}&quot;. Try searching in English or native script.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-100 border-t border-stone-200 text-xs text-stone-600 flex items-center justify-between">
          <span>🇮🇳 Constitution of India &bull; 8th Schedule Recognized Languages</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
