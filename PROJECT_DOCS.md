# 📚 CHAMAN CAB — Complete System Documentation
> **For AI Agents (Claude, Gemini, GPT, etc.):** Read this ENTIRE file before making any change to this project. It contains critical system architecture, safety rules, and operational context.

---

## 📋 Table of Contents
1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Database Architecture](#3-database-architecture)
4. [Application Flow](#4-application-flow)
5. [Admin Features](#5-admin-features)
6. [Deployment System](#6-deployment-system)
7. [Critical Safety Rules](#7-critical-safety-rules)
8. [Known Risks](#8-known-risks)
9. [Backup & Recovery System](#9-backup--recovery-system)
10. [Future Roadmap](#10-future-roadmap)
11. [AI Agent Instructions](#11-ai-agent-instructions)

---

## 1. Project Overview

| Field | Details |
|---|---|
| **Project Name** | Chaman Cab (Chaman Tour and Travels) |
| **Type** | Full-stack cab booking platform |
| **Domain** | Intercity & local cab services in Uttar Pradesh, India |
| **Live URL** | Hosted on AWS EC2 at IP `98.84.13.176` |
| **GST Number** | 09COVPK1632M1ZA |

### Purpose
Chaman Cab is a production cab booking platform serving customers in Jagdishpur, Lucknow, Amethi, Raebareli, Ayodhya, Barabanki, Sultanpur, and nearby areas in Uttar Pradesh.

### Main Functionality
- **Public website:** Customers can search, book, and pay for cab rides
- **Admin dashboard:** Operators manage bookings, fleet, drivers, pricing, offers, and coupons
- **Booking types supported:**
  - One Way (point-to-point intercity)
  - Round Trip (return journey)
  - Local Rental (hourly packages within a city)
  - Self Drive (customer drives themselves)
  - Hire Driver (driver only, no cab)
- **Payment methods:** Pay on Pickup, Razorpay (online), Partial payment
- **Notifications:** Telegram bot alerts for new bookings, WhatsApp links for payment collection

---

## 2. Tech Stack

### Frontend
- **Framework:** Next.js 16.2.2 (App Router)
- **Styling:** Tailwind CSS v4
- **Icons:** Google Material Symbols (via CDN)
- **Fonts:** Inter, Noto Sans, Plus Jakarta Sans

### Backend
- **Runtime:** Node.js (via Next.js API routes + Server Actions)
- **ORM:** Prisma v7.6.0 with `better-sqlite3` adapter
- **Authentication:** Custom session-based admin auth (cookie)
- **Payment Gateway:** Razorpay (live keys configured)
- **SMS:** Fast2SMS API for OTP
- **Notifications:** Telegram Bot API

### Database
- **Type:** SQLite (single `.db` file — see Section 3 for critical details)
- **File:** `dev.db` located at `/home/ubuntu/app/dev.db` on EC2

### Infrastructure
| Component | Detail |
|---|---|
| **Hosting** | AWS EC2 — Ubuntu 24.04 LTS |
| **Instance IP** | `98.84.13.176` |
| **Process Manager** | PM2 (app name: `chamancab`) |
| **Reverse Proxy** | Nginx (port 80 → localhost:3000) |
| **Backup Storage** | AWS S3 bucket: `chamancab-db-backups` (region: us-east-1) |

### Key Environment Variables (on EC2 at `/home/ubuntu/app/.env`)
```
DATABASE_URL="file:./dev.db"
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
FAST2SMS_API_KEY=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
GOOGLE_MAPS_API_KEY=...
```

---

## 3. Database Architecture

### ⚠️ CRITICAL: This is SQLite, Not PostgreSQL

The entire database is stored in a **single binary file**: `/home/ubuntu/app/dev.db`

This means:
- **No database server** — it's just a file on disk
- **Overwriting this file = total data loss** with no recovery
- **`prisma db push` on schema changes can silently drop and recreate tables**, wiping all data
- **No WAL log / transaction history** — once data is gone, it cannot be recovered unless a backup exists

### Database Tables

| Table | Purpose |
|---|---|
| `Booking` | All customer bookings (One Way, Round Trip, Rental) |
| `Car` | Fleet of vehicles available for booking |
| `Driver` | Hire-a-driver listings |
| `SelfDriveCar` | Self-drive vehicle listings |
| `City` | Operational cities |
| `Location` | Pickup/drop hubs within cities |
| `CityDistance` | Distance matrix between cities |
| `RoutePricing` | Per-route fare for each car type |
| `RentalPackage` | Local rental packages (4hr/40km, 8hr/80km, etc.) |
| `RentalPricing` | Rental fare per car per package |
| `Coupon` | Discount coupon codes |
| `Offer` | Promotional announcements (header banner) |
| `Payment` | Razorpay payment records |
| `DriverBooking` | Hire-driver bookings |
| `SelfDriveBooking` | Self-drive bookings |
| `Admin` | Admin user accounts |
| `User` | Customer accounts |
| `Otp` | OTP records for customer login |

### Prisma Schema Location
`/Users/adityasingh/chamancab/prisma/schema.prisma`

---

## 4. Application Flow

### 4.1 Customer Booking Flow

#### One Way / Round Trip
1. Customer visits homepage → selects trip type (One Way / Round Trip)
2. Enters pickup and drop locations (Google Places Autocomplete)
3. Selects date and time (+ return date/time for Round Trip)
4. System fetches available cars with pricing from `RoutePricing` table
5. Customer selects car → fills passenger details (name, phone, email)
6. Optionally applies coupon code → discount applied if valid
7. Selects payment method (Pay on Pickup / Online via Razorpay)
8. Booking confirmed → stored in `Booking` table
9. Telegram alert sent to admin

#### Local Rental
1. Customer selects city and package (e.g., 8hr/80km)
2. System fetches pricing from `RentalPricing` table
3. Booking flow same as above

### 4.2 Hire Driver Flow
1. Customer visits `/hire-driver`
2. Selects driver, duty type: **Half Day** or **Full Day**
3. System calculates:
   - Half Day: `halfDayPrice`
   - Full Day: `fullDayPrice`
   - **Night Charge: +₹200** if pickup time is between **9 PM and 6 AM**
4. Customer pays full amount online (Razorpay only — no Pay on Pickup)
5. Booking stored in `DriverBooking` table

### 4.3 Self Drive Flow
1. Customer visits `/self-drive`
2. Selects vehicle from `SelfDriveCar` table
3. Pays online via Razorpay
4. Booking stored in `SelfDriveBooking` table

### 4.4 Coupon Flow
1. Customer enters coupon code in booking form
2. System checks `Coupon` table: validity, expiry, usage limit
3. If valid: discount calculated (percent-based), price updated instantly
4. Coupon applied → `couponCode`, `discountPercent`, `discountAmount` saved on booking
5. Admin dashboard shows coupon usage per booking

### 4.5 Pricing Logic

#### Route-based (One Way / Round Trip)
```
fare = RoutePricing[fromCity][toCity][carType]
```

#### Rental
```
fare = RentalPricing[carType][package]
```

#### Night Charge (Hire Driver)
```
if pickupTime >= 21:00 OR pickupTime <= 06:00:
  totalAmount = basePrice + ₹200 (nightCharge)
else:
  totalAmount = basePrice
```

#### Coupon Discount
```
discountAmount = totalFare × (discountPercent / 100)
finalPayable = totalFare - discountAmount
```

---

## 5. Admin Features

Access: `/admin` — protected by cookie-based session

### Admin Sidebar Navigation
| Module | Route | Purpose |
|---|---|---|
| Dashboard | `/admin` | Stats overview (bookings, revenue) |
| Bookings | `/admin/bookings` | View, filter, update booking status and payment |
| Offers | `/admin/offers` | Header announcement bar management |
| Coupons | `/admin/coupons` | Create/update/delete discount codes |
| Cab Fleet | `/admin/cars` | Add/edit vehicle listings |
| Self Drive | `/admin/self-drive-cars` | Self-drive vehicle management |
| Packages | `/admin/packages` | Rental package management |
| Rental Prices | `/admin/pricing` | Per-car per-package pricing |
| Cities | `/admin/cities` | City and hub/location management |
| Drivers | `/admin/drivers` | Hire-driver listings and pricing |

### Admin Booking Management
- View all bookings with filters (type, status, payment)
- Update booking status: PENDING → CONFIRMED → COMPLETED → CANCELLED
- Update payment status: PENDING → PARTIAL_PAID → PAID
- Generate WhatsApp payment link for partial payments
- Add admin notes to bookings
- Create offline/manual bookings

### Admin Mobile Sidebar
- On screens < 768px: sidebar converts to slide-in drawer
- Hamburger menu (☰) in top header triggers it
- Dark overlay closes drawer on tap outside

---

## 6. Deployment System

### ✅ ALWAYS Deploy Using This Command (on EC2)
```bash
bash ~/safe-deploy.sh
```

### What `safe-deploy.sh` Does (In Order)
1. **Backs up database** to local + S3 (via `~/backup.sh`)
2. **Git pull** latest code from GitHub
3. **`npx prisma migrate deploy`** — applies pending migrations safely
4. **`npm run build`** — Next.js production build
5. **`pm2 restart chamancab`** — restarts the app

### Deploy Script Location
- `/home/ubuntu/safe-deploy.sh` (on EC2)

### ❌ NEVER Deploy Manually Like This
```bash
# DO NOT do this manually:
git pull && npm run build && pm2 restart chamancab
# Reason: skips backup and uses unsafe migration
```

---

## 7. Critical Safety Rules

> These rules exist because data loss has already occurred once on this project due to unsafe operations.

### 🚫 ABSOLUTE PROHIBITIONS

```
NEVER run: npx prisma db push
NEVER run: prisma db reset
NEVER run: sqlite3 dev.db "DROP TABLE ..."
NEVER run: rm dev.db
NEVER run: cp /dev/null dev.db
NEVER overwrite dev.db without backup
NEVER modify or drop existing columns directly
NEVER perform destructive schema changes without explicit approval
```

### ✅ SAFE SCHEMA CHANGE WORKFLOW

**Step 1 — Edit schema.prisma**
- Only ADD new tables or columns
- Make changes additive and backward-compatible

**Step 2 — Generate migration (local)**
```bash
npx prisma migrate dev --name add_<feature_name>
```

**Step 3 — Review generated SQL**
```bash
# Check in prisma/migrations/<timestamp>_add_feature/migration.sql
# Ensure NO: DROP TABLE, DROP COLUMN, TRUNCATE
```

**Step 4 — Deploy to production**
```bash
bash ~/safe-deploy.sh
```

**Step 5 — Verify after migration**
```bash
sqlite3 ~/app/dev.db "SELECT COUNT(*) FROM Booking; SELECT COUNT(*) FROM Car;"
```

---

## 8. Known Risks

### SQLite Limitations
| Risk | Severity | Status |
|---|---|---|
| Single file — easy to corrupt/overwrite | 🔴 Critical | Mitigated by backup system |
| `prisma db push` recreates tables on conflict | 🔴 Critical | `db push` is blocked in AI rules |
| No concurrent write support | 🟡 Medium | Acceptable for current traffic |
| No built-in point-in-time recovery | 🟡 Medium | Mitigated by twice-daily backups |
| No connection pooling | 🟢 Low | Fine for current scale |

### Data Loss Scenarios (Historical)
- **April 20, 2026:** `npx prisma db push` was manually run on EC2 after a Driver schema change. SQLite dropped and recreated the Driver table, wiping all driver records. Root cause: no backup existed and `db push` was used instead of `prisma migrate`.

### Disk Space Risk
- EC2 root volume is small (6.8 GB total)
- `node_modules/` alone uses ~943 MB
- Monitor with: `df -h /`
- Clean periodically: `npm cache clean --force && find .next -name "*.map" -delete`

---

## 9. Backup & Recovery System

### Backup Architecture
```
Database (dev.db)
     │
     ├── Local Backup: /home/ubuntu/db_backups/
     │   ├── Retention: 7 days
     │   └── Cron: 3AM UTC + 3PM UTC daily
     │
     └── S3 Backup: s3://chamancab-db-backups/
         ├── Retention: 30 backups max
         ├── Storage class: STANDARD_IA (cost-optimised)
         └── Cron: 3AM UTC + 3PM UTC daily
```

### Backup Script Location
`/home/ubuntu/backup.sh`

### Run Manual Backup
```bash
bash ~/backup.sh
```

### Verify Backups Exist
```bash
# Local
ls -lah ~/db_backups/

# S3
aws s3 ls s3://chamancab-db-backups/ --human-readable
```

### Restore from S3 Backup
```bash
# Step 1: List available backups
aws s3 ls s3://chamancab-db-backups/ --human-readable

# Step 2: Restore (replace filename with most recent)
aws s3 cp s3://chamancab-db-backups/dev_backup_YYYYMMDD_HHMMSS.db ~/app/dev.db

# Step 3: Restart app
pm2 restart chamancab

# Step 4: Verify data
sqlite3 ~/app/dev.db "SELECT COUNT(*) FROM Booking; SELECT COUNT(*) FROM Car; SELECT COUNT(*) FROM Driver;"
```

### AWS S3 Credentials
- IAM User: `chamancab-s3-backup`
- Configured at: `~/.aws/credentials` on EC2
- Permissions: S3 PutObject, GetObject, ListBucket only

---

## 10. Future Roadmap

### Phase 1 — Immediate Stability (Current)
- [x] Automated local + S3 backups (twice daily)
- [x] Safe deploy script with backup-first workflow
- [x] AI safety rules documented
- [ ] Migrate from `prisma db push` to full migration history
- [ ] Expand EC2 disk volume from 8GB to 20GB

### Phase 2 — Database Migration (3–6 months)
- [ ] **Migrate SQLite → Supabase PostgreSQL (Pro plan, $25/mo)**
  - Why: Built-in daily backups, point-in-time recovery, no file corruption risk
  - How: Export SQLite → change Prisma provider → `prisma migrate deploy` on Supabase
  - No `prisma db push` during migration
- [ ] Set up staging environment (separate Supabase project)

### Phase 3 — Scaling (6–12 months)
- [ ] CDN for static assets (CloudFront or Vercel Edge)
- [ ] Move from EC2 to Vercel (Next.js optimised hosting)
- [ ] Implement proper session management (NextAuth or JWT)
- [ ] Add customer dashboard (booking history, profile)
- [ ] Multi-city operator support

---

## 11. AI Agent Instructions

> **MANDATORY:** Any AI agent (Claude, Gemini, GPT, or other) MUST read this entire section before taking any action on this project.

### Before Any Action — Checklist
- [ ] Have you read this entire document?
- [ ] Have you read `AI_RULES.md` in the project root?
- [ ] Do you understand this is a **SQLite database on a single file**?
- [ ] Is the requested change **purely UI/frontend**? If yes, skip all DB steps.
- [ ] Does the change require schema modifications? If yes, follow Section 7 strictly.

### Classify the Change First

| Change Type | DB Risk | Required Action |
|---|---|---|
| UI/CSS/text change | 🟢 None | No DB steps needed |
| New page/component | 🟢 None | No DB steps needed |
| New API route (read-only) | 🟢 None | No DB steps needed |
| New API route (writes to existing table) | 🟡 Low | Check schema compatibility |
| Schema: add new table/column | 🟡 Medium | Use `prisma migrate dev` |
| Schema: modify existing column type | 🔴 High | Stop → explain → get approval |
| Schema: remove column/table | 🔴 Critical | REFUSE unless explicitly approved |
| Deployment | 🟡 Medium | Always use `bash ~/safe-deploy.sh` |

### Rules for DB Schema Changes
1. **STOP** before any schema modification
2. **Explain** exactly what the change is and what it will affect
3. **Show** the SQL that will be generated (check `prisma/migrations/`)
4. **Confirm** no DROP TABLE or DROP COLUMN statements exist
5. **Backup** must be verified before applying
6. **Only proceed** after explicit user approval

### Rules for Deployment
1. Always use `bash ~/safe-deploy.sh`
2. Never run `npm run build && pm2 restart` without backup first
3. Never run `npx prisma db push` — ever

### Rules for Debugging
1. Check PM2 logs: `pm2 logs chamancab --lines 50`
2. Check DB integrity: `sqlite3 ~/app/dev.db ".tables"`
3. Check record counts before and after any operation
4. If something goes wrong: STOP → restore backup → report

### Communication Standards
- If a request is ambiguous, **ask for clarification** before proceeding
- If a command could cause data loss, **say so explicitly** before running
- If unsure about safety of an operation, **assume it is unsafe** and ask
- Always confirm what you DID after completing changes

---

## 📞 Quick Reference

### SSH into Server
```bash
ssh -i /Users/adityasingh/Downloads/chamancab-key.pem ubuntu@98.84.13.176
```

### Check App Status
```bash
pm2 status
pm2 logs chamancab --lines 30
```

### Safe Deploy
```bash
bash ~/safe-deploy.sh
```

### Manual Backup
```bash
bash ~/backup.sh
```

### Check Database Record Counts
```bash
sqlite3 ~/app/dev.db "
SELECT 'Bookings', COUNT(*) FROM Booking;
SELECT 'Cars', COUNT(*) FROM Car;
SELECT 'Drivers', COUNT(*) FROM Driver;
SELECT 'Cities', COUNT(*) FROM City;
SELECT 'Coupons', COUNT(*) FROM Coupon;
SELECT 'Pricing', COUNT(*) FROM RentalPricing;
"
```

### Check Disk Space
```bash
df -h /
du -sh ~/app/node_modules/ ~/app/.next/ ~/db_backups/
```

---

*Last updated: April 20, 2026 | Maintained by: Aditya Singh*
*This document should be updated whenever major system changes are made.*
