import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import adminAxios from "@/store/axiosAdmin";

export interface Visit {
  id: number;
  slot_template_id: number | null;
  visit_date: string;
  time_start: string;
  time_end: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string;
  visitor_interest: string;
  visitor_message: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  created_at: string;
  admin_notes: string;
  is_manual_entry: number;
}

export interface BlockedDate {
  id: number;
  override_date: string;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
}

export interface SlotTemplate {
  id: number;
  day_of_week: number; // 0=Sun … 6=Sat
  start_time: string;
  end_time: string;
  max_capacity: number;
  label: string | null;
  is_active: number;
}

export interface VisitSetting {
  config_key: string;
  config_value: number | string | boolean;
  config_type: "integer" | "boolean" | "string" | "email" | "url";
  label: string;
  description: string;
}

interface AdminVisitsState {
  visits: Visit[];
  dayCounts: Record<string, number>;
  blockedDates: BlockedDate[];
  slotTemplates: SlotTemplate[];
  visitSettings: VisitSetting[];
  loading: boolean;
  slotsLoading: boolean;
  settingsLoading: boolean;
  settingsSaving: boolean;
  error: string | null;
  saving: boolean;
}

const initialState: AdminVisitsState = {
  visits: [],
  dayCounts: {},
  blockedDates: [],
  slotTemplates: [],
  visitSettings: [],
  loading: false,
  slotsLoading: false,
  settingsLoading: false,
  settingsSaving: false,
  error: null,
  saving: false,
};

export const fetchAdminVisits = createAsyncThunk(
  "adminVisits/fetch",
  async (params: { month?: string; date?: string; status?: string }) => {
    const { data } = await adminAxios.get("/api/admin/visits.php", { params });
    return data as { visits: Visit[]; day_counts: Record<string, number> };
  },
);

export const fetchBlockedDates = createAsyncThunk(
  "adminVisits/fetchBlocked",
  async (month: string) => {
    const { data } = await adminAxios.get("/api/admin/visits.php", {
      params: { view: "blocked", month },
    });
    return data as { blocked_dates: BlockedDate[] };
  },
);

export const createVisit = createAsyncThunk(
  "adminVisits/create",
  async (
    payload: Partial<Visit> & { admin_notes?: string; status?: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await adminAxios.post("/api/admin/visits.php", payload);
      return data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error ?? "Error al crear la visita",
      );
    }
  },
);

export const updateVisit = createAsyncThunk(
  "adminVisits/update",
  async (payload: Partial<Visit> & { id: number }, { rejectWithValue }) => {
    try {
      const { data } = await adminAxios.put("/api/admin/visits.php", payload);
      return { ...payload };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error ?? "Error al actualizar",
      );
    }
  },
);

export const cancelVisit = createAsyncThunk(
  "adminVisits/cancel",
  async (id: number) => {
    await adminAxios.delete("/api/admin/visits.php", { params: { id } });
    return id;
  },
);

export const blockDate = createAsyncThunk(
  "adminVisits/blockDate",
  async (payload: {
    date: string;
    reason: string;
    time_start?: string;
    time_end?: string;
  }) => {
    const { data } = await adminAxios.post("/api/admin/visits.php", {
      action: "block-date",
      ...payload,
    });
    return { ...payload, id: data.id as number };
  },
);

export const unblockDate = createAsyncThunk(
  "adminVisits/unblockDate",
  async (date: string) => {
    await adminAxios.post("/api/admin/visits.php", {
      action: "unblock-date",
      date,
    });
    return date;
  },
);

export const unblockById = createAsyncThunk(
  "adminVisits/unblockById",
  async (id: number) => {
    await adminAxios.post("/api/admin/visits.php", {
      action: "unblock-by-id",
      id,
    });
    return id;
  },
);

export const fetchSlotTemplates = createAsyncThunk(
  "adminVisits/fetchSlots",
  async () => {
    const { data } = await adminAxios.get("/api/admin/slots.php");
    return data as { slots: SlotTemplate[] };
  },
);

export const generateDaySlots = createAsyncThunk(
  "adminVisits/generateDay",
  async (
    payload: {
      day_of_week: number;
      start_time: string;
      end_time: string;
      slot_duration_minutes: number;
      max_capacity: number;
    },
    { rejectWithValue },
  ) => {
    try {
      await adminAxios.post("/api/admin/slots.php", {
        action: "generate",
        ...payload,
      });
      // Re-fetch all templates so state is in sync
      const { data } = await adminAxios.get("/api/admin/slots.php");
      return data as { slots: SlotTemplate[] };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error ?? "Error al generar");
    }
  },
);

export const createSlotTemplate = createAsyncThunk(
  "adminVisits/createSlot",
  async (
    payload: Omit<SlotTemplate, "id" | "is_active">,
    { rejectWithValue },
  ) => {
    try {
      const { data } = await adminAxios.post("/api/admin/slots.php", payload);
      return { ...payload, id: data.id, is_active: 1 } as SlotTemplate;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error ?? "Error al crear el horario",
      );
    }
  },
);

export const updateSlotTemplate = createAsyncThunk(
  "adminVisits/updateSlot",
  async (
    payload: Partial<SlotTemplate> & { id: number },
    { rejectWithValue },
  ) => {
    try {
      await adminAxios.put("/api/admin/slots.php", payload);
      return payload;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error ?? "Error al actualizar",
      );
    }
  },
);

