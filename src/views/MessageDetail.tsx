import React, { useState, useEffect } from 'react';
import type { AnonymousMessage } from '../utils/storage';
import { deleteMessage, markMessageAsRead } from '../utils/storage';
import { AlertTriangle, Download, X, Trash2, ShieldCheck, Sparkles, CreditCard } from 'lucide-react';
import { Modal } from '../components/Modal';

interface MessageDetailProps {
  message: AnonymousMessage;
  onClose: () => void;
  onReply: (msg: AnonymousMessage) => void;
  onDelete: (id: string) => void;
}

export const MessageDetail: React.FC<MessageDetailProps> = ({
  message,
  onClose,
  onReply,
  onDelete
}) => {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isReported, setIsReported] = useState(false);
  
  // Mark as read immediately when viewed
  useEffect(() => {
    markMessageAsRead(message.id);
  }, [message.id]);

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      deleteMessage(message.id);
      onDelete(message.id);
    }
  };

  const handleReport = () => {
    setIsReported(true);
    setTimeout(() => {
      setIsReported(false);
      setShowReportModal(false);
      onClose();
    }, 2000);
  };

  return (
    <div 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#0A0D14',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 20px 40px 20px',
        zIndex: 100,
        overflow: 'hidden'
      }}
      className="animate-fade-in"
    >
      {/* Top action header */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 0'
        }}
      >
        <button 
          onClick={() => setShowReportModal(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#8E9BAE',
            cursor: 'pointer',
            padding: '8px'
          }}
        >
          <AlertTriangle size={24} />
        </button>

        {/* Center download story (shortcuts to reply card generator directly) */}
        <button 
          onClick={() => onReply(message)}
          style={{
            background: 'none',
            border: 'none',
            color: '#8E9BAE',
            cursor: 'pointer',
            padding: '8px'
          }}
        >
          <Download size={24} />
        </button>

        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#FFFFFF',
            cursor: 'pointer',
            padding: '8px'
          }}
        >
          <X size={26} />
        </button>
      </div>

      {/* Main card box in center */}
      <div 
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          padding: '20px 0'
        }}
      >
        <div 
          style={{
            background: 'var(--ngl-gradient)',
            width: '100%',
            maxWidth: '350px',
            aspectRatio: '1.2/1',
            borderRadius: '32px',
            padding: '28px 24px',
            boxShadow: '0 12px 35px rgba(255, 0, 122, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative'
          }}
          className="animate-scale-up"
        >
          {/* Subtle logo inside the card background */}
          <span 
            style={{
              position: 'absolute',
              top: '20px',
              fontSize: '0.95rem',
              fontWeight: 800,
              opacity: 0.8,
              letterSpacing: '0.5px'
            }}
          >
            ngl.link anonymous q&a
          </span>

          <div 
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '24px 20px',
              borderRadius: '24px',
              width: '100%',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
              marginTop: '10px'
            }}
          >
            <p 
              style={{
                color: '#000000',
                fontSize: '1.25rem',
                fontWeight: 700,
                lineHeight: '1.45',
                wordBreak: 'break-word'
              }}
            >
              {message.content}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom control buttons */}
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          width: '100%',
          maxWidth: '380px',
          margin: '0 auto'
        }}
      >
        {/* Who sent this? premium hook */}
        <button 
          onClick={() => setShowPremiumModal(true)}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '9999px',
            padding: '12px 24px',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
        >
          Who sent this? 🤔
        </button>

        {/* Reply button */}
        <button 
          onClick={() => onReply(message)}
          className="btn-black"
          style={{
            backgroundColor: '#FFFFFF',
            color: '#000000',
            fontSize: '1.1rem',
            padding: '16px'
          }}
        >
          Reply
        </button>

        {/* Delete button */}
        <button 
          onClick={handleDelete}
          style={{
            background: 'none',
            border: 'none',
            color: '#EF4444',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px'
          }}
        >
          <Trash2 size={16} /> Delete Message
        </button>
      </div>

      {/* PREMIUM PAYWALL MODAL */}
      <Modal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        title="Unlock Hints"
      >
        <div style={{ textAlign: 'center', color: '#FFFFFF' }}>
          <div 
            style={{ 
              background: 'var(--ngl-gradient)',
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 6px 15px rgba(255,0,122,0.3)'
            }}
          >
            <Sparkles size={32} color="#FFFFFF" />
          </div>
          
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>NGL Pro</h3>
          <p style={{ color: '#8E9BAE', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.4' }}>
            Get weekly hints about who sent you messages, including device model, location, and exact time!
          </p>

          {/* Premium Preview Box */}
          <div 
            style={{
              backgroundColor: '#1E2538',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '24px',
              textAlign: 'left',
              border: '1px dashed rgba(255,255,255,0.15)'
            }}
          >
            <h5 style={{ color: 'var(--ngl-pink)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '10px' }}>
              Locked hint for this message:
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', opacity: 0.65 }}>
              <p style={{ fontSize: '0.9rem' }}>📍 Location: <span style={{ filter: 'blur(4px)', userSelect: 'none' }}>{message.locationInfo || "California, USA"}</span></p>
              <p style={{ fontSize: '0.9rem' }}>📱 Device: <span style={{ filter: 'blur(4px)', userSelect: 'none' }}>{message.deviceInfo || "iPhone 15 Pro"}</span></p>
            </div>
          </div>

          {/* Buy Button */}
          <button 
            onClick={() => {
              alert("Payment completed! Pro features are simulated. You can now see the hint details below!");
              // Simulate premium unlock
              message.locationInfo = message.locationInfo || "New York, USA";
              message.deviceInfo = message.deviceInfo || "iPhone 15 Pro";
              setShowPremiumModal(false);
            }}
            className="btn-gradient"
            style={{
              gap: '10px',
              marginBottom: '12px'
            }}
          >
            <CreditCard size={18} /> Unlock Hints - $1.99/wk
          </button>
          
          <p style={{ fontSize: '0.75rem', color: '#5C6A7F' }}>
            Cancel anytime. Subscription auto-renews.
          </p>
        </div>
      </Modal>

      {/* REPORT MODAL */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Report Message"
      >
        <div style={{ color: '#FFFFFF' }}>
          {isReported ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }} className="animate-scale-up">
              <div 
                style={{ 
                  backgroundColor: '#10B981', 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto'
                }}
              >
                <ShieldCheck size={32} color="#FFFFFF" />
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>Report Submitted</h4>
              <p style={{ color: '#8E9BAE', fontSize: '0.85rem' }}>We have received your report and hidden this message.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ color: '#8E9BAE', fontSize: '0.9rem', lineHeight: '1.4' }}>
                If this message contains bullying, harassment, or hate speech, report it to our moderation team.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {["Harassment or Bullying", "Spam or Scam", "Hate Speech", "Sexually Explicit Content"].map((reason, idx) => (
                  <button
                    key={idx}
                    onClick={handleReport}
                    style={{
                      width: '100%',
                      padding: '14px',
                      backgroundColor: '#1E2538',
                      border: '1px solid #2B354F',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      textAlign: 'left',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: 'background-color 0.15s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#262F42')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1E2538')}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
