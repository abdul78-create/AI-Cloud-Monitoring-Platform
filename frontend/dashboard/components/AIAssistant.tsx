"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Sparkles, Brain, Zap, Shield, BarChart3, Clock, Check, AlertTriangle, Info, ArrowDown, Bot, User, Copy, Terminal, RefreshCw } from "lucide-react";
import { useMonitoringStore } from "@/store/useMonitoringStore";

// Type definitions
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  status?: "sending" | "sent" | "error";
};

// Simple Markdown-like parser for code blocks and bold text
const renderMessageContent = (content: string) => {
  const parts = content.split(/(```[\s\S]*?```)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith("```")) {
      const code = part.slice(3, -3).trim();
      return (
        <div key={index} className="my-3 relative group">
          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1.5 rounded-md bg-slate-800 text-slate-400 hover:text-white transition-colors" aria-label="Copy code">
              <Copy size={14} />
            </button>
          </div>
          <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 shadow-lg">
            <div className="flex items-center gap-2 mb-2 text-slate-500 text-[10px] uppercase font-bold">
              <Terminal size={12} />
              <span>Shell / Output</span>
            </div>
            <pre><code>{code}</code></pre>
          </div>
        </div>
      );
    }
    
    // Handle bold text
    const boldParts = part.split(/(\*\*.*?\*\*)/g);
    return (
      <span key={index}>
        {boldParts.map((boldPart, bIndex) => {
          if (boldPart.startsWith("**") && boldPart.endsWith("**")) {
            return <strong key={bIndex} className="font-bold text-slate-900 dark:text-white">{boldPart.slice(2, -2)}</strong>;
          }
          return boldPart;
        })}
      </span>
    );
  });
};

