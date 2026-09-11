# 📲 File Transfer App (SHAREit Style)

A modern, fast, mobile-first cross-device file transfer and cloud storage application inspired by **SHAREit**, designed with clean white, soft sky blue, and deep navy aesthetics directly matching the reference visual design.

---

## 🌟 Key Features

### 1. ⚡ Real-Time File Transfer (Relay & P2P Architecture)
- **Send & Receive Any File Type**: Photos, Videos, Music, Documents, Apps (APK), and ZIP archives.
- **Instant Pairing**:
  - **Dynamic QR Code**: High-resolution QR code generated for every session.
  - **6-Digit Pairing Code**: Large numeric code (e.g. `839 204`) with one-click copy.
- **Live Transfer Progress**:
  - Real-time progress bar (per-file & overall).
  - Transfer speed meter (e.g. `24.8 MB/s`).
  - Estimated time remaining (ETA countdown).
  - Confetti celebration on completion.
- **Nearby Radar Discovery**:
  - Animated radar wave scanning nearby active devices (Android, iPhone, Desktop).

### 2. 📂 Boardsave (File Manager & Cloud Storage)
- **Categorized File Manager**: Images, Videos, Documents, Music, Apps, and Archives.
- **Live Search & Sorting**: Search by keyword, sort by date, size, and name.
- **File Actions**: In-app preview, rename, delete, and download.
- **Public Share Links**:
  - Generate public download links (`/share/:token`).
  - Automatic expiration enforcement based on user membership tier (7 days, 30 days, or Never Expire).
  - Dedicated public download page with countdown timer and *"This link has expired"* message once expired.

### 3. 💳 Membership Plans & Payment Simulation
- **Free Plan**: Free transfers, 10 GB cloud storage, links expire after 7 days, max upload 4 GB.
- **Pro Plan (\$8/mo)**: Send & receive up to 300 GB, 300 GB Boardsave, 1 TB Storage, links expire after 30 days, high-speed priority.
- **Unlimited Plan (\$15/mo)**: Unlimited storage, never-expiring links, VIP priority queue.
- **Payment Sandbox**:
  - Simulated payment options: **QRIS**, **Bank Transfer (BCA, Mandiri, BRI)**, **E-Wallet (GoPay, OVO, DANA)**, and **Credit Card**.
  - One-click *"Simulate Payment Success"* immediately upgrades user quota in real time.

### 4. 🛡️ Admin Control Panel (Web & Mobile)
- **KPI Metrics Overview**: Total users, transfers, files, storage used, premium subscribers, and simulated revenue.
- **7-Day Activity Chart**: Visual bar graph of transfer traffic.
- **User Management**: Search, toggle active/suspended status, modify plan tier, or delete user.
- **Transfer Session Monitor**: Real-time log of sender/receiver devices, byte sizes, and statuses.
- **File Moderation**: Audit all user files, toggle public/private share link, and remove files.
- **Plan Pricing Manager**: Edit plan prices, upload caps, storage quotas, and feature descriptions.
- **Transaction Manager**: View all simulated transactions, update status (Pending, Success, Failed), and auto-sync user plans.

### 5. 📱 Mobile Device Simulator & Full Responsive View
- Realistic **Mobile Handset Shell** (iPhone/Android frame with notch, status bar, and home bar) for desktop browsing.
- One-click toggle to **Fullscreen Responsive View** for native mobile browsers on local Wi-Fi.

---

## 🔑 Demo Accounts

| Role | Email | Password | Pre-seeded Data |
| :--- | :--- | :--- | :--- |
| **Demo User** (Florian) | `user@app.com` | `user123` | Pre-loaded with reference files (`Bermain bersama chika.3gp`, `Another iteration of mind.png`, etc.) |
| **Administrator** | `admin@app.com` | `admin123` | Full access to Admin Panel (`/admin` or Admin toggle) |
| **Guest** | *One-click* | *None* | Instant transfer access without registration |

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Step 1: Install Dependencies
From the project root:
```powershell
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 2: Build the Client
```powershell
cd ../client
npm run build
```

### Step 3: Run the Application
You can run the unified server (which serves both the API and the built client):
```powershell
cd ../server
node src/index.js
```

Or for development with hot-reloading:
```powershell
# Terminal 1: Start Backend Server (port 5000)
cd server
npm run dev

