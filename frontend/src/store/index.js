import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import detectionReducer from './slices/detectionSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        detection: detectionReducer,
        ui: uiReducer,
    },
});

export default store;
