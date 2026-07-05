// assets/js/pages/khitan.js
// Field dari API: id, location, event_date, city, quota,
//                 peserta_terdaftar, sisa_kuota, status_name

export function khitanPage(events, role = "user") {
    const isAdmin = role === "admin";
    const hasData = events && events.length > 0;

    const statusLabel = {
        available: "Pendaftaran Dibuka",
        in_use: "Kuota Penuh",
        maintenance: "Ditutup"
    };
    const statusClass = {
        available: "text-success fw-semibold",
        in_use: "text-warning fw-semibold",
        maintenance: "text-secondary"
    };

    const buildInfo = (k) => {
        const tanggal = k.event_date
            ? new Date(k.event_date).toLocaleDateString("id-ID", {
                day: "2-digit", month: "long", year: "numeric"
            })
            : "-";
        const label = statusLabel[k.status_name] || k.status_name;
        const cls = statusClass[k.status_name] || "";
        const sisaKuota = k.sisa_kuota ?? k.quota ?? "-";
        const totalPendaftar = k.peserta_terdaftar ?? 0;
        const pct = k.quota > 0
            ? Math.min(100, Math.round((totalPendaftar / k.quota) * 100))
            : 0;
        const barColor = pct >= 100 ? "bg-danger" : pct >= 75 ? "bg-warning" : "bg-success";
        return { tanggal, label, cls, sisaKuota, totalPendaftar, pct, barColor };
    };

    const actionButtons = (k, sisaKuota) => isAdmin
        ? `<div class="d-flex flex-column flex-sm-row gap-1">
                <button class="btn btn-sm btn-primary btn-detail-unit"
                    data-id="${k.id}" data-type="khitan">
                    Detail / Edit
                </button>
                <button class="btn btn-sm btn-danger btn-delete-unit"
                    data-id="${k.id}" data-type="khitan"
                    data-name="${k.city} ${k.event_date || ''}">
                    Hapus
                </button>
           </div>`
        : `<button class="btn btn-sm btn-orange btn-order w-100"
                data-id="${k.id}" data-type="khitan"
                ${k.status_name !== "available" || sisaKuota <= 0 ? "disabled" : ""}>
                Daftar
           </button>`;

    // ---- Versi TABEL (desktop) ----
    const tableRows = hasData
        ? events.map(k => {
            const { tanggal, label, cls, sisaKuota, totalPendaftar, pct, barColor } = buildInfo(k);
            const kuotaCell = `
                <div class="small mb-1">
                    <span class="fw-semibold">${totalPendaftar}</span>
                    <span class="text-muted">/ ${k.quota} peserta</span>
                </div>
                <div class="progress" style="height:6px; min-width:80px;">
                    <div class="progress-bar ${barColor}" style="width:${pct}%"></div>
                </div>`;
            return `
                <tr>
                    <td>${k.city || "-"}</td>
                    <td>${k.location || "-"}</td>
                    <td class="small">${tanggal}</td>
                    <td>${kuotaCell}</td>
                    <td class="${cls}">${label}</td>
                    <td>${actionButtons(k, sisaKuota)}</td>
                </tr>`;
        }).join("")
        : `<tr><td colspan="6" class="text-center text-muted py-4">
               Belum ada jadwal khitanan massal.
           </td></tr>`;

    // ---- Versi CARD (mobile) ----
    const cards = hasData
        ? events.map(k => {
            const { tanggal, label, cls, sisaKuota, totalPendaftar, pct, barColor } = buildInfo(k);
            return `
                <div class="card mb-2 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="fw-semibold">${k.city || "-"}</span>
                            <span class="${cls} small">${label}</span>
                        </div>
                        <div class="small text-muted mb-1">Lokasi: ${k.location || "-"}</div>
                        <div class="small text-muted mb-2">Tanggal: ${tanggal}</div>
                        <div class="small mb-1">
                            <span class="fw-semibold">${totalPendaftar}</span>
                            <span class="text-muted">/ ${k.quota} peserta</span>
                        </div>
                        <div class="progress mb-3" style="height:6px;">
                            <div class="progress-bar ${barColor}" style="width:${pct}%"></div>
                        </div>
                        ${actionButtons(k, sisaKuota)}
                    </div>
                </div>`;
        }).join("")
        : `<div class="text-center text-muted py-4">Belum ada jadwal khitanan massal.</div>`;

    return `
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
            <span class="text-muted small">${hasData ? events.length : 0} jadwal terdaftar</span>
            ${isAdmin
            ? `<button class="btn btn-success btn-sm btn-tambah-unit w-sm-auto" data-type="khitan">
                       + Tambah Jadwal Khitan
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
                        <th>Kota</th>
                        <th>Lokasi</th>
                        <th>Tanggal</th>
                        <th>Kuota Pendaftar</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>${tableRows}</tbody>
            </table>
        </div>
    `;
}