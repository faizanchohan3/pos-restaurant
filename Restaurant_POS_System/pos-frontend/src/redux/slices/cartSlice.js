import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const cartSlice = createSlice({
    name : "cart",
    initialState,
    reducers : {
        addItems : (state, action) => {
            // Merge with an existing line for the same product instead of duplicating.
            const existing = state.find(i => i.id === action.payload.id);
            if (existing) {
                existing.quantity += action.payload.quantity;
                existing.price = existing.pricePerQuantity * existing.quantity;
            } else {
                state.push(action.payload);
            }
        },

        updateItemQuantity: (state, action) => {
            const { id, quantity } = action.payload;
            const item = state.find(i => i.id === id);
            if (item) {
                item.quantity = Math.max(1, quantity);
                item.price = item.pricePerQuantity * item.quantity;
            }
        },

        removeItem: (state, action) => {
            return state.filter(item => item.id != action.payload);
        },

        setCart: (state, action) => {
            return Array.isArray(action.payload) ? action.payload : [];
        },

        removeAllItems: (state) => {
            return [];
        }
    }
})

export const getTotalPrice = (state) => state.cart.reduce((total, item) => total + item.price, 0);
export const { addItems, updateItemQuantity, removeItem, setCart, removeAllItems } = cartSlice.actions;
export default cartSlice.reducer;