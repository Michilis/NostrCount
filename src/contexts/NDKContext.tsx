import React, { createContext, useContext, useEffect, useState } from 'react';
import NDK, { NDKEvent, NDKUser, NDKSigner, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
import NDKCacheAdapterDexie from '@nostr-dev-kit/ndk-cache-dexie';
import { getPublicKey, nip19 } from 'nostr-tools';
import { DEFAULT_RELAYS } from '../utils/nostr';
import type { UserProfile } from '../types';

interface NDKContextType {
  ndk: NDK | null;
  user: NDKUser | null;
  userProfile: UserProfile | null;
  isConnected: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  loginWithKeys: (npub: string, nsec: string) => Promise<void>;
  loginWithNip55: (url: string) => Promise<void>;
  logout: () => void;
  publishEvent: (event: Partial<NDKEvent>) => Promise<NDKEvent>;
  fetchUserProfile: (pubkey: string) => Promise<UserProfile | null>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const NDKContext = createContext<NDKContextType | null>(null);

export const useNDK = () => {
  const context = useContext(NDKContext);
  if (!context) {
    throw new Error('useNDK must be used within NDKProvider');
  }
  return context;
};

interface NDKProviderProps {
  children: React.ReactNode;
}

export const NDKProvider: React.FC<NDKProviderProps> = ({ children }) => {
  const [ndk, setNdk] = useState<NDK | null>(null);
  const [user, setUser] = useState<NDKUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initNDK = async () => {
      try {
        console.log('Initializing NDK with Dexie cache...');
        
        // Initialize Dexie cache adapter
        const dexieAdapter = new NDKCacheAdapterDexie({ 
          dbName: 'nostrcount-cache' 
        });
        
        const ndkInstance = new NDK({
          explicitRelayUrls: DEFAULT_RELAYS,
          cacheAdapter: dexieAdapter,
        });

        console.log('Connecting to relays...');
        await ndkInstance.connect();
        console.log('NDK connected successfully with cache');
        
        setNdk(ndkInstance);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize NDK:', error);
        setIsLoading(false);
      }
    };

    initNDK();
  }, []);

  const login = async () => {
    if (!ndk) return;

    try {
      setIsLoading(true);
      console.log('Attempting login with NIP-07 extension...');
      
      // Check for NIP-07 extension
      if (window.nostr) {
        console.log('Nostr extension found, getting public key...');
        const pubkey = await window.nostr.getPublicKey();
        console.log('Got public key:', pubkey);
        
        const ndkUser = ndk.getUser({ pubkey });
        
        // Set signer
        ndk.signer = {
          user: async () => ndkUser,
          sign: async (event: NDKEvent) => {
            console.log('Signing event with NIP-07 extension...');
            if (!window.nostr) throw new Error('Nostr extension not available');
            
            // Get the raw event data for signing
            const rawEvent = {
              kind: event.kind,
              created_at: event.created_at || Math.floor(Date.now() / 1000),
              tags: event.tags,
              content: event.content,
              pubkey: event.pubkey,
            };
            
            console.log('Raw event to sign:', rawEvent);
            
            const signedEvent = await window.nostr.signEvent(rawEvent as any);
            console.log('Event signed successfully:', signedEvent);
            
            event.sig = signedEvent.sig;
            return event.sig;
          },
          blockUntilReady: async () => true,
        } as unknown as NDKSigner;

        setUser(ndkUser);
        setIsConnected(true);
        console.log('Login successful with NIP-07');
        
        // Fetch user profile
        const profile = await fetchUserProfile(pubkey);
        setUserProfile(profile);
      } else {
        throw new Error('No Nostr extension found');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithKeys = async (npub: string, nsec: string) => {
    if (!ndk) return;

    try {
      setIsLoading(true);
      console.log('Attempting login with keys...');
      
      let pubkey: string;
      let privateKey: Uint8Array;
      
      // If only nsec is provided, derive the public key
      if (nsec && !npub) {
        try {
          const nsecDecoded = nip19.decode(nsec);
          const privateKeyBytes = nsecDecoded.data as Uint8Array;
          pubkey = getPublicKey(privateKeyBytes);
          privateKey = privateKeyBytes;
          console.log('Derived public key from private key:', pubkey);
        } catch (error) {
          throw new Error('Invalid nsec format');
        }
      } else if (npub && nsec) {
        // Both provided - verify they match
        try {
          const npubDecoded = nip19.decode(npub);
          pubkey = npubDecoded.data as string;
        } catch (error) {
          throw new Error('Invalid npub format');
        }
        
        try {
          const nsecDecoded = nip19.decode(nsec);
          privateKey = nsecDecoded.data as Uint8Array;
        } catch (error) {
          throw new Error('Invalid nsec format');
        }
        
        // Verify the keys match
        const derivedPubkey = getPublicKey(privateKey);
        if (derivedPubkey !== pubkey) {
          throw new Error('Public key does not match private key');
        }
      } else {
        throw new Error('Please provide a valid private key');
      }
      
      console.log('Keys verified successfully');
      const ndkUser = ndk.getUser({ pubkey });
      
      // Set signer using NDKPrivateKeySigner
      // Convert Uint8Array to hex string for NDKPrivateKeySigner
      const privateKeyHex = Array.from(privateKey).map(b => b.toString(16).padStart(2, '0')).join('');
      const signer = new NDKPrivateKeySigner(privateKeyHex);
      ndk.signer = signer;
      console.log('Signer set successfully');

      setUser(ndkUser);
      setIsConnected(true);
      console.log('Login successful with keys');
      
      // Fetch user profile
      const profile = await fetchUserProfile(pubkey);
      setUserProfile(profile);
    } catch (error) {
      console.error('Keys login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithNip55 = async (url: string) => {
    if (!ndk) return;

    try {
      setIsLoading(true);
      console.log('Attempting NIP-55 login with URL:', url);
      
      // TODO: Implement NIP-55 login
      // This would involve:
      // 1. Fetching the NIP-55 JSON from the URL
      // 2. Validating the response
      // 3. Setting up the signer for external signing
      
      throw new Error('NIP-55 login not yet implemented');
    } catch (error) {
      console.error('NIP-55 login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out...');
    setUser(null);
    setUserProfile(null);
    setIsConnected(false);
    if (ndk) {
      ndk.signer = undefined;
    }
  };

  const publishEvent = async (eventData: Partial<NDKEvent>): Promise<NDKEvent> => {
    if (!ndk || !user) {
      throw new Error('NDK not initialized or user not logged in');
    }

    try {
      console.log('Creating NDK event with data:', eventData);
      
      const event = new NDKEvent(ndk, {
        ...eventData,
        pubkey: user.pubkey,
      });

      console.log('Signing event...');
      await event.sign();
      console.log('Event signed successfully');
      
      console.log('Publishing event...');
      await event.publish();
      console.log('Event published successfully');
      
      return event;
    } catch (error) {
      console.error('Error in publishEvent:', error);
      throw error;
    }
  };

  const fetchUserProfile = async (pubkey: string): Promise<UserProfile | null> => {
    if (!ndk) return null;

    try {
      console.log('Fetching user profile for:', pubkey);
      const user = ndk.getUser({ pubkey });
      await user.fetchProfile();
      
      if (user.profile) {
        console.log('User profile fetched:', user.profile);
        return {
          pubkey,
          name: user.profile.name,
          display_name: user.profile.display_name as string | undefined,
          about: user.profile.about,
          picture: user.profile.picture,
          nip05: user.profile.nip05,
          lud16: user.profile.lud16 as string | undefined,
          lud06: user.profile.lud06 as string | undefined,
        };
      }
      
      console.log('No profile found for user');
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const updateUserProfile = async (profile: Partial<UserProfile>): Promise<void> => {
    if (!ndk || !user) {
      throw new Error('NDK not initialized or user not logged in');
    }

    try {
      console.log('Updating user profile:', profile);
      
      // Create kind 0 metadata event
      const event = new NDKEvent(ndk);
      event.kind = 0; // Metadata event
      event.content = JSON.stringify(profile);
      
      console.log('Publishing profile update...');
      await event.sign();
      await event.publish();
      console.log('Profile updated successfully');
      
      // Update local state
      const updatedProfile = await fetchUserProfile(user.pubkey);
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  return (
    <NDKContext.Provider
      value={{
        ndk,
        user,
        userProfile,
        isConnected,
        isLoading,
        login,
        loginWithKeys,
        loginWithNip55,
        logout,
        publishEvent,
        fetchUserProfile,
        updateUserProfile,
      }}
    >
      {children}
    </NDKContext.Provider>
  );
};

 