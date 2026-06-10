import React from 'react';

interface AvatarProps {
  url: string;
  size?: number;
  editable?: boolean;
  onEditClick?: () => void;
  className?: string;
}

export const PRESET_AVATARS = [
  { id: 'fox', label: '🦊', color: '#FFF0E6' },
  { id: 'koala', label: '🐨', color: '#F0F2F5' },
  { id: 'unicorn', label: '🦄', color: '#FCE8FF' },
  { id: 'panda', label: '🐼', color: '#F5F5F5' },
  { id: 'lion', label: '🦁', color: '#FFF9E6' },
  { id: 'dino', label: '🦖', color: '#EAFBEA' },
  { id: 'cat', label: '🐱', color: '#FFF5F5' },
  { id: 'ghost', label: '👻', color: '#F0F8FF' }
];

export const Avatar: React.FC<AvatarProps> = ({
  url,
  size = 64,
  editable = false,
  onEditClick,
  className = ''
}) => {
  const isEmoji = PRESET_AVATARS.some(p => p.id === url || p.label === url);
  const preset = PRESET_AVATARS.find(p => p.id === url || p.label === url) || PRESET_AVATARS[0];
  
  const style: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${size * 0.55}px`,
    backgroundColor: isEmoji ? preset.color : '#e2e8f0',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    position: 'relative',
    overflow: 'hidden',
    userSelect: 'none'
  };

  const renderContent = () => {
    if (isEmoji) {
      return <span>{preset.label}</span>;
    }
    
    // In case of base64 or external url
    if (url && (url.startsWith('data:') || url.startsWith('http') || url.startsWith('/'))) {
      return (
        <img 
          src={url} 
          alt="Avatar" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          onError={(e) => {
            // Fallback to emoji
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      );
    }
    
    // Default fallback
    return <span>👤</span>;
  };

  return (
    <div className={`avatar-container ${className}`} style={{ position: 'relative', display: 'inline-block' }}>
      <div style={style}>
        {renderContent()}
      </div>
      {editable && (
        <button
          onClick={onEditClick}
          style={{
            position: 'absolute',
            bottom: '-2px',
            right: '-2px',
            backgroundColor: '#FFFFFF',
            border: 'none',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            fontSize: '12px'
          }}
          title="Edit Avatar"
        >
          ✏️
        </button>
      )}
    </div>
  );
};
