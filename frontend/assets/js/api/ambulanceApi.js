// assets/js/api/ambulanceApi.js

const BASE_URL = "http://localhost:3000/api/ambulances";
const getToken = () => localStorage.getItem("token");
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });
const jsonHeaders = () => ({ "Content-Type": "application/json", ...authHeader() });

export async function getAllAmbulances() {
    const res = await fetch(BASE_URL);
    return res.json();
}

export async function addAmbulance(data) {
    const res = await fetch(BASE_URL, {
        method: "POST", 
        headers: jsonHeaders(), 
        body: JSON.stringify(data)
    });
    return res.json();
}

export async function updateAmbulance(id, data) {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: jsonHeaders(),
        body: JSON.stringify(data)
    });
    return res.json();
}

export async function deleteAmbulance(id) {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE", 
        headers: authHeader()
    });
    return res.json();
}

// POST pemesanan ambulans — multipart/form-data (ada upload file dokumen)
export async function createAmbulanceRequest(formData) {
    const res = await fetch("http://localhost:3000/api/requests/ambulance", {
        method: "POST",
        headers: authHeader(),   
        body: formData
    });
    return res.json();
}