"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Sparkles, Brain, Zap, Shield, BarChart3, Clock, Check, AlertTriangle, Info, ArrowDown, Bot, User } from "lucide-react";
import { useMonitoringStore } from "@/store/useMonitoringStore";

// Type definitions
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  status?: "sending" | "sent" | "error";
};

export const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I am your AI DevOps Copilot. I have analyzed your current infrastructure. How can I help you today?",
      timestamp: new Date(),
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const metrics = useMonitoringStore((state) => state.metrics);
  const alerts = useMonitoringStore((state) => state.alerts);
  const infrastructure = useMonitoringStore((state) => state.infrastructure);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const suggestions = [
    "Analyze current infrastructure",
    "Why is CPU usage high?",
    "Detect security threats",
    "Optimize performance",
    "Summarize alerts"
  ];

  // Simulated streaming function
  const simulateStreaming = (text: string, messageId: string) => {
    setIsTyping(true);
    let currentText = "";
    const words = text.split(" ");
    let i = 0;

    const interval = setInterval(() => {
      if (i < words.length) {
        currentText += (i === 0 ? "" : " ") + words[i];
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, content: currentText } : msg
          )
        );
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 50); // Adjust speed here
  };

  const handleSend = (textToUse?: string) => {
    const messageText = textToUse || message;
    if (!messageText.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    setActiveSuggestion(null);

    // Prepare context-aware response
    const latestMetric = metrics[metrics.length - 1];
    const criticalAlerts = alerts.filter(a => a.severity === "critical");
    const downNodes = infrastructure.filter(i => i.status === "down");

    let response = "I have analyzed your request. ";

    if (messageText.toLowerCase().includes("cpu")) {
      response = `Your current CPU usage is at ${latestMetric?.cpu || 0}%. This is within normal parameters. However, I noticed a spike in the last 10 minutes on cluster-B.`;
    } else if (messageText.toLowerCase().includes("analyze") || messageText.toLowerCase().includes("infrastructure")) {
      response = `Infrastructure Summary: You have ${infrastructure.length} active services. ${downNodes.length} nodes are currently down. Health score is at 94%. I recommend checking the DB replica latency.`;
    } else if (messageText.toLowerCase().includes("threat") || messageText.toLowerCase().includes("security")) {
      response = `Security Analysis: I found ${criticalAlerts.length} critical alerts in the last 24 hours. No active brute force attacks detected. I recommend rotating API keys for the Gateway.`;
    } else if (messageText.toLowerCase().includes("optimize")) {
      response = "Optimization Suggestion: Your DB write-replica is running at 30% capacity. You can scale down to a smaller instance to save approximately 15% on monthly costs.";
    } else if (messageText.toLowerCase().includes("alerts")) {
      response = `Alert Summary: Total of ${alerts.length} alerts active. ${criticalAlerts.length} critical, ${alerts.filter(a => a.severity === "warning").length} warnings. Most are related to latency spikes.`;
    } else {
      response = "I am processing your query using Ollama (Llama3). Based on the current metrics, the system is stable but I recommend monitoring the memory trend on the API Gateway.";
    }

    // Add empty assistant message for streaming
    const assistantMsgId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setTimeout(() => {
      setMessages((prev) => [...prev, assistantMsg]);
      simulateStreaming(response, assistantMsgId);
    }, 500);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="relative">
              <MessageSquare size={24} />
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-rose-500 border-2 border-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-120px)] glass-card rounded-2xl border-white/80 shadow-premium flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-white/70 backdrop-blur-xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <Brain size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">AI ChatOps Assistant</h3>
                  <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Ollama (Llama3) Active
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Context Aware</span>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
                  <ArrowDown size={16} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-slate-50/50 to-white/50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${msg.role === 'user' ? 'bg-slate-200 text-slate-700' : 'bg-indigo-100 text-indigo-600'}`}>
                      {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div>
                      <div className={`rounded-2xl px-4 py-2.5 text-sm ${
                        msg.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'
                      }`}>
                        {msg.content}
                        {msg.content === "" && (
                          <div className="flex gap-1 items-center h-5">
                            <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                            <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 px-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompts */}
            {messages.length === 1 && (
              <div className="px-4 py-2 border-t border-slate-50 bg-slate-50/50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Suggested Prompts</p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((sug) => (
                    <button
                      key={sug}
                      onClick={() => handleSend(sug)}
                      className="text-xs bg-white border border-slate-100 rounded-full px-3 py-1.5 text-slate-600 hover:border-indigo-200 hover:text-indigo-600 hover:shadow-sm transition-all"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-slate-100 bg-white/70 backdrop-blur-xl">
              <div className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask about infrastructure, alerts, or optimization..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-4 pr-12 py-3 text-sm outline-none focus:border-indigo-300 focus:bg-white focus:shadow-sm focus:shadow-indigo-100/50 transition-all text-slate-800 placeholder:text-slate-400"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!message.trim() || isTyping}
                  className={`absolute right-2 p-2 rounded-lg transition-all ${
                    message.trim() && !isTyping 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send size={14} />
                </button>
              </div>
              <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400 font-medium">
                <span>Shift + Enter for new line</span>
                <span className="flex items-center gap-1"><Info size={10} /> AI may generate inaccurate info.</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
