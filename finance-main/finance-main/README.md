# The Accounting Room

A full-stack accounting and tax services website for **The Accounting Room** — built with Next.js 16, Supabase, Resend, and deployed on Vercel.

**Live URL:** https://finance-main-sand.vercel.app

---

## What This Site Does

The Accounting Room is a professional website that allows clients to:

- View all services and transparent pricing
- Book a consultation directly on the site
- Submit a contact enquiry
- Upload and manage financial documents via a secure client portal
- Chat with an assistant widget (with WhatsApp and email actions)

The business owner can:

- View and manage all bookings
- Read contact form submissions
- Set available time slots for bookings
- Download uploaded client documents
- Manage everything from the admin dashboard

---

## Pages

### Home (`/`)
The main landing page. Contains five sections:
1. **Hero** — headline, CTA buttons (Book Consultation, Client Portal)
2. **Services** — overview of all service categories with icons
3. **Pricing** — four service cards with itemised fees (Personal Tax, Business Tax, Monthly Compliance, Companies & CIPC)
4. **Booking** — live calendar where clients pick a date and time, enter their email, and confirm a consultation
5. **Contact** — contact form (name, email, message) that emails the business and saves to the database

### Services (`/services`)
A dedicated page listing all services offered.

### Booking (`/booking`)
A standalone booking page (same calendar functionality as the home page booking section).

### Contact (`/contact`)
A standalone contact form page.

### Client Portal (`/portal`)
A secure area for logged-in clients to upload and view their financial documents.

### Auth (`/auth/login` and `/auth/signup`)
Login and registration pages powered by Supabase Auth.

### Admin Dashboard (`/admin`)
A protected back-office page for the business owner. Displays:
- All bookings
- All contact form submissions
- All uploaded documents (with download links)
- Ability to set available time slots for the booking calendar

---

## How Each Feature Works

 

### Contact Form
1. Client fills in name, email, and message
2. On submit, the message is saved to `contact_submissions` in Supabase
3. An email notification is sent to the business via Resend

### Client Portal
1. Client signs up or logs in using Supabase Auth
2. Once logged in, they can upload documents (tax forms, payslips, bank statements, etc.)
3. Uploaded files are stored securely and visible to the admin

### Chat Widget
A floating **"Chat with us"** button appears in the bottom-right corner of every page.
- Client types a question — the assistant gives keyword-based replies covering pricing, services, bookings, and documents
- **WhatsApp button** — opens WhatsApp with the full chat history pre-filled, sent to +27 60 998 0062
- **Send to Email button** — sends the full chat transcript to the business email via Resend (`/api/send-email`)

### Admin Dashboard
Protected by a password. The admin can:
- View all bookings in a table
- Read all contact submissions
- Download uploaded client documents
- Add or remove available time slots on the booking calendar

---

## API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/booking` | POST | Save booking to Supabase + send confirmation emails |
| `/api/contact` | POST | Save contact message to Supabase + send email |
| `/api/send-email` | POST | Send chat widget transcript via Resend |
| `/api/availability` | GET | Fetch available booking slots |
| `/api/upload` | POST | Upload a client document |
| `/api/admin/bookings` | GET | Fetch all bookings (admin only) |
| `/api/admin/contacts` | GET | Fetch all contact submissions (admin only) |
| `/api/admin/documents` | GET | Fetch all uploaded documents (admin only) |
| `/api/admin/availability` | POST/DELETE | Add or remove time slots |
| `/api/admin/download` | GET | Download a client document |
| `/api/admin/messages` | GET | Fetch admin messages |

---

## Database Tables (Supabase)

| Table | Columns | Purpose |
|---|---|---|
| `bookings` | id, email, date, time, created_at | Stores consultation bookings |
| `availability` | id, date, time, is_booked, created_at | Admin-set available time slots |
| `contact_submissions` | id, name, email, message, created_at | Contact form entries |
| `documents` | id, user_id, file_name, file_url, created_at | Uploaded client files |
| `messages` | id, user_id, content, created_at | Internal messages |

---

## Pricing (from the fee schedule)

### Personal Tax Returns
| Service | Price |
|---|---|
| Standard IT12 (IRP5 only) | R1 665 |
| IT12 (IRP5 + Rental income) | R2 248 |
| Sole Proprietor IT12 | R2 831 |
| Catch-up standard return (per year) | R1 665 |
| Catch-up extended return (per year) | R2 248 |
| SARS audit / verification (per hour) | R988 |

### Business & Provisional Tax
| Service | Price |
|---|---|
| Provisional Tax — IRP6 (per period) | R904 |
| Company / CC — IT14 | R1 915 |
| Trust — IT12TR | R1 915 |

### Monthly Books & Compliance
| Service | Price |
|---|---|
| VAT201 return (per return) | R288 |
| EMP201 / PAYE return (per return) | R288 |
| Bookkeeping data entry (per hour) | R476 |
| Payroll — payslips (per employee / month) | R77 |

### Companies & CIPC
| Service | Price |
|---|---|
| Register a new Pty (Ltd) | R2 350 |
| CIPC annual return | R2 500 |

*All prices exclude VAT.*

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| Email | Resend |
| Deployment | Vercel |

---

## Brand

| Name | Hex |
|---|---|
| Olive Green (primary) | `#6B7A45` |
| Gold (accent) | `#C9A96A` |
| Background | `#F5F2EC` |

---

## Environment Variables

Add a `.env.local` file to the project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=your-resend-api-key
```

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Add environment variables
# Create .env.local and fill in the values above

# 3. Start the dev server
npm run dev
```

Open http://localhost:3000

---

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

Environment variables must also be added in the Vercel dashboard under **Settings → Environment Variables**.

---

## Repository

GitHub: https://github.com/HeyitsOn/Automation
