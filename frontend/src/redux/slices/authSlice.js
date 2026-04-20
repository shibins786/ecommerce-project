import { createSlice } from "@reduxjs/toolkit";

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const initialState = {
  user: safeParse(localStorage.getItem("user")),
  access: localStorage.getItem("access") || null,
  refresh: localStorage.getItem("refresh") || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      const { user, access, refresh } = action.payload || {};

      state.user = user || null;
      state.access = access || null;
      state.refresh = refresh || null;

      if (user) localStorage.setItem("user", JSON.stringify(user));
      if (access) localStorage.setItem("access", access);
      if (refresh) localStorage.setItem("refresh", refresh);
    },

    logout: (state) => {
      state.user = null;
      state.access = null;
      state.refresh = null;

      localStorage.removeItem("user");
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
    },

    hydrateAuth: (state) => {
      state.user = safeParse(localStorage.getItem("user"));
      state.access = localStorage.getItem("access");
      state.refresh = localStorage.getItem("refresh");
    },
  },
});

export const { login, logout, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;