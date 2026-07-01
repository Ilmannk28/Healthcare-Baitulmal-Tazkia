    // assets/js/api/khitanApi.js

    const BASE_URL = "http://localhost:3000/api/khitan";
    const getToken = () => localStorage.getItem("token");
    const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });
    const jsonHeaders = () => ({ "Content-Type": "application/json", ...authHeader() });

    export async function getAllKhitanEvents() {
        const res = await fetch(BASE_URL);
        return res.json();
    }

    export async function addKhitanEvent(data) {
        const res = await fetch(BASE_URL, {
            method: "POST", headers: jsonHeaders(), body: JSON.stringify(data)
        });
        return res.json();
    }

    export async function updateKhitanEvent(id, data) {
        const res = await fetch(`${BASE_URL}/${id}`, {
            method: "PUT", headers: jsonHeaders(), body: JSON.stringify(data)
        });
        return res.json();
    }

    export async function deleteKhitanEvent(id) {
        const res = await fetch(`${BASE_URL}/${id}`, {
            method: "DELETE", headers: authHeader()
        });
        return res.json();
    }

    // POST pendaftaran khitan — multipart/form-data
    export async function createKhitanRequest(formData) {
        const res = await fetch("http://localhost:3000/api/requests/khitan", {
            method: "POST",
            headers: authHeader(),
            body: formData
        });
        return res.json();
    }