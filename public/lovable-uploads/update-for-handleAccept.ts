import { useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration
const MAP_CONTAINER_STYLE = { width: '100%', height: '400px' };
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const GREEN_DOT_ICON = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
const BLUE_DOT_ICON = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';

interface Location {
  lat: number;
  lng: number;
}

interface RequestData {
  requestId: string;
  acceptedPrice: number;
  employeeName: string;
  userName: string;
  userLocation: Location;
  employeeLocation: Location;
  etaSeconds: number;
}

interface HistoryRecord {
  request_id: string;
  date: string;
  time: string;
  accepted_price: number;
  location: string;
  completed_at: string;
}

const ServiceRequestTracker = (props: RequestData) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });
  
  const [currentEmployeeLocation, setCurrentEmployeeLocation] = useState<Location>(props.employeeLocation);
  const [remainingEta, setRemainingEta] = useState<number>(props.etaSeconds);
  const [arrivalStatus, setArrivalStatus] = useState<'en_route' | 'arrived' | 'completed'>('en_route');
  const supabase = useRef<SupabaseClient | null>(null);
  
  // Initialize Supabase
  useEffect(() => {
    supabase.current = createClient(SUPABASE_URL, SUPABASE_KEY);
  }, []);

  // Employee movement simulation
  useEffect(() => {
    if (!isLoaded || arrivalStatus !== 'en_route') return;

    const interval = setInterval(() => {
      setRemainingEta(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setArrivalStatus('arrived');
          return 0;
        }
        return prev - 1;
      });

      // Calculate new position (linear interpolation)
      const progress = 1 - (remainingEta - 1) / props.etaSeconds;
      const newLat = props.employeeLocation.lat + 
        (props.userLocation.lat - props.employeeLocation.lat) * progress;
      const newLng = props.employeeLocation.lng + 
        (props.userLocation.lng - props.employeeLocation.lng) * progress;
      
      setCurrentEmployeeLocation({ lat: newLat, lng: newLng });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoaded, arrivalStatus, remainingEta, props]);

  // Handle arrival and completion
  useEffect(() => {
    if (arrivalStatus !== 'arrived') return;

    const timer = setTimeout(async () => {
      setArrivalStatus('completed');
      await completeRequest();
      // Close windows and handle completion in parent component
    }, 5000);

    return () => clearTimeout(timer);
  }, [arrivalStatus]);

  const completeRequest = async () => {
    if (!supabase.current) return;

    const timestamp = new Date();
    const dateStr = timestamp.toLocaleDateString();
    const timeStr = timestamp.toLocaleTimeString();
    const locationStr = `${props.userLocation.lat},${props.userLocation.lng}`;

    // Create history records
    const userRecord: HistoryRecord & { employee_name: string } = {
      request_id: props.requestId,
      date: dateStr,
      time: timeStr,
      accepted_price: props.acceptedPrice,
      employee_name: props.employeeName,
      location: locationStr,
      completed_at: timestamp.toISOString(),
    };

    const employeeRecord: HistoryRecord & { user_name: string } = {
      request_id: props.requestId,
      date: dateStr,
      time: timeStr,
      accepted_price: props.acceptedPrice,
      user_name: props.userName,
      location: locationStr,
      completed_at: timestamp.toISOString(),
    };

    try {
      // Store in both tables
      await Promise.all([
        supabase.current.from('user_history').insert(userRecord),
        supabase.current.from('simulated_employee_history').insert(employeeRecord)
      ]);

      // Clean up tables
      await cleanTable('user_history');
      await cleanTable('simulated_employee_history');
    } catch (error) {
      console.error('Failed to complete request:', error);
    }
  };

  const cleanTable = async (tableName: string) => {
    if (!supabase.current) return;

    try {
      // Get count of records
      const { count, error } = await supabase.current
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      if (!count || count < 20) return;

      // Get the latest record
      const { data: latest, error: latestError } = await supabase.current
        .from(tableName)
        .select('id')
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      if (latestError || !latest) throw latestError;

      // Delete all except the latest
      await supabase.current
        .from(tableName)
        .delete()
        .neq('id', latest.id);
    } catch (error) {
      console.error(`Error cleaning ${tableName}:`, error);
    }
  };

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div className="service-request-container">
      <h2>Service Request Status</h2>
      <h3 className="accepted-status">Accepted</h3>
      
      <div className="request-details">
        <p>I have a flat tyre and need assistance</p>
      </div>
      
      <div className="live-tracking-section">
        <h4>Live Location Tracking</h4>
        
        <div className="map-container">
          <GoogleMap
            mapContainerStyle={MAP_CONTAINER_STYLE}
            center={props.userLocation}
            zoom={15}
            options={{
              mapTypeId: 'hybrid',
              streetViewControl: false,
              fullscreenControl: false,
            }}
          >
            <Marker 
              position={props.userLocation} 
              icon={GREEN_DOT_ICON}
              title="Your location"
            />
            <Marker 
              position={currentEmployeeLocation} 
              icon={BLUE_DOT_ICON}
              title={`${props.employeeName} (ETA: ${remainingEta}s)`}
            />
          </GoogleMap>
        </div>
        
        <div className="location-labels">
          <div className="location-label">
            <span className="dot green-dot"></span>
            <span>Your location</span>
          </div>
          <div className="location-label">
            <span className="dot blue-dot"></span>
            <span>Employee Location</span>
          </div>
        </div>
        
        <div className="map-legend">
          <span>Satellite</span>
          <span>SLAVIA CЛАВИЯ</span>
          <span>Kaufland kaydnaïya - B</span>
        </div>
      </div>
      
      <div className="status-message">
        {arrivalStatus === 'en_route' ? (
          <p>Your request has been accepted! {props.employeeName} will arrive in {remainingEta} seconds.</p>
        ) : arrivalStatus === 'arrived' ? (
          <p>Employee has arrived! Completing request...</p>
        ) : (
          <p>Request completed successfully!</p>
        )}
      </div>
      
      <div className="action-buttons">
        <button className="support-button">Contact Support</button>
        <button className="close-button">Close</button>
      </div>
      
      <style jsx>{`
        .service-request-container {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        h2 {
          color: #333;
          margin-bottom: 10px;
        }
        
        .accepted-status {
          color: #4CAF50;
          margin-top: 0;
        }
        
        .request-details {
          padding: 15px 0;
          border-bottom: 1px solid #eee;
        }
        
        .live-tracking-section {
          margin: 20px 0;
        }
        
        .location-labels {
          display: flex;
          gap: 20px;
          margin: 10px 0;
        }
        
        .location-label {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .dot {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        
        .green-dot {
          background-color: #0F9D58;
        }
        
        .blue-dot {
          background-color: #4285F4;
        }
        
        .map-legend {
          display: flex;
          gap: 15px;
          font-size: 0.9rem;
          color: #666;
          margin-top: 10px;
        }
        
        .status-message {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 4px;
          margin: 15px 0;
        }
        
        .action-buttons {
          display: flex;
          gap: 10px;
        }
        
        .support-button, .close-button {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
        }
        
        .support-button {
          background: #4285F4;
          color: white;
        }
        
        .close-button {
          background: #f5f5f5;
          border: 1px solid #ddd;
        }
      `}</style>
    </div>
  );
};

export default ServiceRequestTracker;