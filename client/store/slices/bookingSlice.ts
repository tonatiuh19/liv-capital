import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "@/store/axiosClient";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TimeSlot {
  id: number;
  start: string; // "10:00"
  end: string; // "11:00"
  available: number;
  label: string | null;
}

export interface BookingSubmission {
  slot_template_id: number;
  visit_date: string; // "YYYY-MM-DD"
  time_start: string; // "HH:MM"
  time_end: string; // "HH:MM"
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string;
  visitor_interest: string;
  visitor_message: string;
}

interface BookingState {
  /** Date → slots map. Keys are "YYYY-MM-DD". Populated per month fetch. */
  monthSlots: Record<string, TimeSlot[]>;
  /** Month currently being fetched ("YYYY-MM") or null */
  loadingMonth: string | null;
  monthError: string | null;
  submitting: boolean;
  submitted: boolean;
  bookingId: number | null;
  submitError: string | null;
}

const initialState: BookingState = {
  monthSlots: {},
  loadingMonth: null,
  monthError: null,
  submitting: false,
  submitted: false,
  bookingId: null,
  submitError: null,
};

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchMonthSlots = createAsyncThunk(
  "booking/fetchMonthSlots",
  async (month: string) => {
    const { data } = await axiosClient.get<{
      month: string;
      dates: Record<string, TimeSlot[]>;
    }>(`/api/slots.php?month=${month}`);
    return data;
  },
);

export const submitBooking = createAsyncThunk(
  "booking/submit",
  async (submission: BookingSubmission, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post<{
        success: boolean;
        booking_id: number;
      }>("/api/bookings.php", submission);
      return data;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        axiosErr.response?.data?.error ?? "Error al agendar. Intenta de nuevo.",
      );
    }
  },
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    resetBooking: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // fetchMonthSlots
      .addCase(fetchMonthSlots.pending, (state, action) => {
        state.loadingMonth = action.meta.arg;
        state.monthError = null;
      })
      .addCase(fetchMonthSlots.fulfilled, (state, action) => {
        state.loadingMonth = null;
        // Merge dates from the fetched month into the cache
        Object.assign(state.monthSlots, action.payload.dates);
      })
      .addCase(fetchMonthSlots.rejected, (state) => {
        state.loadingMonth = null;
        state.monthError =
          "No se pudo cargar la disponibilidad. Intenta de nuevo.";
      })

      // submitBooking
      .addCase(submitBooking.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(submitBooking.fulfilled, (state, action) => {
        state.submitting = false;
        state.submitted = true;
        state.bookingId = action.payload.booking_id;
      })
      .addCase(submitBooking.rejected, (state, action) => {
        state.submitting = false;
        state.submitError =
          (action.payload as string) ?? "Error al agendar. Intenta de nuevo.";
      });
  },
});

export const { resetBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
