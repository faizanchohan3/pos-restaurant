import axios from "axios";
import API_BASE_URL from "../config/api";

const defaultHeader = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

// Use API_BASE_URL from config (which handles env variables)
export const axiosWrapper = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { ...defaultHeader },
});
