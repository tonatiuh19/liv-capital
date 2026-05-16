import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import adminAxios, { ADMIN_TOKEN_KEY } from "@/store/axiosAdmin";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: "superadmin" | "admin";
}

interface AdminState {
  admin: AdminUser | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  otpSent: boolean;
  adminName: string | null; // from check-email
  error: string | null;
}

const initialState: AdminState = {
  admin: null,
  status: "idle",
  otpSent: false,
  adminName: null,
  error: null,
};

export const checkAdminEmail = createAsyncThunk(
  "admin/checkEmail",
  async (email: string, { rejectWithValue }) => {
    const { data } = await adminAxios.post("/api/admin/auth.php", {
      action: "check-email",
      email,
    });
    return data as { exists: boolean; name?: string };
  },
);

export const sendAdminOtp = createAsyncThunk(
  "admin/sendOtp",
  async (email: string, { rejectWithValue }) => {
    const { data } = await adminAxios.post("/api/admin/auth.php", {
      action: "send-otp",
      email,
    });
    return data as { sent: boolean };
  },
);

export const verifyAdminOtp = createAsyncThunk(
  "admin/verifyOtp",
  async (payload: { email: string; code: string }, { rejectWithValue }) => {
    try {
      const { data } = await adminAxios.post("/api/admin/auth.php", {
        action: "verify-otp",
        ...payload,
      });
      return data as { token: string; admin: AdminUser };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error ?? "Código incorrecto");
    }
  },
);

export const verifyAdminSession = createAsyncThunk(
  "admin/verifySession",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await adminAxios.post("/api/admin/auth.php", {
        action: "verify-session",
      });
      return data as { valid: boolean; admin?: AdminUser };
    } catch {
      return rejectWithValue("Sesión inválida");
    }
  },
);

export const logoutAdmin = createAsyncThunk("admin/logout", async () => {
  try {
    await adminAxios.post("/api/admin/auth.php", { action: "logout" });
  } catch {
    // ignore
  }
  localStorage.removeItem(ADMIN_TOKEN_KEY);
});

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdminError(state) {
      state.error = null;
    },
    resetAdminFlow(state) {
      state.otpSent = false;
      state.adminName = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // checkEmail
      .addCase(checkAdminEmail.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(checkAdminEmail.fulfilled, (state, action) => {
        state.status = "idle";
        if (action.payload.exists) {
          state.adminName = action.payload.name ?? null;
        } else {
          state.error = "Este correo no está registrado como administrador.";
        }
      })
      .addCase(checkAdminEmail.rejected, (state) => {
        state.status = "idle";
        state.error = "Error al verificar el correo.";
      })
      // sendOtp
      .addCase(sendAdminOtp.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(sendAdminOtp.fulfilled, (state) => {
        state.status = "idle";
        state.otpSent = true;
      })
      .addCase(sendAdminOtp.rejected, (state) => {
        state.status = "idle";
        state.error = "Error al enviar el código.";
      })
      // verifyOtp
      .addCase(verifyAdminOtp.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(verifyAdminOtp.fulfilled, (state, action) => {
        localStorage.setItem(ADMIN_TOKEN_KEY, action.payload.token);
        state.admin = action.payload.admin;
        state.status = "authenticated";
        state.error = null;
      })
      .addCase(verifyAdminOtp.rejected, (state, action) => {
        state.status = "idle";
        state.error = (action.payload as string) ?? "Código incorrecto.";
      })
      // verifySession
      .addCase(verifyAdminSession.pending, (state) => {
        state.status = "loading";
      })
      .addCase(verifyAdminSession.fulfilled, (state, action) => {
        if (action.payload.valid && action.payload.admin) {
          state.admin = action.payload.admin;
          state.status = "authenticated";
        } else {
          localStorage.removeItem(ADMIN_TOKEN_KEY);
          state.status = "unauthenticated";
        }
      })
      .addCase(verifyAdminSession.rejected, (state) => {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        state.status = "unauthenticated";
      })
      // logout
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.admin = null;
        state.status = "unauthenticated";
        state.otpSent = false;
        state.adminName = null;
      });
  },
});

export const { clearAdminError, resetAdminFlow } = adminSlice.actions;
export default adminSlice.reducer;
