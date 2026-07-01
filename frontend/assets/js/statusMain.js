// assets/js/statusMain.js

import { getRequests, adminUpdateStatusRequest, updateRequestByDetail, getDocumentsByRequest, uploadDocument } from "./api/requestApi.js";
import { renderNavbar } from "./utils/utils.js";

// ── STATE ──────────────────────────────────────────────────────────────────
let allRequestsData = [];
let currentRole = "user";

// ── ENTRY POINT ────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
    renderNavbar();

    const token = localStorage.getItem("token");
    if (!token) {
        alert("Akses ditolak! Anda harus login terlebih dahulu.");
        window.location.href = "../login.html";
        return;
    }

    currentRole = localStorage.getItem("userRole") || "user";

    await loadRequests();
    setupTableEventListeners();
    setupSidebarFilter();
    setupFormEditListener();
});

// ── LOAD DATA ──────────────────────────────────────────────────────────────
async function loadRequests() {
    const spinner = document.getElementById("loadingSpinner");
    const errorMsg = document.getElementById("errorMsg");
    const app = document.getElementById("app");

    spinner.style.display = "block";
    errorMsg.style.display = "none";
    app.innerHTML = "";

    try {
        const res = await getRequests();
        if (!res.success) throw new Error(res.message || "Gagal mengambil data");
        allRequestsData = res.data;
        renderTable(allRequestsData);
    } catch (err) {
        console.error(err);
        errorMsg.style.display = "block";
    } finally {
        spinner.style.display = "none";
    }
}

// ── RENDER TABEL ────────────────────────────────────────────────────────────
function renderTable(requests) {
    const app = document.getElementById("app");
    if (!requests || requests.length === 0) {
        app.innerHTML = `
            <div class="text-center py-5 text-muted">
                <p class="fs-1 mb-1">📋</p>
                <p>Tidak ada permintaan layanan ditemukan.</p>
            </div>`;
        return;
    }

    app.innerHTML = `
        <table class="table table-hover mb-0">
            <thead class="table-dark">
                <tr>
                    <th>ID</th>
                    <th>Layanan</th>
                    <th>Nama Pemohon</th>
                    <th>Tanggal</th>
                    <th>Status</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
                ${requests.map(r => buildRow(r)).join("")}
            </tbody>
        </table>`;
}

function buildRow(r) {
    const statusClass = {
        pending: "status-pending",
        approved: "status-approved",
        rejected: "status-rejected",
        completed: "status-completed"
    }[r.status_name] || "status-pending";

    const tanggal = r.created_at
        ? new Date(r.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
        : "-";

    // Admin dan user sama-sama punya tombol Detail
    // Bedanya ada di dalam modal
    const btnClass = currentRole === "admin" ? "btn-detail-admin" : "btn-detail-user";

    return `
        <tr>
            <td class="fw-bold text-muted small">REQ-${r.request_id}</td>
            <td>${r.service_name}</td>
            <td>${r.user_name}</td>
            <td class="small">${tanggal}</td>
            <td><span class="status-badge ${statusClass}">${r.status_name}</span></td>
            <td>
                <button class="btn btn-sm btn-orange ${btnClass}" data-id="${r.request_id}">
                    Detail
                </button>
            </td>
        </tr>`;
}

// ── EVENT DELEGATION ────────────────────────────────────────────────────────
function setupTableEventListeners() {
    const app = document.getElementById("app");

    app.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;

        const id = btn.dataset.id;
        const data = allRequestsData.find(r => r.request_id == id);
        if (!data) return;

        if (btn.classList.contains("btn-detail-admin")) bukaModalDetailAdmin(data);
        if (btn.classList.contains("btn-detail-user")) bukaModalDetailUser(data);
    });
}

