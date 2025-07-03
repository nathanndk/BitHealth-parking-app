"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ReservationDialog from "@/components/reservation-dialog";
import { useAppStore, Parking } from "@/lib/store";

interface ReservationDetails {
  parkingId: number;
  parkingName: string;
  startTime: Date;
  endTime: Date;
}

export default function SearchPage() {
  const { status } = useSession();
  const { toast } = useToast();
  const {
    availableParkings,
    loadingSearch,
    fetchAvailableParkings,
    createReservation,
  } = useAppStore();

  const [startTime, setStartTime] = useState<Date | undefined>(new Date());
  const [endTime, setEndTime] = useState<Date | undefined>(
    new Date(new Date().getTime() + 60 * 60 * 1000)
  );
  const [startTimeStr, setStartTimeStr] = useState("09:00");
  const [endTimeStr, setEndTimeStr] = useState("10:00");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedParking, setSelectedParking] =
    useState<ReservationDetails | null>(null);
  const [loadingReserve, setLoadingReserve] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const combineDateAndTime = (
    date: Date | undefined,
    timeStr: string
  ): Date | null => {
    if (!date) return null;
    const [hours, minutes] = timeStr.split(":").map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  };

  const handleSearch = async () => {
    setHasSearched(true);
    if (!startTime || !endTime) {
      toast({
        variant: "destructive",
        title: "Input Tidak Lengkap",
        description: "Silakan pilih tanggal mulai dan selesai.",
      });
      return;
    }

    const start = combineDateAndTime(startTime, startTimeStr);
    const end = combineDateAndTime(endTime, endTimeStr);

    if (!start || !end || start >= end) {
      toast({
        variant: "destructive",
        title: "Waktu Tidak Valid",
        description: "Waktu mulai harus sebelum waktu selesai.",
      });
      return;
    }

    try {
      await fetchAvailableParkings(start.toISOString(), end.toISOString());
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error Pencarian",
        description: err.message || "Terjadi kesalahan saat mencari parkir.",
      });
    }
  };

  const handleReserveClick = (parking: Parking) => {
    const start = combineDateAndTime(startTime, startTimeStr);
    const end = combineDateAndTime(endTime, endTimeStr);

    if (!start || !end || start >= end) {
      toast({
        variant: "destructive",
        title: "Error Waktu",
        description: "Waktu yang dipilih tidak valid.",
      });
      return;
    }

    setSelectedParking({
      parkingId: parking.id,
      parkingName: parking.name,
      startTime: start,
      endTime: end,
    });
    setDialogOpen(true);
  };

  const handleConfirmReservation = async () => {
    if (!selectedParking) return false;
    setLoadingReserve(true);
    try {
      await createReservation({
        parkingId: selectedParking.parkingId,
        startTime: selectedParking.startTime.toISOString(),
        endTime: selectedParking.endTime.toISOString(),
      });
      toast({ title: "Sukses", description: "Reservasi berhasil dibuat!" });
      setDialogOpen(false);
      await handleSearch(); // Refresh list
      return true;
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error Reservasi",
        description: err.message,
      });
      return false;
    } finally {
      setLoadingReserve(false);
    }
  };

  useEffect(() => {
    const now = new Date();
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
    setStartTimeStr(format(now, "HH:mm"));
    setEndTimeStr(format(nextHour, "HH:mm"));
  }, []);

  if (status === "loading")
    return (
      <div className="container mx-auto p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
      </div>
    );
  if (status === "unauthenticated")
    return (
      <div className="container mx-auto p-8 text-center text-lg font-medium">
        Silakan login untuk mencari parkir.
      </div>
    );

  return (
    <div className="container mx-auto p-6 md:p-8 space-y-8">
      <Card className="border-0 shadow-none md:border md:shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Cari Tempat Parkir</CardTitle>
          <CardDescription>
            Pilih tanggal dan waktu untuk menemukan spot yang tersedia.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="space-y-2">
            <Label htmlFor="startDate">Tanggal Mulai</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="startDate"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startTime && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startTime ? (
                    format(startTime, "PPP")
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startTime}
                  onSelect={setStartTime}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="startTime">Waktu Mulai</Label>
            <Input
              id="startTime"
              type="time"
              value={startTimeStr}
              onChange={(e) => setStartTimeStr(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">Tanggal Selesai</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="endDate"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endTime && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endTime ? (
                    format(endTime, "PPP")
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endTime}
                  onSelect={setEndTime}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime">Waktu Selesai</Label>
            <Input
              id="endTime"
              type="time"
              value={endTimeStr}
              onChange={(e) => setEndTimeStr(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSearch} disabled={loadingSearch} size="lg">
            {loadingSearch ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            Cari Parkir
          </Button>
        </CardFooter>
      </Card>

      <div>
        <h2 className="text-2xl font-semibold mb-6">Hasil Pencarian</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingSearch ? (
            <div className="col-span-full flex flex-col justify-center items-center h-48 bg-muted/30 rounded-lg">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
              <p className="text-muted-foreground">
                Mencari spot terbaik untuk Anda...
              </p>
            </div>
          ) : availableParkings.length > 0 ? (
            availableParkings.map((p) => (
              <Card key={p.id} className="transition-all hover:shadow-lg">
                <CardHeader>
                  <CardTitle>{p.name}</CardTitle>
                  <CardDescription>{p.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Tersedia untuk waktu yang Anda pilih.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleReserveClick(p)}
                    disabled={loadingReserve}
                    className="w-full"
                  >
                    {loadingReserve && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Reservasi Sekarang
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col justify-center items-center h-48 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground text-center">
                {hasSearched
                  ? "Tidak ada parkir tersedia untuk waktu yang dipilih."
                  : "Silakan lakukan pencarian untuk melihat spot parkir."}
              </p>
              {!hasSearched && (
                <Search className="w-8 h-8 mt-3 text-muted-foreground/50" />
              )}
            </div>
          )}
        </div>
      </div>

      {selectedParking && (
        <ReservationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          details={selectedParking}
          onConfirm={handleConfirmReservation}
        />
      )}
    </div>
  );
}
