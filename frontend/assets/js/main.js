// assets/js/main.js

//  PAGES 
import { ambulancePage } from "./pages/ambulance.js";
import { wheelchairPage } from "./pages/wheelchair.js";
import { khitanPage } from "./pages/khitan.js";

//  API UNIT (CRUD) 
import { getAllAmbulances, addAmbulance, updateAmbulance, deleteAmbulance } from "./api/ambulanceApi.js";
import { getAllWheelchairs, addWheelchair, updateWheelchair, deleteWheelchair } from "./api/wheelchairApi.js";
import { getAllKhitanEvents, addKhitanEvent, updateKhitanEvent, deleteKhitanEvent } from "./api/khitanApi.js";

//  API REQUEST 
import { getRequests, adminUpdateStatusRequest, updateRequestByDetail } from "./api/requestApi.js";
import { renderNavbar } from "./utils/utils.js";

//  STATE 
const app = document.getElementById("app");
const title = document.getElementById("title_dashboard");

let localRequestsData = [];
let currentPageData = []; 
let currentRole = "user";

//  ROUTES 
const routes = {
    ambulans: { render: renderAmbulancePage, title: "Ambulans" },
    kursi: { render: renderwheelchairPage, title: "Kursi Roda" },
    khitan: { render: renderkhitanPage, title: "Khitanan Massal" },
};

//  RENDER HALAMAN LAYANAN 
async function renderAmbulancePage() {
    const res = await getAllAmbulances();
    const data = res.data || res;
    currentPageData = data;
    if (app) app.innerHTML = ambulancePage(data, currentRole);
}

async function renderwheelchairPage() {
    const res = await getAllWheelchairs();
    const data = res.data || res;
    currentPageData = data;
    if (app) app.innerHTML = wheelchairPage(data, currentRole);
}

async function renderkhitanPage() {
    const res = await getAllKhitanEvents();
    const data = res.data || res;
    currentPageData = data;
    if (app) app.innerHTML = khitanPage(data, currentRole);
}

//  LOAD PAGE (SPA ROUTER) 
window.loadPage = async function (page) {
    const selectedRoute = routes[page];
    if (!selectedRoute) return;

    document.querySelectorAll(".sidebar .nav-link").forEach(l => l.classList.remove("active"));
    const sideLink = document.getElementById(page);
    if (sideLink) sideLink.classList.add("active");

    await selectedRoute.render();

    if (title) title.innerHTML = `Daftar Layanan ${selectedRoute.title}`;
};

