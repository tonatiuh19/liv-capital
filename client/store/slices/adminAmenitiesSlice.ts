import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import adminAxios from "@/store/axiosAdmin";

export interface Amenity {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  category: string | null;
  type: "amenity" | "facility";
  show_in_gallery: number;
  is_active: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface AdminAmenitiesState {
  amenities: Amenity[];
  loading: boolean;
  saving: boolean;
  uploading: boolean;
  error: string | null;
}

const initialState: AdminAmenitiesState = {
  amenities: [],
  loading: false,
  saving: false,
  uploading: false,
  error: null,
};

export const fetchAdminAmenities = createAsyncThunk(
  "adminAmenities/fetch",
  async () => {
    const { data } = await adminAxios.get("/api/admin/amenities.php");
    return data as { amenities: Amenity[] };
  },
);

export const createAmenity = createAsyncThunk(
  "adminAmenities/create",
  async (payload: Partial<Amenity>, { rejectWithValue }) => {
    try {
      const { data } = await adminAxios.post(
        "/api/admin/amenities.php",
        payload,
      );
      return {
        ...payload,
        id: data.id,
        is_active: payload.is_active ?? 1,
        display_order: payload.display_order ?? 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Amenity;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error ?? "Error al crear");
    }
  },
);

export const updateAmenity = createAsyncThunk(
  "adminAmenities/update",
  async (payload: Partial<Amenity> & { id: number }, { rejectWithValue }) => {
    try {
      await adminAxios.put("/api/admin/amenities.php", payload);
      return payload;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error ?? "Error al actualizar",
      );
    }
  },
);

export const deleteAmenity = createAsyncThunk(
  "adminAmenities/delete",
  async (id: number) => {
    await adminAxios.delete("/api/admin/amenities.php", { params: { id } });
    return id;
  },
);

export const uploadAmenityImage = createAsyncThunk(
  "adminAmenities/uploadImage",
  async (file: File, { rejectWithValue }) => {
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await adminAxios.post(
        "/api/admin/amenity-upload.php",
        form,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return data.url as string;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error ?? "Error al subir");
    }
  },
);

const adminAmenitiesSlice = createSlice({
  name: "adminAmenities",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminAmenities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminAmenities.fulfilled, (state, action) => {
        state.loading = false;
        state.amenities = action.payload?.amenities ?? [];
      })
      .addCase(fetchAdminAmenities.rejected, (state) => {
        state.loading = false;
        state.error = "Error al cargar las amenidades";
      })
      .addCase(createAmenity.pending, (state) => {
        state.saving = true;
      })
      .addCase(createAmenity.fulfilled, (state, action) => {
        state.saving = false;
        state.amenities.push(action.payload);
      })
      .addCase(createAmenity.rejected, (state) => {
        state.saving = false;
      })
      .addCase(updateAmenity.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateAmenity.fulfilled, (state, action) => {
        state.saving = false;
        const idx = state.amenities.findIndex(
          (a) => a.id === action.payload.id,
        );
        if (idx !== -1)
          state.amenities[idx] = { ...state.amenities[idx], ...action.payload };
      })
      .addCase(updateAmenity.rejected, (state) => {
        state.saving = false;
      })
      .addCase(deleteAmenity.fulfilled, (state, action) => {
        state.amenities = state.amenities.filter(
          (a) => a.id !== action.payload,
        );
      })
      .addCase(uploadAmenityImage.pending, (state) => {
        state.uploading = true;
      })
      .addCase(uploadAmenityImage.fulfilled, (state) => {
        state.uploading = false;
      })
      .addCase(uploadAmenityImage.rejected, (state) => {
        state.uploading = false;
      });
  },
});

export default adminAmenitiesSlice.reducer;
