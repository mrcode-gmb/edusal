import { useState, useEffect, useRef, type FC, type FormEvent } from 'react';
import type {
  AICoachConversation,
  AICoachMessage,
  StudentProfile,
  Pathway,
} from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import {
  SparklesIcon,
  ShieldCheckIcon,
  FileTextIcon,
  SendIcon,
  ClockIcon,
  PlusIcon,
  AlertCircleIcon,
} from '../icons';

interface AICareerCoachChatProps {
  studentProfile: StudentProfile;
  activePathway: Pathway | null;
  authToken?: string;
}

export const AICareerCoachChat: FC<AICareerCoachChatProps> = ({
  studentProfile,
  activePathway,
  authToken,
}) => {
  const [conversations, setConversations] = useState<AICoachConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AICoachMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'How do I submit my SIWES Form 08 and weekly logbook?',
    'Tailor my CV for Cloud & DevOps roles based on my verified milestones.',
    'What evidence is required for the 400L Microservices milestone?',
    'How does my Holland Code (IRC) align with my target career?',
  ];

  const fetchConversations = async () => {
    try {
      setError(null);
      const convList = await institutionApi.listAIConversations(studentProfile.id, authToken);
      setConversations(convList);

      if (convList.length > 0) {
        const firstId = convList[0].id;
        setActiveConvId(firstId);
        const msgs = await institutionApi.getAIMessages(firstId, authToken);
        setMessages(msgs);
      } else {
        // Create initial conversation automatically
        const newConv = await institutionApi.createAIConversation(
          'Career & SIWES Advisory Session',
          studentProfile.id,
          authToken
        );
        setConversations([newConv]);
        setActiveConvId(newConv.id);
        const msgs = await institutionApi.getAIMessages(newConv.id, authToken);
        setMessages(msgs);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load AI coach conversation');
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [studentProfile.id, authToken]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSelectConversation = async (convId: string) => {
    if (convId === activeConvId) return;
    setActiveConvId(convId);
    try {
      const msgs = await institutionApi.getAIMessages(convId, authToken);
      setMessages(msgs);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversation messages');
    }
  };

  const handleNewConversation = async () => {
    try {
      const newConv = await institutionApi.createAIConversation(
        `Advisory Session - ${new Date().toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}`,
        studentProfile.id,
        authToken
      );
      setConversations((prev) => [newConv, ...prev]);
      setActiveConvId(newConv.id);
      const msgs = await institutionApi.getAIMessages(newConv.id, authToken);
      setMessages(msgs);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create new conversation');
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !activeConvId || sending) return;

    const currentMsg = text.trim();
    setInputText('');
    setSending(true);
    setError(null);

    // Optimistically append student message
    const tempUserMsg: AICoachMessage = {
      id: `temp-${Date.now()}`,
      conversation: activeConvId,
      role: 'user',
      content: currentMsg,
      citations: [],
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const reply = await institutionApi.sendAIMessage(activeConvId, currentMsg, authToken);
      setMessages((prev) => [...prev.filter((m) => m.id !== tempUserMsg.id), tempUserMsg, reply]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to get answer from AI Coach');
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <div className="ai-coach-wrapper">
      {/* Top Identity & Grounding Banner */}
      <div className="coach-identity-strip">
        <div className="coach-identity-left">
          <div className="coach-spark-badge">
            <SparklesIcon size={18} color="#38bdf8" />
          </div>
          <div>
            <div className="coach-strip-tags">
              <span className="strip-tag-live">24/7 Grounded AI Coach</span>
              <span className="strip-tag-inst">{studentProfile.institution_name}</span>
            </div>
            <h3 className="coach-strip-title">
              Personalized for {studentProfile.user_name} · {studentProfile.program_name} ({studentProfile.level_display})
            </h3>
          </div>
        </div>

        <div className="coach-identity-right">
          <div className="coach-stat-pill">
            <span className="pill-label">Active Pathway:</span>
            <span className="pill-val">{activePathway?.title || 'General STEM'}</span>
          </div>
          <div className="coach-stat-pill score-pill">
            <span className="pill-label">Employability Score:</span>
            <span className="pill-val">{studentProfile.employability_score.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="coach-main-grid">
        {/* Left Conversation Threads Sidebar */}
        <aside className="coach-threads-sidebar">
          <div className="sidebar-header">
            <h4>Advisory History</h4>
            <button
              type="button"
              className="btn btn-secondary-sm btn-new-thread"
              onClick={handleNewConversation}
            >
              <PlusIcon size={14} /> New Chat
            </button>
          </div>

          <div className="threads-list">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`thread-item ${conv.id === activeConvId ? 'active' : ''}`}
                onClick={() => handleSelectConversation(conv.id)}
              >
                <div className="thread-title-row">
                  <span className="thread-title">{conv.title}</span>
                </div>
                <div className="thread-meta-row">
                  <span className="thread-date">
                    <ClockIcon size={11} /> {new Date(conv.created_at).toLocaleDateString()}
                  </span>
                  <span className="thread-msg-count">{conv.messages_count || 1} turns</span>
                </div>
              </div>
            ))}
          </div>

          <div className="sidebar-security-badge">
            <ShieldCheckIcon size={14} color="#0284c7" />
            <span>Grounded strictly in institutional handbooks with zero web hallucination.</span>
          </div>
        </aside>

        {/* Right Active Chat Workspace */}
        <div className="coach-chat-area">
          {error && (
            <div className="login-alert-error" style={{ margin: '14px 20px 0 20px' }}>
              <AlertCircleIcon size={15} color="#dc2626" />
              <span>{error}</span>
            </div>
          )}

          {/* Messages Scroll View */}
          <div className="coach-messages-scroll">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div key={msg.id} className={`chat-message-row ${isUser ? 'user-row' : 'assistant-row'}`}>
                  <div className="message-bubble-wrapper">
                    <div className="message-avatar">
                      {isUser ? (
                        <span className="user-initials">{studentProfile.user_name?.charAt(0) || 'S'}</span>
                      ) : (
                        <SparklesIcon size={16} color="#0284c7" />
                      )}
                    </div>

                    <div className={`message-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
                      <div className="bubble-sender-row">
                        <strong>{isUser ? 'You (Student)' : 'EduSal Institutional AI Coach'}</strong>
                        <span className="msg-timestamp">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="bubble-text">
                        {msg.content.split('\n\n').map((para, idx) => (
                          <p key={idx}>{para}</p>
                        ))}
                      </div>

                      {/* Grounded Document Citations */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="message-citations-block">
                          <div className="citations-header">
                            <FileTextIcon size={13} color="#0284c7" />
                            <span>Grounded Institutional Sources:</span>
                          </div>
                          <div className="citations-list">
                            {msg.citations.map((cite, idx) => (
                              <div key={idx} className="citation-chip">
                                <span className="cite-index">{cite.citation_label}</span>
                                <span className="cite-doc-title">{cite.document_title}</span>
                                {cite.section_reference && (
                                  <span className="cite-sec">· {cite.section_reference}</span>
                                )}
                                {cite.page_number && (
                                  <span className="cite-page">p.{cite.page_number}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Telemetry metadata */}
                      {msg.telemetry && (
                        <div className="message-telemetry-row">
                          <span>Model: {msg.telemetry.model}</span>
                          <span>· Latency: {msg.telemetry.latency_ms}ms</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {sending && (
              <div className="chat-message-row assistant-row">
                <div className="message-bubble-wrapper">
                  <div className="message-avatar">
                    <SparklesIcon size={16} color="#0284c7" />
                  </div>
                  <div className="message-bubble assistant-bubble typing-bubble">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span className="typing-text">Evaluating handbooks and synthesizing grounded advice...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips Strip */}
          <div className="coach-quick-prompts-strip">
            <span className="prompt-label">Ask about:</span>
            <div className="prompts-scroll-row">
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="quick-prompt-chip"
                  onClick={() => handleSendMessage(p)}
                  disabled={sending}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <div className="coach-input-container">
            <form onSubmit={handleSubmit} className="coach-input-form">
              <input
                type="text"
                className="coach-text-input"
                placeholder="Ask about cover letters, SIWES logbooks, milestone evidence, or degree pathways..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={sending}
              />
              <button
                type="submit"
                className="btn btn-primary btn-send-message"
                disabled={!inputText.trim() || sending}
              >
                <SendIcon size={16} /> Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
