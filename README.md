# Asha Bani Dandiya Raas 2026

Official web application and event management platform built for Asha Bani Dandiya Raas 6.0, an annual Dandiya and Garba cultural celebration conducted by a close friend. 

This project was built with Google Antigravity and the Gemini 3.7 Flash (High) reasoning model.

---

## Overview

The platform handles end-to-end event operations, from attendee engagement and interactive exhibitor stall bookings to live payment processing, automated pass generation, and gate entry verification.

### Core Features

- **Interactive Stall Booking System**: Real-time visual floor plan allowing businesses and vendors to inspect stall dimensions, section categories (Food, Premium, Front Visibility, General), pricing, and reserve stalls directly.
- **Secure Payment Processing**: Integrated with Razorpay for online checkout with automatic payment verification and instant booking confirmation.
- **Dynamic Digital Exhibitor Passes**: Generates passes equipped with encrypted high-density QR verification codes, contact details, team member allotments, and one-click image downloads.
- **Gate Entry Verifier Portal**: Mobile-first portal for event security staff featuring real-time camera QR scanning, anti-duplicate entry protection, and instant check-in status reporting.
- **Comprehensive Administration Panel**: Protected dashboard to manage stall inventory, view booking transactions, review attendee inquiries, configure site settings, upload carousel gallery media, and provision entry staff credentials.
- **Responsive Festive UI**: Built with Next.js App Router and Mantine UI with custom dark festive styling and fluid animations.

---

## Tech Stack

- **Framework**: Next.js (App Router, Turbopack)
- **Language**: TypeScript
- **UI & Styling**: Mantine Core v7, Tabler Icons, Vanilla CSS
- **Database & ORM**: PostgreSQL with Prisma ORM (with automatic fallback store for standalone development)
- **Payments**: Razorpay Node.js SDK
- **Pass & QR Engine**: qrcode, jsQR, html2canvas, docxtemplater
- **Authentication**: JWT sessions with HTTP-only cookies and bcrypt password hashing
- **Deployment**: Apache2 Reverse Proxy, Node.js/PM2, Cloudflare DNS, Let's Encrypt / Cloudflare SSL

---

## Project Structure

```
├── app/
│   ├── admin/             # Admin console routes (bookings, stalls, inquiries, users, settings)
│   ├── api/               # Serverless API routes (auth, payments, scan, stalls, inquiries)
│   ├── dandiyaraas/       # Public landing page & interactive stall booking flow
│   ├── verifier/          # Gate entry staff login & live QR scanner desk
│   └── layout.tsx         # Root application layout and theme provider
├── components/            # Reusable UI components (InteractiveStallGrid, ExhibitorPassCard, Navbar, etc.)
├── lib/                   # Core business logic (db adapter, auth, razorpay, qr-service, stall-data)
├── prisma/                # Prisma schema definition for PostgreSQL
├── public/                # Static public assets, gallery images, manifest, and icons
└── theme/                 # Mantine color scheme and typographic tokens
```

---

## Local Development Setup

### Prerequisites
- Node.js 18.18 or higher
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy the example environment file:
```bash
cp .env.example .env
```

Update `.env` with your credentials:
```env
PORT=3000
NODE_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Generate with: openssl rand -hex 32
JWT_SECRET_KEY=your_random_secret_key_here

# PostgreSQL connection (e.g. Neon.tech or local Postgres)
DATABASE_URL="postgresql://username:password@localhost:5432/dandiyadb?schema=public"

# Razorpay credentials
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id

# Default Admin account for first bootstrap
DEFAULT_ADMIN_EMAIL=admin@ashabani.com
DEFAULT_ADMIN_PASSWORD=admin@ashabani2026
```

### 4. Run database migrations (optional if using PostgreSQL)
```bash
npx prisma db push
```

### 5. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Default Access Routes

- **Public Event Portal**: `/dandiyaraas`
- **Stall Booking**: `/dandiyaraas/stall`
- **Admin Dashboard**: `/admin/login`
- **Gate Entry Verifier**: `/verifier/login`

---

## License

This project is created for the Asha Bani Dandiya Raas cultural event. All rights reserved.
