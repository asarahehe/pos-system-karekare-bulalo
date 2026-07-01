// src/services/menuservice.js
// Firestore collection: "menuItems"
// Each document shape:
// {
//   stockCode: "B001",
//   name: "Bulalo",
//   category: "Bulalo",       // see MENU_CATEGORIES below
//   description: "Classic beef bulalo with bone marrow",
//   price: 350,
//   stock: 10,
//   defaultQty: 1,
//   createdAt: Timestamp,
//   updatedAt: Timestamp,
// }

import { db } from "./firebase";
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
} from "firebase/firestore";

export const MENU_CATEGORIES = [
    "Bulalo",
    "Kare-Kare",
    "Sidings",
    "Rice",
    "Drinks",
    "Extras",
];

// ── ADD-ONS per category (for the Till cart) ──────────────────────────────
// These appear as checkboxes when a cashier expands a cart item.
export const CATEGORY_ADDONS = {
    "Bulalo":   { "Extra Bone Marrow": 50, "Extra Broth": 30, "Add Corn": 25, "Add Pechay": 20 },
    "Kare-Kare":{ "Extra Bagoong": 20, "Extra Peanut Sauce": 30, "Add Eggplant": 25 },
    "Sidings":  { "Extra Sauce": 20 },
    "Drinks":   { "Extra Ice": 0, "Add Sugar": 0 },
    "Extras":   {},
    "Rice":     {},
};

const menuItemsRef = collection(db, "menuItems");

// Real-time listener — use in components
export const subscribeToMenuItems = (callback) => {
    return onSnapshot(menuItemsRef, (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(items);
    });
};

export const addMenuItem = async (data) => {
    return await addDoc(menuItemsRef, { ...data, createdAt: new Date() });
};

export const updateMenuItem = async (id, data) => {
    return await updateDoc(doc(db, "menuItems", id), {
        ...data,
        updatedAt: new Date(),
    });
};

export const deleteMenuItem = async (id) => {
    return await deleteDoc(doc(db, "menuItems", id));
};
