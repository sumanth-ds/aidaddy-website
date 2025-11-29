// Authentication utilities

const TOKEN_KEY = 'aidaddy_auth_token';

export const setToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
    localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = () => {
    return !!getToken();
};

export const login = (token) => {
    setToken(token);
};

export const logout = () => {
    removeToken();
};
