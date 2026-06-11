import { useState, useEffect } from 'react';
import { Onboarding } from './views/Onboarding';
import { Dashboard } from './views/Dashboard';
import { PublicSendPage } from './views/PublicSendPage';
import { MessageDetail } from './views/MessageDetail';
import { ReplyGenerator } from './views/ReplyGenerator';
import { SettingsView } from './views/Settings';
import type { UserProfile, AnonymousMessage } from './utils/storage';
import { getProfile, getMessages, addMessage, associateSentMessagesToAccount } from './utils/storage';
import { getOrCreateVisitorId, collectVisitorMetadata } from './utils/metadata';
import { supabase } from './utils/supabase';



export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<AnonymousMessage[]>([]);
  const [currentHash, setCurrentHash] = useState(window.location.hash);
  const [isLoading, setIsLoading] = useState(true);
  const [adminDebugMode, setAdminDebugMode] = useState(false);
  
  // Navigation overlays
  const [selectedMessage, setSelectedMessage] = useState<AnonymousMessage | null>(null);
  const [replyMessage, setReplyMessage] = useState<AnonymousMessage | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const loadedProfile = await getProfile();
        setProfile(loadedProfile);
        
        if (loadedProfile) {
          const loadedMessages = await getMessages(loadedProfile.username);
          setMessages(loadedMessages);
        }
      } catch (err) {
        console.error("Failed to load initial data", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();

    // Listen to Supabase Auth State changes (Persisted session handler)
    let authSubscription: any = null;
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, _session: any) => {
        console.log(`🔑 Supabase Auth Event: ${event}`);
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          try {
            const loadedProfile = await getProfile();
            setProfile(loadedProfile);
            if (loadedProfile) {
              const msgs = await getMessages(loadedProfile.username);
              setMessages(msgs);
            }
          } catch (err) {
            console.error("Failed to sync profile after sign in event:", err);
          }
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setMessages([]);
        }
      });
      authSubscription = subscription;
    }

    // Listen to hash routes
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);

    // Listen to Ctrl + Alt + A for admin debug console toggle
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a') {
        const activeProfileStr = localStorage.getItem('ngl_user_profile');
        if (activeProfileStr) {
          try {
            const activeProfile = JSON.parse(activeProfileStr);
            if (activeProfile.isAdmin) {
              setAdminDebugMode(prev => {
                const next = !prev;
                
                // Show floating notification
                const toast = document.createElement('div');
                toast.innerText = next ? "Admin Debug Console: ACTIVE 🛠️" : "Admin Debug Console: INACTIVE";
                toast.style.position = 'fixed';
                toast.style.bottom = '30px';
                toast.style.left = '50%';
                toast.style.transform = 'translateX(-50%)';
                toast.style.backgroundColor = next ? '#0284c7' : '#334155';
                toast.style.color = '#FFFFFF';
                toast.style.padding = '8px 18px';
                toast.style.borderRadius = '20px';
                toast.style.fontSize = '0.85rem';
                toast.style.fontWeight = 'bold';
                toast.style.zIndex = '99999';
                toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                toast.style.animation = 'fadeInUp 0.2s ease-out';
                document.body.appendChild(toast);
                
                setTimeout(() => {
                  toast.remove();
                }, 1500);
                
                return next;
              });
            }
          } catch (err) {
            console.error(err);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('keydown', handleKeyDown);
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  // Sync messages helper when updated
  const refreshMessages = async (usernameParam?: string) => {
    const targetUser = usernameParam || profile?.username;
    if (targetUser) {
      const msgs = await getMessages(targetUser);
      setMessages(msgs);
    }
  };

  const handleOnboardingComplete = async (newProfile: UserProfile) => {
    setIsLoading(true);
    setProfile(newProfile);
    
    // Visitor Attribution System: Link previous messages sent as visitor to this username
    const visitorId = getOrCreateVisitorId();
    await associateSentMessagesToAccount(newProfile.username, visitorId);

    window.location.hash = '#/';
    await refreshMessages(newProfile.username);
    setIsLoading(false);
  };

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  const handleInjectMockMessage = async () => {
    if (!profile) return;
    
    // Get random prompts
    const prompts = [
      "what's your biggest crush right now?? 🤐",
      "ur rlly cute. let's hang out? 👀",
      "tell me a secret you've never told anyone else",
      "would you date the last person you texted?",
      "are you single right now? asking for a friend...",
      "what is the most embarrassing thing you did this week?",
      "what's your honest opinion of me?"
    ];
    const randPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    const metadata = await collectVisitorMetadata(profile.username);
    await addMessage(randPrompt, profile.username, metadata);
    await refreshMessages();
  };

  const handleDeleteMessage = async (_id: string) => {
    setSelectedMessage(null);
    await refreshMessages();
  };

  const handleSaveReply = async (_updatedMsg: AnonymousMessage) => {
    setReplyMessage(null);
    setSelectedMessage(null);
    await refreshMessages();
  };

  // Route Parser
  const getRenderView = () => {
    const hash = currentHash;

    // 1. Send Q&A page route: #/user/[username]
    if (hash.startsWith('#/user/')) {
      const username = hash.replace('#/user/', '');
      return (
        <PublicSendPage 
          username={username}
          onGetYourOwn={() => {
            window.location.hash = '#/';
          }}
        />
      );
    }

    // 2. Main app flow
    if (isLoading) {
      return (
        <div style={{ background: 'var(--ngl-gradient-radial)', minHeight: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#FFFFFF' }}>
          <p style={{ fontWeight: 700, fontSize: '1.2rem', letterSpacing: '0.5px' }}>checking inbox...</p>
        </div>
      );
    }

    if (!profile) {
      return <Onboarding onComplete={handleOnboardingComplete} />;
    }

    // Default: Dashboard (Play/Inbox tabs)
    return (
      <Dashboard
        profile={profile}
        messages={messages}
        onOpenSettings={() => setShowSettings(true)}
        onOpenMessage={(msg) => setSelectedMessage(msg)}
      />
    );
  };

  return (
    <div className="app-container">
      {/* Dynamic View Router */}
      <div className="view-wrapper">
        {getRenderView()}

        {/* Settings Overlay View */}
        {profile && showSettings && (
          <SettingsView
            profile={profile}
            onClose={() => setShowSettings(false)}
            onUpdateProfile={handleUpdateProfile}
            onAddSimulatedMessage={handleInjectMockMessage}
          />
        )}

        {/* Message Detail Overlay View */}
        {selectedMessage && (
          <MessageDetail
            message={selectedMessage}
            onClose={() => setSelectedMessage(null)}
            onReply={(msg) => setReplyMessage(msg)}
            onDelete={handleDeleteMessage}
            adminDebugMode={adminDebugMode}
          />
        )}

        {/* Reply Card Generator Overlay View */}
        {profile && replyMessage && (
          <ReplyGenerator
            message={replyMessage}
            profile={profile}
            onBack={() => setReplyMessage(null)}
            onSaveReply={handleSaveReply}
          />
        )}
      </div>
    </div>
  );
}
