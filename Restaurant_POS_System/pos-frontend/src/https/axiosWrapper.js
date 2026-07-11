import axios from "axios";
import API_BASE_URL from "../config/api";

const defaultHeader = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

export const axiosWrapper = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || API_BASE_URL,
  withCredentials: true,
  headers: { ...defaultHeader },
});
