# Jose Kare-Kare Bulalo House POS System

A web-based Point of Sale (POS) system built with **React**, **Vite**, and **Firebase** for managing inventory, processing sales, and tracking transactions.

---

## Features

### Inventory Management
- View, add, and edit products
- Import/export CSV for bulk updates
- Pagination and search
- Role-based access control (admin only for modifications)

### Till / Sales
- Browse products and add to cart
- Manage quantities and add-ons
- Apply discounts and calculate VAT automatically
- Process transactions and store them in Firestore

### Transactions Dashboard
- View all transactions
- Filter by reference number, date, and time
- Pagination for better usability
- Role-based access control (authenticated users can view)

---

## Tech Stack

- **React** (Hooks)
- **Vite** for fast development
- **Firebase Firestore** for real-time database
- **Firebase Authentication** for access control
- **Material UI** & **React Datepicker** for UI
- **Tailwind CSS** for styling

---

## Getting Started

### Prerequisites

* Node.js >= 18
* Firebase project with Firestore enabled
* Firebase Authentication set up

### Installation

```bash
# Clone the repository
git clone https://github.com/asarahehe/pos-system-karekare-bulalo.git
cd pos-system-karekare-bulalo

# Install dependencies
npm install

# Run the development server
npm run dev
```

### Setup Firebase

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Create a Firestore database
3. Enable Email/Password authentication
4. Update `.firebaserc` with your project ID:
   ```json
   {
     "projects": {
       "default": "your-firebase-project-id"
     }
   }
   ```

---

## Usage

1. Log in with Firebase Authentication.
2. Navigate to **Inventory** to manage products (admin only).
3. Use **Till** to add products to cart and process sales.
4. Check **Transactions** for a real-time list of sales.

---

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

---

## Deployment

Deploy to Firebase Hosting:

```bash
npm install -g firebase-tools
firebase deploy
```

---

## Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m "Add feature"`
4. Push: `git push origin feature-name`
5. Open a Pull Request

---

## License

MIT License
