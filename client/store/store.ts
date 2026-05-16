import { configureStore } from "@reduxjs/toolkit";
import siteConfigReducer from "@/store/slices/siteConfigSlice";
import bookingReducer from "@/store/slices/bookingSlice";
import adminReducer from "@/store/slices/adminSlice";
import adminVisitsReducer from "@/store/slices/adminVisitsSlice";
import adminContactsReducer from "@/store/slices/adminContactsSlice";
import adminModelsReducer from "@/store/slices/adminModelsSlice";
import adminClientsReducer from "@/store/slices/adminClientsSlice";
import adminAdminsReducer from "@/store/slices/adminAdminsSlice";
import adminAmenitiesReducer from "@/store/slices/adminAmenitiesSlice";
import contactReducer from "@/store/slices/contactSlice";
import modelsReducer from "@/store/slices/modelsSlice";
import amenitiesReducer from "@/store/slices/amenitiesSlice";
import locationReducer from "@/store/slices/locationSlice";
import adminPOIReducer from "@/store/slices/adminPOISlice";
import galleryReducer from "@/store/slices/gallerySlice";
import adminGalleryReducer from "@/store/slices/adminGallerySlice";

export const store = configureStore({
  reducer: {
    siteConfig: siteConfigReducer,
    booking: bookingReducer,
    admin: adminReducer,
    adminVisits: adminVisitsReducer,
    adminContacts: adminContactsReducer,
    adminModels: adminModelsReducer,
    adminAdmins: adminAdminsReducer,
    adminAmenities: adminAmenitiesReducer,
    adminClients: adminClientsReducer,
    contact: contactReducer,
    models: modelsReducer,
    amenities: amenitiesReducer,
    location: locationReducer,
    adminPOI: adminPOIReducer,
    gallery: galleryReducer,
    adminGallery: adminGalleryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
