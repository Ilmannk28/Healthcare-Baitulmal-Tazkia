// assets/js/pages/ambulance.js

export function ambulancePage(ambulances, role = "user") {
    const isAdmin = role === "admin";
    const hasData = ambulances && ambulances.length > 0;

    const statusInfo = (statusName) => {
        const cls = statusName === "available"
            ? "text-success fw-semibold"
            : statusName === "in_use"
                ? "text-warning fw-semibold"
                : "text-secondary";
        const label = {
            available: "Tersedia",
            maintenance: "Tidak Tersedia",
            in_use: "Dipakai"
        }[statusName] || statusName;
        return { cls, label };
    };

    const actionButtons = (a) => isAdmin
        ? `<div class="d-flex flex-column flex-sm-row gap-1">
                <button class="btn btn-sm btn-primary btn-detail-unit"
                    data-id="${a.id}" data-type="ambulance">
                    Detail / Edit
                </button>
                <button class="btn btn-sm btn-danger btn-delete-unit"
                    data-id="${a.id}" data-type="ambulance"
                    data-name="${a.code || 'AMB-' + a.id}">
                    Hapus
                </button>
           </div>`
        : `<button class="btn btn-sm btn-orange btn-order w-100"
                data-id="${a.id}" data-type="ambulance"
                ${a.status_name !== "available" ? "disabled" : ""}>
                Pesan
           </button>`;

    //  Versi TABEL (desktop) 
    const tableRows = hasData
        ? ambulances.map(a => {
            const { cls, label } = statusInfo(a.status_name);
            return `
                <tr>
                    <td class="fw-semibold">${a.code || "AMB-" + a.id}</td>
                    <td>${a.coverage_area || "-"}</td>
                    <td>${a.location || "-"}</td>
                    <td class="${cls}">${label}</td>
                    <td>${actionButtons(a)}</td>
                </tr>`;
        }).join("")
        : `<tr><td colspan="5" class="text-center text-muted py-4">Belum ada data unit ambulans.</td></tr>`;

    //  Versi CARD (mobile) 
    const cards = hasData
        ? ambulances.map(a => {
            const { cls, label } = statusInfo(a.status_name);
            return `
                <div class="card mb-2 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="fw-semibold">${a.code || "AMB-" + a.id}</span>
                            <span class="${cls} small">${label}</span>
                        </div>
                        <div class="small text-muted mb-1">Wilayah: ${a.coverage_area || "-"}</div>
                        <div class="small text-muted mb-3">Lokasi: ${a.location || "-"}</div>
                        ${actionButtons(a)}
                    </div>
                </div>`;
        }).join("")
        : `<div class="text-center text-muted py-4">Belum ada data unit ambulans.</div>`;

    return `
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
            <span class="text-muted small">${hasData ? ambulances.length : 0} unit terdaftar</span>
            ${isAdmin
                ? `<button class="btn btn-success btn-sm btn-tambah-unit w-sm-auto" data-type="ambulance">
                        + Tambah Unit Ambulans
                   </button>`
                : ""}
        </div>

        <!-- Mobile: card list -->
        <div class="d-md-none">${cards}</div>

        <!-- Desktop: table -->
        <div class="table-responsive bg-white rounded shadow-sm d-none d-md-block">
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
                <tbody>${tableRows}</tbody>
            </table>
        </div>
    `;
}