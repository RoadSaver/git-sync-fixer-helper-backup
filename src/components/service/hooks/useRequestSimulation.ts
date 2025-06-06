import { useRef } from 'react';
import { toast } from "@/components/ui/use-toast";
import { useEmployeeSimulation } from '@/hooks/useEmployeeSimulation';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Types for simulation state
interface SimEmployee {
  id: string;
  full_name: string;
}
interface SimRequestState {
  requestId: string;
  status: 'pending' | 'quoted' | 'revised' | 'accepted' | 'in_progress' | 'completed' | 'declined';
  currentEmployeeId: string | null;
  blacklist: string[];
  employeeDeclineCounts: Record<string, number>;
  quote: number | null;
  isRevised: boolean;
}

export const useRequestSimulation = () => {
  const { employees } = useEmployeeSimulation();
  // Per-request state map (requestId -> state)
  const requestStates = useRef<{ [id: string]: SimRequestState }>({});
  // Simulated request queue
  const requestQueue = useRef<string[]>([]);

  // Main simulation entry point
  const simulateEmployeeResponse = (
    requestId: string,
    timestamp: string,
    type: string,
    userLocation: { lat: number; lng: number },
    onPriceQuote: (quote: number) => void,
    setShowPriceQuote: (show: boolean) => void,
    setShowRealTimeUpdate: (show: boolean) => void,
    setStatus: (status: 'pending' | 'accepted' | 'declined') => void,
    setDeclineReason: (reason: string) => void,
    setEmployeeLocation: (location: { lat: number; lng: number }) => void,
    onEmployeeAssigned: (employeeName: string) => void,
    excludedEmployees: string[] = []
  ) => {
    // Initialize state if needed
    if (!requestStates.current[requestId]) {
      requestStates.current[requestId] = {
        requestId,
        status: 'pending',
        currentEmployeeId: null,
        blacklist: [...excludedEmployees],
        employeeDeclineCounts: {},
        quote: null,
        isRevised: false
      };
    }
    // Add to queue and process
    if (!requestQueue.current.includes(requestId)) {
      requestQueue.current.push(requestId);
    }
    processQueue(
      requestId,
      type,
      onPriceQuote,
      setShowPriceQuote,
      setShowRealTimeUpdate,
      setStatus,
      setDeclineReason,
      setEmployeeLocation,
      onEmployeeAssigned
    );
  };

  // Process the queue for a given request
  const processQueue = (
    requestId: string,
    type: string,
    onPriceQuote: (quote: number) => void,
    setShowPriceQuote: (show: boolean) => void,
    setShowRealTimeUpdate: (show: boolean) => void,
    setStatus: (status: 'pending' | 'accepted' | 'declined') => void,
    setDeclineReason: (reason: string) => void,
    setEmployeeLocation: (location: { lat: number; lng: number }) => void,
    onEmployeeAssigned: (employeeName: string) => void
  ) => {
    const state = requestStates.current[requestId];
    if (!state) return;
    // Find available employees (not blacklisted)
    const availableEmployees = employees.filter(
      e => !state.blacklist.includes(String(e.id))
    );
    if (availableEmployees.length === 0) {
      setStatus('declined');
      setDeclineReason('No available employees. Please try again later.');
      toast({
        title: "No employees available",
        description: "All employees are currently busy. Please try again later.",
        variant: "destructive"
      });
      state.status = 'declined';
      requestQueue.current = requestQueue.current.filter(id => id !== requestId);
      return;
    }
    // Randomly select an available employee
    const randomIndex = Math.floor(Math.random() * availableEmployees.length);
    const selectedEmployee = availableEmployees[randomIndex];
    state.currentEmployeeId = String(selectedEmployee.id);
    state.status = 'quoted';
    state.employeeDeclineCounts[state.currentEmployeeId] = 0;
    onEmployeeAssigned(selectedEmployee.full_name);
    toast({
      title: "Employee Found",
      description: `${selectedEmployee.full_name} is reviewing your request.`
    });
    // Generate initial price quote
    setTimeout(() => {
      const basePrice = getServiceBasePrice(type);
      state.quote = basePrice;
      state.isRevised = false;
      onPriceQuote(basePrice);
      setShowRealTimeUpdate(false);
      setShowPriceQuote(true);
      toast({
        title: "Price Quote Received",
        description: `${selectedEmployee.full_name} sent a quote of ${basePrice} BGN.`
      });
    }, Math.random() * 2000 + 1000);
    requestQueue.current = requestQueue.current.filter(id => id !== requestId);
  };

  // Handle user decline (first or second)
  const handleDecline = (
    requestId: string,
    onPriceQuote: (quote: number) => void,
    setShowPriceQuote: (show: boolean) => void,
    setShowRealTimeUpdate: (show: boolean) => void,
    setStatus: (status: 'pending' | 'accepted' | 'declined') => void,
    setDeclineReason: (reason: string) => void,
    setEmployeeLocation: (location: { lat: number; lng: number }) => void,
    onEmployeeAssigned: (employeeName: string) => void,
    userLocation: { lat: number; lng: number },
    type: string
  ) => {
    const state = requestStates.current[requestId];
    if (!state || !state.currentEmployeeId) return;
    const empId = state.currentEmployeeId;
    state.employeeDeclineCounts[empId] = (state.employeeDeclineCounts[empId] || 0) + 1;
    if (state.employeeDeclineCounts[empId] === 1 && !state.isRevised) {
      // First decline: send revised quote
      setShowPriceQuote(false);
      setShowRealTimeUpdate(false);
      setTimeout(() => {
        const revisedQuote = state.quote ? Math.floor(state.quote * 0.8) : getServiceBasePrice(type);
        state.quote = revisedQuote;
        state.isRevised = true;
        onPriceQuote(revisedQuote);
        setShowRealTimeUpdate(false);
        setShowPriceQuote(true);
        toast({
          title: "Revised Quote Received",
          description: `Employee sent a revised quote of ${revisedQuote} BGN.`
        });
      }, 2000);
    } else {
      // Second decline: blacklist employee, assign new one
      state.blacklist.push(empId);
      state.currentEmployeeId = null;
      state.isRevised = false;
      setShowPriceQuote(false);
      setShowRealTimeUpdate(false);
      setStatus('pending');
      toast({
        title: "Quote Declined",
        description: "Looking for another available employee..."
      });
      setTimeout(() => {
        simulateEmployeeResponse(
          requestId,
          new Date().toISOString(),
          type,
          userLocation,
          onPriceQuote,
          setShowPriceQuote,
          setShowRealTimeUpdate,
          setStatus,
          setDeclineReason,
          setEmployeeLocation,
          onEmployeeAssigned,
          state.blacklist
        );
      }, 1500);
    }
  };

  // Accept logic integration with live movement and Google Maps
  const handleAccept = async (
    requestId: string,
    acceptedPrice: number,
    employeeName: string,
    userName: string,
    userLocation: { lat: number; lng: number },
    employeeLocation: { lat: number; lng: number },
    etaSeconds: number,
    onEtaUpdate?: (remaining: number) => void,
    onEmployeeLocationUpdate?: (loc: { lat: number; lng: number }) => void,
    onCompletion?: () => void,
    onWindowsClose?: () => void
  ) => {
    // Environment config
    const SUPABASE_URL = (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_SUPABASE_URL) || (window as any).env?.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_KEY = (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || (window as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.error('Supabase credentials missing');
      return;
    }
    const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

    let remaining = etaSeconds;
    let currentEmployeeLocation = { ...employeeLocation };
    const startLocation = { ...employeeLocation };
    const endLocation = { ...userLocation };

    // Simulate employee movement and ETA countdown
    const etaInterval = setInterval(() => {
      remaining--;
      // Linear interpolation for movement
      const progress = 1 - (remaining / etaSeconds);
      const newLat = startLocation.lat + (endLocation.lat - startLocation.lat) * progress;
      const newLng = startLocation.lng + (endLocation.lng - startLocation.lng) * progress;
      currentEmployeeLocation = { lat: newLat, lng: newLng };
      onEmployeeLocationUpdate?.(currentEmployeeLocation);
      onEtaUpdate?.(remaining);
      if (remaining <= 0) {
        clearInterval(etaInterval);
        employeeArrived();
      }
    }, 1000);

    // Employee arrival and completion
    function employeeArrived() {
      setTimeout(async () => {
        await completeRequest();
        onCompletion?.();
        cleanup();
      }, 5000);
    }

    async function completeRequest() {
      try {
        const timestamp = new Date();
        const dateStr = timestamp.toLocaleDateString();
        const timeStr = timestamp.toLocaleTimeString();
        const locationStr = `${userLocation.lat},${userLocation.lng}`;
        // Create history records
        const userRecord = {
          request_id: requestId,
          date: dateStr,
          time: timeStr,
          accepted_price: acceptedPrice,
          employee_name: employeeName,
          location: locationStr,
          completed_at: timestamp.toISOString(),
        };
        const employeeRecord = {
          request_id: requestId,
          date: dateStr,
          time: timeStr,
          accepted_price: acceptedPrice,
          user_name: userName,
          location: locationStr,
          completed_at: timestamp.toISOString(),
        };
        await Promise.all([
          supabase.from('user_history').insert(userRecord),
          supabase.from('simulated_employee_history').insert(employeeRecord)
        ]);
        await cleanTable('user_history');
        await cleanTable('simulated_employee_history');
        onWindowsClose?.();
      } catch (error) {
        console.error('Request completion failed:', error);
      }
    }

    async function cleanTable(tableName: string) {
      try {
        const { count, error: countError } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        if (countError) throw countError;
        if (count && count >= 20) {
          const { data: latest, error: latestError } = await supabase
            .from(tableName)
            .select('id')
            .order('completed_at', { ascending: false })
            .limit(1)
            .single();
          if (latestError) throw latestError;
          const { error: deleteError } = await supabase
            .from(tableName)
            .delete()
            .neq('id', latest.id);
          if (deleteError) throw deleteError;
        }
      } catch (error) {
        console.error(`Table cleanup failed for ${tableName}:`, error);
      }
    }

    function cleanup() {
      clearInterval(etaInterval);
    }
  };

  const getServiceBasePrice = (type: string): number => {
    const prices = {
      'flat-tyre': 35,
      'out-of-fuel': 25,
      'car-battery': 40,
      'tow-truck': 60,
      'other-car-problems': 45,
      'emergency': 80,
      'support': 20
    };
    return prices[type as keyof typeof prices] || 30;
  };

  return {
    simulateEmployeeResponse,
    handleDecline,
    handleAccept
  };
};
