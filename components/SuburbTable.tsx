import React, { useState, useMemo } from 'react';
import { SuburbData, SortField, SortOrder } from '../types';
import { Download, MapPin, ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, Briefcase, Search } from 'lucide-react';

interface SuburbTableProps {
  data: SuburbData[];
}

export const SuburbTable: React.FC<SuburbTableProps> = ({ data }) => {
  const [sortField, setSortField] = useState<SortField>(SortField.NAME);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC);
    } else {
      setSortField(field);
      setSortOrder(SortOrder.ASC);
    }
  };

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Handle numeric comparison if we add numeric sort fields later, strictly strings for now based on Enum
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === SortOrder.ASC ? -1 : 1;
      if (valA > valB) return sortOrder === SortOrder.ASC ? 1 : -1;
      return 0;
    });
  }, [data, sortField, sortOrder]);

  const downloadCSV = () => {
    const headers = [
      "Suburb Name", "Postcode", "Longitude", "Latitude", "Top 5 Near Suburbs", "LGA", "State", "Region", "Top 5 Industries", "Google Search Count"
    ];
    
    const rows = sortedData.map(item => [
      item.suburbName,
      item.postcode,
      item.longitude,
      item.latitude,
      `"${item.top5NearSuburbs.join(', ')}"`,
      `"${item.lga}"`,
      item.state,
      `"${item.region}"`,
      `"${item.top5Industries.join(', ')}"`,
      item.googleSearchCount
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "australian_suburbs_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 opacity-30" />;
    return sortOrder === SortOrder.ASC ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  if (data.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-indigo-600" />
          Results ({data.length})
        </h3>
        <button 
          onClick={downloadCSV}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>
      
      <div className="overflow-x-auto custom-scrollbar flex-1">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-100 text-slate-700 uppercase font-bold sticky top-0 z-10 shadow-sm">
            <tr>
              <th 
                className="px-6 py-4 cursor-pointer hover:bg-slate-200 transition-colors group"
                onClick={() => handleSort(SortField.NAME)}
              >
                <div className="flex items-center gap-1">
                  Suburb Name {renderSortIcon(SortField.NAME)}
                </div>
              </th>
              <th 
                className="px-6 py-4 cursor-pointer hover:bg-slate-200 transition-colors group"
                onClick={() => handleSort(SortField.POSTCODE)}
              >
                <div className="flex items-center gap-1">
                  Postcode {renderSortIcon(SortField.POSTCODE)}
                </div>
              </th>
              <th className="px-6 py-4">Coordinates</th>
              <th className="px-6 py-4 min-w-[250px]">Top 5 Near Suburbs</th>
              <th className="px-6 py-4">LGA</th>
              <th 
                className="px-6 py-4 cursor-pointer hover:bg-slate-200 transition-colors group"
                onClick={() => handleSort(SortField.STATE)}
              >
                 <div className="flex items-center gap-1">
                  State {renderSortIcon(SortField.STATE)}
                </div>
              </th>
              <th className="px-6 py-4">Region</th>
              <th className="px-6 py-4 min-w-[250px]">
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4 text-slate-400" />
                  Top 5 Industries
                </div>
              </th>
              <th className="px-6 py-4">
                 <div className="flex items-center gap-1">
                  <Search className="h-4 w-4 text-slate-400" />
                  Search Count (Monthly)
                </div>
              </th>
              <th className="px-6 py-4">Map</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedData.map((item, idx) => (
              <tr key={`${item.suburbName}-${item.postcode}-${idx}`} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{item.suburbName}</td>
                <td className="px-6 py-4 text-indigo-600 font-mono">{item.postcode}</td>
                <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                  {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                </td>
                <td className="px-6 py-4 text-slate-600 truncate max-w-xs" title={item.top5NearSuburbs.join(', ')}>
                  {item.top5NearSuburbs.map((sub, i) => (
                     <span key={i} className="inline-block bg-slate-100 px-2 py-0.5 rounded text-xs mr-1 mb-1 border border-slate-200">
                       {sub}
                     </span>
                  ))}
                </td>
                <td className="px-6 py-4 text-slate-700">{item.lga}</td>
                <td className="px-6 py-4">
                  <span className={`
                    px-2 py-1 rounded text-xs font-bold
                    ${item.state === 'NSW' ? 'bg-blue-100 text-blue-700' : ''}
                    ${item.state === 'VIC' ? 'bg-blue-900 text-white' : ''}
                    ${item.state === 'QLD' ? 'bg-red-100 text-red-800' : ''}
                    ${item.state === 'WA' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${item.state === 'SA' ? 'bg-red-50 text-red-600' : ''}
                    ${item.state === 'TAS' ? 'bg-emerald-100 text-emerald-800' : ''}
                    ${item.state === 'ACT' ? 'bg-purple-100 text-purple-800' : ''}
                    ${item.state === 'NT' ? 'bg-orange-100 text-orange-800' : ''}
                  `}>
                    {item.state}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{item.region}</td>
                <td className="px-6 py-4 text-slate-600 truncate max-w-xs" title={item.top5Industries.join(', ')}>
                   {item.top5Industries.map((ind, i) => (
                     <span key={i} className="inline-block bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs mr-1 mb-1 border border-indigo-100">
                       {ind}
                     </span>
                  ))}
                </td>
                <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                  <span className="bg-slate-100 px-2 py-1 rounded">
                    {item.googleSearchCount.toLocaleString()}
                  </span>
                </td>
                 <td className="px-6 py-4">
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};