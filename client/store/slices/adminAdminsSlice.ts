import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import adminAxios from "@/store/axiosAdmin";

export interface AdminMember {
  id: number;
  name: string;
  email: string;
  role: "superadmin" | "admin";
  is_active: number;
  created_at: string;
}

interface AdminAdminsState {
  admins: AdminMember[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: AdminAdminsState = {
  admins: [],
  loading: false,
  saving: false,
  error: null,
};

export const fetchAdmins = createAsyncThunk("adminAdmins/fetch", async () => {
  const { data } = await adminAxios.get("/api/admin/admins.php");
  return data as { admins: AdminMember[] };
});

export const createAdmin = createAsyncThunk(
  "adminAdmins/create",
  async (
    payload: { name: string; email: string; role: "superadmin" | "admin" },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await adminAxios.post("/api/admin/admins.php", payload);
      return {
        ...payload,
        id: data.id,
        is_active: 1,
        created_at: new Date().toISOString(),
      } as AdminMember;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error ?? "Error al crear el administrador",
      );
    }
  },
);

export const updateAdmin = createAsyncThunk(
  "adminAdmins/update",
  async (
    payload: Partial<AdminMember> & { id: number },
    { rejectWithValue },
  ) => {
    try {
      await adminAxios.put("/api/admin/admins.php", payload);
      return payload;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error ?? "Error al actualizar",
      );
    }
  },
);

export const deactivateAdmin = createAsyncThunk(
  "adminAdmins/deactivate",
  async (id: number, { rejectWithValue }) => {
    try {
      await adminAxios.delete("/api/admin/admins.php", { params: { id } });
      return id;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error ?? "Error al desactivar",
      );
    }
  },
);

const adminAdminsSlice = createSlice({
  name: "adminAdmins",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdmins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdmins.fulfilled, (state, action) => {
        state.loading = false;
        state.admins = action.payload.admins;
      })
      .addCase(fetchAdmins.rejected, (state) => {
        state.loading = false;
        state.error = "Error al cargar los administradores";
      })
      .addCase(createAdmin.pending, (state) => {
        state.saving = true;
      })
      .addCase(createAdmin.fulfilled, (state, action) => {
        state.saving = false;
        state.admins.push(action.payload);
      })
      .addCase(createAdmin.rejected, (state) => {
        state.saving = false;
      })
      .addCase(updateAdmin.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateAdmin.fulfilled, (state, action) => {
        state.saving = false;
        const idx = state.admins.findIndex((a) => a.id === action.payload.id);
        if (idx !== -1)
          state.admins[idx] = { ...state.admins[idx], ...action.payload };
      })
      .addCase(updateAdmin.rejected, (state) => {
        state.saving = false;
      })
      .addCase(deactivateAdmin.fulfilled, (state, action) => {
        const idx = state.admins.findIndex((a) => a.id === action.payload);
        if (idx !== -1) state.admins[idx].is_active = 0;
      });
  },
});

export default adminAdminsSlice.reducer;
