# 🛒 cMart - Smart POS System (Frontend)

Welcome to the frontend repository for the **cMart Smart POS System**! This is a modern, full-featured Point of Sale and Inventory Management application designed to streamline business operations with a premium user interface.

## 🌟 Key Features

- **Store Owner Dashboard**: Comprehensive analytics, sales overviews, and business health monitoring.
- **Advanced Inventory Management**: Track stock levels, low-stock alerts, out-of-stock items, and calculate total inventory value. Quick inline stock adjustments.
- **Product Management**: Elegant catalog system with barcode/SKU support, multiple images per product, categories, and subcategories.
- **Barcode Generator**: Built-in barcode generation and batch export functionality for products.
- **Categories & Subcategories**: Hierarchical organization of products for seamless navigation.
- **Premium UI/UX**: Built with a sleek, glassmorphic design, smooth micro-animations, and full **Dark/Light Mode** support.

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
