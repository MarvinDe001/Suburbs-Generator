import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { SuburbData } from '../types';

interface GeoChartProps {
  data: SuburbData[];
}

export const GeoChart: React.FC<GeoChartProps> = ({ data }) => {
  if (data.length === 0) return null;

  // Transform data for chart
  // Note: Longitude is X, Latitude is Y
  const chartData = data.map(item => ({
    x: item.longitude,
    y: item.latitude,
    name: item.suburbName,
    state: item.state
  }));

  // Calculate domains to zoom in the chart nicely
  const xValues = chartData.map(d => d.x);
  const yValues = chartData.map(d => d.y);
  
  const minX = Math.min(...xValues) - 0.05;
  const maxX = Math.max(...xValues) + 0.05;
  const minY = Math.min(...yValues) - 0.05;
  const maxY = Math.max(...yValues) + 0.05;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-slate-200 shadow-md rounded text-sm">
          <p className="font-bold">{data.name}</p>
          <p className="text-slate-500">Lat: {data.y.toFixed(3)}, Long: {data.x.toFixed(3)}</p>
          <p className="text-xs text-indigo-600 mt-1">{data.state}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-80 flex flex-col">
      <h3 className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wider">Spatial Distribution</h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <XAxis 
              type="number" 
              dataKey="x" 
              name="Longitude" 
              domain={[minX, maxX]} 
              tick={{fontSize: 10}}
              tickFormatter={(val) => val.toFixed(1)}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Latitude" 
              domain={[minY, maxY]} 
              tick={{fontSize: 10}}
              tickFormatter={(val) => val.toFixed(1)}
              width={40}
            />
            <ZAxis range={[60, 60]} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Suburbs" data={chartData} fill="#4f46e5" shape="circle" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};