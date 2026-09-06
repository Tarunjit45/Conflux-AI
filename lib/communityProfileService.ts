// Conflux Platform — Community Profile & Social Onboarding Engine
// Implements strict Profile State Machine:
// ONBOARDING_NOT_STARTED -> ONBOARDING_IN_PROGRESS -> PROFILE_INCOMPLETE -> PROFILE_COMPLETE
// Invariant: Anonymous posting is prohibited. Only PROFILE_COMPLETE users can publish updates.

export type CommunityProfileState =
  | 'ONBOARDING_NOT_STARTED'
  | 'ONBOARDING_IN_PROGRESS'
  | 'PROFILE_INCOMPLETE'
  | 'PROFILE_COMPLETE';

export interface CommunityProfile {
  id: string;
  name: string;
  photoUrl: string; // Genuine photo (data URL or hosted image URL)
  locality: string; // Connected Ranaghat neighborhood
  interests: string[]; // What do you know about?
  goals: string[]; // What brings you here?
  bio: string; // Short bio
  status: CommunityProfileState;
  createdAt: string;
  updatedAt: string;
}

export const COMMUNITY_PROFILE_STORAGE_KEY = 'conflux_community_profile_v1';

export const BANNED_NAMES = [
  'test user',
  'demo user',
  'ranaghat resident',
  'john doe',
  'jane doe',
  'admin',
  'administrator',
  'community member',
  'local resident',
  'guest',
  'guest user',
  'anonymous',
  'user',
  'test',
  'demo',
  'asdf',
  'someone',
  'nobody',
  'moderator',
  'null',
  'undefined'
];

export const RANAGHAT_NEIGHBORHOODS = [
  'Station Road',
  'Rathtala',
  'Subhas Avenue',
  'College Para',
  'Biswaspara',
  'Anandanagar',
  'Habibpur',
  'Payradanga',
  'Churni Ghat',
  'Court Area'
];

export const COMMUNITY_TOPICS = [
  { id: 'businesses', label: 'Local Businesses & Shops', icon: '🏪' },
  { id: 'transit', label: 'Transit & Sealdah Trains', icon: '🚆' },
  { id: 'roads', label: 'Roads & Traffic Notices', icon: '🚧' },
  { id: 'jobs', label: 'Jobs & Local Hiring', icon: '💼' },
  { id: 'education', label: 'Education & Schools', icon: '🏫' },
  { id: 'markets', label: 'Food, Markets & Haats', icon: '🥬' },
  { id: 'civic', label: 'Civic & Utilities (Power/Water)', icon: '⚡' },
  { id: 'events', label: 'Local Events & Festivals', icon: '🎪' },
  { id: 'healthcare', label: 'Healthcare & Pharmacies', icon: '🩺' },
  { id: 'places', label: 'Neighborhood Information', icon: '📍' }
];

export const COMMUNITY_GOALS = [
  { id: 'share_updates', label: 'Share real-time local updates and transit notices', icon: '📢' },
  { id: 'find_services', label: 'Find trusted local businesses and services', icon: '🔍' },
  { id: 'help_neighbors', label: 'Help neighbors with reliable ground truth', icon: '🤝' },
  { id: 'stay_informed', label: 'Stay informed about Ranaghat news & civic advisories', icon: '📰' }
];

/**
 * Validates whether a given name is a legitimate first and last name.
 * Disallows test, placeholder, or anonymous names.
 */
