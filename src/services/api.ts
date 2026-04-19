import axios from 'axios';



const BASE_URL = "https://memers-backend.vercel.app/api/v1"

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    withCredentials: true,
});


export default api;
