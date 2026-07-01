// assets/js/utils.js

export function formatTanggalIndonesia(isoString) {
  if (!isoString) return "-";
  
  const date = new Date(isoString);
  const jam = date.getHours().toString().padStart(2, '0');
  const menit = date.getMinutes().toString().padStart(2, '0');
  const waktu = `Jam ${jam}.${menit}`;

  const opsiTanggal = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  
  const tanggalHari = new Intl.DateTimeFormat('id-ID', opsiTanggal).format(date);
  return `${waktu} - ${tanggalHari}`;
}

export function renderNavbar() {
  const authDiv = document.getElementById("authNavButtons");
  if (!authDiv) return;

  const token    = localStorage.getItem("token");
  const userName = localStorage.getItem("userName") || "User";
  const role     = localStorage.getItem("userRole");
  const limit    = (t, n) => t.length > n ? t.substring(0, n) + "..." : t;

  // OTOMATIS CEK: Apakah URL browser saat ini mengandung kata '/dashboard/'?
  // Jika iya, berarti sedang membuka halaman di dalam subfolder dashboard.
  const isCurrentlyInDashboard = window.location.pathname.includes("/dashboard/");

  // Penyesuaian Path Dinamis yang akurat 
  // Kiri (setelah ?) = jika di dalam folder dashboard. Kanan (setelah :) = jika di folder views (index)
  const loginPath     = isCurrentlyInDashboard ? "../login.html" : "./login.html";
  const registerPath  = isCurrentlyInDashboard ? "../register.html" : "./register.html";
  const indexPath     = isCurrentlyInDashboard ? "../index.html" : "./index.html";
  const dashboardPath = isCurrentlyInDashboard ? "./adminDashboard.html" : "./dashboard/adminDashboard.html";

  if (!token) {
    authDiv.innerHTML = `
      <a href="${loginPath}">
        <button type="button" class="btn btn-outline-primary me-2">Login</button>
      </a>
      <a href="${registerPath}">
        <button type="button" class="btn btn-outline-secondary">Sign-up</button>
      </a>`;
    return;
  }

  const dashboardLink = role === "admin"
    ? `<a href="${dashboardPath}" class="btn btn-sm btn-outline-primary me-2">Dashboard</a>`
    : "";

  authDiv.innerHTML = `
    <div class="d-flex justify-content-end align-items-center gap-2">
      <span class="fw-bold text-primary small">Halo, ${limit(userName, 14)}!</span>
      ${dashboardLink}
      <button type="button" id="logoutBtn" class="btn btn-sm btn-outline-danger">Logout</button>
    </div>`;

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = indexPath;
  });
}