export function validateRealName(name: string): { valid: boolean; error?: string } {
  const trimmed = (name || '').trim();
  if (!trimmed) {
    return { valid: false, error: 'Please enter your full name.' };
  }
  if (trimmed.length < 3) {
    return { valid: false, error: 'Name must be at least 3 characters long.' };
  }

  const lower = trimmed.toLowerCase();
  for (const banned of BANNED_NAMES) {
    if (lower === banned || lower.startsWith(`${banned} `) || lower.endsWith(` ${banned}`)) {
      return {
        valid: false,
        error: 'Please use your real first and last name. Placeholder, test, or anonymous names are not allowed.'
      };
    }
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length < 2) {
    return {
      valid: false,
      error: 'Please enter both your first and last name (e.g. Rahul Debnath).'
    };
  }

  // Ensure parts are alphabetic characters or common Bengali/Indian name characters
  if (!/^[\p{L}\s.'-]+$/u.test(trimmed)) {
    return {
      valid: false,
      error: 'Name may only contain letters, spaces, hyphens, and periods.'
    };
  }

  return { valid: true };
}

/**
 * Validates that a real user photo is provided.
 * Prohibits auto-generated, placeholder, or empty avatars.
 */
export function validateRealPhoto(photoUrl: string): { valid: boolean; error?: string } {
  const trimmed = (photoUrl || '').trim();
  if (!trimmed) {
    return {
      valid: false,
      error: 'A real profile photo is required to join the local community and post updates.'
    };
  }

  const lower = trimmed.toLowerCase();
  const disallowedServices = [
    'ui-avatars.com',
    'dicebear.com',
    'avatar.iran.liara.run',
    'placeholder.com',
    'via.placeholder.com',
    'gravatar.com/avatar/placeholder',
    'robohash.org'
  ];

  if (disallowedServices.some(svc => lower.includes(svc))) {
    return {
      valid: false,
      error: 'Generated or placeholder avatars are not permitted. Please upload a real photo.'
    };
  }

  // Must either be a valid Data URL (uploaded from file input) or a valid HTTP/HTTPS image URL
  if (trimmed.startsWith('data:image/')) {
    return { valid: true };
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return { valid: true };
  }

  return {
    valid: false,
    error: 'Please upload an image file or provide a valid image URL.'
  };
}

/**
 * Checks if a profile has reached PROFILE_COMPLETE status with all required fields satisfied.
 */
export function isProfileComplete(profile: CommunityProfile | null): boolean {
  if (!profile) return false;
  if (profile.status !== 'PROFILE_COMPLETE') return false;

  const nameVal = validateRealName(profile.name);
  if (!nameVal.valid) return false;

  const photoVal = validateRealPhoto(profile.photoUrl);
  if (!photoVal.valid) return false;

  if (!profile.locality || profile.locality.trim().length < 2) return false;
  if (!Array.isArray(profile.interests) || profile.interests.length === 0) return false;

  return true;
}

class CommunityProfileService {
  private cachedProfile: CommunityProfile | null = null;

  constructor() {
    this.hydrate();
  }

  private hydrate(): CommunityProfile | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(COMMUNITY_PROFILE_STORAGE_KEY);
      if (raw) {
        this.cachedProfile = JSON.parse(raw);
        return this.cachedProfile;
      }
    } catch {
      this.cachedProfile = null;
    }
    return null;
  }

  getCommunityProfile(): CommunityProfile | null {
    if (!this.cachedProfile) {
      this.hydrate();
    }
    return this.cachedProfile;
  }

  getProfileState(): CommunityProfileState {
    const profile = this.getCommunityProfile();
    if (!profile) return 'ONBOARDING_NOT_STARTED';
    if (isProfileComplete(profile)) return 'PROFILE_COMPLETE';
    return profile.status || 'PROFILE_INCOMPLETE';
  }

  saveCommunityProfile(data: Partial<CommunityProfile>): CommunityProfile {
    const existing = this.getCommunityProfile();
    const now = new Date().toISOString();

    const id = existing?.id || data.id || `usr_ranaghat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const name = data.name !== undefined ? data.name.trim() : (existing?.name || '');
    const photoUrl = data.photoUrl !== undefined ? data.photoUrl.trim() : (existing?.photoUrl || '');
    const locality = data.locality !== undefined ? data.locality.trim() : (existing?.locality || 'Ranaghat');
    const interests = data.interests || existing?.interests || [];
    const goals = data.goals || existing?.goals || [];
    const bio = data.bio !== undefined ? data.bio.trim() : (existing?.bio || '');

    // Determine state
    let status: CommunityProfileState = data.status || existing?.status || 'ONBOARDING_IN_PROGRESS';
    const nameCheck = validateRealName(name);
    const photoCheck = validateRealPhoto(photoUrl);

    if (data.status === 'PROFILE_COMPLETE') {
      if (nameCheck.valid && photoCheck.valid && locality.length >= 2 && interests.length > 0) {
        status = 'PROFILE_COMPLETE';
      } else {
        status = 'PROFILE_INCOMPLETE';
      }
    }

    const updated: CommunityProfile = {
      id,
      name,
      photoUrl,
      locality,
      interests,
      goals,
      bio,
      status,
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };

    this.cachedProfile = updated;

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(COMMUNITY_PROFILE_STORAGE_KEY, JSON.stringify(updated));
        localStorage.setItem('conflux_local_user_id', id);
      } catch (err) {
        console.warn('[CommunityProfileService] Failed to persist profile to localStorage:', err);
      }
    }

    return updated;
  }

  clearCommunityProfile(): void {
    this.cachedProfile = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(COMMUNITY_PROFILE_STORAGE_KEY);
    }
  }
}

export const communityProfileService = new CommunityProfileService();
