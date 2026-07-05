// frontend/assets/js/index.js
import { renderNavbar } from "./utils/utils.js";

document.addEventListener("DOMContentLoaded", () => {
    // 1. Render navbar secara otomatis (Default false karena index.html di luar folder dashboard)
    renderNavbar();

    const token = localStorage.getItem("token");
    const serviceButtons = document.querySelectorAll(".btn-layanan");

    // 2. Kelola hak akses tombol layanan kesehatan
    serviceButtons.forEach(button => {
        const target = button.getAttribute("data-target");

        if (token) {
            button.setAttribute("href", target);

            button.addEventListener("click", (e) => {
                e.preventDefault();
                window.location.href = target;
            });
        } else {
            button.setAttribute("href", "./login.html");

            button.addEventListener("click", (e) => {
                e.preventDefault();
                alert("Anda harus login terlebih dahulu untuk mengakses layanan ini!"); 
                window.location.href = "./login.html";
            });
        }
    });
});