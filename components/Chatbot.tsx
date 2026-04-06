
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, ChevronRight } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

const Chatbot: React.FC = () => {
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
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[1000] font-inter">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-[#020c1b] border border-blue-600/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
            style={{ boxShadow: '0 20px 50px rgba(0, 0, 255, 0.15)' }}
          >
            {/* Header */}
            <div className="p-4 border-b border-blue-600/20 bg-blue-600/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-600/30">
                  <Bot className="text-blue-600" size={20} />
                </div>
                <div>
                  <h3 className="font-inter text-sm font-black text-white tracking-widest uppercase">
                    Conflux <span className="text-blue-500">AI</span>
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                    <span className="text-[10px] text-blue-600/70 font-medium">Online & Active</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-blue-600/20 scrollbar-track-transparent">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.sender === 'bot' ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.sender === 'user' 
                      ? 'bg-blue-700 text-white rounded-tr-none shadow-lg shadow-blue-900/20' 
                      : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
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
            <div className="p-4 border-t border-blue-600/20 bg-[#020c1b]">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-600/50 transition-all pr-12"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="absolute right-2 p-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <Send size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
              <p className="mt-2 text-[11px] text-center text-slate-400 uppercase tracking-widest font-inter font-bold opacity-70">
                Helping You Grow with AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#020c1b] border-2 border-blue-600 shadow-2xl flex items-center justify-center text-blue-600 relative group overflow-hidden"
        style={{ boxShadow: '0 0 30px rgba(0, 0, 255, 0.3)' }}
      >
        <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity" />
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
        
        {!isOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full border-2 border-[#020c1b] animate-bounce" />
        )}
      </motion.button>
    </div>
  );
};

export default Chatbot;