// ── MODAL DETAIL ADMIN ──────────────────────────────────────────────────────
// Admin bisa lihat detail + dokumen + ubah status via dropdown
async function bukaModalDetailAdmin(data) {
    const container = document.getElementById("containerDetailModal");
    const footer = document.getElementById("modalDetailFooter");
    const title = document.getElementById("modalDetailLabel");

    title.innerText = `Detail Permintaan: REQ-${data.request_id} (${data.service_name})`;
    container.innerHTML = `<div class="text-center py-3"><div class="spinner-border spinner-border-sm"></div> Memuat...</div>`;

    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("modalDetailRequest"));
    modal.show();

    // Fetch dokumen
    let docs = [];
    try {
        const docRes = await getDocumentsByRequest(data.request_id);
        if (docRes.success) docs = docRes.data;
    } catch (e) { console.error(e); }

    container.innerHTML = buildDetailHTML(data) + buildDocsHTML(docs, false);

    // Footer: dropdown status + tombol simpan
    const statusOptions = [
        { id: 1, label: "Pending" },
        { id: 2, label: "Approved / Disetujui" },
        { id: 3, label: "Rejected / Ditolak" },
        { id: 4, label: "Completed / Selesai" }
    ].map(s => `<option value="${s.id}" ${data.status_name === s.label.split(" ")[0].toLowerCase() ? "selected" : ""}>${s.label}</option>`).join("");

    // Mapping status_name ke status_id
    const statusMap = { pending: 1, approved: 2, rejected: 3, completed: 4 };
    const currentStatusId = statusMap[data.status_name] || 1;

    footer.innerHTML = `
        <div class="d-flex align-items-center gap-2 w-100">
            <label class="form-label mb-0 fw-bold small text-nowrap">Update Status:</label>
            <select class="form-select form-select-sm" id="adminStatusSelect">
                <option value="1" ${currentStatusId === 1 ? "selected" : ""}>Pending</option>
                <option value="2" ${currentStatusId === 2 ? "selected" : ""}>Approved / Disetujui</option>
                <option value="3" ${currentStatusId === 3 ? "selected" : ""}>Rejected / Ditolak</option>
                <option value="4" ${currentStatusId === 4 ? "selected" : ""}>Completed / Selesai</option>
            </select>
            <button type="button" class="btn btn-primary btn-sm text-nowrap" id="btnSaveStatus">Simpan</button>
            <button type="button" class="btn btn-secondary btn-sm text-nowrap" data-bs-dismiss="modal">Tutup</button>
        </div>
    `;

    document.getElementById("btnSaveStatus").addEventListener("click", async () => {
        const selectedStatus = document.getElementById("adminStatusSelect").value;
        if (selectedStatus == currentStatusId) {
            alert("Status tidak berubah.");
            return;
        }
        if (!confirm(`Update status REQ-${data.request_id} menjadi "${document.getElementById("adminStatusSelect").options[document.getElementById("adminStatusSelect").selectedIndex].text}"?`)) return;
        await handleAdminUpdateStatus(data.request_id, selectedStatus);
    });
}

// ── MODAL DETAIL USER ───────────────────────────────────────────────────────
async function bukaModalDetailUser(data) {
    const container = document.getElementById("containerDetailModal");
    const footer = document.getElementById("modalDetailFooter");
    const title = document.getElementById("modalDetailLabel");

    title.innerText = `Detail Permintaan: REQ-${data.request_id} (${data.service_name})`;
    container.innerHTML = `<div class="text-center py-3"><div class="spinner-border spinner-border-sm"></div> Memuat...</div>`;

    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("modalDetailRequest"));
    modal.show();

    let docs = [];
    try {
        const docRes = await getDocumentsByRequest(data.request_id);
        if (docRes.success) docs = docRes.data;
    } catch (e) { console.error(e); }

    const canEdit = data.status_name === "pending";
    container.innerHTML = buildDetailHTML(data) + buildDocsHTML(docs, canEdit);

    if (canEdit) setupDocUploadListeners(data.request_id);

    footer.innerHTML = canEdit
        ? `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
           <button type="button" class="btn btn-primary" id="btnEditRequest">Edit Data</button>`
        : `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>`;

    if (canEdit) {
        document.getElementById("btnEditRequest").addEventListener("click", () => {
            bootstrap.Modal.getInstance(document.getElementById("modalDetailRequest")).hide();
            setTimeout(() => bukaModalEdit(data.request_id, data.service_name, data), 400);
        });
    }
}

// ── ADMIN UPDATE STATUS ─────────────────────────────────────────────────────
async function handleAdminUpdateStatus(id, statusId) {
    try {
        const res = await adminUpdateStatusRequest(id, statusId);
        if (res.success) {
            alert(res.message || "Status berhasil diperbarui.");
            bootstrap.Modal.getInstance(document.getElementById("modalDetailRequest")).hide();
            await loadRequests();
        } else {
            alert("Gagal: " + res.message);
        }
    } catch (err) {
        console.error(err);
        alert("Terjadi masalah sistem.");
    }
}

