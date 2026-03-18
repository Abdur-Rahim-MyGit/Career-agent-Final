import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const mockTrendData = [
  { month: 'Jan', dataAnalyst: 4000, fullStack: 2400, aiEngineer: 2400 },
  { month: 'Feb', dataAnalyst: 3000, fullStack: 1398, aiEngineer: 2210 },
  { month: 'Mar', dataAnalyst: 2000, fullStack: 9800, aiEngineer: 2290 },
  { month: 'Apr', dataAnalyst: 2780, fullStack: 3908, aiEngineer: 2000 },
  { month: 'May', dataAnalyst: 1890, fullStack: 4800, aiEngineer: 2181 },
  { month: 'Jun', dataAnalyst: 2390, fullStack: 3800, aiEngineer: 2500 },
  { month: 'Jul', dataAnalyst: 3490, fullStack: 4300, aiEngineer: 3100 },
];

const mockSalaryData = [
  { role: 'Data Analyst', avgSalary: 6.5, topSalary: 12 },
  { role: 'Full Stack', avgSalary: 8.0, topSalary: 15 },
  { role: 'AI Engineer', avgSalary: 10.5, topSalary: 22 },
];

export default function MarketInsights() {
  const [intel, setIntel] = useState(null);
  
  // In a real app, this fetches from the /api/market-intel fueled by our Python scraper
  useEffect(() => {
    // Simulate network fetch
    setTimeout(() => {
      setIntel(true);
    }, 1000);
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Live Market Intelligence
        </h1>
        <p className="text-gray-600 text-lg">
          Powered by SMAART Hybrid-AI. View real-time hiring trends and skill demands across the Indian tech ecosystem.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Trend Chart (Area) */}
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Hiring Volume Trends (Last 7 Months)</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip />
                <Area type="monotone" dataKey="dataAnalyst" stroke="#0d9488" fillOpacity={1} fill="url(#colorDA)" />
                <Area type="monotone" dataKey="fullStack" stroke="#4f46e5" fillOpacity={1} fill="url(#colorFS)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Salary Chart (Bar) */}
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Salary Estimates (LPA)</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockSalaryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="role" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgSalary" name="Average Profile" stackId="a" fill="#3b82f6" radius={[0,0,4,4]} />
                <Bar dataKey="topSalary" name="Top 10% Profile" stackId="a" fill="#1d4ed8" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* AI Demand Section */}
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <h2 className="text-2xl font-bold mb-6 relative z-10">Fastest Growing AI Skills</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {[
            { tag: "Prompt Engineering", rise: "+240%", usage: "Cross-functional" },
            { tag: "LangChain / RAG", rise: "+180%", usage: "Software Engineering" },
            { tag: "Claude 3.5 API", rise: "+310%", usage: "Backend / Architecture" }
          ].map((item, idx) => (
            <div key={idx} className="bg-white/10 rounded-xl p-5 border border-white/20 hover:bg-white/20 transition-colors">
              <div className="text-emerald-400 font-bold text-xl mb-1">{item.rise}</div>
              <h3 className="font-semibold text-lg">{item.tag}</h3>
              <p className="text-indigo-200 text-sm mt-2">{item.usage}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
