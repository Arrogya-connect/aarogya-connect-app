import AsyncStorage from '@react-native-async-storage/async-storage';

// Render backend URL
// export const API_BASE = 'http://localhost:4000'; // For local testing
export const API_BASE = 'https://aarogya-backend-delta.vercel.app';

export const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem('sessionToken');
    return {
        'Content-Type': 'application/json',
        'x-session-token': token || '',
    };
};

export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const headers = await getAuthHeaders();
    const url = `${API_BASE}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            ...headers,
            ...options.headers,
        },
    });

    const data = await response.json();
    return { status: response.status, ok: response.ok, data };
};
