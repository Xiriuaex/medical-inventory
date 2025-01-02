import axios from 'axios';

 
export const server = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:4000/api',
    withCredentials: true,
    headers: {
        Authorization: typeof window !== "undefined" ? `Bearer ${localStorage.getItem("token")}` : undefined
    }
});
 