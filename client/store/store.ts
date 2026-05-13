import { configureStore } from "@reduxjs/toolkit";
import siteConfigReducer from "@/store/slices/siteConfigSlice";
import bookingReducer from "@/store/slices/bookingSlice";

export const store = configureStore({
  reducer: {
    siteConfig: siteConfigReducer,
    booking: bookingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
