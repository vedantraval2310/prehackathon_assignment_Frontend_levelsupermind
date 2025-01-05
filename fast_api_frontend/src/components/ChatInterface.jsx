import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const API_URL = 'http://127.0.0.1:8000/chat';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setMessages(prev => [...prev, { text: userMessage, sender: 'user', timestamp: new Date() }]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_message: userMessage,
          tweaks: {},
          output_type: "chat",
          input_type: "chat"
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { 
        text: data.response_message, 
        sender: 'assistant',
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        text: 'Sorry, something went wrong. Please try again.', 
        sender: 'assistant',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm py-4 px-6 flex items-center gap-3">
        <Bot className="text-blue-500 w-6 h-6" />
        <h1 className="text-xl font-semibold text-gray-800">AI Assistant</h1>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg">Welcome! How can I help you today?</p>
            <p className="text-sm mt-2">Send a message to start the conversation.</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender === 'assistant' && (
              <div className="flex-shrink-0">
                <Bot className="w-8 h-8 text-blue-500" />
              </div>
            )}
            
            <div className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800'
                }`}
              >
                {message.text}
              </div>
              <span className="text-xs text-gray-500 mt-1">
                {formatTime(message.timestamp)}
              </span>
            </div>

            {message.sender === 'user' && (
              <div className="flex-shrink-0">
                <User className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3">
            <Bot className="w-8 h-8 text-blue-500" />
            <div className="bg-white text-gray-800 rounded-2xl px-4 py-2 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="bg-white border-t p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-3 border border-gray-200 rounded-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-gray-50"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;