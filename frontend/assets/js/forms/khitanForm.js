// assets/js/forms/khitanForm.js
// Membaca khitan_event_id dari URL (?id=1) dan submit form pendaftaran khitan

import { createKhitanRequest } from "../api/khitanApi.js";

document.addEventListener("DOMContentLoaded", () => {

    const token = localStorage.getItem("token");
    if (!token) {
        alert("Anda harus login terlebih dahulu.");
        window.location.href = "../login.html";
        return;
    }

    const params        = new URLSearchParams(window.location.search);
    const khitanEventId = params.get("id");

    if (!khitanEventId) {
        alert("Jadwal khitan tidak ditemukan. Silakan pilih dari halaman layanan.");
        window.location.href = "../dashboard/layananKesehatan.html";
        return;
    }

    const hiddenInput = document.querySelector('input[name="khitan_event_id"]');
    if (hiddenInput) hiddenInput.value = khitanEventId;

    renderNavbar();

    const form = document.getElementById("serviceForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn       = form.querySelector("button[type='submit']");
        submitBtn.disabled    = true;
        submitBtn.textContent = "Mendaftarkan...";

        try {
            const formData = new FormData(form);
            formData.set("khitan_event_id", khitanEventId);

            const result = await createKhitanRequest(formData);

            if (result.success) {
                alert("Pendaftaran khitan berhasil! Silakan pantau status di halaman Status Pemesanan.");
                window.location.href = "../dashboard/statusPemesanan.html";
            } else {
                alert("Gagal: " + (result.message || "Terjadi kesalahan."));
                submitBtn.disabled    = false;
                submitBtn.textContent = "Daftar Sekarang";
            }
        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan sistem. Coba lagi.");
            submitBtn.disabled    = false;
            submitBtn.textContent = "Daftar Sekarang";
        }
    });
});

function renderNavbar() {
    const authDiv  = document.querySelector(".col-md-3.text-end");
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