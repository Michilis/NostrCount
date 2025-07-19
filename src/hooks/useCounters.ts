import { useState, useEffect, useCallback } from 'react';
import { NDKEvent, NDKFilter } from '@nostr-dev-kit/ndk';
import { useNDK } from '../contexts/NDKContext';
import { eventToCounter, getCounterFilter, deriveCounterType, isValidCounterEvent } from '../utils/nostr';
import type { Counter, CounterFormData } from '../types';

export function useCounters(pubkey?: string, isPublic?: boolean) {
  const { ndk } = useNDK();
  const [counters, setCounters] = useState<Counter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const fetchCounters = useCallback(async () => {
    console.log('useCounters: fetchCounters called', { pubkey, isPublic, ndk: !!ndk });
    
    if (!ndk) {
      console.log('useCounters: NDK not initialized, skipping fetch');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First, fetch deletion events (kind 5) to know which events are deleted
      const deletionFilter: NDKFilter = {
        kinds: [5],
        limit: 100,
      };
      
      if (pubkey) {
        deletionFilter.authors = [pubkey];
      }

      console.log('useCounters: Fetching deletion events...');
      const deletionEvents = await ndk.fetchEvents(deletionFilter);
      console.log('useCounters: Fetched deletion events:', deletionEvents.size);
      
      // Extract deleted event IDs from kind 5 events
      const deletedIds = new Set<string>();
      for (const event of deletionEvents) {
        for (const tag of event.tags) {
          if (tag[0] === 'a' && tag[1]) {
            // Extract event ID from 'a' tag (format: "30078:eventId")
            const parts = tag[1].split(':');
            if (parts.length === 2 && parts[0] === '30078') {
              deletedIds.add(parts[1]);
            }
          }
        }
      }
      

      console.log('useCounters: Deleted event IDs:', Array.from(deletedIds));

      const filter = getCounterFilter(pubkey, isPublic);
      console.log('useCounters: Using filter:', filter);

      console.log('useCounters: Fetching counter events...');
      const events = await ndk.fetchEvents(filter);
      console.log('useCounters: Fetched events:', events.size);
      
      const counterList: Counter[] = [];
      
      for (const event of events) {
        console.log('useCounters: Processing event:', event.id);
        
        // Skip if this event is marked as deleted
        if (deletedIds.has(event.id)) {
          console.log('useCounters: Skipping deleted event:', event.id);
          continue;
        }
        
        // First check if this looks like a valid counter event
        // Pass requirePublic=true if we're fetching public counters
        if (!isValidCounterEvent(event, isPublic)) {
          console.log('useCounters: Skipping invalid counter event:', event.id);
          continue;
        }
        
        const counter = eventToCounter(event, isPublic);
        if (counter) {
          console.log('useCounters: Valid counter found:', counter.title);
          counterList.push(counter);
        } else {
          console.log('useCounters: Invalid counter event:', event.id);
        }
      }

      console.log('useCounters: Total valid counters:', counterList.length);

      // Sort by creation date (newest first)
      counterList.sort((a, b) => b.createdAt - a.createdAt);
      
      setCounters(counterList);
    } catch (err) {
      console.error('useCounters: Error fetching counters:', err);
      setError('Failed to fetch counters');
    } finally {
      setLoading(false);
    }
  }, [ndk, pubkey, isPublic]);

  useEffect(() => {
    console.log('useCounters: useEffect triggered', { pubkey, isPublic, ndk: !!ndk });
    fetchCounters();
  }, [fetchCounters]);

  const refetch = useCallback(() => {
    console.log('useCounters: Manual refetch triggered');
    fetchCounters();
  }, [fetchCounters]);

  return {
    counters,
    loading,
    error,
    refetch,
  };
}

export function useCounter(slug: string) {
  const { ndk } = useNDK();
  const [counter, setCounter] = useState<Counter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCounter = async () => {
      if (!ndk || !slug) return;

      try {
        setLoading(true);
        setError(null);

        const filter: NDKFilter = {
          kinds: [30078],
          ids: [slug],
        };

        const events = await ndk.fetchEvents(filter);
        
        if (events.size === 0) {
          setError('Counter not found');
          return;
        }

        // Get the most recent event (in case of duplicates)
        const sortedEvents = Array.from(events).sort((a, b) => b.created_at! - a.created_at!);
        const latestEvent = sortedEvents[0];
        
        const counterData = eventToCounter(latestEvent);
        
        if (counterData) {
          setCounter(counterData);
        } else {
          setError('Invalid counter data');
        }
      } catch (err) {
        console.error('Error fetching counter:', err);
        setError('Failed to fetch counter');
      } finally {
        setLoading(false);
      }
    };

    fetchCounter();
  }, [ndk, slug]);

  return {
    counter,
    loading,
    error,
  };
}

export function useCreateCounter() {
  const { ndk, user } = useNDK();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCounter = async (formData: CounterFormData) => {
    if (!ndk || !user) {
      throw new Error('NDK not initialized or user not logged in');
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Creating counter with form data:', formData);

      // Auto-derive the type from the date
      const derivedType = deriveCounterType(formData.date);
      console.log('Derived type from date:', derivedType);

      // Create event data
      const eventData = {
        kind: 30078,
        content: '',
        tags: [
          ['type', derivedType],
          ['title', formData.title],
          ['date', formData.date],
          ['visibility', formData.visibility],
        ],
        created_at: Math.floor(Date.now() / 1000),
        pubkey: user.pubkey,
      };

      console.log('Event data:', eventData);

      // Create NDK event
      const event = new NDKEvent(ndk, eventData);
      console.log('NDK event created:', event);

      console.log('Signing event...');
      await event.sign();
      console.log('Event signed successfully');

      console.log('Publishing event...');
      await event.publish();
      console.log('Event published successfully');

      // Convert to Counter object
      const counter = eventToCounter(event);
      if (!counter) {
        throw new Error('Failed to parse created counter');
      }

      console.log('Counter created successfully:', counter);
      return counter;
    } catch (err) {
      console.error('Error creating counter:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create counter';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createCounter,
    loading,
    error,
  };
}

export function useDeleteCounter() {
  const { publishEvent } = useNDK();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteCounter = async (slug: string) => {
    try {
      setLoading(true);
      setError(null);

      // Create a deletion event (NIP-09)
      const eventData = {
        kind: 5,
        content: 'Deleted counter',
        tags: [
          ['a', `30078:${slug}`],
        ],
        created_at: Math.floor(Date.now() / 1000),
      };

      const event = await publishEvent(eventData);
      return event;
    } catch (err) {
      console.error('Error deleting counter:', err);
      setError('Failed to delete counter');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteCounter,
    loading,
    error,
  };
} 