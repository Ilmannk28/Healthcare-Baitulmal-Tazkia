// assets/js/pages/khitan.js
// Field dari API: id, location, event_date, city, quota,
//                 peserta_terdaftar, sisa_kuota, status_name

export function khitanPage(events, role = "user") {
    const isAdmin = role === "admin";

    const statusLabel = {
        available:   "Pendaftaran Dibuka",
        in_use:      "Kuota Penuh",
        maintenance: "Ditutup"
    };
    const statusClass = {
        available:   "text-success fw-semibold",
        in_use:      "text-warning fw-semibold",
        maintenance: "text-secondary"
    };

    const rows = events && events.length > 0
        ? events.map(k => {
            const tanggal = k.event_date
                ? new Date(k.event_date).toLocaleDateString("id-ID", {
                    day: "2-digit", month: "long", year: "numeric"
                })
                : "-";

            const label     = statusLabel[k.status_name] || k.status_name;
            const cls       = statusClass[k.status_name] || "";
            const sisaKuota = k.sisa_kuota ?? k.quota ?? "-";
            const totalPendaftar = k.peserta_terdaftar ?? 0;

            // Progress bar kuota
            const pct = k.quota > 0
                ? Math.min(100, Math.round((totalPendaftar / k.quota) * 100))
                : 0;
            const barColor = pct >= 100 ? "bg-danger" : pct >= 75 ? "bg-warning" : "bg-success";

            const kuotaCell = `
                <div class="small mb-1">
                    <span class="fw-semibold">${totalPendaftar}</span>
                    <span class="text-muted">/ ${k.quota} peserta</span>
                </div>
                <div class="progress" style="height:6px; min-width:80px;">
                    <div class="progress-bar ${barColor}" style="width:${pct}%"></div>
                </div>
            `;

            const aksi = isAdmin
                ? `<button class="btn btn-sm btn-primary btn-detail-unit"
                        data-id="${k.id}" data-type="khitan">Detail / Edit</button>
                   <button class="btn btn-sm btn-danger ms-1 btn-delete-unit"
                        data-id="${k.id}" data-type="khitan"
                        data-name="${k.city} ${tanggal}">Hapus</button>`
                : `<button class="btn btn-sm btn-orange btn-order"
                        data-id="${k.id}" data-type="khitan"
                        ${k.status_name !== "available" || sisaKuota <= 0 ? "disabled" : ""}>
                        Daftar
                   </button>`;

            return `
                <tr>
                    <td>${k.city || "-"}</td>
                    <td>${k.location || "-"}</td>
                    <td class="small">${tanggal}</td>
                    <td>${kuotaCell}</td>
                    <td class="${cls}">${label}</td>
                    <td>${aksi}</td>
                </tr>
            `;
        }).join("")
        : `<tr><td colspan="6" class="text-center text-muted py-4">
               Belum ada jadwal khitanan massal.
           </td></tr>`;

    return `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="text-muted small">${events ? events.length : 0} jadwal terdaftar</span>
            ${isAdmin
                ? `<button class="btn btn-success btn-sm btn-tambah-unit" data-type="khitan">
                       + Tambah Jadwal Khitan
                   </button>`
                : ""}
        </div>
        <div class="table-responsive bg-white rounded shadow-sm">
            <table class="table table-hover mb-0">
                <thead class="table-dark">
                    <tr>
                        <th>Kota</th>
                        <th>Lokasi</th>
                        <th>Tanggal</th>
                        <th>Kuota Pendaftar</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
}