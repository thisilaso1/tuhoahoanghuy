import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ChatWidgetRenderer } from './ChatWidgetRenderer';
import { Send, Sparkles, Trash2, ShieldCheck, HelpCircle } from 'lucide-react';

export const ThienCoPanel: React.FC<{ fullScreen?: boolean }> = ({ fullScreen = false }) => {
  const {
    activeChart,
    chatMessages,
    isChatStreaming,
    streamingMessageContent,
    sendMessageToThienCo,
    clearChatHistory,
    settings,
  } = useApp();

  const [inputPrompt, setInputPrompt] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, streamingMessageContent]);

  const handleSend = () => {
    if (!inputPrompt.trim() || isChatStreaming) return;
    const prompt = inputPrompt;
    setInputPrompt('');
    sendMessageToThienCo(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={`flex flex-col rounded-2xl border border-amber-900/30 bg-slate-950/90 shadow-2xl backdrop-blur-xl ${
        fullScreen ? 'h-[calc(100vh-120px)]' : 'h-[650px]'
      }`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-amber-900/30 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-base font-bold text-amber-200">
                AI Thiên Cơ
              </h2>
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-300">
                2026 Engine
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Đồng hành cùng mệnh bàn: <strong className="text-amber-300">{activeChart.name}</strong> ({activeChart.birthCanChi.year.stem} {activeChart.birthCanChi.year.branch})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Provider status badge */}
          <div className="hidden items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/30 px-2.5 py-1 text-[10px] text-emerald-300 sm:flex">
            <ShieldCheck size={12} />
            <span>{settings.provider === 'demo' ? 'Khảo sát học thuật nội bộ' : `API: ${settings.provider}`}</span>
          </div>

          <button
            onClick={clearChatHistory}
            className="rounded-lg p-2 text-stone-400 hover:bg-slate-900 hover:text-stone-200 transition"
            title="Làm mới cuộc đối thoại"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Message List Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {chatMessages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-amber-600/30 border border-amber-500/40 text-amber-100 rounded-tr-none'
                    : 'bg-slate-900/90 border border-amber-900/20 text-stone-200 rounded-tl-none shadow-md'
                }`}
              >
                {!isUser && (
                  <div className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wider text-amber-400/80 font-serif">
                    <span>✦ Thiên Cơ Luận Giải</span>
                  </div>
                )}

                <div className="prose-scholarly whitespace-pre-wrap">
                  {msg.content}
                </div>

                {/* Render Widgets */}
                {msg.widgets && msg.widgets.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.widgets.map((widget, idx) => (
                      <ChatWidgetRenderer key={idx} widget={widget} />
                    ))}
                  </div>
                )}
              </div>

              {/* Suggested Questions */}
              {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 max-w-[85%]">
                  {msg.suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessageToThienCo(q)}
                      className="rounded-full border border-amber-900/40 bg-slate-900/70 px-2.5 py-1 text-[11px] text-amber-300/90 hover:border-amber-500/50 hover:bg-slate-800 transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Streaming State Bubble */}
        {isChatStreaming && (
          <div className="flex flex-col items-start">
            <div className="max-w-[85%] rounded-2xl rounded-tl-none border border-amber-900/30 bg-slate-900/95 p-4 text-xs sm:text-sm text-stone-200 shadow-md">
              <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-amber-400">
                <span className="inline-block h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Thiên Cơ đang chiêm nghiệm tinh tú...</span>
              </div>
              <div className="whitespace-pre-wrap prose-scholarly">
                {streamingMessageContent || 'Đang vận hành thuật toán tất định...'}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-amber-900/30 p-3 sm:p-4 bg-slate-950">
        <div className="relative flex items-center">
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Hỏi thiên mệnh... (ví dụ: 'Năm 2026 cung Tài Bạch thế nào?', 'Xem cung Phu Thê')"
            rows={2}
            className="w-full resize-none rounded-xl border border-amber-900/40 bg-slate-900 px-4 py-2.5 pr-12 text-xs sm:text-sm text-amber-100 placeholder-stone-500 focus:border-amber-500/70 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
          />
          <button
            onClick={handleSend}
            disabled={!inputPrompt.trim() || isChatStreaming}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-amber-600/40 p-2 text-amber-200 hover:bg-amber-600/70 disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Gửi câu hỏi"
          >
            <Send size={16} />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between text-[10px] text-stone-500 px-1">
          <span className="flex items-center gap-1">
            <HelpCircle size={11} /> Nhấn <kbd className="rounded bg-slate-800 px-1">Enter</kbd> để gửi, <kbd className="rounded bg-slate-800 px-1">Shift + Enter</kbd> để xuống dòng
          </span>
          <span>Toán học tất định & Không suy đoán bịa đặt</span>
        </div>
      </div>
    </div>
  );
};
