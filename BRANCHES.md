# 🌳 Branch Structure Guide

This document outlines the branch structure for the Jose Kare-Kare Bulalo POS System project to help team members understand where to work.

---

## 📍 Main Branches

### 🎯 `main`
**Status:** Production Ready
- Stable, tested code
- All features are complete and working
- This is the live version

---

### 🎨 `frontend`
**Purpose:** React UI and User Interface Development
**What to work on:**
- React components (`src/components/`)
- Pages and views (`src/pages/`)
- Styling with Tailwind CSS
- User interactions and forms
- UI/UX improvements
- State management for frontend

**Team:** Frontend Developers

**Get Started:**
```bash
git checkout frontend
npm install
npm run dev
```

---

### ⚙️ `backend`
**Purpose:** API and Business Logic Development
**What to work on:**
- Cloud Functions (`functions/`)
- API endpoints and routes
- Data validation and processing
- Authentication logic
- Business logic and calculations
- Database queries and operations

**Team:** Backend Developers

**Get Started:**
```bash
git checkout backend
npm install
cd functions && npm install
firebase emulators:start --only functions
```

---

### 🔥 `firebase`
**Purpose:** Firebase Configuration and Infrastructure
**What to work on:**
- Firestore database schema and indexes
- Firebase security rules (`.rules` files)
- Firebase authentication setup
- Cloud Functions deployment
- Firebase hosting configuration
- Database migrations and updates

**Team:** DevOps / Firebase Specialists

**Get Started:**
```bash
git checkout firebase
# Update Firebase configuration files
firebase deploy --dry-run  # Test changes
firebase deploy            # Deploy changes
```

---

## 🔄 Workflow

1. **Create a feature branch** from the appropriate branch:
   ```bash
   git checkout frontend  # or backend or firebase
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and commit:
   ```bash
   git add .
   git commit -m "Add feature description"
   ```

3. **Push to your branch:**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create a Pull Request** to merge back into your work branch (frontend/backend/firebase)

5. **Request Code Review** from team members

6. **Merge to main** only after thorough testing

---

## 📝 Commit Message Convention

```
[BRANCH_TYPE] Brief description

Detailed explanation if needed.

Fixes #issue-number
```

**Examples:**
- `[FRONTEND] Add product list component`
- `[BACKEND] Create inventory API endpoint`
- `[FIREBASE] Update Firestore security rules`

---

## 🚀 Deployment Process

1. **Feature branches → Work branch** (frontend/backend/firebase via PR)
2. **Work branch → main** (when ready for production)
3. **main → Production** (automatic or manual deployment)

---

## 📞 Need Help?

- **Frontend Issues?** → Checkout `frontend` branch
- **Backend Issues?** → Checkout `backend` branch
- **Firebase Issues?** → Checkout `firebase` branch

---

**Happy coding! 🎉**
