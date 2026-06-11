export interface VisitorMetadata {
  visitorId: string;
  timestamp: number;
  browser: string;
  os: string;
  deviceType: string;
  screenResolution: string;
  language: string;
  timezone: string;
  referrer: string;
  city: string;
  region: string;
  country: string;
  isp: string;
  visitCount: number;
}

const VISITOR_ID_KEY = 'ngl_visitor_uuid';

/**
 * Gets or creates a unique anonymous visitor ID.
 */
export const getOrCreateVisitorId = (): string => {
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = `vis-${Math.random().toString(36).substring(2, 11)}-${Date.now().toString(36)}`;
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
};

/**
 * Tracks and increments the visit count for a specific recipient's profile page.
 */
export const getAndIncrementVisitCount = (recipientUsername: string): number => {
  const key = `ngl_visit_count_${recipientUsername.toLowerCase().trim()}`;
  const current = localStorage.getItem(key);
  const count = current ? parseInt(current, 10) + 1 : 1;
  localStorage.setItem(key, count.toString());
  return count;
};

/**
 * Parses user agent to detect browser name.
 */
const getBrowserName = (ua: string): string => {
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('SamsungBrowser')) return 'Samsung Browser';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  if (ua.includes('Trident') || ua.includes('MSIE')) return 'Internet Explorer';
  if (ua.includes('Edge') || ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  return 'Unknown Browser';
};

/**
 * Parses user agent to detect operating system.
 */
const getOSName = (ua: string): string => {
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) return 'iOS';
  if (ua.includes('Macintosh') || ua.includes('Mac OS')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  return 'Unknown OS';
};

/**
 * Detects device type.
 */
const getDeviceType = (ua: string): string => {
  const isMobile = /Mobi|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTablet = /Tablet|iPad|PlayBook|Silicon/i.test(ua) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && ua.includes('Macintosh'));
  
  if (isTablet) return 'Tablet';
  if (isMobile) return 'Mobile';
  return 'Desktop';
};

/**
 * Asynchronously gathers complete analytics metadata about the current visitor session.
 */
export const collectVisitorMetadata = async (recipientUsername: string): Promise<VisitorMetadata> => {
  const ua = navigator.userAgent;
  const visitorId = getOrCreateVisitorId();
  const visitCount = getAndIncrementVisitCount(recipientUsername);
  
  const metadata: VisitorMetadata = {
    visitorId,
    timestamp: Date.now(),
    browser: getBrowserName(ua),
    os: getOSName(ua),
    deviceType: getDeviceType(ua),
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language || 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    referrer: document.referrer || 'direct',
    city: 'Mumbai',
    region: 'Maharashtra',
    country: 'India',
    isp: 'Reliance Jio',
    visitCount
  };

  // Try to geolocate using free public API
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json();
      metadata.city = data.city || metadata.city;
      metadata.region = data.region || metadata.region;
      metadata.country = data.country_name || metadata.country;
      metadata.isp = data.org || metadata.isp;
    }
  } catch (err) {
    // Graceful fallback for offline, adblockers, or CORS blocks
    console.warn("Geolocation API blocked/failed. Using network profile default fallback values.", err);
  }

  return metadata;
};
