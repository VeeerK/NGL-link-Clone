import { supabase, isLiveBackend } from './supabase';
import type { VisitorMetadata } from './metadata';

export interface UserProfile {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  theme: string;
  moderationEnabled: boolean;
  blockedWords: string[];
  premiumActive: boolean;
  isAdmin: boolean; // Add admin support
  userId?: string;  // Link to Supabase Auth
}

export interface AnonymousMessage {
  id: string;
  content: string;
  timestamp: number;
  isRead: boolean;
  replyText?: string;
  replyTimestamp?: number;
  
  // Sender attribution
  senderVisitorId: string;
  senderType: 'anonymous' | 'registered_later' | 'authenticated';
  senderUsername?: string;
  
  // Analytics metadata
  browser?: string;
  os?: string;
  deviceType?: string;
  screenResolution?: string;
  language?: string;
  timezone?: string;
  referrer?: string;
  city?: string;
  region?: string;
  country?: string;
  isp?: string;
  visitCount?: number;
  
  recipientUsername?: string;
}

const PROFILE_KEY = 'ngl_user_profile';
const MESSAGES_KEY = 'ngl_messages';

const PRESET_DICE_PROMPTS = [
  "who's your crush??",
  "ur rlly cute",
  "james has a crush on u",
  "got a sneaky link?",
  "who's your best friend?",
  "tell me a secret nobody else knows",
  "what is your biggest regret in life?",
  "would you date the last person you texted?",
  "what's your honest opinion of me?",
  "if you could swap lives with anyone for a day, who?",
  "what is the weirdest habit you have?",
  "send a selfie or else..."
];

// Mapping Adapters (PostgreSQL snake_case to JS camelCase)
const mapProfileFromDb = (dbProfile: any): UserProfile => ({
  username: dbProfile.username,
  displayName: dbProfile.display_name,
  bio: dbProfile.bio || '',
  avatarUrl: dbProfile.avatar_url || 'fox',
  theme: dbProfile.theme || 'ngl-default',
  moderationEnabled: dbProfile.moderation_enabled ?? true,
  blockedWords: dbProfile.blocked_words || [],
  premiumActive: dbProfile.premium_active ?? false,
  isAdmin: dbProfile.is_admin ?? false,
  userId: dbProfile.user_id || undefined
});

const mapProfileToDb = (profile: UserProfile) => ({
  username: profile.username.toLowerCase().trim(),
  display_name: profile.displayName,
  bio: profile.bio,
  avatar_url: profile.avatarUrl,
  theme: profile.theme,
  moderation_enabled: profile.moderationEnabled,
  blocked_words: profile.blockedWords,
  premium_active: profile.premiumActive,
  is_admin: profile.isAdmin,
  user_id: profile.userId || null
});

const mapMessageFromDb = (dbMsg: any): AnonymousMessage => ({
  id: dbMsg.id,
  content: dbMsg.content,
  timestamp: Number(dbMsg.timestamp),
  isRead: dbMsg.is_read ?? false,
  replyText: dbMsg.reply_text || undefined,
  replyTimestamp: dbMsg.reply_timestamp ? Number(dbMsg.reply_timestamp) : undefined,
  
  // Attribution
  senderVisitorId: dbMsg.sender_visitor_id,
  senderType: dbMsg.sender_type || 'anonymous',
  senderUsername: dbMsg.sender_username || undefined,
  
  // Metadata
  browser: dbMsg.browser || undefined,
  os: dbMsg.os || undefined,
  deviceType: dbMsg.device_type || undefined,
  screenResolution: dbMsg.screen_resolution || undefined,
  language: dbMsg.language || undefined,
  timezone: dbMsg.timezone || undefined,
  referrer: dbMsg.referrer || undefined,
  city: dbMsg.city || undefined,
  region: dbMsg.region || undefined,
  country: dbMsg.country || undefined,
  isp: dbMsg.isp || undefined,
  visitCount: dbMsg.visit_count ? Number(dbMsg.visit_count) : undefined,
  
  recipientUsername: dbMsg.recipient_username
});

