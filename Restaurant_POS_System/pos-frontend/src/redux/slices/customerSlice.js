import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    orderId: "",
    customerId: null,
    customerName: "",
    customerPhone: "",
    guests: 0,
    table: null
}


const customerSlice = createSlice({
    name : "customer",
    initialState,
    reducers : {
        setCustomer: (state, action) => {
            const { name, phone, guests, customerId } = action.payload;
            state.orderId = `${Date.now()}`;
            state.customerId = customerId ?? null;
            state.customerName = name;
            state.customerPhone = phone;
            state.guests = guests;
        },

        removeCustomer: (state) => {
            state.customerId = null;
            state.customerName = "";
            state.customerPhone = "";
            state.guests = 0;
            state.table = null;
        },

        updateTable: (state, action) => {
            state.table = action.payload.table;
        }

    }
})


export const { setCustomer, removeCustomer, updateTable } = customerSlice.actions;
export default customerSlice.reducer;