export const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I am your **AI DevOps Copilot**. I have analyzed your current infrastructure. How can I help you today?",
      timestamp: new Date(),
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { metrics, alerts, infrastructure, rootCause, playbook } = useMonitoringStore();
  const theme = useMonitoringStore((state) => state.theme);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const suggestions = [
    { text: "Analyze infrastructure health", category: "Analyze" },
    { text: "Why is CPU usage high?", category: "Troubleshoot" },
    { text: "Show critical incidents", category: "Alerts" },
    { text: "Optimize cloud resources", category: "Optimize" },
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
    }, 40); // Adjust speed here
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

    let response = "I have analyzed your request. I am your AI Copilot, monitoring logs, metrics, and topology in real-time. System appears stable.";

    if (messageText.toLowerCase().includes("cpu")) {
      response = `Your current CPU usage is at **${latestMetric?.cpu?.toFixed(1) || 45}%**. This is within normal parameters.`;
      if (latestMetric && latestMetric.cpu > 80) {
        response = `CRITICAL: Your current CPU usage is spiked at **${latestMetric.cpu.toFixed(1)}%**! This is likely causing latency. ${rootCause || ""}`;
      }
    } else if (messageText.toLowerCase().includes("network") || messageText.toLowerCase().includes("traffic")) {
      response = `Current network traffic is **${latestMetric?.networkTrafficMbps?.toFixed(1) || 200} Mbps**.`;
      if (latestMetric && latestMetric.networkTrafficMbps > 500) {
        response = `Traffic is exceptionally high (**${latestMetric.networkTrafficMbps.toFixed(1)} Mbps**). ${rootCause || "This might be due to a spike in user activity or a potential DDoS attack."}`;
      }
    } else if (messageText.toLowerCase().includes("root cause") || messageText.toLowerCase().includes("incident") || messageText.toLowerCase().includes("why")) {
      if (rootCause) {
        response = `The identified root cause is: **${rootCause}**.\n\nSuggested Playbook:\n${playbook?.map(a => `- ${a}`).join("\n")}`;
      } else if (criticalAlerts.length > 0) {
        response = `I see **${criticalAlerts.length}** critical alerts. The main issue seems to be: **${criticalAlerts[0].message}**.`;
      }
    } else if (messageText.toLowerCase().includes("infrastructure") || messageText.toLowerCase().includes("nodes")) {
      response = `Infrastructure status: **${infrastructure.length}** services monitored. **${downNodes.length}** services are currently failing or critical.`;
      if (downNodes.length > 0) {
        response += ` Critical services: ${downNodes.map(n => `**${n.service}**`).join(", ")}.`;
      }
    } else if (messageText.toLowerCase().includes("incidents") || messageText.toLowerCase().includes("alerts")) {
      response = `I found **${criticalAlerts.length || 2} critical alerts** in the last 24 hours. 
      
Critical Incidents:
- **API Gateway**: High latency (avg 1.2s)
- **Auth Service**: Rate limit exceeded for 3 IPs

I recommend rotating API keys for the Gateway and investigating the Auth Service logs.`;
    } else if (messageText.toLowerCase().includes("optimize")) {
      response = "Your DB write-replica is running at **30% capacity**. You can scale down to a smaller instance to save approximately **15% on monthly costs**. Here is the recommended configuration:\n\`\`\`\n{\n  \"instance_type\": \"db.t3.medium\",\n  \"savings\": \"~$45/month\"\n}\n\`\`\`";
    } else {
      response = "I am processing your query using **Ollama (Llama3)**. Based on the current metrics, the system is stable but I recommend monitoring the memory trend on the API Gateway.";
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
    }, 800); // Thinking delay
  };

  return (
    <>
      {/* Floating Button (World-Class Redesign) */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-md hover:shadow-lg transition-all cursor-pointer overflow-hidden"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity" />
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={22} />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="relative">
              <Sparkles size={22} className="animate-pulse" />
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-rose-500 border-2 border-white dark:border-slate-900" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window (World-Class Redesign) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-6 z-50 w-[450px] max-w-[calc(100vw-48px)] h-[650px] max-h-[calc(100vh-140px)] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-premium flex flex-col overflow-hidden transition-colors duration-500"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl flex justify-between items-center transition-colors duration-500">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-md">
                  <Brain size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    AI Operations Copilot
                    <span className="text-[10px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-medium">Live</span>
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Context Aware • Llama3
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <ArrowDown size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-white/50 dark:bg-slate-900/50 transition-colors duration-500">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`h-9 w-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm ${msg.role === 'user' ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'}`}>
                      {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className="space-y-1">
                      <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-tr-none shadow-md' 
                          : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-none shadow-sm transition-colors duration-500'
                      }`}>
                        {renderMessageContent(msg.content)}
                        
                        {/* Thinking Indicator */}
                        {msg.content === "" && (
                          <div className="flex gap-1.5 items-center h-5">
                            <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                            <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1 flex items-center gap-1 justify-end">
                        <Clock size={10} />
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompts (Redesigned) */}
            {messages.length === 1 && (
              <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 transition-colors duration-500">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Quick Commands</p>
                <div className="grid grid-cols-2 gap-2">
                  {suggestions.map((sug) => (
                    <button
                      key={sug.text}
                      onClick={() => handleSend(sug.text)}
                      className="text-xs bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-600 dark:text-slate-300 hover:border-indigo-200 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-sm transition-all text-left flex items-center justify-between group"
                    >
                      <span>{sug.text}</span>
                      <Sparkles size={12} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area (Redesigned) */}
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl transition-colors duration-500">
              <div className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask about infrastructure, alerts, or optimization..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl pl-4 pr-12 py-3.5 text-sm outline-none focus:border-indigo-300 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:shadow-sm focus:shadow-indigo-100/50 dark:focus:shadow-none transition-all text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!message.trim() || isTyping}
                  className={`absolute right-2 p-2.5 rounded-lg transition-all ${
                    message.trim() && !isTyping 
                      ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white hover:shadow-md hover:shadow-indigo-500/20' 
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Send size={16} />
                </button>
              </div>
              <div className="flex justify-between items-center mt-3 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                <span className="flex items-center gap-1"><Terminal size={10} /> Shift + Enter for new line</span>
                <span className="flex items-center gap-1"><Info size={10} /> AI generated insights.</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
