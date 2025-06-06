import { useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { useApp } from '@/contexts/AppContext';
import { serviceMessages } from './constants/serviceMessages';
import { ServiceType } from './types/serviceRequestState';
import { useServiceValidation } from './hooks/useServiceValidation';
import { useRequestSimulation } from './hooks/useRequestSimulation';
import { useRequestActions } from './hooks/useRequestActions';
import { usePriceQuoteSnapshot } from '@/hooks/usePriceQuoteSnapshot';
import { UserHistoryService } from '@/services/userHistoryService';
// --- Blacklist for simulated employees (in-memory, resets after request finishes) ---
import { employeeSimulationBlacklist } from '@/hooks/employeeSimulationBlacklist';

export const useServiceRequest = (
  type: ServiceType,
  userLocation: { lat: number; lng: number }
) => {
  const { setOngoingRequest, ongoingRequest, user } = useApp();
  const { validateMessage } = useServiceValidation();
  const { simulateEmployeeResponse, handleDecline, handleAccept } = useRequestSimulation();
  const {
    handleAcceptQuote: acceptQuote,
    handleCancelRequest: cancelRequest,
    handleContactSupport
  } = useRequestActions();
  const { storeSnapshot, loadSnapshot, storedSnapshot, moveToFinished } = usePriceQuoteSnapshot();

  // Initialize states with values from ongoing request if it exists
  const [message, setMessage] = useState(serviceMessages[type] || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRealTimeUpdate, setShowRealTimeUpdate] = useState(false);
  const [showPriceQuote, setShowPriceQuote] = useState(false);
  const [priceQuote, setPriceQuote] = useState<number>(0);
  const [originalPriceQuote, setOriginalPriceQuote] = useState<number>(0);
  const [employeeLocation, setEmployeeLocation] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [status, setStatus] = useState<'pending' | 'accepted' | 'declined'>('pending');
  const [declineReason, setDeclineReason] = useState('');
  const [currentEmployeeName, setCurrentEmployeeName] = useState<string>('');
  const [hasDeclinedOnce, setHasDeclinedOnce] = useState(false);
  // Track decline count per employee per request
  const [employeeDeclineCounts, setEmployeeDeclineCounts] = useState<{ [employee: string]: number }>({});
  // Add state for employee movement and ETA
  const [employeeMovingLocation, setEmployeeMovingLocation] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [eta, setEta] = useState<string | null>(null);
  const [sessionEmployeeBlacklist, setSessionEmployeeBlacklist] = useState<string[]>([]);

  // Reset blacklist when a new request is started or finished
  useEffect(() => {
    if (!ongoingRequest) {
      setSessionEmployeeBlacklist([]);
    }
  }, [ongoingRequest]);

  // Update local states when ongoing request changes
  useEffect(() => {
    if (ongoingRequest) {
      if (ongoingRequest.priceQuote !== undefined) {
        setPriceQuote(ongoingRequest.priceQuote);
        if (originalPriceQuote === 0) {
          setOriginalPriceQuote(ongoingRequest.priceQuote);
        }
      }
      if (ongoingRequest.employeeName) {
        setCurrentEmployeeName(ongoingRequest.employeeName);
      }
      if (ongoingRequest.id) {
        loadSnapshot(ongoingRequest.id);
      }
    }
  }, [ongoingRequest, originalPriceQuote, loadSnapshot]);

  // Helper to calculate ETA in HH:MM:SS
  const calculateEta = (from: { lat: number; lng: number }, to: { lat: number; lng: number }) => {
    const R = 6371; // km
    const dLat = (to.lat - from.lat) * Math.PI / 180;
    const dLng = (to.lng - from.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // in km
    const speed = 40; // km/h, assumed
    const hours = distance / speed;
    const totalSeconds = Math.max(1, Math.round(hours * 3600));
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleSubmit = () => {
    if (!validateMessage(message, type)) {
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      const requestId = Date.now().toString();
      const timestamp = new Date().toISOString();
      
      setHasDeclinedOnce(false);
      const newOngoingRequest = {
        id: requestId,
        type,
        status: 'pending' as const,
        timestamp: new Date().toLocaleString(),
        location: 'Sofia Center, Bulgaria',
        declinedEmployees: []
      };
      
      setOngoingRequest(newOngoingRequest);
      setStatus('pending');
      setIsSubmitting(false);
      setShowRealTimeUpdate(false); // Do not show the intermediate status screen
      toast({
        title: "Request Sent",
        description: "Your request has been sent to our team."
      });
      simulateEmployeeResponse(
        requestId,
        timestamp,
        type,
        userLocation,
        async (quote: number) => {
          setPriceQuote(quote);
          setOriginalPriceQuote(quote);
          const employeeName = currentEmployeeName;
          await storeSnapshot(requestId, type, quote, employeeName, false);
          setOngoingRequest(prev => {
            if (!prev) return null;
            return {
              ...prev,
              priceQuote: quote,
              employeeName: employeeName
            };
          });
          setShowPriceQuote(true); // Show price quote dialog immediately
        },
        setShowPriceQuote,
        setShowRealTimeUpdate,
        setStatus,
        setDeclineReason,
        setEmployeeLocation,
        (employeeName: string) => {
          // Only assign valid employee names from Supabase
          if (employeeName && employeeName !== 'Unknown') {
            setCurrentEmployeeName(employeeName);
            setOngoingRequest(prev => prev ? {
              ...prev,
              employeeName: employeeName
            } : null);
          } else {
            setCurrentEmployeeName('');
            setOngoingRequest(prev => prev ? {
              ...prev,
              employeeName: ''
            } : null);
            setShowPriceQuote(false);
            setShowRealTimeUpdate(false);
            setStatus('declined');
            setDeclineReason('No available employees. Please try again later.');
            toast({
              title: "No employees available",
              description: "All employees are currently busy. Please try again later.",
              variant: "destructive"
            });
          }
          setHasDeclinedOnce(false);
        },
        []
      );
    }, 1500);
  };

  const handleAcceptQuote = async () => {
    if (!user || !ongoingRequest) return;
    // Start ETA and completion simulation using handleAccept
    handleAccept(
      ongoingRequest.id,
      ongoingRequest.priceQuote || priceQuote,
      currentEmployeeName,
      user.username,
      userLocation,
      // Simulate employee starting from a random nearby location
      {
        lat: userLocation.lat + (Math.random() - 0.5) * 0.02,
        lng: userLocation.lng + (Math.random() - 0.5) * 0.02
      },
      15, // ETA in seconds (example: 15s)
      (remaining) => {
        setEta(remaining > 0 ? `00:00:${remaining.toString().padStart(2, '0')}` : '00:00:00');
      },
      (loc) => {
        setEmployeeMovingLocation(loc);
      },
      () => {
        // On completion, show toast and update state
        toast({
          title: "Service Completed",
          description: `Your ${type} service has been completed successfully.`
        });
        setOngoingRequest(null);
        setShowRealTimeUpdate(false);
        setEmployeeMovingLocation(undefined);
        setEta(null);
      },
      () => {
        // On windows close, can be used to close dialogs if needed
      }
    );
    // UI state for accepted
    setShowPriceQuote(false);
    setShowRealTimeUpdate(true);
    setStatus('accepted');
    setOngoingRequest(prev => prev ? { ...prev, status: 'accepted' as const } : null);
    toast({
      title: "Quote Accepted",
      description: `${currentEmployeeName} is on the way to your location.`
    });
  };

  // --- EMPLOYEE MOVEMENT ---
  // Simulate employee movement toward user after quote is accepted
  const simulateEmployeeMovement = () => {
    let intervalId: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;

    setEmployeeLocation(prev => {
      if (!prev) {
        // Set initial employee location (random nearby location)
        const initialLat = userLocation.lat + (Math.random() - 0.5) * 0.02;
        const initialLng = userLocation.lng + (Math.random() - 0.5) * 0.02;
        setEta(calculateEta({ lat: initialLat, lng: initialLng }, userLocation));
        return { lat: initialLat, lng: initialLng };
      }
      setEta(calculateEta(prev, userLocation));
      return prev;
    });

    intervalId = setInterval(() => {
      setEmployeeLocation(prev => {
        if (!prev) return prev;
        const deltaLat = userLocation.lat - prev.lat;
        const deltaLng = userLocation.lng - prev.lng;
        const distance = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng);
        // If close enough, stop moving
        if (distance < 0.0005) {
          clearInterval(intervalId);
          setEta('00:00:00');
          return { ...userLocation };
        }
        // Move 10% closer each time
        const next = {
          lat: prev.lat + deltaLat * 0.1,
          lng: prev.lng + deltaLng * 0.1
        };
        setEta(calculateEta(next, userLocation));
        return next;
      });
    }, 2000); // update every 2 seconds for smoother movement

    timeoutId = setTimeout(() => clearInterval(intervalId), 60000);
  };
  
  // Track declines per employee
  const [employeeDeclineCount, setEmployeeDeclineCount] = useState<{ [employee: string]: number }>({});

  const handleDeclineQuote = async (isSecondDecline: boolean = false) => {
    if (!user) return;
    const declines = (employeeDeclineCount[currentEmployeeName] || 0) + 1;
    setEmployeeDeclineCount(prev => ({
      ...prev,
      [currentEmployeeName]: declines
    }));
    if (declines >= 2 || isSecondDecline || hasDeclinedOnce) {
      // Add to blacklist in state (deduped)
      setSessionEmployeeBlacklist(prev => Array.from(new Set([...prev, currentEmployeeName])));
      await UserHistoryService.addHistoryEntry({
        user_id: user.username,
        username: user.username,
        service_type: type,
        status: 'declined',
        employee_name: currentEmployeeName,
        request_date: new Date().toISOString(),
        completion_date: new Date().toISOString(),
        address_street: 'Sofia Center, Bulgaria',
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        decline_reason: 'User declined quote twice'
      });
      setHasDeclinedOnce(false);
      setEmployeeDeclineCount(prev => ({
        ...prev,
        [currentEmployeeName]: 0
      }));
      setShowPriceQuote(false);
      setShowRealTimeUpdate(true);
      setStatus('pending');
      const updatedRequest = {
        ...ongoingRequest,
        status: 'pending' as const,
        employeeName: undefined
      };
      setOngoingRequest(updatedRequest);
      toast({
        title: "Quote Declined",
        description: "Looking for another available employee..."
      });
      setTimeout(() => {
        const requestId = Date.now().toString();
        const timestamp = new Date().toISOString();
        // Always use the latest blacklist
        simulateEmployeeResponse(
          requestId,
          timestamp,
          type,
          userLocation,
          // Do not change price quote here
          () => {},
          (show) => setShowPriceQuote(show),
          setShowRealTimeUpdate,
          setStatus,
          setDeclineReason,
          setEmployeeLocation,
          (employeeName: string) => {
            setCurrentEmployeeName(employeeName);
            setOngoingRequest(prev => prev ? {
              ...prev,
              employeeName: employeeName
            } : null);
            setTimeout(() => {
              setShowPriceQuote(true);
            }, 100);
          },
          [...sessionEmployeeBlacklist, currentEmployeeName] // always up-to-date
        );
      }, 2000);
    } else {
      setHasDeclinedOnce(true);
      toast({
        title: "Quote Declined",
        description: `${currentEmployeeName} will send you a revised quote.`
      });
      setTimeout(() => {
        // Only change price on decline
        const revisedQuote = Math.max(10, priceQuote - Math.floor(Math.random() * 15) - 5);
        setPriceQuote(revisedQuote);
        setOngoingRequest(prev => prev ? {
          ...prev,
          priceQuote: revisedQuote
        } : null);
        toast({
          title: "Revised Quote Received",
          description: `${currentEmployeeName} sent a revised quote of ${revisedQuote} BGN.`
        });
      }, 3000);
    }
  };
  
  const handleCancelRequest = () => {
    // Reset blacklist if request is cancelled
    setSessionEmployeeBlacklist([]);
    cancelRequest(setShowPriceQuote);
  };

  const showStoredPriceQuote = () => {
    if (storedSnapshot) {
      setShowPriceQuote(true);
    }
  };

  return {
    message,
    setMessage,
    isSubmitting,
    showRealTimeUpdate,
    showPriceQuote,
    setShowPriceQuote,
    priceQuote: originalPriceQuote > 0 ? originalPriceQuote : (ongoingRequest?.priceQuote ?? priceQuote),
    employeeLocation,
    status,
    declineReason,
    currentEmployeeName: ongoingRequest?.employeeName || currentEmployeeName,
    hasDeclinedOnce,
    eta,
    handleSubmit,
    handleAcceptQuote,
    handleDeclineQuote,
    handleCancelRequest,
    handleContactSupport,
    storedSnapshot,
    showStoredPriceQuote
  };
};
