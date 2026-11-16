# Berani Bicara

Aplikasi latihan public speaking untuk siswa SMP dan SMK. Siswa bisa menonton video pembuka, membaca materi, memilih topik, latihan dengan timer, dan menilai hasilnya dengan rubrik. Ada kuis dan riwayat progres di browser.

## Cara menjalankan

1. Unduh atau clone repo ini, lalu buka `index.html` di browser. Gunakan `Berani-Bicara.html` jika memakai salinan yang ada di folder Windows.
2. Buka **Latihan**, pilih jenjang dan topik, lalu ubah durasi lewat **Pengaturan waktu** jika diperlukan.
3. Untuk merekam, nyalakan kamera dan mikrofon sesuai kebutuhan. Berikan izin saat browser memintanya.
4. Jalankan timer. Setelah selesai, pilih **Lihat hasil**. Klik waktu pada catatan mikrofon untuk memutar bagian terkait.
5. Pilih siapa yang memberi skor, misalnya **Diri sendiri** atau **Orang tua / wali**. Nilai aspek yang bisa diamati, lalu catat bagian yang perlu diperbaiki dan target berikutnya. Unduh rekaman sebelum memulai sesi baru jika ingin menyimpannya.

Aplikasi berjalan di browser. Rekaman diproses di perangkat dan progres tersimpan di browser yang dipakai.

Narasi video dibuat dengan [Piper, model suara Indonesia news_tts](https://huggingface.co/rhasspy/piper-voices/blob/main/id/id_ID/news_tts/medium/MODEL_CARD).

## Mengaktifkan login Google dan email

1. Buat proyek dan daftarkan aplikasi **Web** di [Firebase Console](https://console.firebase.google.com/).
2. Di **Authentication → Sign-in method**, aktifkan **Google** dan **Email/Password**. Pilih email dukungan saat mengaktifkan Google.
3. Salin objek konfigurasi aplikasi web dari **Project settings** untuk mengganti nilai `null` di `firebase-config.js`. Gunakan konfigurasi web, tanpa kredensial Admin SDK.
4. Tambahkan `localhost` di **Authentication → Settings → Authorized domains** untuk uji lokal. Jika aplikasi dihosting, tambahkan domain HTTPS tempat aplikasi benar-benar berjalan.
5. Buka terminal di folder aplikasi dan jalankan `node serve.mjs`. Buka [localhost:8080](http://localhost:8080), lalu pilih **Masuk**.

Layanan akun memakai Firebase Authentication. Riwayat, nilai kuis, dan draf latihan disimpan di browser yang dipakai, sehingga akun belum menyinkronkan data antargawai. Video materi dan latihan bisa diakses tanpa masuk akun.
