import { NDKEvent, NDKFilter } from '@nostr-dev-kit/ndk';
import type { Counter } from '../types';

export function deriveCounterType(date: string): 'since' | 'until' {
  const today = new Date();
  const targetDate = new Date(date);
  
  // If the date is in the past, it's "since"
  // If the date is in the future, it's "until"
  return targetDate <= today ? 'since' : 'until';
}

export function isValidCounterEvent(event: NDKEvent, requirePublic: boolean = false): boolean {
  // Check if this looks like a NostrCount counter event
  const tags = event.tags;
  
  // Must have the required tags
  const hasType = tags.some(tag => tag[0] === 'type' && (tag[1] === 'since' || tag[1] === 'until'));
  const hasTitle = tags.some(tag => tag[0] === 'title' && tag[1] && tag[1].length > 0);
  const hasDate = tags.some(tag => tag[0] === 'date' && tag[1] && /^\d{4}-\d{2}-\d{2}$/.test(tag[1]));

  
  // Must have at least type, title, and date to be considered a valid counter
  const isValid = hasType && hasTitle && hasDate;
  
  if (!isValid) return false;
  
  // If we require public counters, check visibility
  if (requirePublic) {
    const isPublic = tags.some(tag => tag[0] === 'visibility' && tag[1] === 'public');
    return isPublic;
  }
  
  return true;
}

export function eventToCounter(event: NDKEvent, requirePublic: boolean = false): Counter | null {
  try {
    console.log('Parsing event:', event);
    const tags = event.tags;
    console.log('Event tags:', tags);
    
    // Log each tag individually for debugging
    tags.forEach((tag, index) => {
      console.log(`Tag ${index}:`, tag);
    });
    
    // Try to find tags with different possible structures
    let typeTag = tags.find(tag => tag[0] === 'type')?.[1];
    let titleTag = tags.find(tag => tag[0] === 'title')?.[1];
    let dateTag = tags.find(tag => tag[0] === 'date')?.[1];
    let visibilityTag = tags.find(tag => tag[0] === 'visibility')?.[1];

    // If we don't find the expected tags, try alternative approaches
    if (!typeTag || !titleTag || !dateTag) {
      console.log('Standard tags not found, trying alternative parsing...');
      
      // Look for tags that might contain the data in different formats
      for (const tag of tags) {
        if (tag[0] === 'd' && tag[1]) {
          // Some events might use 'd' tag for title
          if (!titleTag) titleTag = tag[1];
        }
        if (tag[0] === 't' && tag[1]) {
          // Some events might use 't' tag for type
          if (!typeTag) typeTag = tag[1];
        }
      }
      
      // Try to extract from content if it's JSON
      if (event.content && event.content.trim() !== '') {
        try {
          const content = JSON.parse(event.content);
          console.log('Parsed content:', content);
          
          if (!titleTag && content.title) titleTag = content.title;
          if (!typeTag && content.type) typeTag = content.type;
          if (!dateTag && content.date) dateTag = content.date;
          if (!visibilityTag && content.visibility) visibilityTag = content.visibility;
        } catch (e) {
          console.log('Content is not JSON:', event.content);
        }
      }
    }

    console.log('Parsed tags:', { typeTag, titleTag, dateTag, visibilityTag });

    // For a valid counter, we need at least title and date
    if (!titleTag || !dateTag) {
      console.log('Missing required title or date, skipping event');
      return null;
    }
    
    // If we still don't have required fields, try to create a basic counter
    if (!typeTag) {
      typeTag = 'since'; // Default to 'since'
    }
    
    if (!visibilityTag) {
      visibilityTag = 'public'; // Default to public
    }

    if (typeTag !== 'since' && typeTag !== 'until') {
      console.log('Invalid type tag:', typeTag);
      return null;
    }

    if (visibilityTag !== 'public' && visibilityTag !== 'private') {
      console.log('Invalid visibility tag:', visibilityTag);
      return null;
    }

    // Additional validation: check if the date is in a reasonable format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateTag)) {
      console.log('Invalid date format:', dateTag);
      return null;
    }

    // Check if the title is reasonable (not too short or too long)
    if (titleTag.length < 2 || titleTag.length > 100) {
      console.log('Invalid title length:', titleTag.length);
      return null;
    }

    // For public counters, ensure visibility is actually public
    if (requirePublic && visibilityTag !== 'public') {
      console.log('Counter is not public, skipping:', visibilityTag);
      return null;
    }

    const counter = {
      id: event.id,
      title: titleTag,
      date: dateTag,
      type: typeTag as 'since' | 'until',
      visibility: visibilityTag as 'public' | 'private',
      pubkey: event.pubkey,
      createdAt: event.created_at || 0,
      slug: event.id, // Use event ID as slug
    };
    
    console.log('Created counter:', counter);
    return counter;
  } catch (error) {
    console.error('Error parsing counter event:', error);
    return null;
  }
}

export function getCounterFilter(pubkey?: string, isPublic?: boolean): NDKFilter {
  const filter: NDKFilter = {
    kinds: [30078],
    limit: 100, // Limit to 100 events to prevent overwhelming relays
  };

  if (pubkey) {
    filter.authors = [pubkey];
  }

  // For public counters, we'll fetch all kind 30078 events and filter by visibility in the parsing
  // This is more inclusive and will catch events that might not have the visibility tag
  if (isPublic) {
    // Don't filter by visibility tag here - we'll handle it in parsing
    // This allows us to see all counter events and filter them later
  }

  console.log('getCounterFilter: Created filter:', filter, { pubkey, isPublic });
  return filter;
}

export const DEFAULT_RELAYS = [
  'wss://relay.azzamo.net',
  'wss://relay.damus.io',
  'wss://nostr.oxtr.dev',
  'wss://nos.lol',
  'wss://relay.snort.social',
];

export function parseNip05(nip05: string): { name: string; domain: string } | null {
  if (!nip05 || !nip05.includes('@')) return null;
  
  const [name, domain] = nip05.split('@');
  return { name, domain };
}

export function extractLightningAddress(profile: any): string | null {
  if (profile.lud16) return profile.lud16;
  if (profile.lud06) return profile.lud06;
  return null;
}

 