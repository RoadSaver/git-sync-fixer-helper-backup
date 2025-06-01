import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import WaitingForRevisionDialog from './price-quote/WaitingForRevisionDialog';
import PriceQuoteContent from './price-quote/PriceQuoteContent';
import DeclineConfirmDialog from './price-quote/DeclineConfirmDialog';
import CancelConfirmDialog from './price-quote/CancelConfirmDialog';

interface PriceQuoteDialogProps {
  open: boolean;
  onClose: () => void;
  serviceType: string;
  priceQuote: number;
  onAccept: () => void;
  onDecline: (isSecondDecline?: boolean) => void;
  onCancelRequest: () => void;
  hasDeclinedOnce?: boolean;
  employeeName?: string;
}

const PriceQuoteDialog: React.FC<PriceQuoteDialogProps> = ({
  open,
  onClose,
  serviceType,
  priceQuote,
  onAccept,
  onDecline,
  onCancelRequest,
  hasDeclinedOnce = false,
  employeeName = 'Employee'
}) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [isWaitingForRevision, setIsWaitingForRevision] = useState(false);

  const handleCancelRequest = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancel = () => {
    onCancelRequest();
    setShowCancelConfirm(false);
    onClose();
  };

  const handleDecline = () => {
    if (!hasDeclinedOnce) {
      setShowDeclineConfirm(true);
    } else {
      // Second decline - trigger the new behavior
      onDecline(true);
    }
  };

  const confirmDecline = () => {
    setShowDeclineConfirm(false);
    setIsWaitingForRevision(true);
    
    // Every employee gets exactly one chance to send a revised quote
    setTimeout(() => {
      // Generate a revised quote (employee always sends one)
      const revisedQuote = Math.max(10, priceQuote - Math.floor(Math.random() * 20) - 5);
      setIsWaitingForRevision(false);
      // In a real implementation, this would update the parent component's state with the revised quote
      console.log('Employee sent revised quote:', revisedQuote);
      // For now, we'll just proceed with the decline since we don't have the revised quote flow implemented
      onDecline();
    }, 3000);
  };

  // Allow dialog to close when clicking outside or pressing escape - this will keep the request active
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose(); // This will close the dialog but keep the ongoing request active
    }
  };

  if (isWaitingForRevision) {
    return (
      <WaitingForRevisionDialog
        open={open}
        onOpenChange={handleOpenChange}
        employeeName={employeeName}
        onCancelRequest={handleCancelRequest}
      />
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {hasDeclinedOnce ? 'Revised Price Quote' : 'Price Quote Received'}
            </DialogTitle>
          </DialogHeader>
          
          <PriceQuoteContent
            serviceType={serviceType}
            priceQuote={priceQuote}
            employeeName={employeeName}
            hasDeclinedOnce={hasDeclinedOnce}
            onAccept={onAccept}
            onDecline={handleDecline}
            onCancelRequest={handleCancelRequest}
          />
        </DialogContent>
      </Dialog>

      <DeclineConfirmDialog
        open={showDeclineConfirm}
        onOpenChange={setShowDeclineConfirm}
        employeeName={employeeName}
        onConfirm={confirmDecline}
        onCancel={() => setShowDeclineConfirm(false)}
      />

      <CancelConfirmDialog
        open={showCancelConfirm}
        onOpenChange={setShowCancelConfirm}
        onConfirm={confirmCancel}
        onCancel={() => setShowCancelConfirm(false)}
      />
    </>
  );
};

export default PriceQuoteDialog;
