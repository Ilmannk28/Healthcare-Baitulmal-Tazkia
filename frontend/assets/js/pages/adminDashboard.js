// frontend/assets/js/pages/adminDashboard.js

const BASE_URL    = "http://localhost:3000/api";
const getToken    = () => localStorage.getItem("token");
const getRole     = () => localStorage.getItem("userRole");
const getUserName = () => localStorage.getItem("userName") || "Admin";

let lineChartInstance = null;
let doughnutChartInst = null;

// ── ENTRY POINT ──────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
    if (!getToken() || getRole() !== "admin") {
        alert("Akses ditolak! Hanya admin yang dapat mengakses halaman ini.");
        window.location.href = "../login.html";
        return;
    }

    renderNavbar();
    setupLogout();
    document.getElementById("btnRefresh").addEventListener("click", loadDashboard);
    await loadDashboard();
});

// ── NAVBAR — isi authNavButtons, sama polanya dengan halaman lain ─────────────
function renderNavbar() {
    const authDiv = document.getElementById("authNavButtons");
    if (!authDiv) return;

    const limit = (t, n) => t.length > n ? t.substring(0, n) + "..." : t;
    authDiv.innerHTML = `
        <div class="d-flex justify-content-end align-items-center gap-2">
            <span class="fw-bold text-primary small">Halo, ${limit(getUserName(), 14)}!</span>
            <button type="button" id="navLogoutBtn" class="btn btn-sm btn-outline-danger">Logout</button>
        </div>
    `;
    document.getElementById("navLogoutBtn").addEventListener("click", doLogout);
}

function setupLogout() {
    const sl = document.getElementById("sidebarLogout");
    if (sl) sl.addEventListener("click", (e) => { e.preventDefault(); doLogout(); });
}

function doLogout() {
    localStorage.clear();
    window.location.href = "../login.html";
}

