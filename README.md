# Sistem Reservasi Parkir

Aplikasi full-stack untuk reservasi parkir dengan:

- **Role**: User & Officer  
- **Frontend**: Next.js 15 + ShadCN UI  
- **Autentikasi**: Auth.js (NextAuth)  
- **Backend**: Express.js + Prisma + PostgreSQL  
- **HTTP Client**: Axios dengan Interceptor  
- **State Management**: Zustand  
- **Validation**: Zod + React Hook Form  
- **Testing**: Jest (backend) & Vitest (frontend)

---

## 🎯 Fitur Utama
1. **Lihat Lot Parkir** berdasarkan tanggal & waktu  
2. **Reservasi Spot** dengan metode “Pay by Cash”  
3. **Batalkan Reservasi** (sebelum waktu mulai)  
4. **View Reservasi Saya** (upcoming & history)  
5. **Dashboard Officer** untuk konfirmasi pembayaran tunai  
6. **Autentikasi & RBAC** (User vs Officer)  
7. **Global Axios Interceptor** untuk token handling  
8. **SSR** via Next.js App Router  

---

## 🛠️ Stack Teknologi
Frontend
```bash
Next.js 15 (App Router)
ShadCN UI (Tailwind v4)
Auth.js (NextAuth)
Axios + Interceptor
Zustand
Zod + React Hook Form
Backend

Node.js + Express.js
Prisma ORM + PostgreSQL
JWT + Bcrypt
CORS middleware
Jest
🚀 Cara Jalankan
bash
# 1. Clone repository
git clone <repo-url>
cd <project-root>

# 2. Setup Environment

## backend/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/parking_db"
JWT_SECRET="rahasia_jwt"

## frontend/.env.local
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
NEXTAUTH_SECRET="rahasia_nextauth"

# 3. Database & Migration (backend)
cd backend
npm install
npm prisma migrate dev --name init

# 4. Jalankan Backend
npm start
# Server di http://localhost:5000

# 5. Jalankan Frontend
cd ../frontend
npm install --force
npm run dev
# App di http://localhost:3000

🧪 Testing
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
📁 Struktur Proyek
backend/
├─ prisma/
│  └─ schema.prisma
├─ src/
│  ├─ controllers/
│  ├─ middlewares/
│  ├─ routes/
│  └─ index.ts

frontend/
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx
│  ├─ park/[id]/page.tsx
│  └─ dashboard/page.tsx
├─ lib/
│  ├─ api.ts
│  └─ zod.ts
└─ components/
   └─ ui/

📝 API Reference
http
# Prefix: /api

# Auth
POST   /api/auth/register
POST   /api/auth/login          → { token }
GET    /api/auth/me

# Parking Lot
GET    /api/parking
GET    /api/parking/available?startTime=&endTime=
GET    /api/parking/:id
POST   /api/parking             (Officer)
PUT    /api/parking/:id         (Officer)
DELETE /api/parking/:id         (Officer)

# Reservations
GET    /api/reservations?userId=&status=&past=
POST   /api/reservations
PATCH  /api/reservations/:id/cancel

# Payments (Officer)
GET    /api/payments
PATCH  /api/payments/:id/confirm

MIT © 2025
# BitHealth-parking-app