// Local fallback implementations
const getLocalProfile = (): UserProfile | null => {
  const profileStr = localStorage.getItem(PROFILE_KEY);
  if (!profileStr) return null;
  try {
    return JSON.parse(profileStr);
  } catch {
    return null;
  }
};

const getLocalMessages = (): AnonymousMessage[] => {
  const messagesStr = localStorage.getItem(MESSAGES_KEY);
  if (!messagesStr) {
    // Return empty array instead of seeding mock questions (Requirement: start empty)
    return [];
  }
  try {
    return JSON.parse(messagesStr);
  } catch {
    return [];
  }
};

// Async Unified Database Actions
export const getProfile = async (usernameParam?: string): Promise<UserProfile | null> => {
  if (isLiveBackend && supabase) {
    try {
      // 1. If usernameParam is provided, look it up directly (public lookup)
      if (usernameParam) {
        const { data, error } = await supabase
          .from('profiles')
          .select()
          .eq('username', usernameParam.toLowerCase().trim())
          .maybeSingle();

        if (error) throw error;
        return data ? mapProfileFromDb(data) : null;
      }
      
      // 2. Otherwise, check active authenticated session
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select()
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          const profile = mapProfileFromDb(data);
          localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
          return profile;
        }
      }
      
      // 3. Fallback to local profile
      return getLocalProfile();
    } catch (error) {
      console.error("Supabase getProfile failed:", error);
      return getLocalProfile();
    }
  }
  return getLocalProfile();
};

export const saveProfile = async (profile: UserProfile): Promise<void> => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  
  if (isLiveBackend && supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const updatedProfile = {
        ...profile,
        userId: user ? user.id : profile.userId
      };
      
      const { error } = await supabase
        .from('profiles')
        .upsert(mapProfileToDb(updatedProfile));

      if (error) throw error;
      console.log("⚡ Profile updated in Supabase.");
    } catch (error) {
      console.error("Supabase saveProfile failed:", error);
    }
  }
};

export const clearProfile = async (): Promise<void> => {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(MESSAGES_KEY);
  if (isLiveBackend && supabase) {
    try {
      await supabase.auth.signOut();
      console.log("⚡ Logged out from Supabase Auth.");
    } catch (err) {
      console.error("Supabase signOut failed:", err);
    }
  }
};

export const getMessages = async (usernameParam?: string): Promise<AnonymousMessage[]> => {
  if (isLiveBackend && supabase) {
    try {
      const activeUser = usernameParam || getLocalProfile()?.username;
      if (!activeUser) return [];

      const { data, error } = await supabase
        .from('messages')
        .select()
        .eq('recipient_username', activeUser.toLowerCase().trim())
        .order('timestamp', { ascending: false });

      if (error) throw error;
      
      // Return list (inboxes are empty by default, no seeding logic)
      return (data || []).map(mapMessageFromDb);
    } catch (error) {
      console.error("Supabase getMessages failed:", error);
      return getLocalMessages();
    }
  }
  return getLocalMessages();
};

