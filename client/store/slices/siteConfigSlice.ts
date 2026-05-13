import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "@/store/axiosClient";

const BYPASS_KEY = "liv_bypass";

export interface SiteConfig {
  under_construction?: boolean;
  whatsapp_number?: string;
  instagram_url?: string;
  facebook_url?: string;
  site_title?: string;
  [key: string]: unknown;
}

interface SiteConfigState {
  config: SiteConfig;
  status: "loading" | "open" | "locked";
}

const initialState: SiteConfigState = {
  config: {},
  status: "loading",
};

export const fetchSiteConfig = createAsyncThunk(
  "siteConfig/fetch",
  async (_, { rejectWithValue }) => {
    const { data } = await axiosClient.get<{ config: SiteConfig }>(
      "/api/site-config.php",
      { headers: { "Cache-Control": "no-store" } },
    );
    return data.config ?? {};
  },
);

export const verifyBypassToken = createAsyncThunk(
  "siteConfig/verifyBypass",
  async (token: string, { rejectWithValue }) => {
    const { data } = await axiosClient.post<{ valid: boolean }>(
      "/api/bypass.php",
      { action: "verify", token },
    );
    return data.valid;
  },
);

const siteConfigSlice = createSlice({
  name: "siteConfig",
  initialState,
  reducers: {
    bypassGranted(state, action: { payload: string }) {
      localStorage.setItem(BYPASS_KEY, action.payload);
      state.status = "open";
    },
    setLocked(state) {
      state.status = "locked";
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchSiteConfig
      .addCase(fetchSiteConfig.fulfilled, (state, action) => {
        state.config = action.payload;
        if (!action.payload.under_construction) {
          state.status = "open";
        }
        // If under construction, stay "loading" until SiteGate completes bypass check
      })
      .addCase(fetchSiteConfig.rejected, (state) => {
        // API unavailable — never block the site
        state.status = "open";
      })
      // verifyBypassToken
      .addCase(verifyBypassToken.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = "open";
        } else {
          localStorage.removeItem(BYPASS_KEY);
          state.status = "locked";
        }
      })
      .addCase(verifyBypassToken.rejected, (state) => {
        localStorage.removeItem(BYPASS_KEY);
        state.status = "locked";
      });
  },
});

export const { bypassGranted, setLocked } = siteConfigSlice.actions;
export default siteConfigSlice.reducer;
export { BYPASS_KEY };
