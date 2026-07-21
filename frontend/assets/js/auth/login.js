// assets/js/forms/loginForm.js
// Menyimpan token, userName, userRole ke localStorage setelah login berhasil

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email    = form.querySelector('input[name="email"]').value.trim();
        const password = form.querySelector('input[name="password"]').value;
        const errEl    = document.getElementById("loginError");
        const submitBtn = form.querySelector("button[type='submit']");

        if (errEl) errEl.style.display = "none";
        submitBtn.disabled    = true;
        submitBtn.textContent = "Masuk...";

        try {
            const res = await fetch("http://localhost:3000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (data.success) {
                // Simpan semua yang diperlukan ke localStorage 
                localStorage.setItem("token",    data.token);
                localStorage.setItem("userId",   data.user.id);
                localStorage.setItem("userName", data.user.name);
                localStorage.setItem("userRole", data.user.role);   

                // Redirect berdasarkan role 
                if (data.user.role === "admin") {
                    window.location.href = "dashboard/layananKesehatan.html";
                } else {
                    window.location.href = "dashboard/layananKesehatan.html";
                }
            } else {
                if (errEl) {
                    errEl.textContent   = data.message || "Email atau password salah.";
                    errEl.style.display = "block";
                } else {
                    alert(data.message || "Email atau password salah.");
                }
                submitBtn.disabled    = false;
                submitBtn.textContent = "Masuk";
            }

        } catch (err) {
            console.error(err);
            if (errEl) {
                errEl.textContent   = "Gagal terhubung ke server. Pastikan backend berjalan.";
                errEl.style.display = "block";
            }
            submitBtn.disabled    = false;
            submitBtn.textContent = "Masuk";
        }
    });
});