export const addMessage = async (
  content: string, 
  recipientUsername: string,
  metadata: VisitorMetadata,
  senderUsername?: string
): Promise<AnonymousMessage> => {
  const timestamp = Date.now();
  const newMsgId = `msg-${Math.random().toString(36).substr(2, 9)}`;
  const senderType = senderUsername ? 'authenticated' : 'anonymous';

  const newMsgDb = {
    id: newMsgId,
    content,
    timestamp,
    is_read: false,
    
    // Attribution
    sender_visitor_id: metadata.visitorId,
    sender_type: senderType,
    sender_username: senderUsername?.toLowerCase().trim() || null,
    
    // Metadata
    browser: metadata.browser,
    os: metadata.os,
    device_type: metadata.deviceType,
    screen_resolution: metadata.screenResolution,
    language: metadata.language,
    timezone: metadata.timezone,
    referrer: metadata.referrer,
    city: metadata.city,
    region: metadata.region,
    country: metadata.country,
    isp: metadata.isp,
    visit_count: metadata.visitCount,
    
    recipient_username: recipientUsername.toLowerCase().trim()
  };

  if (isLiveBackend && supabase) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert(newMsgDb)
        .select()
        .single();

      if (error) throw error;
      return mapMessageFromDb(data);
    } catch (error) {
      console.error("Supabase addMessage failed:", error);
    }
  }

  // Local Storage Fallback
  const messages = getLocalMessages();
  const localMsg: AnonymousMessage = {
    id: newMsgId,
    content,
    timestamp,
    isRead: false,
    
    senderVisitorId: metadata.visitorId,
    senderType,
    senderUsername,
    
    browser: metadata.browser,
    os: metadata.os,
    deviceType: metadata.deviceType,
    screenResolution: metadata.screenResolution,
    language: metadata.language,
    timezone: metadata.timezone,
    referrer: metadata.referrer,
    city: metadata.city,
    region: metadata.region,
    country: metadata.country,
    isp: metadata.isp,
    visitCount: metadata.visitCount,
    
    recipientUsername
  };
  messages.unshift(localMsg);
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  return localMsg;
};

/**
 * Visitor Attribution System:
 * Automatically associates previously sent messages from the current visitor ID 
 * to their newly created/logged-in username slug.
 */
export const associateSentMessagesToAccount = async (
  username: string, 
  visitorId: string
): Promise<void> => {
  const targetUsername = username.toLowerCase().trim();

  if (isLiveBackend && supabase) {
    try {
      // Query messages sent by this visitor that are still anonymous, and link them
      const { error } = await supabase
        .from('messages')
        .update({ 
          sender_username: targetUsername, 
          sender_type: 'registered_later' 
        })
        .eq('sender_visitor_id', visitorId)
        .eq('sender_type', 'anonymous');

      if (error) throw error;
      console.log(`⚡ Linked previous messages for visitor ${visitorId} to account @${targetUsername}.`);
    } catch (error) {
      console.error("Supabase associateSentMessagesToAccount failed:", error);
    }
  }

  // Local Storage Fallback Sync
  try {
    const messages = getLocalMessages();
    const updated = messages.map(msg => {
      if (msg.senderVisitorId === visitorId && msg.senderType === 'anonymous') {
        return {
          ...msg,
          senderUsername: targetUsername,
          senderType: 'registered_later' as const
        };
      }
      return msg;
    });
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Local storage attribution linking failed:", err);
  }
};

export const markMessageAsRead = async (id: string): Promise<void> => {
  if (isLiveBackend && supabase) {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      return;
    } catch (error) {
      console.error("Supabase markMessageAsRead failed:", error);
    }
  }

  // Local fallback
  const messages = getLocalMessages();
  const updated = messages.map(msg => msg.id === id ? { ...msg, isRead: true } : msg);
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(updated));
};

export const deleteMessage = async (id: string): Promise<void> => {
  if (isLiveBackend && supabase) {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return;
    } catch (error) {
      console.error("Supabase deleteMessage failed:", error);
    }
  }

  // Local fallback
  const messages = getLocalMessages();
  const updated = messages.filter(msg => msg.id !== id);
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(updated));
};

export const addReply = async (id: string, replyText: string): Promise<void> => {
  if (isLiveBackend && supabase) {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ 
          reply_text: replyText, 
          reply_timestamp: Date.now(),
          is_read: true 
        })
        .eq('id', id);

      if (error) throw error;
      return;
    } catch (error) {
      console.error("Supabase addReply failed:", error);
    }
  }

  // Local fallback
  const messages = getLocalMessages();
  const updated = messages.map(msg => 
    msg.id === id 
      ? { ...msg, replyText, replyTimestamp: Date.now(), isRead: true } 
      : msg
  );
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(updated));
};

export const getRandomDicePrompt = (): string => {
  return PRESET_DICE_PROMPTS[Math.floor(Math.random() * PRESET_DICE_PROMPTS.length)];
};
