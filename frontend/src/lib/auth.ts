// Helper para manejar el Token JWT en el navegador

export const setToken = (token: string) => {
    if (typeof window !== "undefined") {
        localStorage.setItem("strapi_jwt", token);
    }
};

export const getToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("strapi_jwt");
    }
    return null;
};

export const removeToken = () => {
    if (typeof window !== "undefined") {
        localStorage.removeItem("strapi_jwt");
    }
};