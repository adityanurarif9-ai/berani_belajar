(() => {
  "use strict";

  const get = (id) => document.getElementById(id);
  const email = get("auth-email");
  const password = get("auth-password");
  const status = get("auth-status");
  const notice = get("auth-notice");
  let isRegister = false;
  let busy = false;
  let auth;
  let sdk;

  function selectMode(register) {
    isRegister = register;
    password.value = "";
    password.autocomplete = register ? "new-password" : "current-password";
    password.minLength = register ? 6 : 1;
    get("auth-login-tab").setAttribute("aria-pressed", String(!register));
    get("auth-register-tab").setAttribute("aria-pressed", String(register));
    get("auth-submit").textContent = register ? "Buat akun dengan email" : "Masuk dengan email";
    get("auth-reset").hidden = register;
    status.textContent = "";
  }

  function updateControls() {
    get("auth-fields").disabled = !auth || busy;
    get("auth-google").disabled = !auth || busy;
    for (const id of ["auth-login-tab", "auth-register-tab", "auth-logout", "auth-verify"]) {
      get(id).disabled = busy;
    }
  }

  function showUser(user) {
    get("auth-guest").hidden = Boolean(user);
    get("auth-member").hidden = !user;
    get("account-link").textContent = user ? "Akun" : "Masuk";
    get("auth-identity").textContent = user?.email || user?.displayName || "";
    get("auth-verify").hidden = !user || user.emailVerified;
    if (user) {
      get("auth-form").reset();
      password.type = "password";
    }
  }

  const errors = {
    "auth/invalid-credential": "Email atau kata sandi tidak cocok.",
    "auth/wrong-password": "Email atau kata sandi tidak cocok.",
    "auth/user-not-found": "Email atau kata sandi tidak cocok.",
    "auth/email-already-in-use": "Email sudah terdaftar. Pilih Masuk atau atur ulang kata sandi.",
    "auth/invalid-email": "Masukkan alamat email yang valid.",
    "auth/weak-password": "Gunakan kata sandi minimal 6 karakter.",
    "auth/password-does-not-meet-requirements": "Kata sandi belum memenuhi syarat aplikasi.",
    "auth/network-request-failed": "Koneksi terputus. Coba lagi.",
    "auth/popup-blocked": "Izinkan pop-up untuk halaman ini, lalu coba lagi.",
    "auth/popup-closed-by-user": "Jendela Google ditutup. Kamu bisa mencoba lagi.",
    "auth/unauthorized-domain": "Alamat situs ini perlu ditambahkan di pengaturan Firebase.",
    "auth/account-exists-with-different-credential": "Email ini sudah terdaftar dengan cara lain. Coba masuk dengan email dan kata sandi.",
    "auth/operation-not-allowed": "Cara masuk ini belum diaktifkan.",
    "auth/too-many-requests": "Terlalu banyak percobaan. Coba lagi nanti."
  };

  async function perform(action) {
    if (!auth || busy) return;
    busy = true;
    updateControls();
    status.textContent = "Sedang memproses…";
    try {
      status.textContent = await action();
    } catch (error) {
      status.textContent = errors[error.code] || "Terjadi kendala saat memproses akun. Coba lagi.";
    } finally {
      busy = false;
      updateControls();
    }
  }

  get("auth-login-tab").onclick = () => selectMode(false);
  get("auth-register-tab").onclick = () => selectMode(true);
  get("auth-show-password").onchange = (event) => {
    password.type = event.currentTarget.checked ? "text" : "password";
  };
  get("auth-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const address = email.value.trim();
    const secret = password.value;
    perform(async () => {
      if (!isRegister) {
        await sdk.signInWithEmailAndPassword(auth, address, secret);
        return "Kamu berhasil masuk.";
      }
      const {user} = await sdk.createUserWithEmailAndPassword(auth, address, secret);
      try {
        await sdk.sendEmailVerification(user);
        return "Akun dibuat. Buka email untuk verifikasi.";
      } catch {
        return "Akun dibuat. Gunakan tombol kirim ulang untuk mendapatkan email verifikasi.";
      }
    });
  });
  get("auth-google").onclick = () => perform(async () => {
    const provider = new sdk.GoogleAuthProvider();
    provider.setCustomParameters({prompt: "select_account"});
    await sdk.signInWithPopup(auth, provider);
    return "Kamu berhasil masuk dengan Google.";
  });
  get("auth-reset").onclick = () => {
    if (!email.reportValidity()) return;
    perform(async () => {
      try {
        await sdk.sendPasswordResetEmail(auth, email.value.trim());
      } catch (error) {
        if (error.code !== "auth/user-not-found") throw error;
      }
      return "Jika email terdaftar, tautan atur ulang kata sandi akan dikirim.";
    });
  };
  get("auth-verify").onclick = () => perform(async () => {
    const user = auth.currentUser;
    await sdk.reload(user);
    showUser(user);
    if (user.emailVerified) return "Email sudah diverifikasi.";
    await sdk.sendEmailVerification(user);
    return "Email verifikasi dikirim ulang.";
  });
  get("auth-logout").onclick = () => perform(async () => {
    await sdk.signOut(auth);
    return "Kamu sudah keluar.";
  });

  async function connect() {
    const config = window.BERANI_FIREBASE_CONFIG;
    if (!config?.apiKey || !config.authDomain || !config.projectId || !config.appId) {
      notice.textContent = "Layanan akun belum diaktifkan. Kamu bisa langsung membuka studio latihan.";
      return;
    }
    if (location.protocol === "file:" || !window.isSecureContext) {
      notice.textContent = "Buka aplikasi melalui localhost atau alamat HTTPS untuk masuk.";
      return;
    }
    try {
      const base = "https://www.gstatic.com/firebasejs/13.3.0/";
      const [app, authentication] = await Promise.all([
        import(base + "firebase-app.js"), import(base + "firebase-auth.js")
      ]);
      sdk = authentication;
      const connection = sdk.getAuth(app.initializeApp(config));
      await sdk.setPersistence(connection, sdk.browserSessionPersistence);
      sdk.onAuthStateChanged(connection, (user) => {
        auth = connection;
        showUser(user);
        notice.hidden = true;
        updateControls();
      });
    } catch {
      notice.textContent = "Layanan akun tidak bisa dibuka. Cek koneksi atau muat ulang halaman.";
    }
  }

  connect();
})();
