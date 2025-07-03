// components/CountdownTimer.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';

interface CountdownTimerProps {
  targetDate: string | Date; // Terima ISO string atau objek Date
  onEnd?: () => void; // Callback opsional saat countdown selesai
}

interface TimeLeft {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

const calculateTimeLeft = (target: Date): { timeLeft: TimeLeft, difference: number } => {
  const difference = +target - +new Date();
  let timeLeft: TimeLeft = {};

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }
  return { timeLeft, difference };
};

export default function CountdownTimer({ targetDate, onEnd }: CountdownTimerProps) {
  // Gunakan useMemo agar target tidak selalu dibuat ulang jika prop targetDate stringnya sama
  const target = useMemo(() => new Date(targetDate), [targetDate]);

  const [{ timeLeft, difference }, setTimeParts] = useState(calculateTimeLeft(target));

  useEffect(() => {
    if (difference <= 0) {
      if (onEnd) onEnd();
      return;
    }

    const timer = setInterval(() => {
      const newTimeParts = calculateTimeLeft(target);
      setTimeParts(newTimeParts);
      if (newTimeParts.difference <= 0 && onEnd) {
        onEnd();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [target, difference, onEnd]); // Perbarui effect jika targetDate (dan karenanya target) atau onEnd berubah

  if (difference <= 0) {
    return <span className="text-sm text-green-600">Waktu reservasi telah dimulai.</span>;
  }

  return (
    <span className="text-sm font-medium text-blue-600">
      {timeLeft.days !== undefined && timeLeft.days > 0 ? `${timeLeft.days}h ` : ""}
      {timeLeft.hours !== undefined && timeLeft.hours > 0 ? `${timeLeft.hours}j ` : ""}
      {timeLeft.minutes !== undefined && timeLeft.minutes > 0 ? `${timeLeft.minutes}m ` : ""}
      {timeLeft.seconds !== undefined ? `${timeLeft.seconds}d` : ""}
      {!timeLeft.days && !timeLeft.hours && !timeLeft.minutes && !timeLeft.seconds && difference > 0 ? 'Segera dimulai...' : ' tersisa'}
    </span>
  );
}
