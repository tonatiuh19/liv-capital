import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import adminAxios from "@/store/axiosAdmin";

export interface ModelImage {
  id: number;
  model_id: number;
  image_url: string;
  caption: string | null;
  display_order: number;
  created_at: string;
}

export interface BuildingModel {
  id: number;
  name: string;
  slug: string;
  type: string;
  area_sqm: number | null;
  terrace_m2: number | null;
  bedrooms: number;
  bathrooms: number;
  parking_spaces: number;
  storage_units: number;
  price_from: number | null;
  description: string;
  floor_plan_url: string;
  floor_min: number | null;
  floor_max: number | null;
  main_image_url: string | null;
  video_url: string | null;
  is_available: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface AdminModelsState {
  models: BuildingModel[];
  imagesByModel: Record<number, ModelImage[]>;
  loading: boolean;
  saving: boolean;
  imagesLoading: number | null; // model_id currently loading images
  error: string | null;
}

const initialState: AdminModelsState = {
  models: [],
  imagesByModel: {},
  loading: false,
  saving: false,
  imagesLoading: null,
  error: null,
};

export const fetchAdminModels = createAsyncThunk(
  "adminModels/fetch",
  async () => {
    const { data } = await adminAxios.get("/api/admin/models.php");
    return data as { models: BuildingModel[] };
  },
);

export const createModel = createAsyncThunk(
  "adminModels/create",
  async (payload: Partial<BuildingModel>, { rejectWithValue }) => {
    try {
      const { data } = await adminAxios.post("/api/admin/models.php", payload);
      return {
        ...payload,
        id: data.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as BuildingModel;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error ?? "Error al crear");
    }
  },
);

export const updateModel = createAsyncThunk(
  "adminModels/update",
  async (
    payload: Partial<BuildingModel> & { id: number },
    { rejectWithValue },
  ) => {
    try {
      await adminAxios.put("/api/admin/models.php", payload);
      return payload;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error ?? "Error al actualizar",
      );
    }
  },
);

export const deleteModel = createAsyncThunk(
  "adminModels/delete",
  async (id: number) => {
    await adminAxios.delete("/api/admin/models.php", { params: { id } });
    return id;
  },
);

// ─── Image thunks ─────────────────────────────────────────────────────────────

export const fetchModelImages = createAsyncThunk(
  "adminModels/fetchImages",
  async (modelId: number) => {
    const { data } = await adminAxios.get("/api/admin/model-images.php", {
      params: { model_id: modelId },
    });
    return { modelId, images: data.images as ModelImage[] };
  },
);

export const uploadModelFile = createAsyncThunk(
  "adminModels/uploadFile",
  async (
    { modelId, file }: { modelId: number; file: File },
    { rejectWithValue },
  ) => {
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await adminAxios.post(
        "/api/admin/model-upload.php",
        form,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return { modelId, url: data.url as string };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error ?? "Error al subir");
    }
  },
);

export const addModelImage = createAsyncThunk(
  "adminModels/addImage",
  async (
    payload: { model_id: number; image_url: string; caption?: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await adminAxios.post(
        "/api/admin/model-images.php",
        payload,
      );
      return {
        id: data.id as number,
        model_id: payload.model_id,
        image_url: payload.image_url,
        caption: payload.caption ?? null,
        display_order: 0,
        created_at: new Date().toISOString(),
      } as ModelImage;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error ?? "Error al agregar");
    }
  },
);

export const deleteModelImage = createAsyncThunk(
  "adminModels/deleteImage",
  async ({ id, modelId }: { id: number; modelId: number }) => {
    await adminAxios.delete("/api/admin/model-images.php", { params: { id } });
    return { id, modelId };
  },
);

const adminModelsSlice = createSlice({
  name: "adminModels",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminModels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminModels.fulfilled, (state, action) => {
        state.loading = false;
        state.models = action.payload?.models ?? [];
      })
      .addCase(fetchAdminModels.rejected, (state) => {
        state.loading = false;
        state.error = "Error al cargar los modelos";
      })
      .addCase(createModel.pending, (state) => {
        state.saving = true;
      })
      .addCase(createModel.fulfilled, (state, action) => {
        state.saving = false;
        state.models.push(action.payload);
      })
      .addCase(createModel.rejected, (state) => {
        state.saving = false;
      })
      .addCase(updateModel.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateModel.fulfilled, (state, action) => {
        state.saving = false;
        const idx = state.models.findIndex((m) => m.id === action.payload.id);
        if (idx !== -1)
          state.models[idx] = { ...state.models[idx], ...action.payload };
      })
      .addCase(updateModel.rejected, (state) => {
        state.saving = false;
      })
      .addCase(deleteModel.fulfilled, (state, action) => {
        state.models = state.models.filter((m) => m.id !== action.payload);
      })
      // Images
      .addCase(fetchModelImages.pending, (state, action) => {
        state.imagesLoading = action.meta.arg;
      })
      .addCase(fetchModelImages.fulfilled, (state, action) => {
        state.imagesLoading = null;
        state.imagesByModel[action.payload.modelId] = action.payload.images;
      })
      .addCase(fetchModelImages.rejected, (state) => {
        state.imagesLoading = null;
      })
      .addCase(addModelImage.fulfilled, (state, action) => {
        const { model_id } = action.payload;
        if (!state.imagesByModel[model_id]) state.imagesByModel[model_id] = [];
        state.imagesByModel[model_id].push(action.payload);
      })
      .addCase(deleteModelImage.fulfilled, (state, action) => {
        const { id, modelId } = action.payload;
        if (state.imagesByModel[modelId]) {
          state.imagesByModel[modelId] = state.imagesByModel[modelId].filter(
            (img) => img.id !== id,
          );
        }
      });
  },
});

export default adminModelsSlice.reducer;
