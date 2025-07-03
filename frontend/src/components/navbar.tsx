// components/Navbar.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "../../auth"; // Sesuaikan path jika auth.ts Anda ada di root atau di tempat lain
import { handleSignOut } from "@/app/actions/authActions"; // Sesuaikan path jika diperlukan
import {
  LogIn,
  LogOut,
  ParkingSquare,
  LayoutDashboard,
  CreditCard,
} from "lucide-react"; // Tambahkan ikon CreditCard atau yang sesuai

export default async function Navbar() {
  const session = await auth();
  const user = session?.user;
  const userRole = user?.role; // Ambil role pengguna

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Branding/Logo Section */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-primary"
        >
          <ParkingSquare className="h-7 w-7" />
          <span className="hidden sm:inline-block">BitHealth</span>{" "}
          {/* Ganti dengan nama aplikasi Anda */}
        </Link>

        {/* Navigation Links & Auth Section */}
        <nav className="flex items-center gap-3 sm:gap-4">
          {/* Tautan navigasi umum lainnya bisa ditambahkan di sini */}
          {user && (
            <Link href="/search" legacyBehavior passHref>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
              >
                Cari Parkir
              </Button>
            </Link>
          )}
          {user && (
            <Link href="/reservation" legacyBehavior passHref>
              <Button variant="ghost" size="sm">
                <LayoutDashboard className="mr-0 h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline-block">Reservasiku</span>
              </Button>
            </Link>
          )}

          {/* Tautan khusus untuk OFFICER */}
          {userRole === "OFFICER" && (
            <Link href="/payment" legacyBehavior passHref>
              <Button
                variant="ghost"
                size="sm"
                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              >
                <CreditCard className="mr-0 h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline-block">Pembayaran</span>
              </Button>
            </Link>
          )}

          {!user ? (
            <Link href="/signin">
              <Button variant="default" size="sm">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-3 sm:gap-4">
              {user.name && (
                <span className="hidden text-sm font-medium text-muted-foreground md:inline-block">
                  {user.name}
                </span>
              )}
              <form action={handleSignOut}>
                <Button variant="outline" size="sm" type="submit">
                  <LogOut className="mr-0 h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline-block">Sign Out</span>
                </Button>
              </form>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
