console.log("register.js loaded");

const form = document.getElementById("registerForm");

console.log(form);

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    console.log("submit jalan");

    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm_password").value;

    if (password !== confirmPassword) {
        alert("Password tidak sama");
        return;
    }

    try {
        const formData = new FormData(form);

        const response = await fetch(
            "http://localhost:3000/api/auth/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: formData.get("name"),
                    birth_date: formData.get("birth_date"),
                    gender: formData.get("gender"),
                    phone: formData.get("phone"), // PERUBAHAN: Ubah 'email' menjadi 'phone'
                    password: formData.get("password")
                })
            }
        );

        const result = await response.json();

        if (result.success) {
            alert("Registrasi berhasil");
            window.location.href = "./login.html";
        } else {
            alert(result.message);
        }

    } catch (error) {
        console.error(error);
        alert("Terjadi kesalahan koneksi/server");
    }
});