//  ENTRY POINT 
document.addEventListener("DOMContentLoaded", () => {
    renderNavbar()
    const isAtDashboard = window.location.pathname.includes("layananKesehatan.html");
    if (!isAtDashboard) return;

    const token = localStorage.getItem("token");
    if (!token) {
        alert("Akses ditolak! Anda harus login terlebih dahulu.");
        window.location.href = "../login.html";
        return;
    }

    currentRole = localStorage.getItem("userRole") || "user";


    //  EVENT DELEGATION UTAMA (tombol di dalam #app) 
    if (app) {
        app.addEventListener("click", async (e) => {

            //  TAMBAH UNIT (admin) 
            if (e.target.classList.contains("btn-tambah-unit")) {
                const type = e.target.dataset.type;
                bukaModalUnit(type, null);
            }

            //  DETAIL / EDIT UNIT (admin) 
            if (e.target.classList.contains("btn-detail-unit")) {
                const id = e.target.dataset.id;
                const type = e.target.dataset.type;
                
                // Cek keduanya: string "1" == number 1 dan number 1 == number 1
                const unitData = currentPageData.find(u => String(u.id) === String(id));
                if (!unitData) {
                    console.error("Unit tidak ditemukan. ID:", id, "| currentPageData:", currentPageData);
                    alert("Data unit tidak ditemukan. Coba refresh halaman.");
                    return;
                }
                bukaModalUnit(type, unitData);
            }

            //  HAPUS UNIT (admin) 
            if (e.target.classList.contains("btn-delete-unit")) {
                const id = e.target.dataset.id;
                const type = e.target.dataset.type;
                const name = e.target.dataset.name;
                if (!confirm(`Hapus unit "${name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
                await handleDeleteUnit(type, id);
            }

            //  PESAN / DAFTAR (user) 
            if (e.target.classList.contains("btn-order")) {
                const id = e.target.dataset.id;
                const type = e.target.dataset.type;
                bukaModalPesan(type, id);
            }
        });
    }

    //  INIT 
    window.loadPage("ambulans");
});

// ══════════════════════════════════════════════════════════════════════════════
// MODAL UNIT — TAMBAH / EDIT (ADMIN)
// ══════════════════════════════════════════════════════════════════════════════

function bukaModalUnit(type, data) {
    const isEdit = !!data;
    const modalEl = document.getElementById("modalEditLayanan");
    const formEl = document.getElementById("formEditLayanan");
    const titleEl = document.getElementById("modalEditLayananLabel");
    const bodyEl = document.getElementById("containerFormDinamis");
    const submitBtn = formEl ? formEl.querySelector("button[type='submit']") : null;

    if (!modalEl || !formEl || !bodyEl) return;

    // Reset form & hidden fields (dipakai berbeda dari edit request user)
    formEl.dataset.mode = isEdit ? "edit-unit" : "add-unit";
    formEl.dataset.unitType = type;
    formEl.dataset.unitId = isEdit ? data.id : "";

    titleEl.innerText = isEdit
        ? `Edit Unit — ${getTypeLabel(type)}`
        : `Tambah Unit — ${getTypeLabel(type)}`;

    if (submitBtn) submitBtn.innerText = isEdit ? "Simpan Perubahan" : "Tambah Unit";

    bodyEl.innerHTML = buildUnitForm(type, data);

    // Pastikan bootstrap sudah ter-load
    if (typeof bootstrap === "undefined") {
        console.error("Bootstrap belum ter-load. Pastikan bootstrap.bundle.min.js di-load sebelum main.js di layananKesehatan.html");
        alert("Bootstrap belum ter-load. Cek urutan script di HTML.");
        return;
    }
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

function getTypeLabel(type) {
    return { ambulance: "Ambulans", wheelchair: "Kursi Roda", khitan: "Khitanan Massal" }[type] || type;
}

function buildUnitForm(type, d = {}) {
    // Guard: pastikan d tidak null/undefined
    if (!d) d = {};
    const statusOptions = (current) => [
        { id: 1, key: "available", label: "Tersedia" },
        { id: 2, key: "in_use", label: "Dipakai" },
        { id: 3, key: "maintenance", label: "Tidak Tersedia" },
    ].map(s =>
        `<option value="${s.id}" ${current === s.key ? "selected" : ""}>${s.label}</option>`
    ).join("");

    if (type === "ambulance" || type === "wheelchair") {
        return `
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label small fw-bold">Kode Unit</label>
                    <input type="text" class="form-control" name="code"
                        value="${d.code || ""}" placeholder="Contoh: AMB-04 || WC-04" required>
                </div>
                <div class="col-md-6">
                <label class="form-label small fw-bold">Lokasi / Basecamp</label>
                <input type="text" class="form-control" name="location"
                value="${d.location || ""}" placeholder="Contoh: Sentul" required>
                </div>
                <div class="col-md-6">
                <label class="form-label small fw-bold">Wilayah</label>
                <input type="text" class="form-control" name="coverage_area"
                value="${d.coverage_area || ""}" placeholder="Contoh: Bogor" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label small fw-bold">Status Unit</label>
                    <select class="form-select" name="status_id">
                        ${statusOptions(d.status_name)}
                    </select>
                </div>
               
            </div>
        `;
    }

    if (type === "khitan") {
        const evDate = d.event_date ? d.event_date.split("T")[0] : "";
        return `
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label small fw-bold">Kota</label>
                    <input type="text" class="form-control" name="city"
                        value="${d.city || ""}" required>
                </div>
                 <div class="col-md-6">
                    <label class="form-label small fw-bold">Lokasi Pelaksanaan</label>
                    <input type="text" class="form-control" name="location"
                        value="${d.location || ""}" required>
                </div>
                <div class="col-md-6">
                <label class="form-label small fw-bold">Tanggal Pelaksanaan</label>
                <input type="date" class="form-control" name="event_date"
                value="${evDate}" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label small fw-bold">Kuota Peserta</label>
                    <input type="number" class="form-control" name="quota"
                        value="${d.quota || ""}" min="1" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label small fw-bold">Status Pendaftaran</label>
                    <select class="form-select" name="status">
                        ${["open", "closed", "done"].map(s => {
            const lbl = { open: "Dibuka", closed: "Ditutup", done: "Selesai" }[s];
            return `<option value="${s}" ${d.status === s ? "selected" : ""}>${lbl}</option>`;
        }).join("")}
                    </select>
                </div>
                
            </div>
        `;
    }

    return "";
}

//  SUBMIT FORM MODAL (add-unit / edit-unit) 
document.addEventListener("DOMContentLoaded", () => {
    

    const formEditLayanan = document.getElementById("formEditLayanan");
    if (!formEditLayanan) return;

    formEditLayanan.addEventListener("submit", async (e) => {
        e.preventDefault();

        const mode = formEditLayanan.dataset.mode;
        const type = formEditLayanan.dataset.unitType;
        const unitId = formEditLayanan.dataset.unitId;

        // Kumpulkan data form
        const formData = new FormData(formEditLayanan);
        const payload = {};
        formData.forEach((v, k) => { payload[k] = v; });

        try {
            let res;

            if (mode === "add-unit") {
                res = await addUnit(type, payload);
            } else if (mode === "edit-unit") {
                res = await editUnit(type, unitId, payload);
            }

            if (res && res.success) {
                alert(res.message || "Berhasil disimpan.");
                bootstrap.Modal.getInstance(document.getElementById("modalEditLayanan")).hide();
                await refreshCurrentPage(type);
            } else {
                alert(`Gagal: ${res ? res.message : "Respons tidak dikenal"}`);
            }
        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan sistem.");
        }
    });
});

// Dispatcher add/edit ke API yang sesuai
async function addUnit(type, data) {
    if (type === "ambulance") return addAmbulance(data);
    if (type === "wheelchair") return addWheelchair(data);
    if (type === "khitan") return addKhitanEvent(data);
}
async function editUnit(type, id, data) {
    if (type === "ambulance") return updateAmbulance(id, data);
    if (type === "wheelchair") return updateWheelchair(id, data);
    if (type === "khitan") return updateKhitanEvent(id, data);
}
async function handleDeleteUnit(type, id) {
    let res;
    if (type === "ambulance") res = await deleteAmbulance(id);
    if (type === "wheelchair") res = await deleteWheelchair(id);
    if (type === "khitan") res = await deleteKhitanEvent(id);
    if (res && res.success) {
        alert(res.message || "Unit berhasil dihapus.");
        await refreshCurrentPage(type);
    } else {
        alert(`Gagal hapus: ${res ? res.message : "Error"}`);
    }
}

async function refreshCurrentPage(type) {
    if (type === "ambulance") await renderAmbulancePage();
    if (type === "wheelchair") await renderwheelchairPage();
    if (type === "khitan") await renderkhitanPage();
}


function bukaModalPesan(type, unitId) {
    const formPages = {
        ambulance: "../../views/forms/ambulanceForm.html",
        wheelchair: "../../views/forms/wheelchairForm.html",
        khitan: "../../views/forms/khitanEventForm.html"
    };

    const targetPage = formPages[type];
    if (!targetPage) {
        alert("Halaman form tidak ditemukan untuk layanan: " + type);
        return;
    }

    // Kirim unit ID lewat URL query param → ?id=1
    window.location.href = `${targetPage}?id=${unitId}`;
}