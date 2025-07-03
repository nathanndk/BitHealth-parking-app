"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldAlert, CheckCircle2 } from "lucide-react";
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
import { useAppStore, Reservation } from '@/lib/store';

export default function OfficerPaymentsPage() {
  const { data: session, status } = useSession();
  const userRole = session?.user?.role;
  const { toast } = useToast();

  const { pendingPayments, loadingPayments, fetchPendingPayments, confirmOfficerPayment } = useAppStore();
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const handleConfirm = async (reservationId: number) => {
    setConfirmingId(reservationId);
    try {
      await confirmOfficerPayment(reservationId);
      toast({ title: "Sukses", description: "Pembayaran berhasil dikonfirmasi." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Gagal Konfirmasi", description: err.message });
    } finally {
      setConfirmingId(null);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
        if (userRole === "OFFICER") {
            fetchPendingPayments().catch(err => {
                toast({ variant: "destructive", title: "Error", description: err.message || "Gagal memuat data." });
            });
        }
    }
  }, [status, userRole, fetchPendingPayments, toast]);

  if (status === "loading") {
    return (
        <div className="container mx-auto p-8 flex justify-center items-center h-[60vh]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  if (status === "unauthenticated" || userRole !== "OFFICER") {
    return (
        <div className="container mx-auto p-8 text-center bg-destructive/10 rounded-lg h-[40vh] flex flex-col justify-center items-center border border-destructive/20">
            <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
            <h1 className="text-2xl font-semibold mb-2 text-destructive">Akses Ditolak</h1>
            <p className="text-destructive/80">
                Halaman ini hanya dapat diakses oleh Petugas.
            </p>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-6 md:p-8 space-y-8">
      <header>
          <h1 className="text-3xl font-bold tracking-tight">Konfirmasi Pembayaran</h1>
          <p className="text-muted-foreground mt-1">
              Verifikasi dan konfirmasi pembayaran tunai yang diterima.
          </p>
      </header>

      <Card>
          <CardHeader>
              <CardTitle>Pembayaran Menunggu Konfirmasi</CardTitle>
              <CardDescription>
                  Berikut adalah daftar reservasi yang pembayarannya perlu dikonfirmasi.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-semibold">ID Reservasi</TableHead>
                      <TableHead className="font-semibold">Nama Pengguna</TableHead>
                      <TableHead className="font-semibold">Spot Parkir</TableHead>
                      <TableHead className="font-semibold">Waktu Mulai</TableHead>
                      <TableHead className="text-right font-semibold">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingPayments && pendingPayments.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-48 text-center">
                                <div className="flex justify-center items-center text-muted-foreground">
                                    <Loader2 className="h-6 w-6 animate-spin mr-3" /> Memuat data...
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : pendingPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                          Tidak ada pembayaran yang menunggu konfirmasi saat ini.
                        </TableCell>
                      </TableRow>
                    ) : (
                      pendingPayments.map((r) => (
                        <TableRow key={r.id} className="hover:bg-muted/20">
                          <TableCell className="font-mono text-xs">{r.id}</TableCell>
                          <TableCell className="font-medium">
                            {r.User?.name || r.User?.email || `User ID: ${r.userId}`}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{r.Parking?.name || "N/A"}</TableCell>
                          <TableCell className="text-sm">{format(new Date(r.startTime), "dd MMM, HH:mm")}</TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" disabled={confirmingId === r.id || loadingPayments}>
                                  {confirmingId === r.id ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                  )}
                                  Konfirmasi Bayar
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Konfirmasi Pembayaran?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Anda akan mengkonfirmasi bahwa pembayaran tunai telah diterima untuk Reservasi ID: <strong>{r.id}</strong> oleh pengguna <strong>{r.User?.name || r.User?.email}</strong>. Pastikan Anda sudah menerima pembayaran yang sesuai.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel disabled={confirmingId === r.id}>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleConfirm(r.id)}
                                    disabled={confirmingId === r.id}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Ya, Konfirmasi
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
          </CardContent>
      </Card>
    </div>
  );
}