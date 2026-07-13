import { createSlice } from "@reduxjs/toolkit";

// Load initial state from localStorage
const loadInitialState = () => {
  try {
    const savedUser = localStorage.getItem("userSession");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      return {
        ...user,
        isAuth: true,
      };
    }
  } catch (error) {
    console.error("Error loading user session:", error);
  }
  return {
    _id: "",
    name: "",
    email: "",
    phone: "",
    role: "",
    isAuth: false,
  };
};

const initialState = loadInitialState();

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { _id, name, phone, email, role } = action.payload;
      state._id = _id;
      state.name = name;
      state.phone = phone;
      state.email = email;
      state.role = role;
      state.isAuth = true;

      // Persist to localStorage
      localStorage.setItem(
        "userSession",
        JSON.stringify({
          _id,
          name,
          phone,
          email,
          role,
        })
      );

      // NOTE: Do NOT set selectedShop here. The correct shop id is set by the
      // login handler (shop id for shop admins, staff.shopId for staff).
      // Hardcoding it caused every shop to share shopId=1 and leak staff/data.
    },

    removeUser: (state) => {
      state._id = "";
      state.email = "";
      state.name = "";
      state.phone = "";
      state.role = "";
      state.isAuth = false;

      // Clear from localStorage
      localStorage.removeItem("userSession");
      localStorage.removeItem("selectedShop");
      localStorage.removeItem("staffSession");
    },

    restoreUser: (state) => {
      const savedUser = loadInitialState();
      Object.assign(state, savedUser);
    },
  },
});

export const { setUser, removeUser, restoreUser } = userSlice.actions;
export default userSlice.reducer;