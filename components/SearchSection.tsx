import React, { useState } from 'react';
import { Search, Loader2, Database, Wand2 } from 'lucide-react';

interface SearchSectionProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export const SearchSection: React.FC<SearchSectionProps> = ({ onSearch, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input.trim());
    }
  };

  const isNumeric = /^\d+$/.test(input.trim());

  const suggestions = [
    "20",
    "50",
    "100",
    "Sydney, Melbourne",
    "Perth Suburbs",
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        {isNumeric ? <Database className="h-5 w-5 text-indigo-600"/> : <Search className="h-5 w-5 text-indigo-600"/>}
        {isNumeric ? "Generate Dataset" : "Search or Generate Data"}
      </h2>
      <form onSubmit={handleSubmit} className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a number (e.g. 50) to generate random suburbs, or type a location"
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium"
            disabled={isLoading}
          />
          {isNumeric ? (
             <Wand2 className="absolute left-3 top-3.5 h-5 w-5 text-indigo-500" />
          ) : (
             <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className={`
            px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 min-w-[140px] justify-center text-white
            ${isLoading ? 'bg-slate-400' : isNumeric ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Processing</span>
            </>
          ) : (
            isNumeric ? (
              <>
                <Wand2 className="h-4 w-4" />
                <span>Generate</span>
              </>
            ) : (
              'Search'
            )
          )}
        </button>
      </form>
      
      <div className="flex flex-wrap gap-2 items-center text-sm text-slate-600">
        <span className="font-medium">Try:</span>
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => {
              setInput(s);
              onSearch(s);
            }}
            disabled={isLoading}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700 transition-colors disabled:opacity-50 border border-slate-200"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};