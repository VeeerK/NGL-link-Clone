import { supabase, isLiveBackend } from './supabase';

export interface UserProfile {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  theme: string;
  moderationEnabled: boolean;
  blockedWords: string[];
  premiumActive: boolean;
}

export interface AnonymousMessage {
  id: string;
  content: string;
  timestamp: number;
  isRead: boolean;
  replyText?: string;
  replyTimestamp?: number;
  deviceInfo?: string;
  locationInfo?: string;
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

const MOCK_MESSAGES: Omit<AnonymousMessage, 'id' | 'timestamp'>[] = [
  {
    content: "Who is your crush?? Tell us now! 🤫",
    isRead: false,
    deviceInfo: "iPhone 15 Pro",
    locationInfo: "London, UK"
  },
  {
    content: "ur rlly cute, let's hang out sometime? 👀",
    isRead: false,
    deviceInfo: "Samsung Galaxy S24",
    locationInfo: "New York, USA"
  },
  {
    content: "got a sneaky link? Be honest!",
    isRead: true,
    replyText: "maybe... wouldn't you like to know? 😉",
    replyTimestamp: Date.now() - 3600000 * 2,
    deviceInfo: "iPhone 14",
    locationInfo: "Paris, France"
  },
  {
    content: "what is a secret you've never told anyone?",
    isRead: false,
    deviceInfo: "Xiaomi 13 Pro",
    locationInfo: "Mumbai, India"
  },
  {
    content: "are you single right now? asking for a friend...",
    isRead: false,
    deviceInfo: "iPhone 13 mini",
    locationInfo: "Sydney, Australia"
  }
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
  premiumActive: dbProfile.premium_active ?? false
});

const mapProfileToDb = (profile: UserProfile) => ({
  username: profile.username.toLowerCase().trim(),
  display_name: profile.displayName,
  bio: profile.bio,
  avatar_url: profile.avatarUrl,
  theme: profile.theme,
  moderation_enabled: profile.moderationEnabled,
  blocked_words: profile.blockedWords,
  premium_active: profile.premiumActive
});

const mapMessageFromDb = (dbMsg: any): AnonymousMessage => ({
  id: dbMsg.id,
  content: dbMsg.content,
  timestamp: Number(dbMsg.timestamp),
  isRead: dbMsg.is_read ?? false,
  replyText: dbMsg.reply_text || undefined,
  replyTimestamp: dbMsg.reply_timestamp ? Number(dbMsg.reply_timestamp) : undefined,
  deviceInfo: dbMsg.device_info || undefined,
  locationInfo: dbMsg.location_info || undefined,
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
    const messages: AnonymousMessage[] = MOCK_MESSAGES.map((msg, index) => ({
      ...msg,
      id: `mock-msg-${index + 1}`,
      timestamp: Date.now() - (index * 3600000 * 4)
    }));
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    return messages;
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
      const targetUser = usernameParam || getLocalProfile()?.username;
      if (!targetUser) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select()
        .eq('username', targetUser.toLowerCase().trim())
        .maybeSingle();

      if (error) throw error;
      if (data) {
        const profile = mapProfileFromDb(data);
        if (!usernameParam) {
          localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
        }
        return profile;
      }
      return null;
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
      const { error } = await supabase
        .from('profiles')
        .upsert(mapProfileToDb(profile));

      if (error) throw error;
      console.log("⚡ Profile updated in Supabase.");
    } catch (error) {
      console.error("Supabase saveProfile failed:", error);
    }
  }
};

export const clearProfile = (): void => {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(MESSAGES_KEY);
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
      
      const fetched = (data || []).map(mapMessageFromDb);
      
      // Seed initial dummy messages inside Supabase if empty and it's our own inbox
      if (fetched.length === 0 && !usernameParam) {
        console.log("⚡ Seeding Supabase mock messages...");
        const seeded = await Promise.all(
          MOCK_MESSAGES.map(async (msg, index) => {
            const added = await addMessage(msg.content, activeUser, msg.deviceInfo, msg.locationInfo);
            return {
              ...added,
              timestamp: Date.now() - (index * 3600000 * 4)
            };
          })
        );
        return seeded;
      }

      return fetched;
    } catch (error) {
      console.error("Supabase getMessages failed:", error);
      return getLocalMessages();
    }
  }
  return getLocalMessages();
};

export const addMessage = async (
  content: string, 
  recipientUsernameParam?: string,
  deviceParam?: string,
  locationParam?: string
): Promise<AnonymousMessage> => {
  const devices = ["iPhone 15 Pro", "iPhone 14 mini", "Samsung Galaxy S24 Ultra", "Google Pixel 8", "OnePlus 12"];
  const locations = ["California, USA", "New Delhi, India", "Toronto, Canada", "Berlin, Germany", "Tokyo, Japan", "London, UK"];
  
  const targetRecipient = recipientUsernameParam || getLocalProfile()?.username || 'admin';
  const finalDevice = deviceParam || devices[Math.floor(Math.random() * devices.length)];
  const finalLocation = locationParam || locations[Math.floor(Math.random() * locations.length)];
  
  const newMsgId = `msg-${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = Date.now();

  const newMsgDb = {
    id: newMsgId,
    content,
    timestamp,
    is_read: false,
    device_info: finalDevice,
    location_info: finalLocation,
    recipient_username: targetRecipient.toLowerCase().trim()
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
    deviceInfo: finalDevice,
    locationInfo: finalLocation,
    recipientUsername: targetRecipient
  };
  messages.unshift(localMsg);
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  return localMsg;
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
