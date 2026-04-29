// frontend/lib/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.110.246:8000/api', 
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const tokenRow = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='));
      
    const token = tokenRow?.split('=')[1];

    // 🔦 SENTER DEBUGGING: Tampilkan token di Console F12
    console.log("🔍 [Axios] Mencoba mengirim token:", token);

    // Pastikan token benar-benar ada dan BUKAN tulisan "undefined"
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("⚠️ [Axios] PERINGATAN: Token kosong atau tidak valid!");
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;