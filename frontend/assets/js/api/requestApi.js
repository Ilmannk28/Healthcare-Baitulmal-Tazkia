// assets/js/api/requestApi.js

const BASE_URL = "http://localhost:3000/api/requests";

const getToken = () => localStorage.getItem("token");

const jsonHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`
});

const authHeader = () => ({
    Authorization: `Bearer ${getToken()}`
});

// GET semua request
export async function getRequests() {
    const res = await fetch(BASE_URL, { headers: jsonHeaders() });
    return res.json();
}

// ADMIN: update status (PUT /api/requests/admin/:id)
export async function adminUpdateStatusRequest(id, status_id) {
    const res = await fetch(`${BASE_URL}/admin/${id}`, {
        method: "PUT",
        headers: jsonHeaders(),
        body: JSON.stringify({ status_id: Number(status_id) })
    });
    return res.json();
}

// USER: edit detail data request (PUT /api/requests/:id)
export async function updateRequestByDetail(id, data) {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: jsonHeaders(),
        body: JSON.stringify(data)
    });
    return res.json();
}

// GET dokumen per request
export async function getDocumentsByRequest(requestId) {
    const res = await fetch(`${BASE_URL}/${requestId}/documents`, {
        headers: jsonHeaders()
    });
    return res.json();
}

// Upload / update satu dokumen (multipart)
export async function uploadDocument(requestId, documentType, file) {
    const formData = new FormData();
    formData.append("document_type", documentType);
    formData.append(documentType, file);   

    const res = await fetch(`${BASE_URL}/${requestId}/documents`, {
        method: "PUT",
        headers: authHeader(),            
        body: formData
    });
    return res.json();
}