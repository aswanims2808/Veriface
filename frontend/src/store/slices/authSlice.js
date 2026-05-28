import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: {
        username: 'Demo User',
        email: 'demo@veriface.ai',
        plan: 'Pro',
        role: 'admin'
    },
    token: 'mock-token',
    isAuthenticated: true,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.error = null;
        },
        loginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
            localStorage.removeItem('veriface_token');
            localStorage.removeItem('veriface_user');
        },
        setAuth: (state, action) => {
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.loading = false;
        }
    },
});

export const { loginStart, loginSuccess, loginFailure, logout, setAuth } = authSlice.actions;
export default authSlice.reducer;
