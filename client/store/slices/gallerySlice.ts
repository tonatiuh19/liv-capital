import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface GalleryImage {
  id: number;
  title: string;
  description: string | null;
  image_url: string;
  category: "arquitectura" | "amenidades" | "interiores";
  display_order: number;
}

interface GalleryState {
  images: GalleryImage[];
  loading: boolean;
  error: string | null;
}

const initialState: GalleryState = {
  images: [],
  loading: false,
  error: null,
};

export const fetchGallery = createAsyncThunk("gallery/fetch", async () => {
  const { data } = await axios.get("/api/gallery.php");
  return data as { images: GalleryImage[] };
});

const gallerySlice = createSlice({
  name: "gallery",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGallery.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGallery.fulfilled, (state, action) => {
        state.loading = false;
        state.images = action.payload?.images ?? [];
      })
      .addCase(fetchGallery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Error al cargar galería";
      });
  },
});

export default gallerySlice.reducer;
