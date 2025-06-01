import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/utils/translations';
import { Info } from 'lucide-react';

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
  const { language } = useApp();
  const t = useTranslation(language);
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

  const serviceFee = 5;
  const totalPrice = priceQuote + serviceFee;

  if (isWaitingForRevision) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Waiting for Response</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 text-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-sm text-gray-600">
              {employeeName} is preparing a revised quote for you...
            </p>
          </div>
          
          <div className="flex justify-center">
            <Button 
              onClick={handleCancelRequest}
              variant="outline"
              className="border-red-500 text-red-600 hover:bg-red-50"
            >
              Cancel Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
          
          <div className="space-y-4">
            <div className="rounded-md bg-secondary p-3">
              <h3 className="font-medium mb-2">Service Request</h3>
              <p className="text-sm">{t(serviceType)}</p>
            </div>
            
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3">
              <h3 className="font-medium mb-2">
                Price Quote from: {employeeName}
              </h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {priceQuote.toFixed(2)} BGN
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-500">+ {serviceFee.toFixed(2)} BGN fee</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Info className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                  </PopoverTrigger>
                  <PopoverContent className="max-w-xs">
                    <p className="text-sm">
                      A small fee for maintaining the app and assuring it functions as intended, 
                      also covering future updates and new exciting features for you to enjoy.
                    </p>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 mt-3 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total:</span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    {totalPrice.toFixed(2)} BGN
                  </span>
                </div>
              </div>
            </div>

            {hasDeclinedOnce && (
              <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  This is a revised quote from {employeeName} based on your previous decline.
                </p>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2 mt-6">
            <Button 
              onClick={onAccept}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Accept
            </Button>
            <Button 
              onClick={handleDecline}
              variant="outline"
              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
            >
              {hasDeclinedOnce ? 'Final Decline' : 'Decline'}
            </Button>
            <Button 
              onClick={handleCancelRequest}
              variant="outline"
              className="border-red-500 text-red-600 hover:bg-red-50"
            >
              Cancel Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeclineConfirm} onOpenChange={setShowDeclineConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline Price Quote?</AlertDialogTitle>
            <AlertDialogDescription>
              {employeeName} will be notified and will send you a revised quote. This is their only opportunity to revise.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeclineConfirm(false)}>
              Keep Current Quote
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDecline}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Yes, Decline Quote
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Request?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your service request?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowCancelConfirm(false)}>
              No, don't cancel my request
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCancel}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, I am sure
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PriceQuoteDialog;
