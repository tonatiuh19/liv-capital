import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface POI {
  id: number;
  category:
    | "mercados"
    | "transporte"
    | "universidades"
    | "hospitales"
    | "parques"
    | "otros";
  name: string;
  distance_meters: number;
  description: string | null;
  lat: number | null;
  lng: number | null;
  display_order: number;
}

export interface ProjectCenter {
  lat: number;
  lng: number;
}

interface LocationState {
  center: ProjectCenter;
  pois: POI[];
  loading: boolean;
  error: string | null;
}

const initialState: LocationState = {
  center: { lat: 20.6897, lng: -103.3493 },
  pois: [],
  loading: false,
  error: null,
};

export const fetchLocation = createAsyncThunk("location/fetch", async () => {
  const { data } = await axios.get<{ center: ProjectCenter; pois: POI[] }>(
    "/api/location.php",
  );
  return data;
});

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.center = action.payload.center ?? initialState.center;
        state.pois = action.payload.pois ?? [];
      })
      .addCase(fetchLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Error al cargar ubicación";
      });
  },
});

export default locationSlice.reducer;
