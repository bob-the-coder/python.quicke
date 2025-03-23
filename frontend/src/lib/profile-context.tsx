import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Keys for localStorage
const PROFILES_KEY = 'user-profiles';
const CURRENT_PROFILE_KEY = 'current-profile-id';

// Profile type definition
export interface Profile {
  id: string;
  name: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Default profile
const DEFAULT_PROFILE: Profile = {
  id: 'default',
  name: 'Default Profile',
  isDefault: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

type UserContextType = {
  profiles: Profile[];
  currentProfile: Profile | undefined;
  currentProfileId: string;
  switchProfile: (profileId: string) => void;
  addProfile: (profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProfile: (profile: Partial<Profile> & { id: string }) => void;
  deleteProfile: (profileId: string) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  // Initialize profiles from localStorage or use defaults
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    try {
      const storedValue = localStorage.getItem(PROFILES_KEY);
      return storedValue !== null 
        ? JSON.parse(storedValue) 
        : [DEFAULT_PROFILE];
    } catch (error) {
      console.error('Error reading profiles from localStorage:', error);
      return [DEFAULT_PROFILE];
    }
  });

  // Initialize current profile ID from localStorage or use default
  const [currentProfileId, setCurrentProfileId] = useState<string>(() => {
    try {
      const storedValue = localStorage.getItem(CURRENT_PROFILE_KEY);
      if (storedValue !== null) {
        return JSON.parse(storedValue);
      }
      return DEFAULT_PROFILE.id;
    } catch (error) {
      console.error('Error reading current profile ID from localStorage:', error);
      return DEFAULT_PROFILE.id;
    }
  });

  // Update localStorage when profiles change
  useEffect(() => {
    try {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    } catch (error) {
      console.error('Error saving profiles to localStorage:', error);
    }
  }, [profiles]);

  // Update localStorage when current profile changes
  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_PROFILE_KEY, JSON.stringify(currentProfileId));
    } catch (error) {
      console.error('Error saving current profile ID to localStorage:', error);
    }
  }, [currentProfileId]);

  // Find current profile
  const currentProfile = profiles.find(p => p.id === currentProfileId) || profiles[0];

  // Profile management functions
  const switchProfile = (profileId: string) => {
    if (profiles.some(p => p.id === profileId)) {
      setCurrentProfileId(profileId);
    }
  };

  const addProfile = (profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProfile: Profile = {
      ...profile,
      id: `profile-${Date.now()}`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setProfiles(prev => [...prev, newProfile]);
    switchProfile(newProfile.id);
  };

  const updateProfile = (profile: Partial<Profile> & { id: string }) => {
    setProfiles(prev => 
      prev.map(p => 
        p.id === profile.id 
          ? { ...p, ...profile, updatedAt: new Date().toISOString() } 
          : p
      )
    );
  };

  const deleteProfile = (profileId: string) => {
    // Prevent deleting the default profile
    const profileToDelete = profiles.find(p => p.id === profileId);
    if (profileToDelete?.isDefault) {
      console.error("Cannot delete the default profile");
      return;
    }
    
    setProfiles(prev => prev.filter(p => p.id !== profileId));
    
    // If deleting the current profile, switch to default
    if (currentProfileId === profileId) {
      const defaultProfile = profiles.find(p => p.isDefault);
      if (defaultProfile) {
        switchProfile(defaultProfile.id);
      }
    }
  };

  return (
    <UserContext.Provider 
      value={{ 
        profiles,
        currentProfile,
        currentProfileId,
        switchProfile,
        addProfile,
        updateProfile,
        deleteProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// Main hook to access user context
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// Profile hook (for convenience)
export function useProfiles() {
  const { 
    profiles, 
    currentProfile, 
    switchProfile, 
    addProfile,
    updateProfile,
    deleteProfile 
  } = useUser();
  
  return {
    profiles,
    currentProfile,
    switchProfile,
    addProfile,
    updateProfile,
    deleteProfile,
    isDefault: currentProfile?.isDefault || false,
  };
}