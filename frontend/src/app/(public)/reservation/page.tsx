"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { id as indonesiaLocale } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Info } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore, Reservation } from "@/lib/store";
import CountdownTimer from "@/components/countdown-timer";
import { cn } from "@/lib/utils";

export default function MyReservationsPage() {
  const { status: sessionStatus } = useSession();
  const { toast } = useToast();

  const {
    myReservations,
    loadingReservations,
    fetchMyReservations,
    cancelUserReservation,
  } = useAppStore();

  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const handleCancel = async (reservationId: number) => {
    setCancellingId(reservationId);
    try {
      await cancelUserReservation(reservationId);
      toast({
        title: "Sukses",
        description: "Reservasi Anda telah berhasil dibatalkan.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Gagal Membatalkan",
        description: err.message || "Terjadi kesalahan saat membatalkan.",
      });
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchMyReservations().catch((error) => {
        console.error("Gagal memuat reservasi:", error);
        toast({
          variant: "destructive",
          title: "Gagal Memuat Data",
          description: "Tidak dapat memuat data reservasi Anda.",
        });
      });
    }
  }, [sessionStatus, fetchMyReservations, toast]);

  const now = new Date();
  const currentReservations = myReservations.filter(
    (r) =>
      new Date(r.endTime) >= now &&
      r.status !== "CANCELED" &&
      r.status !== "COMPLETED"
  );
  const pastReservations = myReservations.filter(
    (r) =>
      new Date(r.endTime) < now ||
      r.status === "CANCELED" ||
      r.status === "COMPLETED"
  );

  const getStatusBadgeVariant = (
    status: string
  ): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
      case "CONFIRMED":
        return "default"; // Green (default often maps to primary/blue, might need custom styling)
      case "PENDING":
        return "secondary"; // Yellow/Gray
      case "CANCELED":
        return "destructive"; // Red
      case "COMPLETED":
        return "outline"; // Gray/Outline
      default:
        return "outline";
    }
  };

  const getStatusBadgeColor = (status: string): string => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800 border-green-200 hover:bg-green-100";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100";
      case "CANCELED":
        return "bg-red-100 text-red-800 border-red-200 hover:bg-red-100";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100";
    }
  };

  if (sessionStatus === "loading") {
    return (
      <div className="container mx-auto p-8 flex justify-center items-center h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (sessionStatus === "unauthenticated") {
    return (
      <div className="container mx-auto p-8 text-center bg-muted/30 rounded-lg h-[40vh] flex flex-col justify-center items-center">
        <Info className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Akses Ditolak</h1>
        <p className="text-muted-foreground">
          Silakan login untuk melihat riwayat reservasi Anda.
        </p>
      </div>
    );
  }

  const renderTable = (data: Reservation[], type: "current" | "past") => (
    <div className="overflow-x-auto border rounded-md">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="min-w-[150px] font-semibold">
              Spot Parkir
            </TableHead>
            <TableHead className="min-w-[150px] font-semibold">
              Lokasi
            </TableHead>
            <TableHead className="min-w-[180px] font-semibold">
              Waktu Mulai
            </TableHead>
            <TableHead className="min-w-[180px] font-semibold">
              Waktu Selesai
            </TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            {type === "current" && (
              <TableHead className="text-right font-semibold">Aksi</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loadingReservations && data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={type === "current" ? 6 : 5}
                className="h-48 text-center"
              >
                <div className="flex justify-center items-center text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mr-3" /> Memuat
                  data...
                </div>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={type === "current" ? 6 : 5}
                className="h-48 text-center text-muted-foreground"
              >
                Tidak ada reservasi{" "}
                {type === "current" ? "aktif" : "dalam riwayat"}.
              </TableCell>
            </TableRow>
          ) : (
            data.map((r) => {
              const reservationStartTime = new Date(r.startTime);
              const showCountdown =
                (r.status === "CONFIRMED" || r.status === "PENDING") &&
                reservationStartTime > now;
              const isOngoing =
                (r.status === "CONFIRMED" || r.status === "PENDING") &&
                reservationStartTime <= now &&
                new Date(r.endTime) > now;

              return (
                <TableRow key={r.id} className="hover:bg-muted/20">
                  <TableCell className="font-medium">
                    {r.Parking?.name || "N/A"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.Parking?.location || "N/A"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(reservationStartTime, "dd MMM yyyy, HH:mm", {
                      locale: indonesiaLocale,
                    })}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(r.endTime), "dd MMM yyyy, HH:mm", {
                      locale: indonesiaLocale,
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-start space-y-1">
                      <Badge
                        variant={getStatusBadgeVariant(r.status)}
                        className={cn(
                          "text-xs w-fit",
                          getStatusBadgeColor(r.status)
                        )}
                      >
                        {r.status}
                      </Badge>
                      {showCountdown && (
                        <CountdownTimer
                          targetDate={r.startTime}
                          onEnd={() => fetchMyReservations()}
                        />
                      )}
                      {isOngoing && (
                        <Badge
                          variant="outline"
                          className="text-xs text-blue-600 border-blue-200"
                        >
                          Sedang Berlangsung
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  {type === "current" && (
                    <TableCell className="text-right">
                      {(r.status === "PENDING" || r.status === "CONFIRMED") &&
                      new Date(r.endTime) > now ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              disabled={cancellingId === r.id}
                            >
                              {cancellingId === r.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Batalkan"
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Batalkan Reservasi Ini?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Anda akan membatalkan reservasi untuk{" "}
                                <strong>{r.Parking?.name || "N/A"}</strong>
                                <br />
                                Mulai:{" "}
                                <strong>
                                  {format(reservationStartTime, "PPpp", {
                                    locale: indonesiaLocale,
                                  })}
                                </strong>
                                .
                                <br />
                                Tindakan ini tidak dapat diurungkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                disabled={cancellingId === r.id}
                              >
                                Tidak
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleCancel(r.id)}
                                disabled={cancellingId === r.id}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Ya, Batalkan
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Reservasi Saya</h1>
        <p className="text-muted-foreground mt-1">
          Lihat dan kelola semua reservasi parkir Anda di sini.
        </p>
      </header>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 h-12 px-2">
          <TabsTrigger value="current" className="text-base">
            Sedang Berlangsung
          </TabsTrigger>
          <TabsTrigger value="past" className="text-base">
            Riwayat
          </TabsTrigger>
        </TabsList>
        <TabsContent value="current">
          <Card>
            <CardHeader>
              <CardTitle>Reservasi Aktif & Akan Datang</CardTitle>
              <CardDescription>
                Ini adalah reservasi Anda yang belum selesai atau belum dimulai.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderTable(currentReservations, "current")}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="past">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Reservasi</CardTitle>
              <CardDescription>
                Semua reservasi yang telah selesai atau dibatalkan.
              </CardDescription>
            </CardHeader>
            <CardContent>{renderTable(pastReservations, "past")}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
