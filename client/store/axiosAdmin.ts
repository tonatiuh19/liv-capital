import axios from "axios";

export const ADMIN_TOKEN_KEY = "liv_admin_token";

const adminAxios = axios.create({
  headers: { "Content-Type": "application/json" },
});

adminAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default adminAxios;
