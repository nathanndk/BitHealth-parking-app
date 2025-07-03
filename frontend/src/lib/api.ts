// lib/axios.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getSession, signOut } from "next-auth/react";

// Buat instance Axios
const api = axios.create({
  baseURL: "https://BitHealth-parking-backend.vercel.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor untuk Request (Sebelum Request Dikirim)
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Ambil session saat ini menggunakan getSession (bisa dipanggil di luar komponen)
    const session = await getSession();

    // Jika session dan token ada, tambahkan header Authorization
    if (session?.user?.accessToken) {
      config.headers.Authorization = `Bearer ${session.user.accessToken}`;
    }

    // Kembalikan config agar request bisa dilanjutkan
    return config;
  },
  (error: AxiosError) => {
    // Lakukan sesuatu jika ada error saat setup request
    console.error("Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

// Interceptor untuk Response (Setelah Menerima Response) - Opsional tapi Sangat Berguna
api.interceptors.response.use(
  (response) => {
    // Jika response sukses (status 2xx), langsung kembalikan
    return response;
  },
  async (error: AxiosError) => {
    // Cek jika error ada response (bukan network error, dll)
    if (error.response) {
      // Jika status adalah 401 (Unauthorized)
      if (error.response.status === 401) {
        console.error(
          "Unauthorized (401) - Token might be expired or invalid."
        );
        // Anda bisa mencoba refresh token di sini jika Anda mengimplementasikannya.
        // Jika tidak, atau refresh gagal, lakukan signOut.
        // Cek agar tidak terjadi loop signout jika halaman signin sendiri menyebabkan 401
        if (
          typeof window !== "undefined" &&
          window.location.pathname !== "/signin"
        ) {
          console.log("Redirecting to sign-in page due to 401 error.");
          // Lakukan sign-out dan redirect ke halaman login
          await signOut({ redirect: true, callbackUrl: "/signin" });
        }
      }
      // Anda bisa menangani error global lain di sini (misal 500, 403, dll)
    } else if (error.request) {
      // Request dibuat tapi tidak ada response (network error)
      console.error("Network Error or No Response:", error.request);
    } else {
      // Error lain saat setup request
      console.error("Axios Error:", error.message);
    }

    // Kembalikan error agar bisa ditangani di level panggilan (jika perlu)
    return Promise.reject(error);
  }
);

// Export instance yang sudah dikonfigurasi
export default api;
