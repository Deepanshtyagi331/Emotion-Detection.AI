"use client";

import { useState } from "react";
import WebcamStream from "@/components/WebcamStream";
import EmotionChart from "@/components/EmotionChart";
import { BrainCircuit, Activity, Heart, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface EmotionInsight {
  message: string;
  emoji: string;
  actionable_advice: string | null;
}

interface DetectionResult {
  face_id: number;
  dominant_emotion: string;
  confidence: number;
  insight: EmotionInsight;
  box?: Box;
}

export default function Home() {
  const [faces, setFaces] = useState<DetectionResult[]>([]);

  // Function to determine dashboard badge color based on primary emotion
  const getBadgeColor = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case "happy": return "bg-amber-500/20 text-amber-400 border-amber-500/50";
      case "sad": return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      case "angry": return "bg-red-500/20 text-red-400 border-red-500/50";
      case "surprise": return "bg-violet-500/20 text-violet-400 border-violet-500/50";
      case "fear": return "bg-gray-500/20 text-gray-400 border-gray-500/50";
      case "disgust": return "bg-lime-500/20 text-lime-400 border-lime-500/50";
      default: return "bg-zinc-800 text-zinc-300 border-zinc-700";
    }
  };

  const primaryFace = faces.length > 0 ? faces[0] : null;

  return (
    <main className="min-h-screen p-8 lg:p-12 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 rounded-xl border border-blue-500/30">
            <BrainCircuit className="text-blue-500" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Edge Emotion Agent</h1>
            <p className="text-sm text-zinc-400">Real-time facial expression analysis & vocal feedback</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-sm font-medium shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <Activity size={16} className="animate-pulse" />
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          System Online
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* WEBCAM COLUMN */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CameraIcon /> Live Feed
            </h2>
            <span className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-semibold">WebRTC / WebSocket</span>
          </div>
          
          <WebcamStream onEmotionData={(data) => setFaces(data)} />
        </div>

        {/* ANALYTICS DASHBOARD COLUMN */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Heart size={20} className="text-rose-400" /> Insights & Telemetry
            </h2>
          </div>

          <div className="glass-panel rounded-2xl p-6 min-h-[300px] flex flex-col">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">
              Current Emotion State
            </h3>

            <AnimatePresence mode="wait">
              {primaryFace ? (
                <motion.div
                  key={primaryFace.dominant_emotion}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col gap-5 flex-1"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-6xl drop-shadow-lg">{primaryFace.insight.emoji}</div>
                    <div>
                      <span className={`px-3 py-1 text-sm font-bold uppercase tracking-wider rounded-md border ${getBadgeColor(primaryFace.dominant_emotion)}`}>
                        {primaryFace.dominant_emotion}
                      </span>
                      <p className="text-sm text-zinc-400 mt-1 font-mono">
                         Confidence: {(primaryFace.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 shadow-inner mt-2 flex-1">
                    <p className="text-lg font-medium text-white mb-2 leading-tight">
                      {primaryFace.insight.message}
                    </p>
                    
                    {primaryFace.insight.actionable_advice && (
                      <div className="mt-4 pt-4 border-t border-zinc-700/50 text-sm text-zinc-400 flex items-start gap-2">
                        <AlertCircle size={16} className="text-blue-400 shrink-0 mt-0.5" />
                        <span className="italic leading-relaxed">{primaryFace.insight.actionable_advice}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 pt-8 pb-4">
                  <div className="w-16 h-16 rounded-full bg-zinc-800/50 border border-zinc-700 flex items-center justify-center mb-4">
                    <BrainCircuit size={24} className="opacity-50" />
                  </div>
                  <p>Awaiting face detection...</p>
                  <p className="text-sm text-zinc-600 mt-1">Start camera to analyze emotions</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">
              Daily Emotion Trends
            </h3>
            <EmotionChart />
          </div>
        </div>
      </div>
    </main>
  );
}

const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
    <circle cx="12" cy="13" r="3"></circle>
  </svg>
);
