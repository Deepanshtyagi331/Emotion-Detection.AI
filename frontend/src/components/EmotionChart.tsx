"use client";

import React, { useEffect, useState } from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from "recharts";

const EMOTION_COLORS: Record<string, string> = {
  happy: "#fbbf24",    // amber-400
  sad: "#60a5fa",      // blue-400
  angry: "#ef4444",    // red-500
  surprise: "#a78bfa", // violet-400
  fear: "#9ca3af",     // gray-400
  disgust: "#84cc16",  // lime-500
  neutral: "#9ca3af",  // gray-400
};

interface TrendData {
  emotion: string;
  count: number;
  avg_confidence: number;
}

export default function EmotionChart() {
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTrends = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/emotions/trends?hours_ago=24");
      const d = await res.json();
      if (Array.isArray(d)) {
         setData(d);
      }
    } catch (e) {
      console.error("Failed to fetch trends", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
    // Poll every 10 seconds for real-time dashboard updates
    const interval = setInterval(fetchTrends, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="h-48 flex items-center justify-center text-zinc-500">Loading charts...</div>;
  }

  if (data.length === 0) {
    return <div className="h-48 flex flex-col items-center justify-center text-zinc-500 text-sm">
      <p>No emotion data found for the last 24 hours.</p>
      <p>Tip: Start camera to begin analysis.</p>
    </div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-4 h-64">
      {/* Pie Chart */}
      <div className="flex flex-col h-full w-full">
        <h3 className="text-sm text-zinc-400 mb-2 font-semibold">Emotion Distribution</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="emotion"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={EMOTION_COLORS[entry.emotion.toLowerCase()] || "#fff"} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }}
              itemStyle={{ color: "#fafafa" }}
            />
            <Legend iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div className="flex flex-col h-full w-full">
         <h3 className="text-sm text-zinc-400 mb-2 font-semibold">Average Confidence</h3>
         <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="emotion" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} />
            <Tooltip 
              contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }}
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} 
              formatter={(value: any) => [`${(Number(value) * 100).toFixed(1)}%`, 'Confidence']}
            />
            <Bar dataKey="avg_confidence" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={EMOTION_COLORS[entry.emotion.toLowerCase()] || "#fff"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
