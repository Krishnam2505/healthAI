import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

export default function Chat() {
  // 1. Initial State
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your AI nutritionist 🥗 Ask me anything about food, macros, or nutrition!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // We grab the user's data so the AI can give personalized answers without asking
  const [userContext, setUserContext] = useState(null);

  // A React Ref to auto-scroll the chat to the bottom when new messages appear
  const messagesEndRef = useRef(null);

  // Auto-scroll effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Fetch the user's context silently in the background when they open the chat
  useEffect(() => {
    const fetchContext = async () => {
      try {
        const response = await api.get('/dashboard');
        const data = response.data;
        // We only save what the AI actually needs to know
        setUserContext({
          goal: data.user?.goal || 'maintain',
          dailyCalorieTarget: data.user?.dailyCalorieTarget || 2000,
          todayCalories: data.today?.totalCalories || 0
        });
      } catch (err) {
        console.error("Failed to fetch context for chat", err);
      }
    };
    fetchContext();
  }, []);

  // 2. Core Chat Logic
  const handleSend = async (text = input) => {
    if (!text.trim() || loading) return;

    // Immediately add the user's message to the screen so it feels fast
    const userMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    
    // Clear the input box and show the typing indicator
    setInput('');
    setLoading(true);

    try {
      // Gemini expects 'model' and 'user', not 'assistant' and 'user'
      // We map over our UI array and convert it to the strict Gemini JSON format.
      // IMPORTANT: We slice(1) to remove the hardcoded first greeting! 
      // Gemini throws an error if the history array starts with a 'model' role.
      const geminiMessages = newMessages.slice(1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      // Send the entire conversation history PLUS the user's context to our Node.js backend
      const response = await api.post('/ai/chat', {
        messages: geminiMessages,
        userContext
      });

      // Add Gemini's response to the screen
      setMessages([...newMessages, { role: 'assistant', content: response.data.reply }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: "Sorry, I'm having trouble connecting to Google's servers right now. Please try again later." }]);
    } finally {
      // Hide the typing indicator
      setLoading(false);
    }
  };

  // Allow sending by hitting the Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick Prompt Chips to help users figure out what to ask
  const quickPrompts = [
    "What should I eat post-workout?",
    "Is my protein intake enough?",
    "Suggest a high-protein snack under 200 kcal",
    "How much water should I drink today?",
    "What foods are high in protein?"
  ];

  return (
    <div className="chat-page">
      <div className="chat-container card">
        
        {/* HEADER */}
        <div className="chat-header">
          <h1>🥗 AI Nutritionist</h1>
          <p>Powered by Gemini AI</p>
        </div>

        {/* MESSAGE AREA */}
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-wrapper ${msg.role}`}>
              <div className="message-bubble">
                {msg.content}
              </div>
            </div>
          ))}
          
          {/* TYPING INDICATOR */}
          {loading && (
            <div className="message-wrapper assistant">
              <div className="message-bubble loading-bubble">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          )}
          {/* This empty div is the anchor we scroll down to! */}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA */}
        <div className="chat-input-area">
          
          {/* Scrollable Row of Prompt Chips */}
          <div className="quick-prompts">
            {quickPrompts.map((prompt, idx) => (
              <button 
                key={idx} 
                className="chip-btn"
                onClick={() => handleSend(prompt)}
                disabled={loading}
              >
                {prompt}
              </button>
            ))}
          </div>
          
          {/* Text Input Box */}
          <div className="input-box">
            <input 
              type="text" 
              placeholder="Ask me anything..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button 
              className="send-btn" 
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
            >
              ➤
            </button>
          </div>
        
        </div>
      </div>
      
      <style>{styles}</style>
    </div>
  );
}

// ------------------------------------------------------------------
// COMPONENT STYLES
// ------------------------------------------------------------------
const styles = `
  .chat-page {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem 1rem;
    height: calc(100vh - 64px); /* Full screen minus navbar */
  }

  .chat-container {
    width: 100%;
    max-width: 800px;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden; /* Keeps everything inside the card */
    padding: 0; /* Remove default card padding so header hits edges */
  }

  /* HEADER */
  .chat-header {
    background: var(--bg-primary); /* Slightly different color to separate from messages */
    padding: 1.5rem;
    border-bottom: 1px solid var(--border);
    text-align: center;
  }

  .chat-header h1 {
    font-size: 1.5rem;
    color: var(--text-primary);
    font-weight: 800;
  }

  .chat-header p {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-top: 0.25rem;
  }

  /* MESSAGES */
  .chat-messages {
    flex-grow: 1; /* Pushes the input area to the bottom */
    padding: 1.5rem;
    overflow-y: auto; /* Adds a scrollbar ONLY to this middle section */
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .message-wrapper {
    display: flex;
    width: 100%;
  }

  .message-wrapper.user {
    justify-content: flex-end; /* Push user messages to the right */
  }

  .message-wrapper.assistant {
    justify-content: flex-start; /* Push AI messages to the left */
  }

  .message-bubble {
    max-width: 75%; /* Prevents text from stretching all the way across */
    padding: 1rem 1.25rem;
    border-radius: 18px;
    font-size: 1rem;
    line-height: 1.5;
  }

  /* User Bubble Styling */
  .user .message-bubble {
    background: var(--accent-green);
    color: #022c22; /* Very dark green text for readability */
    font-weight: 500;
    /* Flattens the bottom right corner like iMessage */
    border-bottom-right-radius: 4px; 
  }

  /* AI Bubble Styling */
  .assistant .message-bubble {
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border);
    /* Flattens the bottom left corner */
    border-bottom-left-radius: 4px; 
  }

  /* TYPING INDICATOR ANIMATION */
  .loading-bubble {
    display: flex;
    gap: 0.25rem;
    align-items: center;
    padding: 1rem 1.5rem;
  }

  .typing-dot {
    width: 8px;
    height: 8px;
    background: var(--text-secondary);
    border-radius: 50%;
    animation: bounce-dot 1.4s infinite ease-in-out both;
  }

  .typing-dot:nth-child(1) { animation-delay: -0.32s; }
  .typing-dot:nth-child(2) { animation-delay: -0.16s; }

  @keyframes bounce-dot {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }

  /* INPUT AREA */
  .chat-input-area {
    padding: 1rem 1.5rem 1.5rem 1.5rem;
    border-top: 1px solid var(--border);
    background: var(--bg-card);
  }

  /* Horizontal Scrollable Row for Chips */
  .quick-prompts {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 1rem;
    /* Hide scrollbar for a cleaner look */
    scrollbar-width: none; 
  }
  .quick-prompts::-webkit-scrollbar {
    display: none;
  }

  .chip-btn {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    color: var(--text-secondary);
    padding: 0.5rem 1rem;
    border-radius: 100px; /* Makes it a pill shape */
    font-size: 0.85rem;
    white-space: nowrap; /* Prevents text from wrapping */
    cursor: pointer;
    transition: all 0.2s;
  }

  .chip-btn:hover {
    background: var(--border);
    color: var(--text-primary);
  }

  /* Text Box & Send Button */
  .input-box {
    display: flex;
    gap: 0.5rem;
  }

  .input-box input {
    flex-grow: 1; /* Takes up all available space */
    background: var(--bg-primary);
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: 1rem 1.5rem;
    border-radius: 100px; /* Pill shape */
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  .input-box input:focus {
    outline: none;
    border-color: var(--accent-green);
  }

  .send-btn {
    background: var(--accent-green);
    color: #022c22;
    border: none;
    border-radius: 50%; /* Perfect circle */
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: transform 0.2s;
  }

  .send-btn:hover:not(:disabled) {
    transform: scale(1.05);
  }

  .send-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Mobile Adjustments */
  @media (max-width: 600px) {
    .chat-page {
      padding: 0; /* Remove outside padding so card hits edge of phone screen */
    }
    .chat-container {
      border-radius: 0;
      border: none;
    }
  }
`;
