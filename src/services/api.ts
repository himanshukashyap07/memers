import axios from 'axios';



// const BASE_URL = "https://memers-backend.vercel.app/api/v1"
const BASE_URL = "http://192.168.213.248:8000/api/v1"

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    withCredentials: true,
});


export default api;
