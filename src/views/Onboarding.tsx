import React, { useState } from 'react';
import { Avatar, PRESET_AVATARS } from '../components/Avatar';
import { ArrowRight, Sparkles, LogIn, Mail, Lock } from 'lucide-react';
import type { UserProfile } from '../utils/storage';
import { saveProfile } from '../utils/storage';
import { supabase, isLiveBackend } from '../utils/supabase';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<0 | 1 | 2>(isLiveBackend ? 0 : 1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [loading, setLoading] = useState(false);
  
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('fox');
  const [error, setError] = useState('');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required!');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (authMode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
        });

        if (signUpError) throw signUpError;
        
        if (data.user && !data.session) {
          // Signup succeeded but needs confirmation
          setError('Verification email sent! Please confirm your email, then toggle to "Log In" here.');
          setLoading(false);
          return;
        }
        
        // Logged in directly (email confirmation off)
        setStep(1);
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (signInError) throw signInError;

        if (data.user) {
          // Check if user has an existing profile
          const { data: dbProfile, error: profileError } = await supabase
            .from('profiles')
            .select()
            .eq('user_id', data.user.id)
            .maybeSingle();

          if (profileError) {
            console.error("Profile lookup failed:", profileError);
          }

          if (dbProfile) {
            // Already has a profile - onboard complete!
            onComplete({
              username: dbProfile.username,
              displayName: dbProfile.display_name,
              bio: dbProfile.bio || '',
              avatarUrl: dbProfile.avatar_url || 'fox',
              theme: dbProfile.theme || 'ngl-default',
              moderationEnabled: dbProfile.moderation_enabled ?? true,
              blockedWords: dbProfile.blocked_words || [],
              premiumActive: dbProfile.premium_active ?? false,
              isAdmin: dbProfile.is_admin ?? false,
              userId: dbProfile.user_id
            });
          } else {
            // Logged in but needs to customize profile
            setStep(1);
          }
        }
      }
    } catch (err: any) {
      console.error("Authentication failed:", err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setError('');
      setLoading(true);
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + window.location.pathname
        }
      });
      if (googleError) throw googleError;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google Authentication failed.');
      setLoading(false);
    }
  };

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

  const handleFinish = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const finalProfile: UserProfile = {
        username: username.toLowerCase().trim(),
        displayName: displayName.trim() || username,
        bio: "Send me anonymous messages!",
        avatarUrl: selectedAvatar,
        theme: 'ngl-default',
        moderationEnabled: true,
        blockedWords: [],
        premiumActive: false,
        isAdmin: false,
        userId: user ? user.id : undefined
      };
      await saveProfile(finalProfile);
      onComplete(finalProfile);
    } catch (err) {
      console.error(err);
      setError('Failed to create inbox. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 0: Auth Flow (Signup / Login)
  if (step === 0) {
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
        {/* Floating background elements */}
        <div style={{ position: 'absolute', top: '10%', left: '8%', fontSize: '24px', opacity: 0.15, transform: 'rotate(-15deg)' }}>💬</div>
        <div style={{ position: 'absolute', top: '25%', right: '12%', fontSize: '28px', opacity: 0.15, transform: 'rotate(10deg)' }}>😈</div>
        <div style={{ position: 'absolute', top: '50%', left: '15%', fontSize: '32px', opacity: 0.15, transform: 'rotate(-5deg)' }}>🤫</div>
        <div style={{ position: 'absolute', top: '65%', right: '10%', fontSize: '24px', opacity: 0.15, transform: 'rotate(20deg)' }}>💖</div>

        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <h1 
            style={{ 
              fontSize: '3.8rem', 
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
              fontSize: '1.15rem', 
              fontWeight: 500, 
              opacity: 0.9,
              marginTop: '4px',
              letterSpacing: '0.5px'
            }}
          >
            anonymous q&a
          </p>
        </div>

        {/* Credentials Form Box */}
        <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: '380px', margin: '0 auto' }}>
          <div 
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.13)',
              backdropFilter: 'blur(12px)',
              padding: '24px',
              borderRadius: '28px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
              marginBottom: '20px'
            }}
          >
            {/* Tab selector for Mode */}
            <div style={{ display: 'flex', borderBottom: '2px solid rgba(255,255,255,0.1)', marginBottom: '20px', paddingBottom: '4px' }}>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setError(''); }}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  color: authMode === 'signup' ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  padding: '8px 0',
                  borderBottom: authMode === 'signup' ? '3px solid var(--ngl-pink)' : '3px solid transparent',
                  marginBottom: '-6px',
                  transition: 'all 0.2s'
                }}
              >
                sign up
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setError(''); }}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  color: authMode === 'login' ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  padding: '8px 0',
                  borderBottom: authMode === 'login' ? '3px solid var(--ngl-pink)' : '3px solid transparent',
                  marginBottom: '-6px',
                  transition: 'all 0.2s'
                }}
              >
                log in
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Email */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.9, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '14px', color: '#8E9BAE' }} />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    required
                    style={{
                      width: '100%',
                      padding: '14px 14px 14px 40px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: '#FFFFFF',
                      color: '#000000',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.9, display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Password
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '14px', color: '#8E9BAE' }} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    required
                    style={{
                      width: '100%',
                      padding: '14px 14px 14px 40px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: '#FFFFFF',
                      color: '#000000',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {error && (
                <p style={{ color: '#FFE0E5', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center', lineHeight: '1.4', margin: '4px 0' }}>
                  ⚠️ {error}
                </p>
              )}

              <button
                type="submit"
                className="btn-black"
                disabled={loading}
                style={{
                  marginTop: '8px',
                  backgroundColor: 'var(--ngl-pink)',
                  color: '#FFFFFF',
                  opacity: loading ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {loading ? 'Processing...' : authMode === 'signup' ? 'Create Account' : 'Sign In'}
                <LogIn size={18} />
              </button>
            </form>

            <div style={{ margin: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <span style={{ height: '1px', background: 'rgba(255,255,255,0.15)', flex: 1 }}></span>
              <span style={{ fontSize: '0.75rem', opacity: 0.5, textTransform: 'uppercase' }}>or</span>
              <span style={{ height: '1px', background: 'rgba(255,255,255,0.15)', flex: 1 }}></span>
            </div>

            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.2)',
                backgroundColor: 'rgba(255,255,255,0.08)',
                color: '#FFFFFF',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.14)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.488 0-6.315-2.827-6.315-6.315s2.827-6.315 6.315-6.315c1.556 0 2.973.565 4.072 1.503l3.056-3.056C19.11 2.507 15.894 1.485 12.24 1.485 6.012 1.485 1 6.5 1 12.729s5.012 11.243 11.24 11.243c5.96 0 10.938-4.225 10.938-11.243 0-.648-.057-1.129-.175-1.444H12.24z"/>
              </svg>
              Continue with Google
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.8rem', opacity: 0.7 }}>
          An account secures your inbox so you never lose your questions.
        </div>
      </div>
    );
  }

  // Step 1: Instagram Username Selection
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
        <div style={{ position: 'absolute', top: '10%', left: '8%', fontSize: '24px', opacity: 0.15 }}>💭</div>
        <div style={{ position: 'absolute', top: '25%', right: '12%', fontSize: '28px', opacity: 0.15 }}>😈</div>
        <div style={{ position: 'absolute', top: '50%', left: '15%', fontSize: '32px', opacity: 0.15 }}>🤫</div>
        <div style={{ position: 'absolute', top: '65%', right: '10%', fontSize: '24px', opacity: 0.15 }}>💖</div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <h1 style={{ fontSize: '3.8rem', fontWeight: 900, letterSpacing: '-2px', textTransform: 'lowercase' }}>
            ngl
          </h1>
          <p style={{ fontSize: '1.2rem', fontWeight: 500, opacity: 0.9, marginTop: '4px' }}>
            anonymous q&a
          </p>
        </div>

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
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '16px', textAlign: 'center' }}>
              Choose your NGL link slug
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
              This will be your shareable URL where anyone can send you anonymous questions.
            </p>
          </div>
          
          <button 
            onClick={handleNextStep}
            className="btn-black"
            style={{ gap: '8px' }}
          >
            Next Step <ArrowRight size={20} />
          </button>
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.8rem', opacity: 0.7 }}>
          Step 1 of 2: Link Creation
        </div>
      </div>
    );
  }

  // Step 2: Customize Avatar & Display Name
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

        {error && (
          <p style={{ color: '#FFE0E5', fontSize: '0.9rem', fontWeight: 600, marginBottom: '16px', textAlign: 'center' }}>
            ⚠️ {error}
          </p>
        )}

        <button 
          onClick={handleFinish}
          className="btn-black"
          disabled={loading}
          style={{ gap: '8px', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Saving...' : 'Create Inbox'} <Sparkles size={18} />
        </button>
      </div>

      <div />
    </div>
  );
};
