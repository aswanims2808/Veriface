import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentDetection: null,
    history: [],
    loading: false,
    error: null,
};

const detectionSlice = createSlice({
    name: 'detection',
    initialState,
    reducers: {
        setDetectionStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        setDetectionSuccess: (state, action) => {
            state.loading = false;
            state.currentDetection = action.payload;
        },
        setDetectionFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        setHistory: (state, action) => {
            state.history = action.payload;
        },
        clearCurrentDetection: (state) => {
            state.currentDetection = null;
        }
    },
});

export const {
    setDetectionStart,
    setDetectionSuccess,
    setDetectionFailure,
    setHistory,
    clearCurrentDetection
} = detectionSlice.actions;
export default detectionSlice.reducer;
