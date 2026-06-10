import React, { useState, useEffect } from 'react';
import { Avatar } from '../components/Avatar';
import { ArrowLeft, Lock } from 'lucide-react';
import type { UserProfile } from '../utils/storage';
import { addMessage, getRandomDicePrompt, getProfile } from '../utils/storage';
import { sanitizeText } from '../utils/profanity';

interface PublicSendPageProps {
  username: string;
  onGetYourOwn: () => void;
}

export const PublicSendPage: React.FC<PublicSendPageProps> = ({
  username,
  onGetYourOwn
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [socialCount, setSocialCount] = useState(140);
  const [shake, setShake] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      const stored = await getProfile();
      if (stored && stored.username.toLowerCase() === username.toLowerCase()) {
        setProfile(stored);
      } else {
        // Look up targeted user profile in Firestore
        const cloudUser = await getProfile(username);
        if (cloudUser) {
          setProfile(cloudUser);
        } else {
          // Fallback mockup
          setProfile({
            username: username,
            displayName: username.charAt(0).toUpperCase() + username.slice(1),
            bio: "send me anonymous messages!",
            avatarUrl: 'koala',
            theme: 'ngl-default',
            moderationEnabled: true,
            blockedWords: [],
            premiumActive: false
          });
        }
      }
    };

    loadProfile();

    // Social proof counter simulation
    setSocialCount(Math.floor(Math.random() * 150) + 100);
  }, [username]);

  const handleRollDice = () => {
    setMessageText(getRandomDicePrompt());
    // Trigger little bounce animation
    setShake(true);
    setTimeout(() => setShake(false), 300);
  };

  const handleSend = async () => {
    if (!profile) return;
    if (!messageText.trim()) {
      setErrorMsg('Write something before sending!');
      return;
    }
    
    setIsSending(true);
    setErrorMsg('');
    
    try {
      let finalContent = messageText.trim();
      
      if (profile?.moderationEnabled) {
        // Run profanity filter
        finalContent = sanitizeText(finalContent, profile.blockedWords);
      }
      
      // Save message in database (Firestore or local fallback)
      await addMessage(finalContent, profile.username);
      
      setIsSending(false);
      setIsSent(true);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to send message. Please try again.');
      setIsSending(false);
    }
  };

  const resetPage = () => {
    setMessageText('');
    setIsSent(false);
    setSocialCount(Math.floor(Math.random() * 150) + 100);
  };

  if (!profile) {
    return (
      <div 
        style={{
          background: 'var(--ngl-gradient-radial)',
          minHeight: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#FFFFFF'
        }}
      >
        <p style={{ fontWeight: 600 }}>Loading inbox details...</p>
      </div>
    );
  }

  if (isSent) {
    /* SUCCESS PAGE (Screen 4 from reference) */
    return (
      <div 
        style={{
          background: 'var(--ngl-gradient-radial)',
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '40px 24px',
          color: '#FFFFFF',
          position: 'relative'
        }}
        className="animate-fade-in"
      >
        {/* Back Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button 
            onClick={resetPage}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)'
            }}
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        {/* Sent Icon & Banner */}
        <div style={{ textAlign: 'center', margin: '0 auto', maxWidth: '340px' }} className="animate-scale-up">
          <div 
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
            }}
          >
            <svg 
              viewBox="0 0 50 50" 
              style={{
                width: '60px',
                height: '60px',
                fill: 'none',
                stroke: 'var(--ngl-pink)',
                strokeWidth: 5,
                strokeLinecap: 'round',
                strokeLinejoin: 'round'
              }}
            >
              <polyline 
                points="12 25 21 34 38 16" 
                style={{
                  strokeDasharray: 80,
                  strokeDashoffset: 80,
                  animation: 'drawCheck 0.4s ease-in-out 0.2s forwards'
                }}
              />
            </svg>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>Sent!</h1>
          
          <p 
            style={{ 
              fontSize: '1rem', 
              fontWeight: 500, 
              color: 'rgba(255, 255, 255, 0.95)',
              marginTop: '16px',
              lineHeight: '1.4'
            }}
          >
            👇 {socialCount} friends just tapped the button 👇
          </p>
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '380px', margin: '0 auto' }}>
          <button 
            onClick={onGetYourOwn}
            className="btn-black"
          >
            Get your own messages!
          </button>
          
          <button 
            onClick={resetPage}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '0.95rem',
              fontWeight: 700,
              textDecoration: 'underline',
              cursor: 'pointer',
              padding: '12px'
            }}
          >
            Send another message
          </button>
        </div>

        <div />
      </div>
    );
  }

  return (
    /* MESSAGE INPUT PAGE (Screen 3 from reference) */
    <div 
      style={{
        background: 'var(--ngl-gradient-radial)',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '30px 24px',
        color: '#FFFFFF'
      }}
      className="animate-fade-in"
    >
      {/* Spacer or Back Button (if sender wants to go back) */}
      <div />

      {/* Main card box */}
      <div style={{ width: '100%', maxWidth: '380px', margin: '0 auto' }} className="animate-fade-in-up">
        <div 
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '32px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            color: '#000000',
            marginBottom: '20px'
          }}
        >
          {/* User Profile Header */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 20px',
              borderBottom: '1px solid #F0F2F5'
            }}
          >
            <Avatar url={profile.avatarUrl} size={40} />
            <div>
              <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#000000' }}>@{profile.username}</h4>
              <p style={{ fontSize: '0.8rem', color: '#6A7B95', fontWeight: 600 }}>
                send me anonymous messages!
              </p>
            </div>
          </div>

          {/* Text Area Body */}
          <div 
            style={{
              background: 'linear-gradient(to bottom, #FFF0F5, #FFFFFF)',
              padding: '20px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '160px'
            }}
          >
            <textarea
              placeholder="send me anonymous messages..."
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                setErrorMsg('');
              }}
              style={{
                width: '100%',
                flex: 1,
                border: 'none',
                backgroundColor: 'transparent',
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
                fontSize: '1.2rem',
                fontWeight: 600,
                color: '#1A1D24',
                lineHeight: '1.4',
                animation: shake ? 'shake 0.3s' : 'none'
              }}
              maxLength={200}
            />

            {/* Dice Icon Button */}
            <button 
              onClick={handleRollDice}
              style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                backgroundColor: '#F3F4F6',
                border: '1px solid #E5E7EB',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'transform 0.15s ease'
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.9)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
            >
              🎲
            </button>
          </div>
        </div>

        {errorMsg && (
          <p 
            style={{ 
              color: '#FFE0E5', 
              fontSize: '0.9rem', 
              fontWeight: 700, 
              textAlign: 'center', 
              marginBottom: '12px' 
            }}
          >
            ⚠️ {errorMsg}
          </p>
        )}

        {/* Anonymous Q&A Badge */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            fontWeight: 700,
            opacity: 0.9,
            marginBottom: '20px'
          }}
        >
          <Lock size={14} style={{ color: '#F59E0B' }} /> anonymous q&a
        </div>

        {/* Send Button */}
        <button 
          onClick={handleSend}
          disabled={isSending}
          className="btn-black"
          style={{ marginBottom: '24px' }}
        >
          {isSending ? 'Sending...' : 'Send!'}
        </button>

        {/* Social stats */}
        <div style={{ textAlign: 'center', color: '#FFFFFF', fontWeight: 600, fontSize: '0.9rem', marginBottom: '16px' }}>
          👇 {socialCount} friends just tapped the button 👇
        </div>

        {/* Get own messages button */}
        <button 
          onClick={onGetYourOwn}
          className="btn-black"
          style={{
            backgroundColor: '#000000',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            fontSize: '0.95rem'
          }}
        >
          Get your own messages!
        </button>
      </div>

      {/* Footer copyright */}
      <div 
        style={{
          textAlign: 'center', 
          fontSize: '0.75rem', 
          opacity: 0.7, 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '12px'
        }}
      >
        <span>Terms</span>
        <span>Privacy</span>
      </div>
    </div>
  );
};