export const deleteSlotTemplate = createAsyncThunk(
  "adminVisits/deleteSlot",
  async (id: number) => {
    await adminAxios.delete("/api/admin/slots.php", { params: { id } });
    return id;
  },
);

export const fetchVisitSettings = createAsyncThunk(
  "adminVisits/fetchSettings",
  async () => {
    const { data } = await adminAxios.get("/api/admin/settings.php", {
      params: { group: "visits" },
    });
    return data as { settings: VisitSetting[] };
  },
);

export const saveVisitSettings = createAsyncThunk(
  "adminVisits/saveSettings",
  async (
    updates: { key: string; value: number | string | boolean }[],
    { rejectWithValue },
  ) => {
    try {
      await adminAxios.put("/api/admin/settings.php", { updates });
      return updates;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error ?? "Error al guardar");
    }
  },
);

const adminVisitsSlice = createSlice({
  name: "adminVisits",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminVisits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminVisits.fulfilled, (state, action) => {
        state.loading = false;
        state.visits = action.payload.visits ?? [];
        state.dayCounts = action.payload.day_counts ?? {};
      })
      .addCase(fetchAdminVisits.rejected, (state) => {
        state.loading = false;
        state.error = "Error al cargar las visitas";
      })
      .addCase(fetchBlockedDates.fulfilled, (state, action) => {
        state.blockedDates = action.payload.blocked_dates;
      })
      .addCase(createVisit.pending, (state) => {
        state.saving = true;
      })
      .addCase(createVisit.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(createVisit.rejected, (state) => {
        state.saving = false;
      })
      .addCase(updateVisit.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateVisit.fulfilled, (state, action) => {
        state.saving = false;
        const idx = state.visits.findIndex((v) => v.id === action.payload.id);
        if (idx !== -1) {
          state.visits[idx] = { ...state.visits[idx], ...action.payload };
        }
      })
      .addCase(updateVisit.rejected, (state) => {
        state.saving = false;
      })
      .addCase(cancelVisit.fulfilled, (state, action) => {
        const idx = state.visits.findIndex((v) => v.id === action.payload);
        if (idx !== -1) state.visits[idx].status = "cancelled";
      })
      .addCase(blockDate.fulfilled, (state, action) => {
        // For full-day blocks, replace any existing full-day entry for that date
        if (!action.payload.time_start) {
          state.blockedDates = state.blockedDates.filter(
            (b) =>
              !(
                b.override_date === action.payload.date && b.start_time === null
              ),
          );
        }
        state.blockedDates.push({
          id: action.payload.id,
          override_date: action.payload.date,
          start_time: action.payload.time_start ?? null,
          end_time: action.payload.time_end ?? null,
          reason: action.payload.reason,
        });
      })
      .addCase(unblockDate.fulfilled, (state, action) => {
        // Only removes the full-day block for that date
        state.blockedDates = state.blockedDates.filter(
          (b) => !(b.override_date === action.payload && b.start_time === null),
        );
      })
      .addCase(unblockById.fulfilled, (state, action) => {
        state.blockedDates = state.blockedDates.filter(
          (b) => b.id !== action.payload,
        );
      })
      .addCase(fetchSlotTemplates.pending, (state) => {
        state.slotsLoading = true;
      })
      .addCase(fetchSlotTemplates.fulfilled, (state, action) => {
        state.slotsLoading = false;
        state.slotTemplates = action.payload.slots ?? [];
      })
      .addCase(fetchSlotTemplates.rejected, (state) => {
        state.slotsLoading = false;
      })
      .addCase(generateDaySlots.pending, (state) => {
        state.slotsLoading = true;
      })
      .addCase(generateDaySlots.fulfilled, (state, action) => {
        state.slotsLoading = false;
        state.slotTemplates = action.payload.slots ?? [];
      })
      .addCase(generateDaySlots.rejected, (state) => {
        state.slotsLoading = false;
      })
      .addCase(createSlotTemplate.fulfilled, (state, action) => {
        state.slotTemplates.push(action.payload);
      })
      .addCase(updateSlotTemplate.fulfilled, (state, action) => {
        const idx = state.slotTemplates.findIndex(
          (s) => s.id === action.payload.id,
        );
        if (idx !== -1)
          state.slotTemplates[idx] = {
            ...state.slotTemplates[idx],
            ...action.payload,
          };
      })
      .addCase(deleteSlotTemplate.fulfilled, (state, action) => {
        state.slotTemplates = state.slotTemplates.filter(
          (s) => s.id !== action.payload,
        );
      })
      .addCase(fetchVisitSettings.pending, (state) => {
        state.settingsLoading = true;
      })
      .addCase(fetchVisitSettings.fulfilled, (state, action) => {
        state.settingsLoading = false;
        state.visitSettings = action.payload.settings ?? [];
      })
      .addCase(fetchVisitSettings.rejected, (state) => {
        state.settingsLoading = false;
      })
      .addCase(saveVisitSettings.pending, (state) => {
        state.settingsSaving = true;
      })
      .addCase(saveVisitSettings.fulfilled, (state, action) => {
        state.settingsSaving = false;
        for (const u of action.payload) {
          const idx = state.visitSettings.findIndex(
            (s) => s.config_key === u.key,
          );
          if (idx !== -1) state.visitSettings[idx].config_value = u.value;
        }
      })
      .addCase(saveVisitSettings.rejected, (state) => {
        state.settingsSaving = false;
      });
  },
});

export default adminVisitsSlice.reducer;
