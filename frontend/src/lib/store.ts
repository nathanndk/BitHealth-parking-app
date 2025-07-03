// lib/store.ts
import { create } from "zustand";
import api from "@/lib/api"; // Impor instance Axios kustom

// --- Interfaces ---
export interface Parking {
  id: number;
  name: string;
  location: string;
  capacity: number;
}

export interface Reservation {
  id: number;
  startTime: string;
  endTime: string;
  status: string;
  paymentMethod: string;
  Parking: {
    name: string;
    location: string;
  };
  User?: {
    // Tambahkan jika backend mengembalikan info User
    name?: string | null;
    email?: string | null;
  };
  userId: number;
}

// --- Tipe State Slice ---
interface SearchState {
  availableParkings: Parking[];
  loadingSearch: boolean;
  errorSearch: string | null;
  fetchAvailableParkings: (startTime: string, endTime: string) => Promise<void>;
  createReservation: (details: {
    parkingId: number;
    startTime: string;
    endTime: string;
  }) => Promise<void>;
}

interface ReservationState {
  myReservations: Reservation[];
  loadingReservations: boolean;
  errorReservations: string | null;
  fetchMyReservations: () => Promise<void>;
  cancelUserReservation: (reservationId: number) => Promise<void>;
}

interface OfficerState {
  pendingPayments: Reservation[];
  loadingPayments: boolean;
  errorPayments: string | null;
  fetchPendingPayments: () => Promise<void>;
  confirmOfficerPayment: (reservationId: number) => Promise<void>;
}

// --- Gabungan Tipe State ---
type AppState = SearchState & ReservationState & OfficerState;

// --- Implementasi Store ---
export const useAppStore = create<AppState>((set, get) => ({
  // === Search Slice ===
  availableParkings: [],
  loadingSearch: false,
  errorSearch: null,
  fetchAvailableParkings: async (startTime, endTime) => {
    set({ loadingSearch: true, errorSearch: null, availableParkings: [] });
    try {
      const response = await api.get("/parking/available", {
        params: { startTime, endTime },
      });
      set({ availableParkings: response.data, loadingSearch: false });
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message || err.message || "Gagal mencari parkir.";
      set({ errorSearch: errMsg, loadingSearch: false });
      throw new Error(errMsg); // Lemparkan error agar komponen bisa menangkapnya (untuk toast)
    }
  },
  createReservation: async (details) => {
    // Tidak perlu set loading di sini, bisa ditangani di komponen jika perlu
    try {
      await api.post("/reservations", {
        parkingId: details.parkingId,
        startTime: details.startTime,
        endTime: details.endTime,
        paymentMethod: "CASH",
      });
      // Panggil fetchMyReservations untuk update daftar setelah berhasil
      await get().fetchMyReservations();
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Gagal membuat reservasi.";
      // Anda bisa set error global atau melempar error
      throw new Error(errMsg); // Lemparkan error agar komponen bisa menangkapnya (untuk toast)
    }
  },

  // === Reservation Slice ===
  myReservations: [],
  loadingReservations: false,
  errorReservations: null,
  fetchMyReservations: async () => {
    set({ loadingReservations: true, errorReservations: null });
    try {
      const response = await api.get("/reservations"); // Panggil endpoint GET /reservations
      set({ myReservations: response.data, loadingReservations: false });
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Gagal mengambil reservasi.";
      set({ errorReservations: errMsg, loadingReservations: false });
      throw new Error(errMsg);
    }
  },
  cancelUserReservation: async (reservationId) => {
    try {
      await api.patch(`/reservations/${reservationId}/cancel`);
      // Update state secara optimis atau fetch ulang
      set((state) => ({
        myReservations: state.myReservations.map((r) =>
          r.id === reservationId ? { ...r, status: "CANCELED" } : r
        ),
      }));
      // Atau fetch ulang: await get().fetchMyReservations();
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Gagal membatalkan reservasi.";
      throw new Error(errMsg);
    }
  },

  // === Officer Slice ===
  pendingPayments: [],
  loadingPayments: false,
  errorPayments: null,
  fetchPendingPayments: async () => {
    set({ loadingPayments: true, errorPayments: null });
    try {
      const response = await api.get("/payments");
      set({ pendingPayments: response.data, loadingPayments: false });
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Gagal mengambil pembayaran pending.";
      set({ errorPayments: errMsg, loadingPayments: false });
      throw new Error(errMsg);
    }
  },
  confirmOfficerPayment: async (reservationId) => {
    try {
      await api.patch(`/payments/${reservationId}/confirm`);
      // Update state: hapus dari pending list
      set((state) => ({
        pendingPayments: state.pendingPayments.filter(
          (p) => p.id !== reservationId
        ),
      }));
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Gagal konfirmasi pembayaran.";
      throw new Error(errMsg);
    }
  },
}));
