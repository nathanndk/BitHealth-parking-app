// app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Pastikan path benar
import {
  ArrowRight,
  MapPin,
  CalendarCheck,
  CreditCard,
  ListChecks,
  ShieldCheck,
  Car,
  Heart,
} from "lucide-react"; // Ikon relevan untuk parkir
import React from "react";

// --- Komponen Internal ---

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
}) => (
  <div className="bg-muted/30 dark:bg-muted/10 p-8 rounded-2xl text-center transition-all duration-300 ease-in-out hover:shadow-2xl hover:bg-card hover:-translate-y-2 group">
    <div className="inline-flex items-center justify-center bg-background dark:bg-gray-800 text-primary rounded-full w-16 h-16 mb-6 shadow-sm border border-border/50 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
    <p className="text-muted-foreground leading-relaxed text-sm">
      {description}
    </p>
  </div>
);

interface HowItWorksStepProps {
  stepNumber: string;
  title: string;
  description: string;
}

const HowItWorksStep: React.FC<HowItWorksStepProps> = ({
  stepNumber,
  title,
  description,
}) => (
  <div className="relative p-6 text-center">
    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-8xl font-extrabold text-primary/10 -z-10">
      {stepNumber}
    </span>
    <h3 className="text-2xl font-bold text-foreground mb-3 mt-8">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

// --- Komponen Utama: LandingPage ---

export default function LandingPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background text-foreground dark:bg-gray-950 dark:text-gray-100 font-sans">
      {/* Hero Section */}
      <header className="relative py-32 sm:py-48 md:py-56 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background dark:from-primary/10 dark:via-gray-950 dark:to-gray-950"></div>
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-primary/5 rounded-full filter blur-3xl opacity-30 dark:opacity-20"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight tracking-tighter text-foreground dark:text-white text-balance">
            Parkir Jadi Mudah. <br />
            <span className="text-primary">Temukan & Pesan Tempat Anda.</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto text-balance">
            Selamat tinggal stres mencari parkir. BitHealth Parking memudahkan Anda
            menemukan, memesan, dan membayar parkir secara real-time.
          </p>
          <div className="flex justify-center items-center gap-4">
            <Link href="/signin" passHref legacyBehavior>
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg font-semibold py-3 px-8 text-lg rounded-full transition-transform hover:scale-105"
              >
                Mulai Cari Parkir
              </Button>
            </Link>
            <Link href="#features" passHref legacyBehavior>
              <Button
                size="lg"
                variant="ghost"
                className="text-primary hover:bg-primary/10 font-semibold py-3 px-8 text-lg rounded-full group"
              >
                Lihat Caranya
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 sm:py-32 bg-muted/20 dark:bg-gray-900/50"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Kemudahan Parkir di Ujung Jari
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Fitur dirancang untuk pengalaman parkir yang mulus dan bebas
              khawatir.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            <FeatureCard
              icon={<MapPin size={32} />}
              title="Pencarian Real-Time"
              description="Lihat ketersediaan spot parkir secara langsung di lokasi tujuan Anda."
            />
            <FeatureCard
              icon={<CalendarCheck size={32} />}
              title="Reservasi Instan"
              description="Amankan tempat parkir Anda sebelum tiba. Cukup beberapa ketukan saja."
            />
            <FeatureCard
              icon={<CreditCard size={32} />}
              title="Pembayaran Fleksibel"
              description="Bayar dengan mudah atau pilih opsi 'Bayar Tunai' yang dikelola petugas kami."
            />
            <FeatureCard
              icon={<ListChecks size={32} />}
              title="Kelola Pesanan"
              description="Lihat riwayat dan detail reservasi parkir Anda kapan saja."
            />
            <FeatureCard
              icon={<ShieldCheck size={32} />}
              title="Akses Petugas Khusus"
              description="Petugas dapat mengelola pembayaran tunai melalui halaman khusus."
            />
            <FeatureCard
              icon={<Car size={32} />}
              title="Parkir Lebih Cepat"
              description="Hemat waktu berharga Anda, langsung menuju spot yang sudah dipesan."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 sm:py-32 bg-background dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-24">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Parkir dalam 3 Langkah
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Sederhana, cepat, dan efisien. Seperti inilah seharusnya parkir.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 border-t border-border pt-16">
            <HowItWorksStep
              stepNumber="01"
              title="Cari & Pilih"
              description="Masukkan lokasi, tanggal, dan waktu. Pilih spot parkir yang tersedia."
            />
            <HowItWorksStep
              stepNumber="02"
              title="Reservasi"
              description="Konfirmasi pesanan Anda. Spot parkir aman menunggu kedatangan Anda."
            />
            <HowItWorksStep
              stepNumber="03"
              title="Parkir & Bayar"
              description="Tiba di lokasi, parkir dengan tenang, dan bayar sesuai pilihan Anda."
            />
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 sm:py-32 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Siap Mengubah Cara Anda Parkir?
          </h2>
          <p className="text-lg sm:text-xl text-primary-foreground/80 mb-10 max-w-xl mx-auto">
            Rasakan kemudahan menemukan dan memesan parkir. Coba BitHealth Parking
            sekarang!
          </p>
          <Link href="/signin" passHref legacyBehavior>
            <Button
              size="lg"
              variant="secondary"
              className="bg-background text-primary hover:bg-background/90 shadow-lg font-bold py-3 px-8 text-lg rounded-full transition-transform hover:scale-105"
            >
              Masuk atau Daftar Sekarang
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background dark:bg-gray-950 border-t border-border/40 text-muted-foreground py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p>
            &copy; {currentYear} BitHealth. All Rights Reserved. (Parking
            Reservation System)
          </p>
        </div>
      </footer>
    </div>
  );
}