// ── FETCH DATA ────────────────────────────────────────────────────────────────
async function loadDashboard() {
    showSkeleton();
    try {
        const res = await fetch(`${BASE_URL}/analytics/dashboard`, {
            headers: { Authorization: `Bearer ${getToken()}` }
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status}: ${text}`);
        }

        const json = await res.json();
        if (!json.success) throw new Error(json.message);
        render(json.data);
    } catch (err) {
        console.error("Dashboard error:", err);
        document.getElementById("dashContent").innerHTML = `
            <div class="alert alert-danger">
                <strong>Gagal memuat data.</strong><br>
                <small>${err.message}</small><br><br>
                <strong>Checklist:</strong>
                <ul class="mb-0 mt-1" style="font-size:.85rem;">
                    <li>Pastikan <code>analyticsRoutes.js</code> sudah didaftarkan di <code>app.js</code></li>
                    <li>Pastikan backend sudah di-restart setelah menambah route</li>
                    <li>Cek Network tab DevTools — lihat response dari <code>/api/analytics/dashboard</code></li>
                </ul>
            </div>`;
    }
}

// ── SKELETON ─────────────────────────────────────────────────────────────────
function showSkeleton() {
    document.getElementById("dashContent").innerHTML = `
        <div class="row g-3 mb-4">
            ${Array(4).fill(`<div class="col-6 col-md-3"><div class="skeleton" style="height:90px;"></div></div>`).join("")}
        </div>
        <div class="row g-3 mb-4">
            <div class="col-lg-8"><div class="skeleton" style="height:300px;"></div></div>
            <div class="col-lg-4"><div class="skeleton" style="height:300px;"></div></div>
        </div>
        <div class="row g-3">
            <div class="col-lg-5"><div class="skeleton" style="height:260px;"></div></div>
            <div class="col-lg-7"><div class="skeleton" style="height:260px;"></div></div>
        </div>`;
}

// ── RENDER SEMUA ──────────────────────────────────────────────────────────────
function render(data) {
    const { summary, monthlyTrend, serviceDistribution, recentRequests, statusByService } = data;

    const growth = summary.requests_last_month > 0
        ? Math.round(((summary.requests_this_month - summary.requests_last_month) / summary.requests_last_month) * 100)
        : null;
    const growthHtml = growth !== null
        ? `<span class="${growth >= 0 ? "up" : "down"}">${growth >= 0 ? "▲" : "▼"} ${Math.abs(growth)}% vs bulan lalu</span>`
        : `<span>Data bulan ini</span>`;

    document.getElementById("dashContent").innerHTML = `
        <!-- METRIC CARDS -->
        <div class="row g-3 mb-4">
            ${metricCard("Total Permintaan", summary.total_requests, "📋", growthHtml)}
            ${metricCard("Pengguna Aktif", summary.total_users, "👥",
                `<span>${pct(summary.total_users, summary.total_requests)} req/user rata-rata</span>`)}
            ${metricCard("Disetujui", summary.total_approved, "✅",
                `<span>${pct(summary.total_approved, summary.total_requests)}% dari total</span>`)}
            ${metricCard("Bulan Ini", summary.requests_this_month, "📅",
                `<span>Pending: ${summary.total_pending}</span>`)}
        </div>

        <!-- CHARTS ROW 1 -->
        <div class="row g-3 mb-4">
            <div class="col-lg-8">
                <div class="chart-card">
                    <h6>Tren Permintaan — 6 Bulan Terakhir</h6>
                    <canvas id="lineChart" height="110"></canvas>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="chart-card d-flex flex-column">
                    <h6>Distribusi Layanan</h6>
                    <div class="flex-grow-1 d-flex align-items-center justify-content-center">
                        <canvas id="doughnutChart" style="max-height:220px;"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <!-- CHARTS ROW 2 -->
        <div class="row g-3 mb-4">
            <div class="col-lg-5">
                <div class="chart-card">
                    <h6>Status per Layanan</h6>
                    <canvas id="barChart" height="180"></canvas>
                </div>
            </div>
            <div class="col-lg-7">
                <div class="chart-card">
                    <h6>Permintaan Terbaru</h6>
                    <div class="table-responsive">
                        <table class="table mb-0">
                            <thead>
                                <tr>
                                    <th>ID</th><th>Pemohon</th><th>Layanan</th>
                                    <th>Tanggal</th><th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${recentRequests.map(r => `
                                <tr>
                                    <td class="fw-bold text-muted">REQ-${r.request_id}</td>
                                    <td>${r.user_name}</td>
                                    <td>${r.service_name}</td>
                                    <td class="small">${fmtDate(r.created_at)}</td>
                                    <td><span class="status-badge status-${r.status_name}">${r.status_name}</span></td>
                                </tr>`).join("")}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- STATUS DISTRIBUTION -->
        <div class="row g-3 mb-2">
            <div class="col-12">
                <div class="chart-card">
                    <h6>Distribusi Status Keseluruhan</h6>
                    <div class="row g-3">
                        ${statusBar("Disetujui",  summary.total_approved,  summary.total_requests, "#198754")}
                        ${statusBar("Pending",    summary.total_pending,   summary.total_requests, "#f59e0b")}
                        ${statusBar("Selesai",    summary.total_completed, summary.total_requests, "#0d6efd")}
                        ${statusBar("Ditolak",    summary.total_rejected,  summary.total_requests, "#dc3545")}
                    </div>
                </div>
            </div>
        </div>`;

    renderLineChart(monthlyTrend);
    renderDoughnutChart(serviceDistribution);
    renderBarChart(statusByService);
}

// ── CHART: LINE ───────────────────────────────────────────────────────────────
function renderLineChart(monthlyTrend) {
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - i);
        months.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`);
    }

    const services = [...new Set(monthlyTrend.map(r => r.service_name))];
    const palette = {
        "Ambulance":  { border: "#0d2f6b", bg: "rgba(13,47,107,.07)"  },
        "Wheelchair": { border: "#198754", bg: "rgba(25,135,84,.07)"  },
        "Khitan":     { border: "#f59e0b", bg: "rgba(245,158,11,.07)" }
    };

    const datasets = services.map(svc => {
        const c = palette[svc] || { border: "#6c757d", bg: "rgba(108,117,125,.07)" };
        return {
            label: svc,
            data: months.map(m => {
                const f = monthlyTrend.find(r => r.month === m && r.service_name === svc);
                return f ? f.total : 0;
            }),
            borderColor: c.border, backgroundColor: c.bg,
            tension: 0.4, pointRadius: 4, borderWidth: 2, fill: true
        };
    });

    if (lineChartInstance) lineChartInstance.destroy();
    lineChartInstance = new Chart(document.getElementById("lineChart"), {
        type: "line",
        data: {
            labels: months.map(m => {
                const [y, mo] = m.split("-");
                return new Date(y, mo-1).toLocaleDateString("id-ID", { month:"short", year:"2-digit" });
            }),
            datasets
        },
        options: {
            responsive: true,
            plugins: { legend: { position:"top", labels:{ boxWidth:12, font:{size:12} } } },
            scales: {
                x: { grid:{ display:false } },
                y: { beginAtZero:true, ticks:{ stepSize:1 } }
            }
        }
    });
}

