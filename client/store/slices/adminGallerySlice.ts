import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import adminAxios from "@/store/axiosAdmin";

export interface AdminGalleryImage {
  id: number;
  title: string;
  description: string | null;
  image_url: string;
  category: "arquitectura" | "amenidades" | "interiores";
  display_order: number;
  is_active: number;
  created_at: string;
}

interface AdminGalleryState {
  images: AdminGalleryImage[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: AdminGalleryState = {
  images: [],
  loading: false,
  saving: false,
  error: null,
};

export const fetchAdminGallery = createAsyncThunk(
  "adminGallery/fetch",
  async () => {
    const { data } = await adminAxios.get("/api/admin/gallery.php");
    return data as { images: AdminGalleryImage[] };
  },
);

export const createGalleryImage = createAsyncThunk(
  "adminGallery/create",
  async (payload: Partial<AdminGalleryImage>, { rejectWithValue }) => {
    try {
      const { data } = await adminAxios.post("/api/admin/gallery.php", payload);
      return {
        ...payload,
        id: data.id,
        created_at: new Date().toISOString(),
      } as AdminGalleryImage;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error ?? "Error al crear");
    }
  },
);

export const updateGalleryImage = createAsyncThunk(
  "adminGallery/update",
  async (
    payload: Partial<AdminGalleryImage> & { id: number },
    { rejectWithValue },
  ) => {
    try {
      await adminAxios.put("/api/admin/gallery.php", payload);
      return payload;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error ?? "Error al actualizar",
      );
    }
  },
);

export const deleteGalleryImage = createAsyncThunk(
  "adminGallery/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await adminAxios.delete(`/api/admin/gallery.php?id=${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error ?? "Error al eliminar");
    }
  },
);

export const uploadGalleryFile = createAsyncThunk(
  "adminGallery/uploadFile",
  async (file: File, { rejectWithValue }) => {
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await adminAxios.post(
        "/api/admin/gallery-upload.php",
        form,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return data.url as string;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error ?? "Error al subir");
    }
  },
);

const adminGallerySlice = createSlice({
  name: "adminGallery",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminGallery.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminGallery.fulfilled, (state, action) => {
        state.loading = false;
        state.images = action.payload?.images ?? [];
      })
      .addCase(fetchAdminGallery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Error";
      })
      .addCase(createGalleryImage.pending, (state) => {
        state.saving = true;
      })
      .addCase(createGalleryImage.fulfilled, (state, action) => {
        state.saving = false;
        state.images.push(action.payload);
      })
      .addCase(createGalleryImage.rejected, (state) => {
        state.saving = false;
      })
      .addCase(updateGalleryImage.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateGalleryImage.fulfilled, (state, action) => {
        state.saving = false;
        const idx = state.images.findIndex((i) => i.id === action.payload.id);
        if (idx !== -1) {
          state.images[idx] = { ...state.images[idx], ...action.payload };
        }
      })
      .addCase(updateGalleryImage.rejected, (state) => {
        state.saving = false;
      })
      .addCase(deleteGalleryImage.fulfilled, (state, action) => {
        state.images = state.images.filter((i) => i.id !== action.payload);
      });
  },
});

export default adminGallerySlice.reducer;
