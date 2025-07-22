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

    document.getElementById("create-form").addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            name: document.getElementById("nama").value,
            regional_origin: document.getElementById("asal").value,
            description: document.getElementById("deskripsi").value,
            main_ingredient: document.getElementById("resep").value,
            type: document.getElementById("type").value,
        };

        try {
            const response = await fetch("http://localhost:8080/traditional-food", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Gagal menambahkan data.");
            }

            alert("Data berhasil ditambahkan!");
            window.location.href = "index.html";
        } catch (err) {
            alert("Error: " + err.message);
        }
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
