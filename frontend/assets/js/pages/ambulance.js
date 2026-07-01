// assets/js/pages/ambulance.js

export function ambulancePage(ambulances, role = "user") {
    const isAdmin = role === "admin";

    const rows = ambulances && ambulances.length > 0
        ? ambulances.map(a => {
            const statusClass = a.status_name === "available"
                ? "text-success fw-semibold"
                : a.status_name === "in_use"
                    ? "text-warning fw-semibold"
                    : "text-secondary";

            const statusLabel = {
                available:   "Tersedia",
                maintenance: "Tidak Tersedia",
                in_use:      "Dipakai"
            }[a.status_name] || a.status_name;

            const aksiBtn = isAdmin
                ? `<button class="btn btn-sm btn-primary btn-detail-unit"
                        data-id="${a.id}"
                        data-type="ambulance">
                        Detail / Edit
                    </button>
                    <button class="btn btn-sm btn-danger ms-1 btn-delete-unit"
                        data-id="${a.id}"
                        data-type="ambulance"
                        data-name="${a.code || 'AMB-' + a.id}">
                        Hapus
                    </button>`
                : `<button class="btn btn-sm btn-orange btn-order"
                        data-id="${a.id}"
                        data-type="ambulance"
                        ${a.status_name !== "available" ? "disabled" : ""}>
                        Pesan
                    </button>`;

            return `
                <tr>
                    <td class="fw-semibold">${a.code || "AMB-" + a.id}</td>
                    <td>${a.coverage_area || "-"}</td>
                    <td>${a.location || "-"}</td>
                    <td class="${statusClass}">${statusLabel}</td>
                    <td>${aksiBtn}</td>
                </tr>
            `;
        }).join("")
        : `<tr><td colspan="5" class="text-center text-muted py-4">Belum ada data unit ambulans.</td></tr>`;

    return `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="text-muted small">${ambulances ? ambulances.length : 0} unit terdaftar</span>
            ${isAdmin
                ? `<button class="btn btn-success btn-sm btn-tambah-unit" data-type="ambulance">
                        + Tambah Unit Ambulans
                    </button>`
                : ""}
        </div>
        <div class="table-responsive bg-white rounded shadow-sm">
            <table class="table table-hover mb-0">
                <thead class="table-dark">
                    <tr>
                        <th>ID Unit</th>
                        <th>Wilayah</th>
                        <th>Lokasi</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
}