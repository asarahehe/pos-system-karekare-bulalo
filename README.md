# Kare-Kare Bulalo POS System

A Point-of-Sale system for a Filipino bulalo/kare-kare restaurant, built with React + Vite + Firebase.

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Firebase (see section below)

### 3. Create your `.env` file
Copy `.env.example` to `.env` and fill in your Firebase project values:
```bash
cp .env.example .env
```

### 4. Run the dev server
```bash
npm run dev
```

---

## Firebase Setup Guide

### Step 1 — Create a Firebase project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → give it a name (e.g. `karekare-bulalo-pos`) → click through
3. On the project dashboard, click the **`</>`** (Web) icon to register a web app
4. Copy the `firebaseConfig` object — paste those values into your `.env` file

### Step 2 — Enable Authentication
1. In the left sidebar: **Build → Authentication → Get started**
2. Under **Sign-in method**, enable **Email/Password**
3. Go to **Users** tab → **Add user** → create your cashier/admin accounts

### Step 3 — Enable Firestore
1. **Build → Firestore Database → Create database**
2. Choose **Start in production mode** (the `firestore.rules` file in this repo already has the right rules)
3. Pick a location close to you (e.g. `asia-southeast1` for Philippines)

### Step 4 — Deploy Firestore rules
```bash
npm install -g firebase-tools
firebase login
firebase use --add          # pick your project
firebase deploy --only firestore:rules
```

### Step 5 — Create the first user record in Firestore
After creating a user in Firebase Auth (Step 2), add a matching document in Firestore:

- Collection: `users`
- Document ID: **(the UID from Firebase Auth)**
- Fields:
  ```
  email: "your@email.com"
  role: "admin"
  displayName: "Your Name"
  ```

---

## Firestore Collections

| Collection     | Purpose                              |
|----------------|--------------------------------------|
| `menuItems`    | Restaurant menu (replaces inventory) |
| `transactions` | All POS transactions                 |
| `users`        | User profiles (linked to Auth UID)   |

### `menuItems` document shape
```js
{
  stockCode:   "B001",           // unique identifier
  name:        "Bulalo Special",
  category:    "Bulalo",         // see MENU_CATEGORIES in menuservice.js
  description: "Beef bulalo with bone marrow",
  price:       350,
  stock:       10,
  defaultQty:  1,
  createdAt:   Timestamp,
  updatedAt:   Timestamp,
}
```

### Menu Categories
- Bulalo
- Kare-Kare
- Sidings
- Rice
- Drinks
- Extras

To add/change categories, edit `MENU_CATEGORIES` in `src/services/menuservice.js`.

---

## Project Structure

```
src/
├── services/
│   ├── firebase.js       # Firebase init (reads from .env)
│   ├── authservice.js    # Login helper
│   └── menuservice.js    # menuItems CRUD + categories + add-ons
├── logic/
│   └── posLogic.js       # Pure calc functions (subtotal, VAT, discount)
├── components/
│   ├── Layout.jsx         # Admin sidebar layout
│   ├── TillLayout.jsx     # POS till layout
│   ├── GlobalHeader.jsx   # Top nav bar
│   ├── MenuTable.jsx      # Table for menu management
│   ├── MenuItemEditor.jsx # Add/edit menu item modal
│   ├── TillProducts.jsx   # Product grid on the till
│   ├── CartPanel.jsx      # Cart + add-ons + discount
│   ├── Checkout.jsx       # Payment modal + Firestore batch write
│   ├── TransactionsTable.jsx
│   ├── TillTransactionsTable.jsx
│   └── TransactionEditor.jsx
└── pages/
    ├── Login.jsx
    ├── Dashboard.jsx      # Summary cards + charts
    ├── Graph.jsx          # Sales graph with date filter
    ├── Transactions.jsx   # Admin transactions view
    ├── TillTransactions.jsx
    ├── Menu.jsx           # Menu management (add/edit/delete/CSV)
    └── Till.jsx           # POS till screen
```
