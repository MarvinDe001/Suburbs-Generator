import React, { useState } from 'react';
import { Layout, Map } from 'lucide-react';
import { SuburbData } from './types';
import { fetchSuburbData } from './services/geminiService';
import { SearchSection } from './components/SearchSection';
import { SuburbTable } from './components/SuburbTable';
import { GeoChart } from './components/GeoChart';

const App: React.FC = () => {
  const [data, setData] = useState<SuburbData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await fetchSuburbData(query);
      
      setData(prev => {
        // 1. Deduplicate incoming results internally (in case AI returns duplicates in the same batch)
        const uniqueIncoming = results.filter((item, index, self) =>
          index === self.findIndex((t) => (
            t.suburbName.toLowerCase() === item.suburbName.toLowerCase() && 
            t.postcode === item.postcode
          ))
        );

        // 2. Filter out items that already exist in the previous state
        const newItems = uniqueIncoming.filter(newItem => 
          !prev.some(existing => 
            existing.suburbName.toLowerCase() === newItem.suburbName.toLowerCase() && 
            existing.postcode === newItem.postcode
          )
        );

        return [...newItems, ...prev];
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setData([]);
    setError(null);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-indigo-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Map className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">AusSuburbia Explorer</h1>
              <p className="text-xs text-indigo-200">AI-Powered Suburb Data Retrieval</p>
            </div>
          </div>
          <div className="text-sm bg-indigo-800/50 px-3 py-1 rounded-full border border-indigo-500/30">
             Total Records: {data.length}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col gap-6">
        
        {/* Intro */}
        <div className="prose max-w-none text-slate-600 mb-2">
          <p>
            Search for any Australian region, city, or list of suburbs to retrieve comprehensive data including 
            <strong> Geolocation</strong>, <strong>LGA</strong>, and <strong>Neighbouring Suburbs</strong>. 
            The table below will populate with AI-generated data.
          </p>
        </div>

        {/* Search */}
        <SearchSection onSearch={handleSearch} isLoading={isLoading} />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-2">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        {/* Visualization & Actions */}
        {data.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
               <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
                  <div className="flex justify-between items-center">
                    <p className="text-blue-700 text-sm">
                      <strong>Tip:</strong> You can keep searching to add more suburbs to the list below. 
                      Click "Export CSV" in the table to save your dataset.
                    </p>
                    <button 
                      onClick={handleClear}
                      className="text-xs text-blue-600 hover:text-blue-800 underline font-medium"
                    >
                      Clear All Data
                    </button>
                  </div>
               </div>
            </div>
            <div className="lg:col-span-1">
               <GeoChart data={data} />
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="flex-1 min-h-[400px]">
          {data.length > 0 ? (
            <SuburbTable data={data} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl p-12">
              <Layout className="h-16 w-16 mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-slate-600">No Data Loaded</h3>
              <p className="text-sm">Enter a query above to start building your dataset.</p>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} AusSuburbia Data Explorer. Powered by Google Gemini.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;