import React, { useState } from 'react';
import type { UserProfile } from '../utils/storage';
import { saveProfile, clearProfile } from '../utils/storage';
import { Avatar, PRESET_AVATARS } from '../components/Avatar';
import { ArrowLeft, Plus, X, Trash2, Shield, Settings as Gear, Sparkles, RefreshCw } from 'lucide-react';

interface SettingsProps {
  profile: UserProfile;
  onClose: () => void;
  onUpdateProfile: (updated: UserProfile) => void;
  onAddSimulatedMessage: () => void;
}

export const SettingsView: React.FC<SettingsProps> = ({
  profile,
  onClose,
  onUpdateProfile,
  onAddSimulatedMessage
}) => {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatarUrl);
  const [moderationEnabled, setModerationEnabled] = useState(profile.moderationEnabled);
  const [newBlockedWord, setNewBlockedWord] = useState('');
  const [blockedWords, setBlockedWords] = useState<string[]>(profile.blockedWords || []);
  const [simulatedCount, setSimulatedCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(profile.isAdmin || false);

  const handleSaveProfile = () => {
    if (!username.trim()) return;
    
    const updated: UserProfile = {
      ...profile,
      username: username.toLowerCase().trim().replace(/[^a-z0-9_]/g, ''),
      displayName: displayName.trim() || username,
      avatarUrl: selectedAvatar,
      moderationEnabled,
      blockedWords,
      isAdmin
    };
    saveProfile(updated);
    onUpdateProfile(updated);
  };

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    const word = newBlockedWord.trim().toLowerCase();
    if (word && !blockedWords.includes(word)) {
      const updatedList = [...blockedWords, word];
      setBlockedWords(updatedList);
      setNewBlockedWord('');
      
      // Auto save word update
      const updatedProfile = { ...profile, blockedWords: updatedList };
      saveProfile(updatedProfile);
      onUpdateProfile(updatedProfile);
    }
  };

  const handleRemoveWord = (wordToRemove: string) => {
    const updatedList = blockedWords.filter(w => w !== wordToRemove);
    setBlockedWords(updatedList);
    
    // Auto save word update
    const updatedProfile = { ...profile, blockedWords: updatedList };
    saveProfile(updatedProfile);
    onUpdateProfile(updatedProfile);
  };

  const handleTriggerSimulate = () => {
    onAddSimulatedMessage();
    setSimulatedCount(prev => prev + 1);
    
    // Quick success animation visual
    const notification = document.createElement('div');
    notification.innerText = "Simulated message added to Inbox! 📬";
    notification.style.position = 'fixed';
    notification.style.bottom = '80px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = '#10B981';
    notification.style.color = '#FFFFFF';
    notification.style.padding = '12px 24px';
    notification.style.borderRadius = '30px';
    notification.style.fontSize = '0.9rem';
    notification.style.fontWeight = 'bold';
    notification.style.zIndex = '9999';
    notification.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    notification.style.animation = 'fadeInUp 0.3s ease-out';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'fadeIn 0.3s ease-out reverse';
      setTimeout(() => notification.remove(), 300);
    }, 1500);
  };

  const handleResetData = async () => {
    if (window.confirm("WARNING: This will delete your profile, links, and all received messages. You will be logged out. Do you want to proceed?")) {
      await clearProfile();
      window.location.reload();
    }
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
        zIndex: 150,
        color: '#FFFFFF'
      }}
      className="animate-fade-in"
    >
      {/* Header */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid #1E2538'
        }}
      >
        <button 
          onClick={() => {
            handleSaveProfile();
            onClose();
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#FFFFFF',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '1rem',
            fontWeight: 700
          }}
        >
          <ArrowLeft size={20} /> Back
        </button>

        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'lowercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Gear size={18} /> settings
        </h3>
        <div style={{ width: '40px' }} />
      </div>

      {/* Settings Scroll Area */}
      <div 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '24px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '30px' 
        }} 
        className="no-scrollbar"
      >
        {/* Profile Details Edit Card */}
        <section 
          style={{
            backgroundColor: '#151A26',
            borderRadius: '24px',
            padding: '20px',
            border: '1px solid #262F42'
          }}
        >
          <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--ngl-pink)' }}>
            Edit Profile
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <Avatar url={selectedAvatar} size={80} />
            
            {/* Avatar Select Carousel */}
            <div 
              style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                width: '100%',
                padding: '8px 0',
                justifyContent: 'flex-start'
              }}
              className="no-scrollbar"
            >
              {PRESET_AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  style={{
                    background: selectedAvatar === avatar.id ? '#FFFFFF' : '#202738',
                    border: 'none',
                    borderRadius: '50%',
                    width: '38px',
                    height: '38px',
                    fontSize: '18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                    boxShadow: selectedAvatar === avatar.id ? '0 2px 8px rgba(255,255,255,0.1)' : 'none'
                  }}
                >
                  {avatar.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8E9BAE', display: 'block', marginBottom: '6px' }}>
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#202738',
                  border: '1px solid #2B354F',
                  borderRadius: '12px',
                  padding: '12px',
                  color: '#FFFFFF',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8E9BAE', display: 'block', marginBottom: '6px' }}>
                Username Slug (ngl.link/...)
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                style={{
                  width: '100%',
                  backgroundColor: '#202738',
                  border: '1px solid #2B354F',
                  borderRadius: '12px',
                  padding: '12px',
                  color: '#FFFFFF',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </section>

        {/* Developer / Demo Simulator Card */}
        <section 
          style={{
            backgroundColor: '#151A26',
            borderRadius: '24px',
            padding: '20px',
            border: '1px solid #262F42'
          }}
        >
          <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} /> Demo Simulator
          </h4>
          <p style={{ fontSize: '0.8rem', color: '#8E9BAE', lineHeight: '1.4', marginBottom: '16px' }}>
            Use this to test the anonymous inbox features locally. Injects a new randomized question card.
          </p>
          
          <button
            onClick={handleTriggerSimulate}
            className="btn-gradient"
            style={{
              padding: '12px 24px',
              fontSize: '0.95rem',
              gap: '8px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
            }}
          >
            <RefreshCw size={16} /> Inject Mock Message ({simulatedCount})
          </button>
        </section>

        {/* Moderation Controls Card */}
        <section 
          style={{
            backgroundColor: '#151A26',
            borderRadius: '24px',
            padding: '20px',
            border: '1px solid #262F42'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--ngl-pink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={16} /> Profanity Filter
            </h4>
            
            <button 
              onClick={() => setModerationEnabled(!moderationEnabled)}
              style={{
                width: '44px',
                height: '24px',
                borderRadius: '12px',
                backgroundColor: moderationEnabled ? 'var(--ngl-pink)' : '#334155',
                border: 'none',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                padding: '2px'
              }}
            >
              <div 
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  position: 'absolute',
                  top: '2px',
                  left: moderationEnabled ? '22px' : '2px',
                  transition: 'left 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />
            </button>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#8E9BAE', lineHeight: '1.4', marginBottom: '16px' }}>
            Automatically censors offensive words (like bad language or harassment terms) with asterisks when they are submitted.
          </p>

          {moderationEnabled && (
            <div className="animate-fade-in" style={{ borderTop: '1px solid #262F42', paddingTop: '16px' }}>
              <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                Custom Blocked Words
              </h5>
              
              <form onSubmit={handleAddWord} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="text"
                  placeholder="e.g. nerd"
                  value={newBlockedWord}
                  onChange={(e) => setNewBlockedWord(e.target.value)}
                  style={{
                    flex: 1,
                    backgroundColor: '#202738',
                    border: '1px solid #2B354F',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#FFFFFF',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: 'var(--ngl-pink)',
                    border: 'none',
                    borderRadius: '8px',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={16} />
                </button>
              </form>

              {/* Tag List */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {blockedWords.length === 0 ? (
                  <span style={{ fontSize: '0.8rem', color: '#5C6A7F', fontStyle: 'italic' }}>No custom blocked words.</span>
                ) : (
                  blockedWords.map(word => (
                    <span
                      key={word}
                      style={{
                        backgroundColor: 'rgba(255, 0, 122, 0.15)',
                        border: '1px solid rgba(255, 0, 122, 0.3)',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--ngl-pink)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {word}
                      <button 
                        onClick={() => handleRemoveWord(word)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--ngl-pink)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: 0
                        }}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          )}
        </section>

        {/* Admin Debug Controls */}
        <section 
          style={{
            backgroundColor: '#151A26',
            borderRadius: '24px',
            padding: '20px',
            border: '1px solid #262F42'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ⚙️ Admin Role
            </h4>
            
            <button 
              onClick={() => {
                const nextVal = !isAdmin;
                setIsAdmin(nextVal);
                // Save immediately
                const updatedProfile = { ...profile, isAdmin: nextVal };
                saveProfile(updatedProfile);
                onUpdateProfile(updatedProfile);
              }}
              style={{
                width: '44px',
                height: '24px',
                borderRadius: '12px',
                backgroundColor: isAdmin ? '#38BDF8' : '#334155',
                border: 'none',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                padding: '2px'
              }}
            >
              <div 
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  position: 'absolute',
                  top: '2px',
                  left: isAdmin ? '22px' : '2px',
                  transition: 'left 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />
            </button>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#8E9BAE', lineHeight: '1.4' }}>
            Unlocks the Admin Debug mode inside your message details overlay. Press **Ctrl + Alt + A** inside details to inspect sender metadata logs.
          </p>
        </section>

        {/* Premium section placeholder */}
        <section 
          style={{
            backgroundColor: '#151A26',
            borderRadius: '24px',
            padding: '20px',
            border: '1px solid #262F42',
            background: 'radial-gradient(circle at top right, rgba(255, 168, 0, 0.15), transparent)'
          }}
        >
          <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '8px', color: '#FFA800', display: 'flex', alignItems: 'center', gap: '6px' }}>
            👑 Premium Features
          </h4>
          <p style={{ fontSize: '0.8rem', color: '#8E9BAE', lineHeight: '1.4', marginBottom: '16px' }}>
            Unlock Pro plans to see advanced sender clues:
            <br />
            • **Monthly**: ₹{import.meta.env.VITE_PRICE_MONTHLY || 99}/month
            <br />
            • **Yearly**: ₹{import.meta.env.VITE_PRICE_YEARLY || 299}/year
          </p>
          <button
            onClick={() => alert(`Premium features placeholder - payments integration coming soon for ₹${import.meta.env.VITE_PRICE_MONTHLY || 99}/mo!`)}
            style={{
              padding: '12px',
              fontSize: '0.9rem',
              fontWeight: '700',
              borderRadius: '9999px',
              border: '2px solid #FFA800',
              backgroundColor: 'transparent',
              color: '#FFA800',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'center'
            }}
          >
            View Pro plans
          </button>
        </section>

        {/* Clear Data / Danger Zone */}
        <section 
          style={{
            backgroundColor: '#151A26',
            borderRadius: '24px',
            padding: '20px',
            border: '1px solid #262F42',
            textAlign: 'center'
          }}
        >
          <button
            onClick={handleResetData}
            style={{
              background: 'none',
              border: 'none',
              color: '#EF4444',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              width: '100%'
            }}
          >
            <Trash2 size={16} /> Reset All Data & Logout
          </button>
        </section>
      </div>
    </div>
  );
};
