import React, { useState, useEffect } from 'react';
import { Avatar } from '../components/Avatar';
import { ArrowLeft, Lock, Mail } from 'lucide-react';
import type { UserProfile } from '../utils/storage';
import { addMessage, getRandomDicePrompt, getProfile } from '../utils/storage';
import { sanitizeText } from '../utils/profanity';
import { collectVisitorMetadata } from '../utils/metadata';

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
            premiumActive: false,
            isAdmin: false
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
      
      if (profile.moderationEnabled) {
        // Run profanity filter
        finalContent = sanitizeText(finalContent, profile.blockedWords);
      }
      
      // 1. Gather browser/OS/geolocation metadata
      const metadata = await collectVisitorMetadata(profile.username);
      
      // 2. Check if the current sender has a logged-in account in this browser
      const senderProfile = await getProfile();
      const senderUsername = senderProfile?.username;

      // 3. Save message with full analytics metadata
      await addMessage(finalContent, profile.username, metadata, senderUsername);
      
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
    /* HIGH CONVERTING POST-SEND SIGNUP PAGE */
    return (
      <div 
        style={{
          background: 'var(--ngl-gradient-radial)',
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '30px 24px 40px 24px',
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

        {/* Success Checkmark & Conversion tags */}
        <div style={{ textAlign: 'center', margin: '0 auto', maxWidth: '360px' }} className="animate-scale-up">
          <div 
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
            }}
          >
            <svg 
              viewBox="0 0 50 50" 
              style={{
                width: '48px',
                height: '48px',
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
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px', lineHeight: '1.2' }}>
            Your message was delivered.
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.4', marginTop: '8px' }}>
            Create your own anonymous link and start receiving messages!
          </p>
        </div>

        {/* Sign Up Flow Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '380px', margin: '0 auto' }} className="animate-fade-in-up">
          
          {/* Continue with Google */}
          <button 
            onClick={onGetYourOwn}
            className="btn-black"
            style={{
              backgroundColor: '#FFFFFF',
              color: '#000000',
              fontSize: '0.95rem',
              fontWeight: 700,
              gap: '10px'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8c-.2 1.1-.8 2-1.8 2.6v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.4z"/>
              <path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.8-3.1.8-2.4 0-4.4-1.6-5.1-3.8H1v2.3C2.5 15.6 5.5 18 9 18z"/>
              <path fill="#FBBC05" d="M3.9 10.6c-.2-.5-.3-1.1-.3-1.6s.1-1.1.3-1.6V5.1H1C.4 6.3 0 7.6 0 9s.4 2.7 1 3.9l2.9-2.3z"/>
              <path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6C13.4.9 11.3 0 9 0 5.5 0 2.5 2.4 1 5.1l2.9 2.3c.7-2.2 2.7-3.8 5.1-3.8z"/>
            </svg>
            Continue with Google
          </button>

          {/* Continue with Instagram (Placeholder design) */}
          <button 
            onClick={onGetYourOwn}
            className="btn-gradient"
            style={{
              background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              fontSize: '0.95rem',
              fontWeight: 700,
              gap: '10px'
            }}
          >
            <svg width="18" height="18" fill="#FFFFFF" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            Continue with Instagram
          </button>

          {/* Continue with Email */}
          <button 
            onClick={onGetYourOwn}
            className="btn-black"
            style={{
              backgroundColor: '#1E2538',
              border: '1px solid #2B354F',
              fontSize: '0.95rem',
              fontWeight: 700,
              gap: '10px'
            }}
          >
            <Mail size={18} />
            Continue with Email
          </button>
          
          {/* Skip / Send another message */}
          <button 
            onClick={resetPage}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '12px',
              textDecoration: 'underline',
              marginTop: '4px'
            }}
          >
            Skip & send another message
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
