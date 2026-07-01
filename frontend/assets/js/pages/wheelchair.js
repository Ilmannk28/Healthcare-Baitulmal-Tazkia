// assets/js/pages/wheelchair.js

export function wheelchairPage(wheelchairs, role = "user") {
    const isAdmin = role === "admin";

    const rows = wheelchairs && wheelchairs.length > 0
        ? wheelchairs.map(w => {
            const statusClass = w.status_name === "available"
                ? "text-success fw-semibold"
                : w.status_name === "in_use"
                    ? "text-warning fw-semibold"
                    : "text-secondary";

            const statusLabel = {
                available:   "Tersedia",
                maintenance: "Tidak Tersedia",
                in_use:      "Dipakai"
            }[w.status_name] || w.status_name;

            const aksiBtn = isAdmin
                ? `<button class="btn btn-sm btn-primary btn-detail-unit"
                        data-id="${w.id}"
                        data-type="wheelchair">
                        Detail / Edit
                    </button>
                    <button class="btn btn-sm btn-danger ms-1 btn-delete-unit"
                        data-id="${w.id}"
                        data-type="wheelchair"
                        data-name="${w.code || 'KR-' + w.id}">
                        Hapus
                    </button>`
                : `<button class="btn btn-sm btn-orange btn-order"
                        data-id="${w.id}"
                        data-type="wheelchair"
                        ${w.status_name !== "available" ? "disabled" : ""}>
                        Pesan
                    </button>`;

            return `
                <tr>
                    <td class="fw-semibold">${w.code || "KR-" + w.id}</td>
                    <td>${w.coverage_area || "-"}</td>
                    <td>${w.location || "-"}</td>
                    <td class="${statusClass}">${statusLabel}</td>
                    <td>${aksiBtn}</td>
                </tr>
            `;
        }).join("")
        : `<tr><td colspan="5" class="text-center text-muted py-4">Belum ada data unit kursi roda.</td></tr>`;

    return `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="text-muted small">${wheelchairs ? wheelchairs.length : 0} unit terdaftar</span>
            ${isAdmin
                ? `<button class="btn btn-success btn-sm btn-tambah-unit" data-type="wheelchair">
                        + Tambah Unit Kursi Roda
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