// Membaca ambulance_id dari URL (?id=1) dan submit form pemesanan ambulans

import { createAmbulanceRequest } from "../api/ambulanceApi.js";

document.addEventListener("DOMContentLoaded", () => {

    //  1. Cek login
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Anda harus login terlebih dahulu.");
        window.location.href = "../login.html";
        return;
    }

    // 2. Baca ambulance_id dari URL 
    const params = new URLSearchParams(window.location.search);
    const ambulanceId = params.get("id");

    if (!ambulanceId) {
        alert("Unit ambulans tidak ditemukan. Silakan pilih dari halaman layanan.");
        window.location.href = "../dashboard/layananKesehatan.html";
        return;
    }

    // 3. Isi hidden field ambulance_id    
    const hiddenInput = document.querySelector('input[name="ambulance_id"]');
    if (hiddenInput) hiddenInput.value = ambulanceId;

    // 4. Render navbar (nama user + logout) 
    renderNavbar();

    // 5. Handle submit form 
    const form = document.getElementById("serviceForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector("button[type='submit']");
        submitBtn.disabled = true;
        submitBtn.textContent = "Mengirim...";

        try {
            const formData = new FormData(form);

            // memastikan ambulance_id ikut terkirim
            formData.set("ambulance_id", ambulanceId);

            const result = await createAmbulanceRequest(formData);
            console.log("STATUS RESULT:", result);
            console.log("result.success value:", result.success);

            if (result.success) {
                alert("Permintaan ambulans berhasil dikirim! Silakan pantau status di halaman Status Pemesanan.");
                window.location.href = "../dashboard/statusPemesanan.html";
            } else {
                alert("Gagal: " + (result.message || "Terjadi kesalahan."));
                submitBtn.disabled = false;
                submitBtn.textContent = "Submit";
            }
        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan sistem. Coba lagi.");
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit";
        }
    });
});

function renderNavbar() {
    const authDiv = document.querySelector(".col-md-3.text-end");
    const userName = localStorage.getItem("userName") || "User";
    if (!authDiv) return;

    authDiv.innerHTML = `
        <div class="d-flex justify-content-end align-items-center gap-2">
            <span class="fw-bold text-primary small">Halo, ${userName}!</span>
            <button type="button" id="logoutBtn" class="btn btn-sm btn-outline-danger">Logout</button>
        </div>
    `;
    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "../login.html";
    });
}