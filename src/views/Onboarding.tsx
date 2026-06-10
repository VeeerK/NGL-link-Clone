import React, { useState } from 'react';
import { Avatar, PRESET_AVATARS } from '../components/Avatar';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { UserProfile } from '../utils/storage';
import { saveProfile } from '../utils/storage';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('fox');
  const [error, setError] = useState('');

  const handleNextStep = () => {
    if (!username.trim()) {
      setError('Username is required!');
      return;
    }
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (cleanUsername.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }
    setUsername(cleanUsername);
    if (!displayName) {
      setDisplayName(cleanUsername);
    }
    setError('');
    setStep(2);
  };

  const handleFinish = () => {
    const finalProfile: UserProfile = {
      username: username.toLowerCase().trim(),
      displayName: displayName.trim() || username,
      bio: "Send me anonymous messages!",
      avatarUrl: selectedAvatar,
      theme: 'ngl-default',
      moderationEnabled: true,
      blockedWords: [],
      premiumActive: false
    };
    saveProfile(finalProfile);
    onComplete(finalProfile);
  };

  // Welcome Step
  if (step === 1) {
    return (
      <div 
        style={{
          background: 'var(--ngl-gradient-radial)',
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '40px 24px',
          color: '#FFFFFF'
        }}
        className="animate-fade-in"
      >
        {/* Floating bubbles for playful UI */}
        <div style={{ position: 'absolute', top: '10%', left: '8%', fontSize: '24px', opacity: 0.15, transform: 'rotate(-15deg)' }}>💬</div>
        <div style={{ position: 'absolute', top: '25%', right: '12%', fontSize: '28px', opacity: 0.15, transform: 'rotate(10deg)' }}>😈</div>
        <div style={{ position: 'absolute', top: '50%', left: '15%', fontSize: '32px', opacity: 0.15, transform: 'rotate(-5deg)' }}>🤫</div>
        <div style={{ position: 'absolute', top: '65%', right: '10%', fontSize: '24px', opacity: 0.15, transform: 'rotate(20deg)' }}>💖</div>

        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <h1 
            style={{ 
              fontSize: '4rem', 
              fontWeight: 900, 
              letterSpacing: '-2px', 
              textTransform: 'lowercase',
              textShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            ngl
          </h1>
          <p 
            style={{ 
              fontSize: '1.2rem', 
              fontWeight: 500, 
              opacity: 0.9,
              marginTop: '4px',
              letterSpacing: '0.5px'
            }}
          >
            anonymous q&a
          </p>
        </div>

        {/* Core Input Field Container */}
        <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: '380px', margin: '0 auto' }}>
          <div 
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              padding: '24px',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              marginBottom: '24px'
            }}
          >
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px', textAlign: 'center' }}>
              What's your Instagram username?
            </h2>
            
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span 
                style={{ 
                  position: 'absolute', 
                  left: '16px', 
                  fontSize: '1.1rem', 
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: 600
                }}
              >
                ngl.link/
              </span>
              <input 
                type="text" 
                placeholder="username" 
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                  setError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleNextStep()}
                style={{
                  width: '100%',
                  padding: '16px 16px 16px 95px',
                  borderRadius: '16px',
                  border: 'none',
                  backgroundColor: '#FFFFFF',
                  color: '#000000',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  outline: 'none',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
                }}
              />
            </div>
            
            {error && (
              <p style={{ color: '#FFE0E5', fontSize: '0.9rem', fontWeight: 600, marginTop: '10px', textAlign: 'center' }}>
                ⚠️ {error}
              </p>
            )}
            
            <p style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '14px', textAlign: 'center', lineHeight: '1.4' }}>
              We'll generate a special link for you to post on your story to get messages!
            </p>
          </div>
          
          <button 
            onClick={handleNextStep}
            className="btn-black"
            style={{ gap: '8px' }}
          >
            Get Link <ArrowRight size={20} />
          </button>
        </div>

        {/* Footer info */}
        <div style={{ textAlign: 'center', fontSize: '0.8rem', opacity: 0.7 }}>
          By continuing, you agree to our Terms & Privacy policy.
        </div>
      </div>
    );
  }

  // Setup Profile (Avatar, display name)
  return (
    <div 
      style={{
        background: 'var(--ngl-gradient-radial)',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '40px 24px',
        color: '#FFFFFF'
      }}
      className="animate-fade-in"
    >
      <div />

      <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: '380px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px' }}>
          Customize Profile
        </h2>
        <p style={{ opacity: 0.9, fontSize: '0.95rem', marginBottom: '24px' }}>
          Choose how you look in the inbox.
        </p>

        {/* Avatar Preview */}
        <div style={{ marginBottom: '24px' }}>
          <Avatar url={selectedAvatar} size={100} />
        </div>

        {/* Avatar Preset Grid */}
        <div 
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            maxWidth: '300px',
            margin: '0 auto 24px auto',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '16px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}
        >
          {PRESET_AVATARS.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => setSelectedAvatar(avatar.id)}
              style={{
                background: selectedAvatar === avatar.id ? '#FFFFFF' : 'rgba(255,255,255,0.15)',
                border: 'none',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
                transform: selectedAvatar === avatar.id ? 'scale(1.15)' : 'none',
                boxShadow: selectedAvatar === avatar.id ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
              }}
            >
              {avatar.label}
            </button>
          ))}
        </div>

        {/* Name Input */}
        <div style={{ marginBottom: '32px', textAlign: 'left' }}>
          <label 
            style={{ 
              display: 'block', 
              fontSize: '0.85rem', 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              letterSpacing: '1px',
              marginBottom: '6px',
              opacity: 0.9
            }}
          >
            Display Name
          </label>
          <input
            type="text"
            placeholder="e.g. Paris"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={20}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              border: 'none',
              backgroundColor: '#FFFFFF',
              color: '#000000',
              fontSize: '1rem',
              fontWeight: 600,
              outline: 'none'
            }}
          />
        </div>

        <button 
          onClick={handleFinish}
          className="btn-black"
          style={{ gap: '8px' }}
        >
          Create Inbox <Sparkles size={18} />
        </button>
      </div>

      <div />
    </div>
  );
};
