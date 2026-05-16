import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import adminAxios from "@/store/axiosAdmin";

export interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string | null;
  message: string;
  source: string | null;
  interest: string;
  status: "new" | "read" | "in_progress" | "replied" | "archived";
  notes: string;
  created_at: string;
}

interface AdminContactsState {
  contacts: ContactSubmission[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: AdminContactsState = {
  contacts: [],
  total: 0,
  page: 1,
  totalPages: 1,
  loading: false,
  saving: false,
  error: null,
};

export const fetchAdminContacts = createAsyncThunk(
  "adminContacts/fetch",
  async (params: { status?: string; page?: number }) => {
    const { data } = await adminAxios.get("/api/admin/contacts.php", {
      params,
    });
    return data as {
      contacts: ContactSubmission[];
      total: number;
      page: number;
      total_pages: number;
    };
  },
);

export const updateContact = createAsyncThunk(
  "adminContacts/update",
  async (
    payload: { id: number; status?: string; notes?: string },
    { rejectWithValue },
  ) => {
    try {
      await adminAxios.put("/api/admin/contacts.php", payload);
      return payload;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error ?? "Error al actualizar",
      );
    }
  },
);

const adminContactsSlice = createSlice({
  name: "adminContacts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminContacts.fulfilled, (state, action) => {
        state.loading = false;
        state.contacts = action.payload.contacts;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.total_pages;
      })
      .addCase(fetchAdminContacts.rejected, (state) => {
        state.loading = false;
        state.error = "Error al cargar los contactos";
      })
      .addCase(updateContact.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateContact.fulfilled, (state, action) => {
        state.saving = false;
        const idx = state.contacts.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) {
          state.contacts[idx] = {
            ...state.contacts[idx],
            ...action.payload,
          } as ContactSubmission;
        }
      })
      .addCase(updateContact.rejected, (state) => {
        state.saving = false;
      });
  },
});

export default adminContactsSlice.reducer;
