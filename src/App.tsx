import { useState, useEffect } from 'react';
import { Onboarding } from './views/Onboarding';
import { Dashboard } from './views/Dashboard';
import { PublicSendPage } from './views/PublicSendPage';
import { MessageDetail } from './views/MessageDetail';
import { ReplyGenerator } from './views/ReplyGenerator';
import { SettingsView } from './views/Settings';
import type { UserProfile, AnonymousMessage } from './utils/storage';
import { getProfile, getMessages, addMessage } from './utils/storage';

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<AnonymousMessage[]>([]);
  const [currentHash, setCurrentHash] = useState(window.location.hash);
  const [isLoading, setIsLoading] = useState(true);
  
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

    // Listen to hash routes
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
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
    await addMessage(randPrompt, profile.username);
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
