import { useState } from 'react';
import type { UserProfile, AnonymousMessage } from '../utils/storage';
import { Avatar } from '../components/Avatar';
import { Settings, Link as LinkIcon, Share2, Check } from 'lucide-react';
import { Modal } from '../components/Modal';

interface DashboardProps {
  profile: UserProfile;
  messages: AnonymousMessage[];
  onOpenSettings: () => void;
  onOpenMessage: (msg: AnonymousMessage) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  messages,
  onOpenSettings,
  onOpenMessage
}) => {
  const [activeTab, setActiveTab] = useState<'play' | 'inbox'>('play');
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(false);

  const getPersonalLink = () => {
    // Generate full URL pointing to the user send page
    const base = window.location.origin + window.location.pathname;
    return `${base}#/user/${profile.username}`;
  };

  const handleCopyLink = () => {
    const link = getPersonalLink();
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#0B0F19',
        color: '#FFFFFF'
      }}
      className="animate-fade-in"
    >
      {/* Top Header Navigation */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px 12px 24px',
          borderBottom: '1px solid #1E2538'
        }}
      >
        <div style={{ display: 'flex', gap: '20px' }}>
          <button 
            onClick={() => setActiveTab('play')}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'play' ? '#FFFFFF' : '#5C6A7F',
              fontSize: '1.45rem',
              fontWeight: 800,
              cursor: 'pointer',
              textTransform: 'lowercase',
              padding: '4px 0',
              borderBottom: activeTab === 'play' ? '3px solid var(--ngl-pink)' : '3px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            play
          </button>
          
          <button 
            onClick={() => setActiveTab('inbox')}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'inbox' ? '#FFFFFF' : '#5C6A7F',
              fontSize: '1.45rem',
              fontWeight: 800,
              cursor: 'pointer',
              textTransform: 'lowercase',
              padding: '4px 0',
              borderBottom: activeTab === 'inbox' ? '3px solid var(--ngl-pink)' : '3px solid transparent',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            inbox
            {unreadCount > 0 && (
              <span 
                style={{
                  backgroundColor: 'var(--ngl-pink)',
                  color: '#FFFFFF',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '10px',
                  lineHeight: '1.3'
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <button 
          onClick={onOpenSettings}
          style={{
            background: '#161B2E',
            border: '1px solid #262F42',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#FFFFFF',
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
          }}
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Main Content Area */}
      <div 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '24px', 
          display: 'flex', 
          flexDirection: 'column' 
        }} 
        className="no-scrollbar"
      >
        {activeTab === 'play' ? (
          /* PLAY SCREEN */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }} className="animate-fade-in-up">
            
            {/* Story Card Preview Box */}
            <div 
              style={{
                background: 'var(--ngl-gradient)',
                borderRadius: '32px',
                padding: '30px 24px',
                aspectRatio: '1.1/1',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                boxShadow: '0 12px 30px rgba(255, 0, 122, 0.25)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Emojis floating design */}
              <div style={{ position: 'absolute', top: '15%', left: '10%', fontSize: '18px', opacity: 0.15 }}>💭</div>
              <div style={{ position: 'absolute', bottom: '20%', right: '8%', fontSize: '20px', opacity: 0.15 }}>🤫</div>
              <div style={{ position: 'absolute', top: '12%', right: '15%', fontSize: '16px', opacity: 0.15 }}>🦁</div>
              
              <div style={{ marginBottom: '16px' }}>
                <Avatar url={profile.avatarUrl} size={64} />
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                send me anonymous messages!
              </h2>
              <div 
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '20px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px'
                }}
              >
                🎲
              </div>
            </div>

            {/* Instruction Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Step 1 */}
              <div 
                style={{
                  backgroundColor: '#151A26',
                  borderRadius: '24px',
                  padding: '20px',
                  border: '1px solid #262F42',
                  textAlign: 'center'
                }}
              >
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                  Step 1: Copy your link
                </h3>
                <p style={{ color: '#5C6A7F', fontSize: '0.85rem', marginBottom: '16px', wordBreak: 'break-all' }}>
                  ngl.link/{profile.username}
                </p>
                <button 
                  onClick={handleCopyLink}
                  className="btn-outline-red"
                  style={{
                    backgroundColor: copied ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    borderColor: copied ? '#10B981' : 'var(--ngl-pink)',
                    color: copied ? '#10B981' : 'var(--ngl-pink)',
                    width: 'auto',
                    minWidth: '150px'
                  }}
                >
                  {copied ? (
                    <>
                      <Check size={18} /> copied link
                    </>
                  ) : (
                    <>
                      <LinkIcon size={18} /> copy link
                    </>
                  )}
                </button>
              </div>

              {/* Step 2 */}
              <div 
                style={{
                  backgroundColor: '#151A26',
                  borderRadius: '24px',
                  padding: '20px',
                  border: '1px solid #262F42',
                  textAlign: 'center'
                }}
              >
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                  Step 2: Share link on your story
                </h3>
                <button 
                  onClick={() => setShowShareModal(true)}
                  className="btn-gradient"
                  style={{
                    padding: '14px 28px',
                    fontSize: '1rem',
                    gap: '8px'
                  }}
                >
                  Share! <Share2 size={18} />
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* INBOX SCREEN */
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '20px' }} className="animate-fade-in-up">
            
            {/* Notification Switch Panel */}
            <div 
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                padding: '16px 20px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div 
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.1)', 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}
                >
                  🔔
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>Turn on Notifications</h4>
                  <p style={{ fontSize: '0.8rem', color: '#8E9BAE' }}>Get notified on new messages</p>
                </div>
              </div>
              <button 
                onClick={() => setNotificationsOn(!notificationsOn)}
                style={{
                  width: '50px',
                  height: '28px',
                  borderRadius: '15px',
                  backgroundColor: notificationsOn ? '#10B981' : '#334155',
                  border: 'none',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  padding: '2px'
                }}
              >
                <div 
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    position: 'absolute',
                    top: '2px',
                    left: notificationsOn ? '24px' : '2px',
                    transition: 'left 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                />
              </button>
            </div>

            {/* Inbox Title Header */}
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--ngl-pink)' }}>
                Your inbox is {messages.length > 0 ? 'active' : 'empty'}
              </h3>
            </div>

            {messages.length === 0 ? (
              /* EMPTY STATE */
              <div 
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '40px 20px',
                  gap: '16px'
                }}
              >
                <div style={{ fontSize: '4rem', opacity: 0.8 }}>📥</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No messages yet!</h3>
                <p style={{ color: '#5C6A7F', fontSize: '0.9rem', maxWidth: '280px', lineHeight: '1.4' }}>
                  Share your link on Instagram to get anonymous questions in your inbox!
                </p>
                <button 
                  onClick={() => setActiveTab('play')}
                  className="btn-gradient"
                  style={{ width: 'auto', padding: '14px 28px', fontSize: '0.95rem' }}
                >
                  Share Link!
                </button>
              </div>
            ) : (
              /* GRID LIST OF MESSAGES */
              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  paddingBottom: '20px'
                }}
              >
                {messages.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => onOpenMessage(msg)}
                    style={{
                      aspectRatio: '1 / 1',
                      borderRadius: '24px',
                      border: 'none',
                      background: msg.isRead 
                        ? '#151A26' 
                        : 'linear-gradient(135deg, #FF007A 0%, #FF5E00 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      cursor: 'pointer',
                      boxShadow: msg.isRead 
                        ? 'none' 
                        : '0 6px 15px rgba(255, 0, 122, 0.25)',
                      transform: 'scale(1)',
                      transition: 'transform 0.1s ease',
                      outline: 'none',
                      color: '#FFFFFF'
                    }}
                    onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
                    onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    {!msg.isRead && (
                      <div 
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: '#FFFFFF',
                          boxShadow: '0 0 10px rgba(255,255,255,0.8)'
                        }}
                      />
                    )}
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                      {msg.replyText ? '💬' : '💌'}
                    </div>
                    <span 
                      style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        opacity: msg.isRead ? 0.6 : 0.9,
                        letterSpacing: '0.5px'
                      }}
                    >
                      {msg.replyText ? 'replied' : 'open'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SHARE MODAL (Instagram story tutorial) */}
      <Modal 
        isOpen={showShareModal} 
        onClose={() => setShowShareModal(false)}
        title="How to Share on Story"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: '#FFFFFF' }}>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div 
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--ngl-pink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                flexShrink: 0
              }}
            >
              1
            </div>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>Copy Your Personal Link</h4>
              <p style={{ color: '#8E9BAE', fontSize: '0.85rem', lineHeight: '1.4' }}>
                We'll automatically copy it to your clipboard.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div 
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--ngl-pink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                flexShrink: 0
              }}
            >
              2
            </div>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>Open Instagram Story</h4>
              <p style={{ color: '#8E9BAE', fontSize: '0.85rem', lineHeight: '1.4' }}>
                Take a photo or choose a screenshot of your inbox box.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div 
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--ngl-pink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                flexShrink: 0
              }}
            >
              3
            </div>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>Add Link Sticker</h4>
              <p style={{ color: '#8E9BAE', fontSize: '0.85rem', lineHeight: '1.4' }}>
                Tap the sticker icon, select "LINK", and paste your personal NGL link.
              </p>
            </div>
          </div>

          <button 
            onClick={() => {
              handleCopyLink();
              setShowShareModal(false);
              // Open Instagram if on mobile
              window.open('https://instagram.com', '_blank');
            }}
            className="btn-gradient"
            style={{ marginTop: '10px' }}
          >
            Copy & Open Instagram
          </button>
        </div>
      </Modal>
    </div>
  );
};
