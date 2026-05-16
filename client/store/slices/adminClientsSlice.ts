import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import adminAxios from "@/store/axiosAdmin";

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  interest: string;
  tags: string[];
  first_source: string | null;
  last_contact_at: string | null;
  created_at: string;
  total_visits: number;
  total_contacts: number;
}

export interface ClientVisit {
  id: number;
  visit_date: string;
  time_start: string;
  time_end: string;
  interest: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

export interface ClientContact {
  id: number;
  subject: string | null;
  message: string;
  interest: string;
  status: string;
  created_at: string;
}

export interface ClientDetail {
  client: Client & { admin_notes: string | null };
  visits: ClientVisit[];
  contacts: ClientContact[];
}

interface AdminClientsState {
  clients: Client[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  detail: ClientDetail | null;
  detailLoading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: AdminClientsState = {
  clients: [],
  total: 0,
  page: 1,
  totalPages: 1,
  loading: false,
  detail: null,
  detailLoading: false,
  saving: false,
  error: null,
};

export const fetchAdminClients = createAsyncThunk(
  "adminClients/fetch",
  async (params: { search?: string; tag?: string; page?: number }) => {
    const { data } = await adminAxios.get("/api/admin/clients.php", { params });
    return data as {
      clients: Client[];
      total: number;
      page: number;
      total_pages: number;
    };
  },
);

export const fetchClientDetail = createAsyncThunk(
  "adminClients/fetchDetail",
  async (id: number) => {
    const { data } = await adminAxios.get("/api/admin/clients.php", {
      params: { id },
    });
    return data as ClientDetail;
  },
);

export const updateClient = createAsyncThunk(
  "adminClients/update",
  async (
    payload: { id: number; admin_notes?: string; tags?: string[] },
    { rejectWithValue },
  ) => {
    try {
      await adminAxios.put("/api/admin/clients.php", payload);
      return payload;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error ?? "Error al guardar");
    }
  },
);

const adminClientsSlice = createSlice({
  name: "adminClients",
  initialState,
  reducers: {
    clearDetail(state) {
      state.detail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // list
      .addCase(fetchAdminClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminClients.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = action.payload.clients;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.total_pages;
      })
      .addCase(fetchAdminClients.rejected, (state) => {
        state.loading = false;
        state.error = "Error al cargar los clientes";
      })
      // detail
      .addCase(fetchClientDetail.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(fetchClientDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.detail = action.payload;
      })
      .addCase(fetchClientDetail.rejected, (state) => {
        state.detailLoading = false;
      })
      // update
      .addCase(updateClient.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.saving = false;
        if (state.detail && state.detail.client.id === action.payload.id) {
          if (action.payload.admin_notes !== undefined)
            state.detail.client.admin_notes = action.payload.admin_notes;
          if (action.payload.tags !== undefined)
            state.detail.client.tags = action.payload.tags;
        }
        const idx = state.clients.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1 && action.payload.tags !== undefined) {
          state.clients[idx].tags = action.payload.tags;
        }
      })
      .addCase(updateClient.rejected, (state) => {
        state.saving = false;
      });
  },
});

export const { clearDetail } = adminClientsSlice.actions;
export default adminClientsSlice.reducer;
