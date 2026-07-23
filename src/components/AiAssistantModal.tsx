import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Copy, 
  Check, 
  ShieldAlert, 
  MessageSquare,
  FileText,
  Building2,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { Task } from '../types';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  tasks
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Xin chào Đồng chí! Tôi là **Trợ lý AI Công an xã Chiềng Sinh** (Gemini AI). Tôi có thể giúp Đồng chí tổng hợp tiến độ nhiệm vụ, phát hiện các điểm nghẽn/quá hạn, gợi ý kế hoạch công tác hoặc soạn thảo văn bản đôn đốc chỉ đạo. Đồng chí cần hỗ trợ gì hôm nay?',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  // Prepare context about current unit tasks
  const overdueCount = tasks.filter(t => t.status === 'overdue').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;

  const taskContext = {
    total: tasks.length,
    completed: completedCount,
    inProgress: inProgressCount,
    overdue: overdueCount,
    recentTasks: tasks.slice(0, 10).map(t => ({
      code: t.code,
      title: t.title,
      departmentName: t.departmentName,
      assigneeName: t.assigneeName,
      status: t.status,
      dueDate: t.dueDate
    }))
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.role,
          text: m.text
        }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: query,
          history: historyPayload,
          taskContext
        })
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: `bot-err-${Date.now()}`,
          role: 'assistant',
          text: `⚠️ Lỗi kết nối AI: ${data.error || 'Vui lòng kiểm tra lại cấu hình hệ thống.'}`,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch (e: any) {
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        role: 'assistant',
        text: '❌ Không thể gửi tin nhắn đến máy chủ Gemini AI.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    {
      icon: ShieldAlert,
      label: 'Tổng hợp các việc quá hạn màu đỏ',
      prompt: 'Hãy thống kê các công việc quá hạn nghiêm trọng nhất trong đơn vị và phân tích rủi ro.'
    },
    {
      icon: FileText,
      label: 'Soạn tin nhắn đôn đốc Cán bộ',
      prompt: 'Hãy soạn một mẫu tin nhắn đôn đốc chỉ đạo của Trưởng Công an xã gửi cho các Tổ trưởng yêu cầu đẩy nhanh tiến độ.'
    },
    {
      icon: Building2,
      label: 'Đánh giá hiệu quả từng Tổ công tác',
      prompt: 'Hãy đánh giá ngắn gọn tình hình thực hiện nhiệm vụ của các Tổ (Tổng hợp, An ninh, CSKV, PCTP, CSTT).'
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex justify-end transition-opacity">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col h-full shadow-2xl relative animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-amber-600 to-amber-700 p-0.5 shadow-lg shadow-red-900/40">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
                <span>TRỢ LÝ AI CHIỀNG SINH</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono font-semibold">
                  GEMINI 3.6
                </span>
              </h3>
              <p className="text-xs text-slate-400">Tư vấn tiến độ & Soạn thảo văn bản đôn đốc</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task quick stats bar */}
        <div className="bg-slate-950/40 px-4 py-2.5 border-b border-slate-800/80 flex items-center justify-between text-xs shrink-0 font-medium">
          <span className="text-slate-400">Dữ liệu nhiệm vụ hiện tại:</span>
          <div className="flex items-center space-x-3">
            <span className="text-slate-300">Tổng: <b>{tasks.length}</b></span>
            <span className="text-emerald-400">Xong: <b>{completedCount}</b></span>
            <span className="text-red-400 font-bold bg-red-950/60 border border-red-800/60 px-1.5 py-0.5 rounded">
              Quá hạn: {overdueCount}
            </span>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${
                msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gradient-to-br from-red-600 to-amber-600 text-amber-200 shadow-md'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed relative group ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-tl-none shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

                <div className="mt-2 pt-1 border-t border-slate-700/40 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{msg.timestamp}</span>
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="text-slate-400 hover:text-amber-300 transition-colors flex items-center space-x-1 cursor-pointer"
                      title="Sao chép câu trả lời"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-amber-600 text-amber-200 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-800 border border-slate-700/80 rounded-2xl rounded-tl-none p-3.5 text-xs text-amber-300 flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Trợ lý Gemini AI đang phân tích dữ liệu và soạn phản hồi...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Suggestion Bar */}
        {messages.length <= 3 && (
          <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/40 shrink-0">
            <p className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center space-x-1">
              <HelpCircle className="w-3 h-3 text-amber-400" />
              <span>Gợi ý câu hỏi nhanh cho AI:</span>
            </p>
            <div className="space-y-1.5">
              {quickPrompts.map((qp, idx) => {
                const IconComponent = qp.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSend(qp.prompt)}
                    className="w-full text-left p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/50 text-[11px] text-slate-300 hover:text-amber-200 transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    <IconComponent className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{qp.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập thắc mắc hoặc yêu cầu Trợ lý AI..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-sans"
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-amber-100 font-semibold text-xs shadow-md border border-amber-400/30 flex items-center space-x-1.5 transition-all disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
