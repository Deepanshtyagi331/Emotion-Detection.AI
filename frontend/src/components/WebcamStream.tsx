"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Camera, CameraOff } from "lucide-react";

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

export default function WebcamStream({ onEmotionData }: { onEmotionData?: (data: DetectionResult[]) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const latestSpokenEmotion = useRef<string | null>(null);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
    }
  };

  const stopStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setIsStreaming(false);
      
      if (overlayCanvasRef.current) {
        const ctx = overlayCanvasRef.current.getContext("2d");
        ctx?.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
      }
    }
  };

  const speakInsight = (insight: EmotionInsight) => {
    if ("speechSynthesis" in window) {
      if (latestSpokenEmotion.current !== insight.message) {
        const utterance = new SpeechSynthesisUtterance(insight.message);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
        latestSpokenEmotion.current = insight.message;
      }
    }
  };

  const drawOverlay = useCallback((results: DetectionResult[]) => {
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, overlay.width, overlay.height);

    results.forEach((res) => {
      const { box, dominant_emotion, insight, confidence } = res;
      if (box && box.w > 0) {
        // Draw bounding box
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 3;
        ctx.strokeRect(box.x, box.y, box.w, box.h);

        // Draw background for text
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(box.x, box.y - 40, box.w, 35);

        // Draw text
        ctx.fillStyle = "#ffffff";
        ctx.font = "18px Inter";
        ctx.fillText(
          `${insight.emoji} ${dominant_emotion} (${(confidence * 100).toFixed(0)}%)`,
          box.x + 5,
          box.y - 15
        );
      }
      
      // Optionally read aloud the first face's insight
      if (res.face_id === 1) {
        speakInsight(insight);
      }
    });
  }, []);

  useEffect(() => {
    wsRef.current = new WebSocket("ws://localhost:8000/ws/stream?client_id=web_user");

    wsRef.current.onopen = () => console.log("WebSocket Connected");
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.results) {
        drawOverlay(data.results);
        if (onEmotionData) onEmotionData(data.results);
      }
    };

    wsRef.current.onclose = () => console.log("WebSocket Disconnected");

    return () => {
      wsRef.current?.close();
    };
  }, [drawOverlay, onEmotionData]);

  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      if (videoRef.current && canvasRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const overlay = overlayCanvasRef.current;
        
        // Sync canvas sizes with video intrinsic size
        if (video.videoWidth && canvas.width !== video.videoWidth) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        if (overlay && video.videoWidth && overlay.width !== video.videoWidth) {
          overlay.width = video.videoWidth;
          overlay.height = video.videoHeight;
        }

        const ctx = canvas.getContext("2d");
        if (ctx && canvas.width > 0) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const base64Img = canvas.toDataURL("image/jpeg", 0.5);
            wsRef.current.send(JSON.stringify({ image: base64Img }));
        }
      }
    }, 400); // 2.5 FPS

    return () => clearInterval(interval);
  }, [isStreaming]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative rounded-2xl overflow-hidden glass-panel border border-zinc-800 shadow-xl bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full max-w-2xl h-auto object-cover ${!isStreaming ? "hidden" : ""}`}
        />
        <canvas ref={overlayCanvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
        
        {/* Hidden canvas for extracting frames */}
        <canvas ref={canvasRef} className="hidden" />

        {!isStreaming && (
          <div className="w-full max-w-2xl h-[400px] flex flex-col items-center justify-center text-zinc-500">
            <CameraOff size={48} className="mb-4 opacity-50" />
            <p>Camera is currently off</p>
          </div>
        )}
      </div>

      <button
        onClick={isStreaming ? stopStream : startStream}
        className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
          isStreaming 
            ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20" 
            : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/30"
        }`}
      >
        {isStreaming ? (
          <>
            <CameraOff size={20} /> Stop Camera
          </>
        ) : (
          <>
            <Camera size={20} /> Start Camera
          </>
        )}
      </button>
    </div>
  );
}
