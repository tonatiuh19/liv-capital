import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "@/store/axiosClient";

interface ContactState {
  submitting: boolean;
  submitted: boolean;
  error: string | null;
}

const initialState: ContactState = {
  submitting: false,
  submitted: false,
  error: null,
};

export const submitContact = createAsyncThunk(
  "contact/submit",
  async (
    payload: {
      name: string;
      email: string;
      phone: string;
      message: string;
      interest?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await axiosClient.post("/api/contact.php", payload);
      return data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error ?? "Error al enviar el formulario",
      );
    }
  },
);

const contactSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {
    resetContact(state) {
      state.submitting = false;
      state.submitted = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitContact.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitContact.fulfilled, (state) => {
        state.submitting = false;
        state.submitted = true;
      })
      .addCase(submitContact.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetContact } = contactSlice.actions;
export default contactSlice.reducer;
