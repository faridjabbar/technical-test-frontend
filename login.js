const app = document.getElementById('app');

function showLogin() {
  app.innerHTML = `
    <div class="container">
      <h2>Login</h2>
      <input type="text" id="login-email" placeholder="Email" />
      <input type="password" id="login-password" placeholder="Password" />
      <button onclick="handleLogin()">Login</button>
      <span class="link" onclick="showRegister()">Belum punya akun? Register</span>
    </div>
  `;
}

function showRegister() {
  app.innerHTML = `
    <div class="container">
      <h2>Register</h2>
      <input type="text" id="register-name" placeholder="Name" />
      <input type="text" id="register-email" placeholder="Email" />
      <select id="register-role">
        <option value="Administrator">Administrator</option>
        <option value="Client">Client</option>
      </select>
      <input type="password" id="register-password" placeholder="Password" />
      <button onclick="handleRegister()">Register</button>
      <span class="link" onclick="showLogin()">Sudah punya akun? Login</span>
    </div>
  `;
}

function handleLogin() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  fetch("http://localhost:8080/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password }),
  })
    .then(res => {
      if (!res.ok) throw new Error("Login gagal!");
      return res.json();
    })
    .then(response => {
      const token = response.data;
      localStorage.setItem("token", token);
      window.location.href = "index.html";
    })
    .catch(err => alert(err.message));
}

function handleRegister() {
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const role = document.getElementById('register-role').value;
  const password = document.getElementById('register-password').value;

  if (password.length < 8) {
    alert("Password harus minimal 8 karakter.");
    return;
  }

  const payload = { name, email, role, password };

  fetch("http://localhost:8080/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
    .then(res => res.json().then(data => {
      if (!res.ok) throw new Error(data.message || "Registrasi gagal!");
      alert(data.message || "Registrasi berhasil!");
      showLogin();
    }))
    .catch(err => alert(err.message));
}

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("token")) {
    window.location.href = "index.html";
  } else {
    showLogin();
  }
});
