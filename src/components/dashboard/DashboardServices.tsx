import React from 'react';
import ServiceCard from '@/components/service/ServiceCard';

type ServiceType = 'flat-tyre' | 'out-of-fuel' | 'other-car-problems' | 'tow-truck' | 'emergency' | 'support' | 'car-battery';

interface DashboardServicesProps {
  onServiceSelect: (service: ServiceType) => void;
}

const DashboardServices: React.FC<DashboardServicesProps> = ({ onServiceSelect }) => {
  return (
    <div className="container max-w-md mx-auto px-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <ServiceCard type="flat-tyre" onClick={() => onServiceSelect('flat-tyre')} />
        <ServiceCard type="out-of-fuel" onClick={() => onServiceSelect('out-of-fuel')} />
        <ServiceCard type="car-battery" onClick={() => onServiceSelect('car-battery')} />
        <ServiceCard type="other-car-problems" onClick={() => onServiceSelect('other-car-problems')} />
        <ServiceCard type="tow-truck" onClick={() => onServiceSelect('tow-truck')} />
        <ServiceCard type="support" onClick={() => onServiceSelect('support')} />
      </div>
    </div>
  );
};

export default DashboardServices;
