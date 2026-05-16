import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface PublicModelImage {
  image_url: string;
  caption: string | null;
  display_order: number;
}

export interface PublicModel {
  id: number;
  name: string;
  slug: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number | null;
  terrace_m2: number | null;
  parking_spaces: number;
  storage_units: number;
  price_from: number | null;
  description: string | null;
  floor_plan_url: string | null;
  floor_min: number | null;
  floor_max: number | null;
  main_image_url: string | null;
  video_url: string | null;
  display_order: number;
  images: PublicModelImage[];
}

interface ModelsState {
  models: PublicModel[];
  loading: boolean;
  error: string | null;
}

const initialState: ModelsState = {
  models: [],
  loading: false,
  error: null,
};

export const fetchModels = createAsyncThunk("models/fetch", async () => {
  const { data } = await axios.get<{ models: PublicModel[] }>(
    "/api/models.php",
  );
  return data.models;
});

const modelsSlice = createSlice({
  name: "models",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchModels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModels.fulfilled, (state, action) => {
        state.loading = false;
        state.models = action.payload ?? [];
      })
      .addCase(fetchModels.rejected, (state) => {
        state.loading = false;
        state.error = "Error al cargar los modelos";
      });
  },
});

export default modelsSlice.reducer;
