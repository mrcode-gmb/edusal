import { useState, useEffect, useRef, type FC, type FormEvent } from 'react';
import type { AICoachConversation, AICoachMessage, StudentProfile, Pathway } from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import { PageHead, Panel, Badge } from '../institution/Shared';
import { Button, TextField } from '@mui/material';
import {
  SmartToy as CoachIcon,
  Shield as ShieldCheckIcon,
  Description as FileTextIcon,
  Send as SendIcon,
  AccessTime as ClockIcon,
  Add as PlusIcon,
  ChatBubbleOutlined as ChatBubbleIcon,
  WorkspacePremium as PremiumIcon,
} from '@mui/icons-material';

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
    <div>
      <PageHead
        eyebrow="24/7 Grounded AI Coach"
        title="Personalized Institutional AI Career Coach"
        sub={`Personalized for ${studentProfile.user_name} · ${studentProfile.program_name} (${studentProfile.level_display})`}
        actions={
          <>
            <Badge color="var(--color-charcoal)" bg="rgba(31,41,51,0.08)">
              Active Pathway: {activePathway?.title || 'General STEM'}
            </Badge>
            <Badge color="#fff" bg="var(--color-primary)">
              <PremiumIcon sx={{ fontSize: 12, mr: 0.5 }} />
              Employability: {Number(studentProfile.employability_score || 0).toFixed(1)}%
            </Badge>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<PlusIcon />}
              onClick={handleNewConversation}
            >
              New Chat
            </Button>
          </>
        }
      />

      {error && (
        <div className="mb-4 rounded-[15px] bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <aside>
          <Panel className="flex h-full flex-col">
            <p className="flex items-center gap-2 text-base font-bold text-charcoal">
              <ChatBubbleIcon sx={{ fontSize: 18, color: 'primary.main' }} />
              Advisory History
            </p>

            <div className="mt-4 flex-1 space-y-2">
              {conversations.map((conv) => {
                const isActive = conv.id === activeConvId;
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full rounded-[15px] px-3.5 py-3 text-left transition-colors ${
                      isActive ? 'bg-primary-soft' : 'bg-bgsoft hover:bg-primary-faint'
                    }`}
                  >
                    <span
                      className={`block truncate text-sm font-bold ${
                        isActive ? 'text-primary' : 'text-charcoal'
                      }`}
                    >
                      {conv.title}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-charcoal-faint">
                      <ClockIcon sx={{ fontSize: 11 }} />
                      {new Date(conv.created_at).toLocaleDateString()}
                      <span className="ml-auto">
                        {conv.messages_count || 1} turns
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-[15px] bg-primary-faint p-3.5">
              <ShieldCheckIcon sx={{ fontSize: 16, color: 'primary.main', mt: 0.25 }} />
              <p className="text-xs text-charcoal-soft">
                Grounded strictly in institutional handbooks with zero web hallucination.
              </p>
            </div>
          </Panel>
        </aside>

        <Panel className="flex flex-col">
          <div className="h-[520px] space-y-4 overflow-y-auto pr-2">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      isUser ? 'bg-charcoal text-white' : 'bg-primary-soft text-primary'
                    }`}
                  >
                    {isUser ? (
                      <span className="text-xs font-extrabold">
                        {studentProfile.user_name?.charAt(0) || 'S'}
                      </span>
                    ) : (
                      <CoachIcon sx={{ fontSize: 18 }} />
                    )}
                  </span>

                  <div
                    className={`max-w-[78%] rounded-[15px] px-4 py-3 ${
                      isUser
                        ? 'rounded-br-md bg-primary text-white'
                        : 'rounded-bl-md bg-bgsoft text-charcoal'
                    }`}
                  >
                    <div
                      className={`mb-1 flex items-center gap-2 text-xs font-bold ${
                        isUser ? 'text-white/80' : 'text-charcoal-faint'
                      }`}
                    >
                      <span className="text-charcoal">
                        {isUser ? 'You (Student)' : 'EduSal Institutional AI Coach'}
                      </span>
                      <span>
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {msg.content.split('\n\n').map((para, idx) => (
                        <p key={idx} className={`text-sm leading-relaxed ${isUser ? 'text-white' : 'text-charcoal-soft'}`}>
                          {para}
                        </p>
                      ))}
                    </div>

                    {msg.citations && msg.citations.length > 0 && (
                      <div
                        className={`mt-3 rounded-[15px] p-3 ${
                          isUser ? 'bg-white/10' : 'bg-white'
                        }`}
                      >
                        <p
                          className={`mb-1.5 flex items-center gap-1.5 text-[11px] font-bold ${
                            isUser ? 'text-white/80' : 'text-charcoal-faint'
                          }`}
                        >
                          <FileTextIcon sx={{ fontSize: 12 }} />
                          Grounded Institutional Sources
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.citations.map((cite, idx) => (
                            <span
                              key={idx}
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                isUser ? 'bg-white/15 text-white/90' : 'bg-primary-soft text-primary'
                              }`}
                            >
                              <span className="font-extrabold">{cite.citation_label}</span>
                              {cite.document_title}
                              {cite.section_reference && (
                                <span className="opacity-70">· {cite.section_reference}</span>
                              )}
                              {cite.page_number && <span className="opacity-70">p.{cite.page_number}</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {msg.telemetry && (
                      <p
                        className={`mt-1.5 text-[10px] ${
                          isUser ? 'text-white/50' : 'text-charcoal-faint'
                        }`}
                      >
                        Model: {msg.telemetry.model} · Latency: {msg.telemetry.latency_ms}ms ·{' '}
                        {msg.telemetry.chunks_retrieved} sources
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {sending && (
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <CoachIcon sx={{ fontSize: 18 }} />
                </span>
                <div className="max-w-[78%] rounded-[15px] rounded-bl-md bg-bgsoft px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: '0.15s' }} />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: '0.3s' }} />
                    <span className="ml-2 text-xs font-semibold text-charcoal-faint">
                      Evaluating handbooks and synthesizing grounded advice...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="mt-4 border-t border-line pt-4">
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-xs font-bold text-charcoal-faint">Ask about:</span>
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(p)}
                  disabled={sending}
                  className="rounded-full bg-bgsoft px-3 py-1.5 text-xs font-semibold text-charcoal-soft transition-colors hover:bg-primary-soft hover:text-primary"
                >
                  {p}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
              <TextField
                fullWidth
                size="medium"
                placeholder="Ask about cover letters, SIWES logbooks, milestone evidence, or degree pathways..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={sending}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SendIcon />}
                disabled={!inputText.trim() || sending}
                sx={{ px: 3, whiteSpace: 'nowrap' }}
              >
                Send
              </Button>
            </form>
          </div>
        </Panel>
      </div>
    </div>
  );
};