import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from '@/utils/translations';

interface User {
  username: string;
  email?: string;
  name?: string;
}

interface OngoingRequest {
  id: string;
  type: 'flat-tyre' | 'out-of-fuel' | 'other-car-problems' | 'tow-truck' | 'emergency' | 'support' | 'car-battery';
  status: 'pending' | 'accepted' | 'declined';
  timestamp: string;
  location: string;
  employeeLocation?: { lat: number; lng: number };
  currentEmployeeName?: string;
  declinedEmployees?: string[];
  employeeName?: string;
  employeePhone?: string;
  priceQuote?: number;
}

interface CompletedRequest {
  id: string;
  type: string;
  date: string;
  time: string;
  completedTime: string;
  status: 'completed';
  user: string;
  employee: string;
}

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  language: 'en' | 'bg';
  userLocation: { lat: number; lng: number };
  ongoingRequest: OngoingRequest | null;
  setOngoingRequest: (request: OngoingRequest | null | ((prev: OngoingRequest | null) => OngoingRequest | null)) => void;
  addToHistory: (request: CompletedRequest) => void;
  requestHistory: CompletedRequest[];
  login: (user: User) => void;
  logout: () => void;
  setLanguage: (language: 'en' | 'bg') => void;
  setUserLocation: (location: { lat: number; lng: number }) => void;
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default location is Sofia, Bulgaria
  const defaultLocation = { lat: 42.698334, lng: 23.319941 };
  
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguageState] = useState<'en' | 'bg'>('en');
  const [userLocation, setUserLocationState] = useState(defaultLocation);
  const [ongoingRequest, setOngoingRequestState] = useState<OngoingRequest | null>(null);
  const [requestHistory, setRequestHistory] = useState<CompletedRequest[]>([]);
  const [editMode, setEditMode] = useState(false);
  
  // Try to get user location on initial load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocationState({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          const t = useTranslation(language);
          toast({
            title: t("location-access-denied"),
            description: t("location-access-message"),
            variant: "destructive",
          });
        }
      );
    }
  }, [language]);
  
  const login = (userData: User) => {
    setUser(userData);
  };
  
  const logout = () => {
    setUser(null);
  };
  
  const setLanguage = (newLanguage: 'en' | 'bg') => {
    setLanguageState(newLanguage);
  };
  
  const setUserLocation = (location: { lat: number; lng: number }) => {
    setUserLocationState(location);
  };
  
  const setOngoingRequest = (request: OngoingRequest | null | ((prev: OngoingRequest | null) => OngoingRequest | null)) => {
    if (typeof request === 'function') {
      setOngoingRequestState(prev => request(prev));
    } else {
      setOngoingRequestState(request);
    }
  };
  
  const addToHistory = (request: CompletedRequest) => {
    setRequestHistory(prev => [request, ...prev]);
  };
  
  const value = {
    user,
    isAuthenticated: !!user,
    language,
    userLocation,
    ongoingRequest,
    setOngoingRequest,
    addToHistory,
    requestHistory,
    login,
    logout,
    setLanguage,
    setUserLocation,
    editMode,
    setEditMode
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