// ── BUILD HTML DETAIL ───────────────────────────────────────────────────────
function buildDetailHTML(data) {
    const tanggal = data.created_at
        ? new Date(data.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
        : "-";

    const statusClass = {
        pending: "status-pending", approved: "status-approved",
        rejected: "status-rejected", completed: "status-completed"
    }[data.status_name] || "status-pending";

    let html = `
        <div class="row g-3 mb-3">
            ${field("ID Permintaan", "REQ-" + data.request_id, "col-md-4")}
            ${field("Jenis Layanan", data.service_name, "col-md-4")}
            <div class="col-md-4">
                <small class="text-muted d-block">Status</small>
                <span class="status-badge ${statusClass}">${data.status_name}</span>
            </div>
            ${field("Nama Pemohon", data.user_name, "col-md-4")}
            ${field("Tanggal Pengajuan", tanggal, "col-md-4")}
        </div>
        <hr>
        <h6 class="fw-bold mb-3">Detail Layanan</h6>
        <div class="row g-3">`;

    const svc = (data.service_name || "").toLowerCase();

    if (svc === "ambulance") {
        html += `
         ${field("Kode Unit Ambulans", data.amb_code ? `<span class="badge bg-primary fs-6">${data.amb_code}</span>`
            : "-", "col-12")} 
            ${field("Nama Pasien", data.amb_patient || "-")}
            ${field("Nomor HP", data.amb_phone || "-")}
            ${field("Jenis Kelamin", data.amb_gender || "-")}
            ${field("Kondisi Pasien", data.amb_condition || "-", "col-12")}
            ${field("Alamat Penjemputan", data.amb_address || "-", "col-md-6")}
            ${field("Tujuan", data.amb_destination || "-", "col-md-6")}`;
    } else if (svc === "wheelchair") {
        const bd = data.wc_borrow_date ? new Date(data.wc_borrow_date).toLocaleDateString("id-ID") : "-";
        html += `
         ${field("Kode Unit Kursi Roda", data.wc_code
            ? `<span class="badge bg-primary fs-6">${data.wc_code}</span>`
            : "-", "col-12")} 
            ${field("Nama Pengguna", data.wc_patient || "-")}
            ${field("Nomor HP", data.wc_phone || "-")}
            ${field("Tanggal Pinjam", bd)}
            ${field("Kondisi / Alasan", data.wc_condition || "-")}
            ${field("Alamat", data.wc_address || "-", "col-12")}`;
    } else if (svc === "khitan") {
        html += `
         
            ${field("Nama Anak", data.khitan_patient || "-")}
            ${field("Nama Orang Tua", data.khitan_parent || "-")}
            ${field("Nomor HP", data.khitan_phone || "-")}
            ${field("Alamat", data.khitan_address || "-", "col-12")}`;
    }

    html += `</div>`;
    return html;
}

function field(label, value, colClass = "col-md-6") {
    return `<div class="${colClass}">
        <small class="text-muted d-block">${label}</small>
        <strong>${value}</strong>
    </div>`;
}

// ── BUILD HTML DOKUMEN ──────────────────────────────────────────────────────
function buildDocsHTML(docs, canUpload) {
    const docTypes = [
        { key: "ktp", label: "KTP" },
        { key: "kk", label: "Kartu Keluarga" },
        { key: "sktm", label: "SKTM" },
        { key: "surat_rujukan", label: "Surat Rujukan" }
    ];

    const docMap = {};
    docs.forEach(d => { docMap[d.document_type] = d; });

    let html = `<hr><h6 class="fw-bold mb-3">Dokumen Pendukung</h6><div class="row g-3">`;

    docTypes.forEach(type => {
        const doc = docMap[type.key];
        const fileUrl = doc ? `http://localhost:3000/${doc.file_path}` : null;

        html += `
            <div class="col-md-6">
                <div class="border rounded p-2">
                    <small class="text-muted d-block fw-bold mb-1">${type.label}</small>
                    ${doc
                ? `<div class="d-flex align-items-center justify-content-between">
                               <span class="small text-truncate me-2" title="${doc.original_name}">📄 ${doc.original_name}</span>
                               <a href="${fileUrl}" target="_blank" class="btn btn-sm btn-outline-primary flex-shrink-0">Lihat</a>
                           </div>`
                : `<span class="small text-danger">Belum diupload</span>`}
                    ${canUpload ? `
                        <div class="mt-2">
                            <input type="file" class="form-control form-control-sm doc-upload-input"
                                data-doc-type="${type.key}" accept=".pdf,.jpg,.jpeg,.png">
                            <div class="small mt-1 text-muted" id="status-${type.key}"></div>
                        </div>` : ""}
                </div>
            </div>`;
    });

    html += `</div>`;
    return html;
}

function setupDocUploadListeners(requestId) {
    document.querySelectorAll(".doc-upload-input").forEach(input => {
        input.addEventListener("change", async (e) => {
            const file = e.target.files[0];
            const docType = input.dataset.docType;
            const statusEl = document.getElementById("status-" + docType);
            if (!file) return;

            statusEl.textContent = "Mengupload...";
            statusEl.className = "small mt-1 text-muted";
            try {
                const res = await uploadDocument(requestId, docType, file);
                if (res.success) {
                    statusEl.textContent = "✅ Berhasil";
                    statusEl.className = "small mt-1 text-success";
                } else {
                    statusEl.textContent = "❌ " + res.message;
                    statusEl.className = "small mt-1 text-danger";
                }
            } catch (err) {
                statusEl.textContent = "❌ Kesalahan sistem";
                statusEl.className = "small mt-1 text-danger";
            }
        });
    });
}

// ── MODAL EDIT USER ─────────────────────────────────────────────────────────
function bukaModalEdit(requestId, serviceName, data) {
    const containerForm = document.getElementById("containerFormDinamis");
    const formEl = document.getElementById("formEditLayanan");
    const modalTitle = document.getElementById("modalEditLayananLabel");

    document.getElementById("editRequestId").value = requestId;
    document.getElementById("editServiceInput").value = serviceName;
    modalTitle.innerText = `Edit Permintaan: ${serviceName}`;

    const svc = (serviceName || "").toLowerCase();
    let html = "";

    if (svc === "ambulance") {
        html = `<div class="row g-3">
            ${editField("Nama Pasien", "patient_name", data.amb_patient || "", "text")}
            ${editField("Nomor HP", "phone", data.amb_phone || "", "text")}
            ${editField("Kondisi Pasien", "patient_condition", data.amb_condition || "", "textarea", "col-12")}
            ${editField("Alamat Penjemputan", "address", data.amb_address || "", "textarea", "col-md-6")}
            ${editField("Tujuan", "destination", data.amb_destination || "", "textarea", "col-md-6")}
        </div>`;
    } else if (svc === "wheelchair") {
        const bd = data.wc_borrow_date ? data.wc_borrow_date.split("T")[0] : "";
        html = `<div class="row g-3">
            ${editField("Nama Pengguna", "patient_name", data.wc_patient || "", "text")}
            ${editField("Nomor HP", "phone", data.wc_phone || "", "text")}
            ${editField("Tanggal Pinjam", "borrow_date", bd, "date")}
            ${editField("Kondisi Medis", "patient_condition", data.wc_condition || "", "text")}
            ${editField("Alamat", "address", data.wc_address || "", "textarea", "col-12")}
        </div>`;
    } else if (svc === "khitan") {
        html = `<div class="row g-3">
            ${editField("Nama Anak", "patient_name", data.khitan_patient || "", "text")}
            ${editField("Nama Orang Tua", "parent_name", data.khitan_parent || "", "text")}
            ${editField("Nomor HP", "phone", data.khitan_phone || "", "text")}
            ${editField("Alamat", "address", data.khitan_address || "", "textarea", "col-12")}
        </div>`;
    }

    containerForm.innerHTML = html;
    bootstrap.Modal.getOrCreateInstance(document.getElementById("modalEditLayanan")).show();
}

function editField(label, name, value, type = "text", colClass = "col-md-6") {
    if (type === "textarea") {
        return `<div class="${colClass}">
            <label class="form-label small fw-bold">${label}</label>
            <textarea class="form-control" name="${name}" rows="2" required>${value}</textarea>
        </div>`;
    }
    return `<div class="${colClass}">
        <label class="form-label small fw-bold">${label}</label>
        <input type="${type}" class="form-control" name="${name}" value="${value}" required>
    </div>`;
}

function setupFormEditListener() {
    const formEl = document.getElementById("formEditLayanan");
    if (!formEl) return;

    formEl.addEventListener("submit", async (e) => {
        e.preventDefault();
        const requestId = document.getElementById("editRequestId").value;
        const serviceName = document.getElementById("editServiceInput").value;
        const formData = new FormData(formEl);
        const payload = { service_name: serviceName };
        formData.forEach((v, k) => {
            if (k !== "request_id" && k !== "service_name") payload[k] = v;
        });

        try {
            const res = await updateRequestByDetail(requestId, payload);
            if (res.success) {
                alert("Data berhasil diperbarui!");
                bootstrap.Modal.getInstance(document.getElementById("modalEditLayanan")).hide();
                await loadRequests();
            } else {
                alert("Gagal: " + res.message);
            }
        } catch (err) {
            console.error(err);
            alert("Kesalahan sistem.");
        }
    });
}

// ── FILTER SIDEBAR ──────────────────────────────────────────────────────────
function setupSidebarFilter() {
    document.querySelectorAll(".sidebar .nav-link[data-filter]").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const status = link.dataset.filter;

            document.querySelectorAll(".sidebar .nav-link").forEach(l => l.classList.remove("active"));
            link.classList.add("active");

            const filtered = status === "semua"
                ? allRequestsData
                : allRequestsData.filter(r => r.status_name === status);
            renderTable(filtered);
        });
    });
}