# Terminal 2: Start Vite Dev Client (port 5173)
cd client
npm run dev
```

### Step 4: Open in Browser
- **Unified App**: Open [http://localhost:5000](http://localhost:5000)
- **Vite Dev App**: Open [http://localhost:5173](http://localhost:5173)

---

## 📲 How to Test Real-time Transfer Between 2 Devices / Tabs

1. Open [http://localhost:5000](http://localhost:5000) in **Tab 1** (Sender).
2. Click **"Switch to Florian"** or log in with `user@app.com`.
3. Click on the light-blue **Send Card** (or tap `+`), select files, and click **"Confirm & Send"**.
4. A QR Code and a 6-digit code (e.g. `839 204`) will appear.
5. In the top bar, click **"Open 2nd Device Tab"** (or open an Incognito / Mobile browser window).
6. In **Tab 2** (Receiver), click the dark-navy **Receive Card** (or Transfer tab → Receive).
7. Enter the 6-digit code or click *"Auto-fill active session"*.
8. Tab 2 will show the incoming file preview with **Accept & Download**.
9. Click **Accept**: watch the live progress bar, speed indicator (`24.8 MB/s`), and confetti completion on both devices!

---

## 🏗️ Project Architecture

```
app-filetransfer/
├── server/
│   ├── src/
│   │   ├── index.js          # Express & Socket.IO server setup + static serving
│   │   ├── db.js             # SQLite (sql.js) database init & seed data
│   │   ├── auth.js           # JWT token generation, verification & middlewares
│   │   ├── socket.js         # Realtime pairing, session relay, progress broadcasts
│   │   └── routes/
│   │       ├── authRoutes.js     # /api/auth (login, register, guest, me)
│   │       ├── transferRoutes.js # /api/transfers (history, upload, sessions)
│   │       ├── cloudRoutes.js    # /api/cloud & /share/:token (boardsave & public share)
│   │       ├── planRoutes.js     # /api/plans (pricing & simulated checkout)
│   │       └── adminRoutes.js    # /api/admin (metrics, users, transfers, files, plans)
│   └── uploads/              # Local storage repository for transfers & cloud files
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MobileFrame.jsx        # Handset simulator with status bar & toggles
│   │   │   ├── BottomNavigation.jsx   # 4 tabs (Home, Boardsave, Transfer, Account)
│   │   │   ├── QRModal.jsx            # Dynamic QR generator with 6-digit pairing code
│   │   │   ├── QRScannerModal.jsx     # QR code scanner simulator & numeric input
│   │   │   ├── PaymentModal.jsx       # QRIS / VA / E-wallet sandbox checkout
│   │   │   ├── FilePickerModal.jsx    # Category-based multi-file picker
│   │   │   └── FilePreviewModal.jsx   # File preview, actions, and share links
│   │   ├── context/
│   │   │   ├── AuthContext.jsx        # User state & JWT persistence
│   │   │   └── SocketContext.jsx      # WebSocket pairing & real-time transfers
│   │   └── pages/
│   │       ├── SplashScreen.jsx       # Animated splash intro
│   │       ├── OnboardingScreen.jsx   # 3D floating folder & clouds slide (Ref 1)
│   │       ├── LoginScreen.jsx        # Sign in / Register / Guest / 1-click demos
│   │       ├── HomeScreen.jsx         # Exact match to reference screenshot 2
│   │       ├── TransferScreen.jsx     # Send, Receive, Nearby radar, History
│   │       ├── FilesScreen.jsx        # Boardsave file manager & cloud quota
│   │       ├── ProfileScreen.jsx      # Profile settings, device name, plan status
│   │       ├── PricingScreen.jsx      # Exact match to reference screenshot 3
│   │       ├── ShareLinkView.jsx      # Public download view with expiry handler
│   │       └── admin/
│   │           └── AdminLayout.jsx    # Complete admin console (6 modules)
```

---

## 📱 Build APK Android Asli (Capacitor)

Proyek ini telah dikonfigurasi dengan **Capacitor Native Android**:

1. **Buka Project di Android Studio**:
   ```bash
   cd client
   npx cap open android
   ```
2. **Build APK**:
   - Di Android Studio, klik menu **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
   - APK akan selesai di-generate di folder `client/android/app/build/outputs/apk/debug/app-debug.apk`.
   - File APK ini dapat langsung Anda install di smartphone Android mana saja!

