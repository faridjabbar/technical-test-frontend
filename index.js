function getRoleFromToken(token) {
    try {
        const payload = token.split('.')[1];
        const decoded = atob(payload);
        const json = JSON.parse(decoded);
        return json.role;
    } catch (e) {
        console.error("Gagal decode JWT:", e);
        return null;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Silakan login terlebih dahulu.");
        window.location.href = "login.html";
        return;
    }

    const role = getRoleFromToken(token);
    console.log("Role dari token:", role);

    if (!role) {
        alert("Role tidak ditemukan dalam token.");
        window.location.href = "login.html";
        return;
    }

    document.body.style.display = "block";

    const createButton = document.getElementById("create-button");
    if (role.toLowerCase() === "administrator") {
        if (createButton) {
            createButton.style.display = "inline-block";
            createButton.addEventListener("click", () => {
                window.location.href = "create.html";
            });
        }
    } else {
        const aksiHeader = document.getElementById("aksi-header");
        if (aksiHeader) aksiHeader.remove();

        document.querySelectorAll(".aksi-cell").forEach(td => td.remove());
    }

    const refreshButton = document.getElementById("refresh-button");
    if (refreshButton) {
        refreshButton.style.padding = "10px 20px";
        refreshButton.style.borderRadius = "8px";
        refreshButton.style.border = "none";
        refreshButton.style.cursor = "pointer";
        refreshButton.style.backgroundColor = "#4CAF50";
        refreshButton.style.color = "white";

        refreshButton.addEventListener("mouseover", () => {
            refreshButton.style.backgroundColor = "#45a049";
        });

        refreshButton.addEventListener("mouseout", () => {
            refreshButton.style.backgroundColor = "#4CAF50";
        });

        refreshButton.addEventListener("click", () => {
            const searchQuery = document.getElementById("search-input").value.trim();
            loadMenu(token, role, searchQuery);
        });
    }

    const searchButton = document.getElementById("search-button");
    const searchInput = document.getElementById("search-input");

    if (searchButton && searchInput) {
        searchButton.addEventListener("click", () => {
            const searchQuery = searchInput.value.trim();
            loadMenu(token, role, searchQuery);
        });

        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                const searchQuery = searchInput.value.trim();
                loadMenu(token, role, searchQuery);
            }
        });
    }

    // Load menu awal tanpa filter
    loadMenu(token, role);
});

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "login.html";
}

function loadMenu(token, role, searchKeyword = "") {
    let url = "http://localhost:8080/traditional-food";
    if (searchKeyword) {
        url += `?search=${encodeURIComponent(searchKeyword)}`;
    }

    fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
        .then((response) => {
            if (!response.ok) throw new Error("Token tidak valid atau server error.");
            return response.json();
        })
        .then((data) => {
            const tbody = document.querySelector("#menu-table tbody");
            tbody.innerHTML = "";
            localStorage.setItem("allData", JSON.stringify(data.data || []));

            if (data.success && Array.isArray(data.data)) {
                data.data.forEach((item) => {
                    const tr = document.createElement("tr");

                    const aksiTd = role.toLowerCase() === "administrator"
                        ? `<td class="aksi-cell">
                            <button class="edit-btn" onclick="editItem(${item.id})">✏️ Edit</button>
                            <button class="delete-btn" onclick="deleteItem(${item.id}, '${token}', '${role}')">🗑️ Hapus</button>
                        </td>`
                        : "";

                    tr.innerHTML = `
                        <td>${item.name}</td>
                        <td>${item.regional_origin}</td>
                        <td>${item.type}</td>
                        <td>${item.main_ingredient}</td>
                        <td>${item.description}</td>
                        ${aksiTd}
                    `;
                    tbody.appendChild(tr);
                });
            } else {
                alert("Data tidak ditemukan.");
            }
        })
        .catch((error) => {
            console.error("Error saat mengambil data:", error);
            alert("Terjadi kesalahan saat mengambil data.");
        });
}

function editItem(id) {
    const allData = JSON.parse(localStorage.getItem("allData"));
    const itemToEdit = allData.find(item => item.id === id);

    if (itemToEdit) {
        localStorage.setItem("editMakanan", JSON.stringify(itemToEdit));
        window.location.href = "edit.html";
    } else {
        alert("Data tidak ditemukan.");
    }
}

function deleteItem(id, token, role) {
    if (confirm("Apakah kamu yakin ingin menghapus item ini?")) {
        fetch(`http://localhost:8080/traditional-food/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    alert("Berhasil dihapus!");
                    loadMenu(token, role);
                } else {
                    alert("Gagal menghapus data.");
                }
            })
            .catch((err) => {
                console.error(err);
                alert("Terjadi kesalahan saat menghapus data.");
            });
    }
}
