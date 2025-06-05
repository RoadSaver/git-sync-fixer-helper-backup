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

export const useServiceRequest = (
  type: ServiceType,
  userLocation: { lat: number; lng: number }
) => {
  const { setOngoingRequest, ongoingRequest, user } = useApp();
  const { validateMessage } = useServiceValidation();
  const { simulateEmployeeResponse } = useRequestSimulation();
  const {
    handleAcceptQuote: acceptQuote,
    handleDeclineQuote: declineQuote,
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
  const [declinedEmployees, setDeclinedEmployees] = useState<string[]>([]);
  
  // Track employee-specific decline counts - key is employee name, value is decline count
  const [employeeDeclineCounts, setEmployeeDeclineCounts] = useState<{[employeeName: string]: number}>({});
  const [estimatedArrivalTime, setEstimatedArrivalTime] = useState<string>('');
  const [movementInterval, setMovementInterval] = useState<NodeJS.Timeout | null>(null);

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
      if (ongoingRequest.declinedEmployees) {
        setDeclinedEmployees(ongoingRequest.declinedEmployees);
      }
      
      if (ongoingRequest.id) {
        loadSnapshot(ongoingRequest.id);
      }
    }
  }, [ongoingRequest, originalPriceQuote, loadSnapshot]);

  // Clean up movement interval on unmount
  useEffect(() => {
    return () => {
      if (movementInterval) {
        clearInterval(movementInterval);
      }
    };
  }, [movementInterval]);

  const calculateETA = (employeeLat: number, employeeLng: number) => {
    const distance = Math.sqrt(
      Math.pow(userLocation.lat - employeeLat, 2) + 
      Math.pow(userLocation.lng - employeeLng, 2)
    );
    
    // Rough estimate: 1 degree ≈ 111km, average speed 30km/h in city
    const distanceKm = distance * 111;
    const timeHours = distanceKm / 30;
    const timeMinutes = Math.max(5, Math.round(timeHours * 60)); // Minimum 5 minutes
    
    const now = new Date();
    const arrival = new Date(now.getTime() + timeMinutes * 60000);
    
    // Format as HH:MM:SS
    const hours = arrival.getHours().toString().padStart(2, '0');
    const minutes = arrival.getMinutes().toString().padStart(2, '0');
    const seconds = arrival.getSeconds().toString().padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleSubmit = () => {
    if (!validateMessage(message, type)) {
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      const requestId = Date.now().toString();
      const timestamp = new Date().toISOString();
      
      // Reset tracking for new request
      setDeclinedEmployees([]);
      setEmployeeDeclineCounts({});
      setCurrentEmployeeName('');
      
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
      setShowRealTimeUpdate(true);
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
          console.log('Employee sent quote:', quote);
          setPriceQuote(quote);
          setOriginalPriceQuote(quote);
          
          await storeSnapshot(requestId, type, quote, currentEmployeeName, false);
          
          setOngoingRequest(prev => {
            if (!prev) return null;
            return { 
              ...prev, 
              priceQuote: quote,
              employeeName: currentEmployeeName
            };
          });
        },
        setShowPriceQuote,
        setShowRealTimeUpdate,
        setStatus,
        setDeclineReason,
        setEmployeeLocation,
        (employeeName: string) => {
          console.log('Employee assigned:', employeeName);
          setCurrentEmployeeName(employeeName);
          setOngoingRequest(prev => prev ? { 
            ...prev, 
            employeeName: employeeName 
          } : null);
          
          // Initialize decline count for new employee
          setEmployeeDeclineCounts(prev => ({ ...prev, [employeeName]: 0 }));
        },
        []
      );
    }, 1500);
  };

  const handleAcceptQuote = async () => {
    if (!user || !ongoingRequest) return;
    
    // Start employee movement simulation
    simulateEmployeeMovement();
    
    // Close the price quote dialog and show real-time update
    setShowPriceQuote(false);
    setShowRealTimeUpdate(true);
    setStatus('accepted');
    
    // Update ongoing request
    setOngoingRequest(prev => prev ? { 
      ...prev, 
      status: 'accepted' as const 
    } : null);
    
    toast({
      title: "Quote Accepted",
      description: `${currentEmployeeName} is on the way to your location.`
    });
    
    // Simulate service completion after 30-60 seconds
    setTimeout(async () => {
      const serviceFee = 5;
      const totalPrice = (ongoingRequest.priceQuote || priceQuote) + serviceFee;
      
      // Add to user history
      await UserHistoryService.addHistoryEntry({
        user_id: user.username,
        username: user.username,
        service_type: type,
        status: 'completed',
        employee_name: currentEmployeeName,
        price_paid: ongoingRequest.priceQuote || priceQuote,
        service_fee: serviceFee,
        total_price: totalPrice,
        request_date: new Date().toISOString(),
        completion_date: new Date().toISOString(),
        address_street: 'Sofia Center, Bulgaria',
        latitude: userLocation.lat,
        longitude: userLocation.lng
      });
      
      // Clean up old history
      await UserHistoryService.cleanupOldHistory(user.username, user.username);
      
      // Move to finished requests
      if (ongoingRequest.id) {
        await moveToFinished(ongoingRequest.id, 'emp-' + currentEmployeeName, currentEmployeeName);
      }
      
      // Clean up movement interval
      if (movementInterval) {
        clearInterval(movementInterval);
        setMovementInterval(null);
      }
      
      // Clear ongoing request and close dialog
      setOngoingRequest(null);
      setShowRealTimeUpdate(false);
      
      toast({
        title: "Service Completed",
        description: `Your ${type} service has been completed successfully.`
      });
    }, Math.random() * 30000 + 30000); // 30-60 seconds
  };

  const simulateEmployeeMovement = () => {
    if (!employeeLocation) {
      // Set initial employee location (random nearby location)
      const initialLat = userLocation.lat + (Math.random() - 0.5) * 0.02;
      const initialLng = userLocation.lng + (Math.random() - 0.5) * 0.02;
      const initialLocation = { lat: initialLat, lng: initialLng };
      setEmployeeLocation(initialLocation);
      setEstimatedArrivalTime(calculateETA(initialLat, initialLng));
    }

    // Clear any existing interval
    if (movementInterval) {
      clearInterval(movementInterval);
    }

    // Simulate movement towards user every 3 seconds
    const interval = setInterval(() => {
      setEmployeeLocation(prev => {
        if (!prev) return prev;
        
        const deltaLat = userLocation.lat - prev.lat;
        const deltaLng = userLocation.lng - prev.lng;
        const distance = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng);
        
        // If close enough, stop moving
        if (distance < 0.001) {
          setEstimatedArrivalTime('00:00:00');
          return userLocation;
        }
        
        // Move 15% closer each time for smoother movement
        const newLocation = {
          lat: prev.lat + deltaLat * 0.15,
          lng: prev.lng + deltaLng * 0.15
        };
        
        // Update ETA
        setEstimatedArrivalTime(calculateETA(newLocation.lat, newLocation.lng));
        
        return newLocation;
      });
    }, 3000);

    setMovementInterval(interval);

    // Clear interval after 60 seconds to prevent infinite movement
    setTimeout(() => {
      clearInterval(interval);
      setMovementInterval(null);
    }, 60000);
  };
  
  const handleDeclineQuote = async (isSecondDecline: boolean = false) => {
    if (!user) return;
    
    const currentDeclineCount = employeeDeclineCounts[currentEmployeeName] || 0;
    console.log(`Declining quote for ${currentEmployeeName}, current decline count: ${currentDeclineCount}, isSecondDecline: ${isSecondDecline}`);
    
    if (isSecondDecline || currentDeclineCount >= 1) {
      // This is the final decline for this employee - find new employee
      console.log('Final decline, finding new employee');
      
      // Add declined request to history
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
      
      // Add current employee to declined list
      const updatedDeclinedEmployees = [...declinedEmployees, currentEmployeeName];
      setDeclinedEmployees(updatedDeclinedEmployees);
      
      // Reset states for new employee search
      setShowPriceQuote(false);
      setShowRealTimeUpdate(true);
      setStatus('pending');
      setPriceQuote(0);
      setCurrentEmployeeName('');
      
      const updatedRequest = {
        ...ongoingRequest,
        declinedEmployees: updatedDeclinedEmployees,
        status: 'pending' as const,
        priceQuote: undefined,
        employeeName: undefined
      };
      setOngoingRequest(updatedRequest);
      
      toast({
        title: "Quote Declined",
        description: "Looking for another available employee..."
      });
      
      // Simulate new employee response
      setTimeout(() => {
        const requestId = Date.now().toString();
        const timestamp = new Date().toISOString();
        
        simulateEmployeeResponse(
          requestId,
          timestamp,
          type,
          userLocation,
          (quote: number) => {
            console.log('New employee quote:', quote);
            setPriceQuote(quote);
            setOriginalPriceQuote(quote);
            setOngoingRequest(prev => {
              if (!prev) return null;
              return { 
                ...prev, 
                priceQuote: quote 
              };
            });
          },
          setShowPriceQuote,
          setShowRealTimeUpdate,
          setStatus,
          setDeclineReason,
          setEmployeeLocation,
          (employeeName: string) => {
            console.log('New employee assigned:', employeeName);
            setCurrentEmployeeName(employeeName);
            setOngoingRequest(prev => prev ? { 
              ...prev, 
              employeeName: employeeName 
            } : null);
            
            // Initialize decline count for new employee
            setEmployeeDeclineCounts(prev => ({ ...prev, [employeeName]: 0 }));
          },
          updatedDeclinedEmployees
        );
      }, 2000);
    } else {
      // First decline - employee gets one chance to revise
      console.log('First decline, employee will send revised quote');
      
      const newDeclineCount = currentDeclineCount + 1;
      setEmployeeDeclineCounts(prev => ({ 
        ...prev, 
        [currentEmployeeName]: newDeclineCount 
      }));
      
      toast({
        title: "Quote Declined",
        description: `${currentEmployeeName} will send you a revised quote.`
      });
      
      // Simulate employee sending revised quote
      setTimeout(() => {
        const revisedQuote = Math.max(10, originalPriceQuote - Math.floor(Math.random() * 15) - 5);
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
  
  const handleCancelRequest = () => cancelRequest(setShowPriceQuote);

  const showStoredPriceQuote = () => {
    if (storedSnapshot) {
      setShowPriceQuote(true);
    }
  };

  // Calculate hasDeclinedOnce based on employee decline count
  const hasDeclinedOnce = (employeeDeclineCounts[currentEmployeeName] || 0) >= 1;

  return {
    message,
    setMessage,
    isSubmitting,
    showRealTimeUpdate,
    showPriceQuote,
    setShowPriceQuote,
    priceQuote: ongoingRequest?.priceQuote ?? priceQuote,
    employeeLocation,
    status,
    declineReason,
    currentEmployeeName: ongoingRequest?.employeeName || currentEmployeeName,
    declinedEmployees,
    hasDeclinedOnce,
    estimatedArrivalTime,
    handleSubmit,
    handleAcceptQuote,
    handleDeclineQuote,
    handleCancelRequest,
    handleContactSupport,
    storedSnapshot,
    showStoredPriceQuote
  };
};
