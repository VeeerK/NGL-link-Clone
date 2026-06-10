import React, { useState, useRef, useEffect } from 'react';
import type { AnonymousMessage, UserProfile } from '../utils/storage';
import { addReply } from '../utils/storage';
import { ArrowLeft, Download, Copy, Check, MessageSquare } from 'lucide-react';
import { Avatar } from '../components/Avatar';

interface ReplyGeneratorProps {
  message: AnonymousMessage;
  profile: UserProfile;
  onBack: () => void;
  onSaveReply: (updatedMsg: AnonymousMessage) => void;
}

const BG_THEMES = [
  { id: 'ngl', name: 'NGL Classic', colors: ['#FF007A', '#FF5E00', '#FFA800'] },
  { id: 'sunset', name: 'Sunset Glow', colors: ['#8000FF', '#FF007A', '#FF8000'] },
  { id: 'ocean', name: 'Deep Ocean', colors: ['#00C6FF', '#0072FF'] },
  { id: 'neon', name: 'Neon Cyber', colors: ['#00F2FE', '#4FACFE', '#000000'] },
  { id: 'dark', name: 'Slate Matte', colors: ['#0F172A', '#1E293B', '#334155'] }
];

export const ReplyGenerator: React.FC<ReplyGeneratorProps> = ({
  message,
  profile,
  onBack,
  onSaveReply
}) => {
  const [replyText, setReplyText] = useState(message.replyText || '');
  const [activeTheme, setActiveTheme] = useState(BG_THEMES[0]);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auto-resize textarea
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [replyText]);

  // Handle save
  const handleSave = () => {
    if (!replyText.trim()) return;
    addReply(message.id, replyText);
    onSaveReply({
      ...message,
      replyText,
      replyTimestamp: Date.now(),
      isRead: true
    });
  };

  // Render Canvas for Export
  const drawStoryToCanvas = async (canvas: HTMLCanvasElement): Promise<void> => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-res story dimensions (1080 x 1920)
    canvas.width = 1080;
    canvas.height = 1920;

    // 1. Draw Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    activeTheme.colors.forEach((color, idx) => {
      gradient.addColorStop(idx / (activeTheme.colors.length - 1), color);
    });
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Decorative Floating Bubbles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath(); ctx.arc(150, 400, 80, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(950, 800, 120, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(200, 1400, 100, 0, Math.PI * 2); ctx.fill();

    // 3. Draw "Send me anonymous messages!" header badge
    const cardWidth = 840;
    const cardHeight = 500;
    const cardX = (canvas.width - cardWidth) / 2;
    const cardY = 480;

    // Draw card background (Glassmorphism white/gradient)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 15;
    
    // Rounded Card Path
    const r = 60; // Card radius
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, r);
    ctx.fill();
    ctx.shadowColor = 'transparent'; // reset shadow

    // Draw User Profile Header in card
    // Draw Username: @username
    ctx.fillStyle = '#000000';
    ctx.font = '800 38px Outfit, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`@${profile.username}`, cardX + 180, cardY + 95);

    // Draw subtitle: send me anonymous messages!
    ctx.fillStyle = '#666666';
    ctx.font = '700 28px Outfit, sans-serif';
    ctx.fillText("send me anonymous messages!", cardX + 180, cardY + 140);

    // Draw a placeholder avatar circle
    ctx.fillStyle = '#EAF0F6';
    ctx.beginPath();
    ctx.arc(cardX + 100, cardY + 105, 50, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw emoji/text inside avatar
    ctx.fillStyle = '#000000';
    ctx.font = '50px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const presets = [
      { id: 'fox', label: '🦊' },
      { id: 'koala', label: '🐨' },
      { id: 'unicorn', label: '🦄' },
      { id: 'panda', label: '🐼' },
      { id: 'lion', label: '🦁' },
      { id: 'dino', label: '🦖' },
      { id: 'cat', label: '🐱' },
      { id: 'ghost', label: '👻' }
    ];
    const userEmoji = presets.find(p => p.id === profile.avatarUrl)?.label || '🦊';
    ctx.fillText(userEmoji, cardX + 100, cardY + 105);

    // 4. Draw Anonymous Prompt Area (Inner Card Gradient / White Area)
    const promptWidth = 740;
    const promptHeight = 220;
    const promptX = (canvas.width - promptWidth) / 2;
    const promptY = cardY + 220;
    
    const promptGrad = ctx.createLinearGradient(promptX, promptY, promptX + promptWidth, promptY + promptHeight);
    promptGrad.addColorStop(0, '#FFEAEA');
    promptGrad.addColorStop(1, '#FFFFFF');
    ctx.fillStyle = promptGrad;
    ctx.beginPath();
    ctx.roundRect(promptX, promptY, promptWidth, promptHeight, 30);
    ctx.fill();

    // Draw Question Text inside Prompt Bubble
    ctx.fillStyle = '#1A1A1A';
    ctx.font = '700 38px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Text Wrapping Helper
    const wrapText = (text: string, maxWidth: number) => {
      const words = text.split(' ');
      const lines = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
          currentLine += " " + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
      return lines;
    };

    const lines = wrapText(message.content, promptWidth - 80);
    const lineHeight = 46;
    const totalTextHeight = lines.length * lineHeight;
    let startTextY = promptY + (promptHeight / 2) - (totalTextHeight / 2) + 20;

    lines.forEach((line, idx) => {
      ctx.fillText(line, canvas.width / 2, startTextY + (idx * lineHeight));
    });

    // 5. Draw User's Reply Card below
    if (replyText.trim()) {
      const replyWidth = 800;
      const replyMinHeight = 160;
      
      // Calculate height dynamically
      ctx.font = '700 42px Outfit, sans-serif';
      const replyLines = wrapText(replyText.trim(), replyWidth - 100);
      const replyLineHeight = 56;
      const replyTextHeight = replyLines.length * replyLineHeight;
      const replyHeight = Math.max(replyMinHeight, replyTextHeight + 80);
      
      const replyX = (canvas.width - replyWidth) / 2;
      const replyY = cardY + cardHeight + 80;

      // Draw Glassmorphism/Dark Card backdrop
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.beginPath();
      ctx.roundRect(replyX, replyY, replyWidth, replyHeight, 40);
      ctx.fill();

      // Draw Reply Text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 44px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const startReplyTextY = replyY + (replyHeight / 2) - (replyTextHeight / 2) + 20;
      replyLines.forEach((line, idx) => {
        ctx.fillText(line, canvas.width / 2, startReplyTextY + (idx * replyLineHeight));
      });
    }

    // 6. Draw Branding watermark at the bottom
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '800 32px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("NGL.LINK", canvas.width / 2, canvas.height - 180);
    ctx.font = '700 24px Outfit, sans-serif';
    ctx.fillText("anonymous messages", canvas.width / 2, canvas.height - 140);
  };

  // Download Action
  const handleDownload = async () => {
    if (isExporting) return;
    setIsExporting(true);
    handleSave(); // Always save reply state first

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      await drawStoryToCanvas(canvas);
      
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `ngl_reply_${profile.username}_${message.id}.png`;
      link.href = dataUrl;
      link.click();
      
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    } catch (err) {
      console.error(err);
      alert("Failed to download image. Try copying instead.");
    } finally {
      setIsExporting(false);
    }
  };

  // Copy to Clipboard Action
  const handleCopyToClipboard = async () => {
    if (isExporting) return;
    setIsExporting(true);
    handleSave();

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      await drawStoryToCanvas(canvas);
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob
            })
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error(err);
          // Fallback if Clipboard API fails (e.g. Chrome security or http)
          alert("Direct copy to clipboard is blocked on some browsers/platforms. Downloading is recommended!");
        }
      }, 'image/png');

    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
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
        justifyContent: 'space-between',
        padding: '24px 20px 40px 20px',
        zIndex: 200,
        overflowY: 'auto'
      }}
      className="animate-fade-in no-scrollbar"
    >
      {/* Hidden canvas for offscreen rendering */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Header */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '16px'
        }}
      >
        <button 
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#FFFFFF',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '1rem',
            fontWeight: 700
          }}
        >
          <ArrowLeft size={20} /> Back
        </button>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'lowercase' }}>
          reply generator
        </h3>
        <div style={{ width: '40px' }} /> {/* alignment balance spacer */}
      </div>

      {/* Main visual preview */}
      <div 
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '20px 0',
          gap: '20px'
        }}
      >
        {/* Story Layout Mockup (9:16 aspect ratio preview container) */}
        <div 
          style={{
            width: '100%',
            maxWidth: '280px',
            aspectRatio: '9 / 16',
            borderRadius: '24px',
            padding: '24px 16px',
            background: `linear-gradient(135deg, ${activeTheme.colors.join(', ')})`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}
          className="animate-scale-up"
        >
          {/* Subtle bubbles inside mockup */}
          <div style={{ position: 'absolute', top: '10%', left: '10%', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', bottom: '25%', right: '8%', width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

          {/* Original Q&A badge in center */}
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '12px 14px',
              width: '100%',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', marginBottom: '8px' }}>
              <Avatar url={profile.avatarUrl} size={24} />
              <div style={{ textAlign: 'left' }}>
                <h6 style={{ fontSize: '0.65rem', fontWeight: 800, color: '#000000', margin: 0 }}>@{profile.username}</h6>
                <span style={{ fontSize: '0.55rem', color: '#666', fontWeight: 600, display: 'block', marginTop: '-2px' }}>
                  send me anonymous messages!
                </span>
              </div>
            </div>
            
            <div 
              style={{
                background: 'linear-gradient(to bottom, #FFEAEA, #FFFFFF)',
                borderRadius: '10px',
                padding: '8px 10px',
                width: '100%',
                textAlign: 'center',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
                minHeight: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <p style={{ color: '#111', fontSize: '0.8rem', fontWeight: 700, margin: 0, wordBreak: 'break-word' }}>
                {message.content}
              </p>
            </div>
          </div>

          {/* User Reply badge below */}
          {replyText.trim() && (
            <div 
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                borderRadius: '14px',
                padding: '10px 14px',
                width: '95%',
                marginTop: '16px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                textAlign: 'center',
                color: '#FFFFFF',
                wordBreak: 'break-word',
                fontSize: '0.85rem',
                fontWeight: 800,
                animation: 'scaleUp 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              {replyText}
            </div>
          )}

          {/* Watermark logo */}
          <div 
            style={{ 
              position: 'absolute', 
              bottom: '16px', 
              textAlign: 'center', 
              opacity: 0.6,
              fontSize: '0.55rem',
              fontWeight: 800,
              letterSpacing: '0.5px'
            }}
          >
            NGL.LINK
          </div>
        </div>

        {/* Theme Picker Grid */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {BG_THEMES.map(theme => (
            <button
              key={theme.id}
              onClick={() => setActiveTheme(theme)}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                border: activeTheme.id === theme.id ? '2px solid #FFFFFF' : '2px solid transparent',
                background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1] || theme.colors[0]})`,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                transform: activeTheme.id === theme.id ? 'scale(1.15)' : 'scale(1)'
              }}
              title={theme.name}
            />
          ))}
        </div>
      </div>

      {/* Editor & Actions footer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '380px', margin: '0 auto' }}>
        
        {/* Reply Input Box */}
        <div 
          style={{
            backgroundColor: '#151A26',
            borderRadius: '20px',
            padding: '16px',
            border: '1px solid #262F42'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <MessageSquare size={16} color="var(--ngl-pink)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8E9BAE', textTransform: 'uppercase' }}>
              Type your reply
            </span>
          </div>
          
          <textarea
            ref={textareaRef}
            rows={2}
            placeholder="Type your reply to share on story..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#FFFFFF',
              fontFamily: 'inherit',
              fontSize: '1rem',
              fontWeight: 600,
              resize: 'none',
              lineHeight: '1.4'
            }}
            maxLength={100}
          />
        </div>

        {/* Action button triggers */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleDownload}
            disabled={!replyText.trim() || isExporting}
            className="btn-gradient"
            style={{
              flex: 1,
              padding: '14px',
              fontSize: '0.95rem',
              gap: '8px',
              opacity: !replyText.trim() ? 0.5 : 1,
              cursor: !replyText.trim() ? 'not-allowed' : 'pointer',
              backgroundColor: downloaded ? '#10B981' : undefined
            }}
          >
            {downloaded ? (
              <>
                <Check size={18} /> Downloaded
              </>
            ) : (
              <>
                <Download size={18} /> Download Card
              </>
            )}
          </button>

          <button 
            onClick={handleCopyToClipboard}
            disabled={!replyText.trim() || isExporting}
            className="btn-black"
            style={{
              flex: 1,
              padding: '14px',
              fontSize: '0.95rem',
              gap: '8px',
              opacity: !replyText.trim() ? 0.5 : 1,
              cursor: !replyText.trim() ? 'not-allowed' : 'pointer',
              backgroundColor: copied ? '#10B981' : '#151A26',
              border: '1px solid #262F42',
              color: '#FFFFFF'
            }}
          >
            {copied ? (
              <>
                <Check size={18} /> Copied!
              </>
            ) : (
              <>
                <Copy size={18} /> Copy Image
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
