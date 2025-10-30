import axios from 'axios';

const http = axios.create({ baseURL: '/api', timeout: 10000 });
console.log('authservice loaded, baseURL = /api');

const login = async ({ email, password }) => {
    try {
        const response = await http.post('/auth/login', { email, password });
        if (response.data.token) {
            console.log('Login successful', response.data);
        }
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Login failed';
        console.error('Login failed', message);
        throw error.response?.data || new Error(message);
    }
};

export default { login };