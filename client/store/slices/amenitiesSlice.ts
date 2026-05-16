import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface PublicAmenity {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  category: string | null;
  type: "amenity" | "facility";
  show_in_gallery: number;
  display_order: number;
}

interface AmenitiesState {
  amenities: PublicAmenity[];
  facilities: PublicAmenity[];
  loading: boolean;
  error: string | null;
}

const initialState: AmenitiesState = {
  amenities: [],
  facilities: [],
  loading: false,
  error: null,
};

export const fetchAmenities = createAsyncThunk("amenities/fetch", async () => {
  const { data } = await axios.get<{
    amenities: PublicAmenity[];
    facilities: PublicAmenity[];
  }>("/api/amenities.php");
  return data;
});

const amenitiesSlice = createSlice({
  name: "amenities",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAmenities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAmenities.fulfilled, (state, action) => {
        state.loading = false;
        state.amenities = action.payload?.amenities ?? [];
        state.facilities = action.payload?.facilities ?? [];
      })
      .addCase(fetchAmenities.rejected, (state) => {
        state.loading = false;
        state.error = "Error al cargar amenidades";
      });
  },
});

export default amenitiesSlice.reducer;
