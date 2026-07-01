// frontend/assets/js/api.js
const BASE_URL = "http://localhost:3000/api";

const authFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });

    if (response.status === 401 || response.status === 403) {
        const isLoggingOut = localStorage.getItem("isLoggingOut");

        if (isLoggingOut === "true") {
            localStorage.removeItem("isLoggingOut");
            return null;
        }

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userName");

        alert("Sesi habis. Silakan login kembali.");
        window.location.href = "../login.html";
        return null;
    }

    return response;
};

const getCurrentUser = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
};

// PUSAT FUNGSI LOGOUT
const handleLogout = (e) => {
    if (e) e.preventDefault();

    localStorage.setItem("isLoggingOut", "true");

    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("user");

    alert("Anda telah logout.");
    window.location.replace("index.html");
};