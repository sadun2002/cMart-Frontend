# 🛒 cMart - Smart POS System (Frontend)

Welcome to the frontend repository for the **cMart Smart POS System**! This is a modern, full-featured Point of Sale and Inventory Management application designed to streamline business operations with a premium user interface.

## 🌟 Key Features

- **Store Owner Dashboard**: Comprehensive analytics, sales overviews, and business health monitoring.
- **Advanced Inventory Management**: Track stock levels, low-stock alerts, out-of-stock items, and calculate total inventory value. Quick inline stock adjustments.
- **Product Management**: Elegant catalog system with barcode/SKU support, multiple images per product, categories, and subcategories.
- **Barcode Generator**: Built-in barcode generation and batch export functionality for products.
- **Categories & Subcategories**: Hierarchical organization of products for seamless navigation.
- **Premium UI/UX**: Built with a sleek, glassmorphic design, smooth micro-animations, and full **Dark/Light Mode** support.

## 🏗️ Future Architecture Plan (Offline POS & Sync)

The application is transitioning into a **SaaS POS System** that operates offline-first using **Tauri** and **SQLite**, with a freemium business model.

### Business Model & Tiers
- **FREE Tier (100% Offline)**: The POS software runs locally on a single computer. All data is saved to a local SQLite database. There is **no cloud sync**. Features include product management, barcode generation, basic sales, and generating reports. Users can back up their database manually to a USB pendrive.
- **STANDARD / PREMIUM Tiers**: Unlocks advanced features (e.g., employee attendance, online dashboard, customer features). Data is stored locally in SQLite but automatically synced to a cloud database (**Supabase**) when an internet connection is available.

### Technical Implementation (Tauri + Next.js)
1. **Single Codebase**: The existing Next.js frontend will be wrapped in **Tauri** to build lightweight, fast desktop applications for Windows/macOS.
2. **Local Storage**: The desktop app will utilize Tauri's SQLite plugin to store all transactional data locally.
3. **UUIDs for Primary Keys**: All database IDs must use **UUIDs** (instead of auto-incrementing integers) to prevent primary key conflicts during cloud synchronization.
4. **Cloud Sync Worker**: A background service inside the Tauri app will detect internet connectivity and push local records to Supabase for premium users.
5. **Feature Flags**: The UI will use a configuration state (e.g., `APP_TIER=FREE`). If a free user attempts to access a locked feature (marked with a 🔒 or ⭐), a "Go to Standard / Premium" upgrade modal will appear.
6. **Pendrive Backup**: The system will provide a simple mechanism for Free users to export/copy their SQLite database file (`.sqlite` / `.db`) and local storage assets to an external drive.

## 🛠️ Technology Stack

- **Framework**: [Next.js 14+ (App Router)](https://nextjs.org/)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Toast Notifications**: Sonner
- **Components**: Radix UI / Custom themed components

## 🚀 Getting Started

Follow these steps to get the frontend running locally on your machine.

### Prerequisites

- Node.js (v18.17 or later)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sadun2002/cMart-Frontend.git
   cd cMart-Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add any required API URLs (e.g., your local backend server).
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open in Browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application in action.

## 📁 Project Structure

```
cMart-Frontend/
├── app/                  # Next.js App Router pages and layouts
│   ├── admin/            # Super Admin panel routes
│   ├── employee/         # Cashier/Employee POS routes
│   └── owner/            # Store Owner dashboard & management routes
├── components/           # Reusable UI components (buttons, dialogs, etc.)
├── lib/                  # Utilities, API configurations, and hooks
├── public/               # Static assets (images, fonts)
└── styles/               # Global CSS and Tailwind configurations
```

## 🤝 Backend Repository

Note: This repository only contains the Next.js frontend codebase. The backend (built with Node.js, Express, Prisma, and PostgreSQL) is managed in a separate repository.

## 📝 License

This project is proprietary and confidential.
