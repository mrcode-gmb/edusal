import { useState, type FC } from 'react';
import {
  SparklesIcon,
  FileTextIcon,
  SearchIcon,
  UsersIcon,
} from './icons';

export const AiAssistantDemo: FC = () => {
  const [activeCitation, setActiveCitation] = useState<boolean>(true);
  const [interactiveStep, setInteractiveStep] = useState<number>(2); // showing full conversation

  return (
    <section id="ai-demo" className="ai-demo-section">
      <div className="container-custom">
        <div className="section-header-centered">
          <span className="section-eyebrow">Zero-Hallucination Career Intelligence</span>
          <h2 className="section-title">An assistant that shows its work</h2>
          <p className="section-lead">
            Trained strictly on your institution's official handbooks, SIWES calendars, and verified employer briefs. Every claim includes its source, and complex judgment is immediately handed off to human counsellors.
          </p>
        </div>

        {/* AI Demo Chat Container */}
        <div className="ai-chat-wrapper">
          {/* Chat Window Frame */}
          <div className="ai-chat-window">
            {/* Header */}
            <div className="ai-chat-header">
              <div className="ai-brand-group">
                <div className="ai-avatar">ES</div>
                <div>
                  <div className="ai-name-row">
                    <span className="ai-title">Nexus Edutech Assistant</span>
                    <span className="ai-grounded-pill">Institution-grounded</span>
                  </div>
                  <span className="ai-student-sub">
                    Chidinma Okafor · 300L Software Engineering · FUTMinna
                  </span>
                </div>
              </div>

              <div className="ai-header-actions">
                <button
                  type="button"
                  className={`citation-toggle-btn ${activeCitation ? 'active' : ''}`}
                  onClick={() => setActiveCitation(!activeCitation)}
                >
                  <SparklesIcon size={14} />
                  <span>{activeCitation ? 'Citations Visible' : 'Hide Citations'}</span>
                </button>
              </div>
            </div>

            {/* Conversation Flow */}
            <div className="ai-chat-messages">
              {/* Message 1: AI Grounded Guidance */}
              <div className="chat-msg ai-msg">
                <div className="msg-avatar-col">
                  <div className="msg-avatar-ai">ES</div>
                </div>
                <div className="msg-body">
                  <p className="msg-text">
                    You've completed 2 of 3 milestones for the <strong>Backend Developer pathway</strong>. Your SIWES window opens in July. Based on your validated skills, two employers are a strong match: <strong>Interswitch (Lagos)</strong> and <strong>Paystack (Lagos)</strong>. Want a shortlist with stipend details?
                  </p>

                  {activeCitation && (
                    <div className="msg-grounding-box">
                      <div className="grounding-header">
                        <FileTextIcon size={14} />
                        <span>Grounded on:</span>
                      </div>
                      <div className="grounding-tags">
                        <span className="gtag">FUTM_SE_Pathway_Template_v2.pdf</span>
                        <span className="gtag">Skills Validation Record #3891</span>
                        <span className="gtag">SIWES_2026_National_Calendar.pdf</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Message 2: Student Query */}
              <div className="chat-msg student-msg">
                <div className="msg-body">
                  <p className="msg-text">
                    Yes — and can I still apply if I haven't finished the database module yet?
                  </p>
                  <span className="msg-timestamp">Today at 10:42 AM</span>
                </div>
                <div className="msg-avatar-col">
                  <div className="msg-avatar-student">CO</div>
                </div>
              </div>

              {/* Message 3: AI Grounded Reasoning & Human Escalation */}
              {interactiveStep >= 2 && (
                <div className="chat-msg ai-msg highlight-response">
                  <div className="msg-avatar-col">
                    <div className="msg-avatar-ai">ES</div>
                  </div>
                  <div className="msg-body">
                    <p className="msg-text">
                      <strong>Interswitch's</strong> listing requires the database module as a prerequisite; <strong>Paystack's</strong> does not. I'd suggest completing the module first if you're set on Interswitch — you're <strong>80% through it</strong>. I'm flagging this thread for <strong>Mr. Adeyemi</strong>, your counsellor, in case you want to talk through timing.
                    </p>

                    {activeCitation && (
                      <div className="msg-grounding-box citation-rule">
                        <div className="grounding-header">
                          <SearchIcon size={14} />
                          <span>Document Citation & Policy Match:</span>
                        </div>
                        <p className="citation-quote">
                          "Interswitch Backend Intern: Minimum requirement 85% completion in Relational Databases (PostgreSQL) prior to final placement interview."
                        </p>
                      </div>
                    )}

                    {/* Human Handoff Ticket */}
                    <div className="handoff-alert-banner">
                      <div className="handoff-icon">
                        <UsersIcon size={16} />
                      </div>
                      <div className="handoff-info">
                        <strong>Next Step: Handed off to your counsellor</strong>
                        <p>Mr. Adeyemi has been notified with the full conversation history, student milestone records, and draft waiver guidance.</p>
                      </div>
                      <span className="handoff-badge">Ticket #CS-2041 Queued</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AI Interactive Prompt Suggestion Row */}
            <div className="ai-chat-footer">
              <div className="suggested-prompts-row">
                <span className="suggested-label">Try asking:</span>
                <button
                  type="button"
                  className="prompt-chip"
                  onClick={() => setInteractiveStep(2)}
                >
                  "Show Paystack internship stipend details"
                </button>
                <button
                  type="button"
                  className="prompt-chip"
                  onClick={() => setInteractiveStep(2)}
                >
                  "Book an office hour slot with Mr. Adeyemi"
                </button>
                <button
                  type="button"
                  className="prompt-chip"
                  onClick={() => setInteractiveStep(2)}
                >
                  "Download my verified skills transcript (PDF)"
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