// ── CHART: DOUGHNUT ───────────────────────────────────────────────────────────
function renderDoughnutChart(serviceDistribution) {
    const colors = ["#0d2f6b","#f59e0b","#198754","#6f42c1"];
    if (doughnutChartInst) doughnutChartInst.destroy();
    doughnutChartInst = new Chart(document.getElementById("doughnutChart"), {
        type: "doughnut",
        data: {
            labels: serviceDistribution.map(r => r.service_name),
            datasets: [{
                data: serviceDistribution.map(r => r.total),
                backgroundColor: colors, borderWidth: 0, hoverOffset: 6
            }]
        },
        options: {
            responsive: true, cutout: "65%",
            plugins: { legend:{ position:"bottom", labels:{ boxWidth:12, font:{size:12} } } }
        }
    });
}

// ── CHART: GROUPED BAR ────────────────────────────────────────────────────────
function renderBarChart(statusByService) {
    const services = [...new Set(statusByService.map(r => r.service_name))];
    const statuses = ["pending","approved","rejected","completed"];
    const colors   = {
        pending:   "#f59e0b",
        approved:  "#198754",
        rejected:  "#dc3545",
        completed: "#0d2f6b"
    };

    new Chart(document.getElementById("barChart"), {
        type: "bar",
        data: {
            labels: services,
            datasets: statuses.map(st => ({
                label: st.charAt(0).toUpperCase() + st.slice(1),
                data: services.map(svc => {
                    const f = statusByService.find(r => r.service_name===svc && r.status_name===st);
                    return f ? f.total : 0;
                }),
                backgroundColor: colors[st], borderRadius: 4
            }))
        },
        options: {
            responsive: true,
            plugins: { legend:{ position:"top", labels:{ boxWidth:12, font:{size:12} } } },
            scales: {
                x: { grid:{ display:false } },
                y: { beginAtZero:true, ticks:{ stepSize:1 } }
            }
        }
    });
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function pct(part, total) {
    if (!total) return 0;
    return Math.round((part / total) * 100);
}

function fmtDate(d) {
    return new Date(d).toLocaleDateString("id-ID", { day:"2-digit", month:"short", year:"numeric" });
}

function metricCard(label, value, icon, subHtml) {
    return `
        <div class="col-6 col-md-3">
            <div class="metric-card">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div class="mc-label">${label}</div>
                    <div class="mc-icon">${icon}</div>
                </div>
                <div class="mc-value">${value ?? 0}</div>
                <div class="mc-sub">${subHtml}</div>
            </div>
        </div>`;
}

function statusBar(label, value, total, color) {
    const w = pct(value, total);
    return `
        <div class="col-md-3 col-6">
            <div class="small text-muted mb-1">${label}</div>
            <div class="d-flex align-items-center gap-2">
                <div class="stat-bar-wrap">
                    <div class="stat-bar-fill" style="width:${w}%;background:${color};"></div>
                </div>
                <span class="fw-bold small">${value ?? 0}</span>
            </div>
        </div>`;
}