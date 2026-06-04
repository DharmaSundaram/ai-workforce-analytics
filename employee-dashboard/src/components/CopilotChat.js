import React, { useState, useRef, useEffect } from 'react';
import { Button, Input } from 'antd';
import { RobotOutlined, SendOutlined, CloseOutlined } from '@ant-design/icons';

const BACKEND_URL = 'http://127.0.0.1:5000';

const EXAMPLE_CHIPS = [
  'Team summary',
  'High burnout employees',
  'Top performers',
  'Overtime report',
  'Department analysis',
];

const CopilotChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleOpen = () => {
    setOpen(true);
    if (!hasOpened) {
      setHasOpened(true);
      setMessages([
        {
          role: 'bot',
          content:
            '🤖 Hi! I can help you analyze your workforce. Try asking about team performance, burnout risks, or department insights!',
        },
      ]);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/copilot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed }),
      });
      const data = await res.json();
      const botMsg = {
        role: 'bot',
        content: data.success
          ? data.answer
          : '❌ Sorry, something went wrong. Please try again.',
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: '❌ Unable to reach the server. Please check your connection.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    sendMessage(input);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChipClick = (chip) => {
    sendMessage(chip);
  };

  // -- Inline styles --

  const pulseKeyframes = `
    @keyframes copilotPulse {
      0% { box-shadow: 0 0 0 0 rgba(139,92,246,0.5); }
      70% { box-shadow: 0 0 0 14px rgba(139,92,246,0); }
      100% { box-shadow: 0 0 0 0 rgba(139,92,246,0); }
    }
    @keyframes typingBounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
  `;

  const fabStyle = {
    position: 'fixed',
    bottom: 24,
    right: 24,
    zIndex: 1000,
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    border: 'none',
    color: '#fff',
    fontSize: 26,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    animation: 'copilotPulse 2s infinite',
    boxShadow: '0 4px 20px rgba(139,92,246,0.4)',
    transition: 'transform 0.2s',
  };

  const panelStyle = {
    position: 'fixed',
    bottom: 24,
    right: 24,
    width: 400,
    height: 500,
    zIndex: 1000,
    borderRadius: 16,
    background: 'rgba(15,23,42,0.98)',
    border: '1px solid rgba(139,92,246,0.3)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 18px',
    background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(124,58,237,0.15))',
    borderBottom: '1px solid rgba(139,92,246,0.2)',
  };

  const headerTitleStyle = {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const messagesAreaStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  };

  const inputAreaStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 14px',
    borderTop: '1px solid rgba(139,92,246,0.15)',
    background: 'rgba(15,23,42,0.6)',
  };

  const userMsgStyle = {
    alignSelf: 'flex-end',
    background: 'rgba(139,92,246,0.35)',
    color: '#e2e8f0',
    padding: '10px 14px',
    borderRadius: '14px 14px 4px 14px',
    maxWidth: '80%',
    fontSize: 13,
    lineHeight: 1.5,
    wordBreak: 'break-word',
  };

  const botMsgStyle = {
    alignSelf: 'flex-start',
    background: 'rgba(30,41,59,0.8)',
    color: '#e2e8f0',
    padding: '10px 14px',
    borderRadius: '14px 14px 14px 4px',
    maxWidth: '85%',
    fontSize: 13,
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  };

  const chipContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  };

  const chipStyle = {
    background: 'rgba(139,92,246,0.15)',
    border: '1px solid rgba(139,92,246,0.3)',
    borderRadius: 20,
    padding: '4px 12px',
    color: '#c4b5fd',
    fontSize: 12,
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const typingStyle = {
    alignSelf: 'flex-start',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '10px 14px',
    background: 'rgba(30,41,59,0.8)',
    borderRadius: '14px 14px 14px 4px',
  };

  const dotStyle = (delay) => ({
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#8b5cf6',
    animation: `typingBounce 1.4s infinite ease-in-out both`,
    animationDelay: delay,
  });

  return (
    <>
      <style>{pulseKeyframes}</style>

      {!open && (
        <div style={fabStyle} onClick={handleOpen} title="AI Workforce Copilot">
          <RobotOutlined />
        </div>
      )}

      {open && (
        <div style={panelStyle}>
          {/* Header */}
          <div style={headerStyle}>
            <span style={headerTitleStyle}>
              <RobotOutlined style={{ fontSize: 18, color: '#8b5cf6' }} />
              AI Workforce Copilot
            </span>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={handleClose}
              style={{ color: '#94a3b8', fontSize: 14 }}
              size="small"
            />
          </div>

          {/* Messages */}
          <div style={messagesAreaStyle}>
            {messages.map((msg, idx) => (
              <div key={idx} style={msg.role === 'user' ? userMsgStyle : botMsgStyle}>
                {msg.content}
                {/* Show chips after the first bot (welcome) message */}
                {msg.role === 'bot' && idx === 0 && (
                  <div style={chipContainerStyle}>
                    {EXAMPLE_CHIPS.map((chip) => (
                      <span
                        key={chip}
                        style={chipStyle}
                        onClick={() => handleChipClick(chip)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(139,92,246,0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(139,92,246,0.15)';
                        }}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={typingStyle}>
                <div style={dotStyle('0s')} />
                <div style={dotStyle('0.2s')} />
                <div style={dotStyle('0.4s')} />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={inputAreaStyle}>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your workforce..."
              disabled={loading}
              style={{
                flex: 1,
                background: 'rgba(30,41,59,0.6)',
                border: '1px solid rgba(139,92,246,0.2)',
                borderRadius: 8,
                color: '#e2e8f0',
                fontSize: 13,
              }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              disabled={!input.trim() || loading}
              style={{
                background: '#8b5cf6',
                borderColor: '#8b5cf6',
                borderRadius: 8,
                height: 36,
                width: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default CopilotChat;
