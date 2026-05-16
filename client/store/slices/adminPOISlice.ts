import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import adminAxios from "@/store/axiosAdmin";
import { ProjectCenter } from "@/store/slices/locationSlice";

export type POICategory =
  | "mercados"
  | "transporte"
  | "universidades"
  | "hospitales"
  | "parques"
  | "otros";

export interface AdminPOI {
  id: number;
  category: POICategory;
  name: string;
  distance_meters: number;
  description: string | null;
  lat: number | null;
  lng: number | null;
  display_order: number;
  is_active: boolean;
}

interface AdminPOIState {
  pois: AdminPOI[];
  center: ProjectCenter;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: AdminPOIState = {
  pois: [],
  center: { lat: 20.69, lng: -103.349 },
  loading: false,
  saving: false,
  error: null,
};

export const fetchAdminPOIs = createAsyncThunk("adminPOI/fetch", async () => {
  const { data } = await adminAxios.get<{
    pois: AdminPOI[];
    center: ProjectCenter;
  }>("/api/admin/poi.php");
  return data;
});

export const createPOI = createAsyncThunk(
  "adminPOI/create",
  async (payload: Omit<AdminPOI, "id">) => {
    const { data } = await adminAxios.post<{ id: number }>(
      "/api/admin/poi.php",
      payload,
    );
    return { ...payload, id: data.id };
  },
);

export const updatePOI = createAsyncThunk(
  "adminPOI/update",
  async (payload: Partial<AdminPOI> & { id: number }) => {
    await adminAxios.put("/api/admin/poi.php", payload);
    return payload;
  },
);

export const deletePOI = createAsyncThunk(
  "adminPOI/delete",
  async (id: number) => {
    await adminAxios.delete(`/api/admin/poi.php?id=${id}`);
    return id;
  },
);

export const updateProjectCenter = createAsyncThunk(
  "adminPOI/updateCenter",
  async (center: ProjectCenter) => {
    await adminAxios.put("/api/admin/poi.php", { center: 1, ...center });
    return center;
  },
);

const adminPOISlice = createSlice({
  name: "adminPOI",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // fetch
    builder.addCase(fetchAdminPOIs.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAdminPOIs.fulfilled, (state, action) => {
      state.loading = false;
      state.pois = action.payload.pois ?? [];
      state.center = action.payload.center ?? initialState.center;
    });
    builder.addCase(fetchAdminPOIs.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? "Error";
    });

    // create
    builder.addCase(createPOI.pending, (state) => {
      state.saving = true;
    });
    builder.addCase(createPOI.fulfilled, (state, action) => {
      state.saving = false;
      state.pois.push(action.payload as AdminPOI);
    });
    builder.addCase(createPOI.rejected, (state) => {
      state.saving = false;
    });

    // update
    builder.addCase(updatePOI.pending, (state) => {
      state.saving = true;
    });
    builder.addCase(updatePOI.fulfilled, (state, action) => {
      state.saving = false;
      const idx = state.pois.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1)
        state.pois[idx] = { ...state.pois[idx], ...action.payload };
    });
    builder.addCase(updatePOI.rejected, (state) => {
      state.saving = false;
    });

    // delete
    builder.addCase(deletePOI.pending, (state) => {
      state.saving = true;
    });
    builder.addCase(deletePOI.fulfilled, (state, action) => {
      state.saving = false;
      state.pois = state.pois.filter((p) => p.id !== action.payload);
    });
    builder.addCase(deletePOI.rejected, (state) => {
      state.saving = false;
    });

    // center
    builder.addCase(updateProjectCenter.pending, (state) => {
      state.saving = true;
    });
    builder.addCase(updateProjectCenter.fulfilled, (state, action) => {
      state.saving = false;
      state.center = action.payload;
    });
    builder.addCase(updateProjectCenter.rejected, (state) => {
      state.saving = false;
    });
  },
});

export default adminPOISlice.reducer;
