"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface ReservationDetails {
  parkingId: number;
  parkingName: string;
  startTime: Date;
  endTime: Date;
}

interface ReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  details: ReservationDetails;
  onConfirm: () => Promise<boolean>;
}

export default function ReservationDialog({
  open,
  onOpenChange,
  details,
  onConfirm,
}: ReservationDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirmClick = async () => {
    setIsConfirming(true);
    const success = await onConfirm();
    setIsConfirming(false);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Konfirmasi Reservasi Anda?</AlertDialogTitle>
          <AlertDialogDescription>
            Anda akan mereservasi{" "}
            <span className="font-bold">{details.parkingName}</span> dari{" "}
            <span className="font-bold">
              {format(details.startTime, "PPP HH:mm")}
            </span>{" "}
            hingga{" "}
            <span className="font-bold">
              {format(details.endTime, "PPP HH:mm")}
            </span>
            .
            <br />
            Pembayaran akan dilakukan secara tunai (Pay by Cash).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isConfirming}>Batal</AlertDialogCancel>
          <Button onClick={handleConfirmClick} disabled={isConfirming}>
            {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ya, Konfirmasi
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
