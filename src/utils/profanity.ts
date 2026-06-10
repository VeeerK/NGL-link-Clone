const PROFANITY_LIST = [
  "abuse",
  "asshole",
  "bitch",
  "bastard",
  "crap",
  "cunt",
  "dick",
  "fuck",
  "fucker",
  "motherfucker",
  "idiot",
  "loser",
  "nigger",
  "pussy",
  "retard",
  "shit",
  "slut",
  "whore",
  "hate"
];

/**
 * Checks if a string contains any profanity.
 */
export const containsProfanity = (text: string, customWords: string[] = []): boolean => {
  const normalized = text.toLowerCase();
  const allWords = [...PROFANITY_LIST, ...customWords];
  
  return allWords.some(word => {
    const regex = new RegExp(`\\b${word}\\b|${word}`, 'i');
    return regex.test(normalized);
  });
};

/**
 * Sanitizes bad words in a string by replacing them with asterisks.
 */
export const sanitizeText = (text: string, customWords: string[] = []): string => {
  let sanitized = text;
  const allWords = [...PROFANITY_LIST, ...customWords];
  
  allWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b|${word}`, 'gi');
    sanitized = sanitized.replace(regex, (match) => '*'.repeat(match.length));
  });
  
  return sanitized;
};
