// src/logic/posLogic.js
// Pure calculation helpers — no Firebase, no React.

export const DISCOUNT_RATES = {
    PWD:     0.2,
    Senior:  0.2,
    Student: 0.1,
};

export function calcSubtotal(cart) {
    return cart.reduce((sum, item) => {
        const addonTotal = (item.addOns || []).reduce((s, a) => s + (a.price || 0), 0);
        return sum + (item.price + addonTotal) * item.qty;
    }, 0);
}

export function calcDiscount(subtotal, discountType) {
    const rate = DISCOUNT_RATES[discountType] || 0;
    return subtotal * rate;
}

export function calcVat(subtotal, discountValue) {
    return (subtotal - discountValue) * 0.12;
}

export function calcTotal(subtotal, discountValue, vat) {
    return subtotal - discountValue + vat;
}
