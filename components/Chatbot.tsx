
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, ChevronRight } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const location = useLocation();
  const isProfilePage = location.pathname.startsWith('/business/');
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I am Conflux, your AI assistant. How can I help you today? You can ask me about our services or how to contact us.",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Hardcoded logic for Conflux
    setTimeout(() => {
      const botResponse = getBotResponse(input.toLowerCase());
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 600);
  };

  const getBotResponse = (query: string): string => {
    if (query.includes('hi') || query.includes('hello') || query.includes('hey')) {
      return "Hello! I'm here to assist you with any questions regarding Conflux AI. What can I do for you?";
    }
    if (query.includes('service') || query.includes('what do you do') || query.includes('capability')) {
      return "We offer three core infrastructure suites: \n1. Omnichannel AI Agents (WhatsApp, Web, Social automation)\n2. Conversion-Optimized Web (High-speed, premium UX)\n3. Precision Ad Systems (Meta & Google ad scaling)\n\nWhich one would you like to know more about?";
    }
    if (query.includes('contact') || query.includes('email') || query.includes('reach') || query.includes('support')) {
      return "You can reach us at confluxdotai@gmail.com. We typically respond within 24 hours. Alternatively, you can follow us on our social media handles linked at the bottom of the page.";
    }
    if (query.includes('who are you') || query.includes('name')) {
      return "My name is Conflux. I am the hardcoded AI intelligence representing Conflux AI.";
    }
    return "I'm not sure I understand. I can help you with information about our AI services, web development capabilities, ad systems, or provide contact details. Feel free to ask!";
  };

  return (
    <div className={`fixed ${isProfilePage ? 'bottom-32 sm:bottom-32' : 'bottom-20'} right-3 sm:right-4 md:bottom-6 md:right-6 z-[40] font-inter`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-3 w-[calc(100vw-1.5rem)] sm:w-[360px] md:w-[400px] h-[65vh] max-h-[500px] bg-[#020c1b] border border-blue-600/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
            style={{ boxShadow: '0 20px 50px rgba(0, 0, 255, 0.15)' }}
          >
            {/* Header */}
            <div className="p-4 border-b border-blue-600/20 bg-blue-600/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-600/30">
                  <Bot className="text-blue-500" size={18} />
                </div>
                <div>
                  <h3 className="font-inter text-xs sm:text-sm font-black text-white tracking-widest uppercase">
                    Conflux <span className="text-blue-500">AI</span>
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-400 font-medium">Assistant Active</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                aria-label="Close Assistant"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-blue-600/20 scrollbar-track-transparent text-sm">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.sender === 'bot' ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-2xl text-xs sm:text-sm ${
                    msg.sender === 'user' 
                      ? 'bg-blue-700 text-white rounded-tr-none shadow-lg shadow-blue-900/20' 
                      : 'bg-white/10 border border-white/10 text-slate-200 rounded-tl-none'
                  }`}>
                    {msg.text.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < msg.text.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3.5 border-t border-blue-600/20 bg-[#020c1b]">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask a question..."
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 text-base text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all pr-11"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  aria-label="Send message"
                  className="absolute right-1.5 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open Conflux AI Chatbot"
        className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#020c1b] border-2 border-blue-600 shadow-2xl flex items-center justify-center text-blue-500 relative group overflow-hidden cursor-pointer"
        style={{ boxShadow: '0 0 24px rgba(0, 0, 255, 0.35)' }}
      >
        <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity" />
        {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
        
        {!isOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full border-2 border-[#020c1b] animate-bounce" />
        )}
      </motion.button>
    </div>
  );
};

export default Chatbot;
