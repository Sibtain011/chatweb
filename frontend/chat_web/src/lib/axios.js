import axios from "axios";

const API_BASE =
  import.meta.env.MODE === "development"
    ? (import.meta.env.VITE_API_URL || "http://localhost:5001") + "/api"
    : "/api";

export const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});