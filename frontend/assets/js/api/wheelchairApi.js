// assets/js/api/wheelchairApi.js

const BASE_URL = "http://localhost:3000/api/wheelchairs";
const getToken = () => localStorage.getItem("token");
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });
const jsonHeaders = () => ({ "Content-Type": "application/json", ...authHeader() });

export async function getAllWheelchairs() {
    const res = await fetch(BASE_URL);
    return res.json();
}

export async function addWheelchair(data) {
    const res = await fetch(BASE_URL, {
        method: "POST", headers: jsonHeaders(), body: JSON.stringify(data)
    });
    return res.json();
}

export async function updateWheelchair(id, data) {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT", headers: jsonHeaders(), body: JSON.stringify(data)
    });
    return res.json();
}

export async function deleteWheelchair(id) {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE", headers: authHeader()
    });
    return res.json();
}

// POST pemesanan kursi roda — multipart/form-data
export async function createWheelchairRequest(formData) {
    const res = await fetch("http://localhost:3000/api/requests/wheelchair", {
        method: "POST",
        headers: authHeader(),
        body: formData
    });
    return res.json();
}