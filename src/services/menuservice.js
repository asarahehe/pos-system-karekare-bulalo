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
    "Main Dishes",
    "Side Dishes",
    "Desserts",
    "Silog Meals",
    "Meryenda",
    "Sidings",
    "Rice",
    "Drinks",
    "Extras",
];

export const CATEGORY_LIMITS = {
    "Main Dishes": 10,
    "Side Dishes": 5,
    "Drinks": 5,
    "Desserts": 5,
};

// ── ADD-ONS per category (for the Till cart) ──────────────────────────────
// These appear as checkboxes when a cashier expands a cart item.
export const CATEGORY_ADDONS = {
    "Main Dishes":  {},
    "Side Dishes":  {},
    "Desserts":     {},
    "Silog Meals":  {},
    "Meryenda":     {},
    "Sidings":      {},
    "Drinks":       {},
    "Extras":       {},
    "Rice":         {},
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
