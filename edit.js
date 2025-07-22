document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Silakan login terlebih dahulu.");
        window.location.href = "login.html";
        return;
    }

    const role = getRoleFromToken(token);

    if (role.toLowerCase() !== "administrator") {
        alert("Anda tidak memiliki akses ke halaman ini.");
        window.location.href = "index.html";
        return;
    }

    document.body.style.display = "block";

    const data = JSON.parse(localStorage.getItem("editMakanan"));

    if (!data || !data.id) {
        alert("Data tidak tersedia untuk diedit.");
        window.location.href = "index.html";
        return;
    }

    // Pre-fill form
    document.getElementById("nama").value = data.name || "";
    document.getElementById("asal").value = data.regional_origin || "";
    document.getElementById("deskripsi").value = data.description || "";
    document.getElementById("resep").value = data.main_ingredient || "";
    document.getElementById("type").value = data.type || "";

    // Submit handler
    const form = document.getElementById("create-form");
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const updatedData = {
            name: document.getElementById("nama").value.trim(),
            regional_origin: document.getElementById("asal").value.trim(),
            description: document.getElementById("deskripsi").value.trim(),
            main_ingredient: document.getElementById("resep").value.trim(),
            type: document.getElementById("type").value
        };

        fetch(`http://localhost:8080/traditional-food/${data.id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedData)
        })
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    alert("Data berhasil diupdate!");
                    localStorage.removeItem("editMakanan");
                    window.location.href = "index.html";
                } else {
                    alert("Gagal update data: " + result.message);
                }
            })
            .catch(err => {
                console.error("Error saat update:", err);
                alert("Terjadi kesalahan saat update data.");
            });
    });
});

function getRoleFromToken(token) {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.role || "";
    } catch (e) {
        return "";
    }
}