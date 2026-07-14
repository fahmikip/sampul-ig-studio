# Sampul IG Studio

Sampul IG Studio adalah aplikasi Google Apps Script Web App untuk membuat sampul Instagram secara cepat dari template siap pakai. Pengguna cukup memilih format, memilih template, mengisi judul/deskripsi, mengunggah foto bila perlu, lalu mengunduh hasil sebagai PNG/JPG atau menyimpannya ke Google Drive.

## Fitur

- Canvas Instagram resolusi asli:
  - Feed Portrait 1080 x 1350
  - Feed Square 1080 x 1080
  - Story 1080 x 1920
  - Reels Cover 1080 x 1920
- 24 template awal dalam 7 kategori.
- Live preview berbasis HTML Canvas.
- Auto typography: wrapping, resize, max line, dan proteksi area aman.
- Upload foto JPG, PNG, dan WEBP.
- Kontrol foto: zoom, posisi, brightness, contrast, saturation, blur, grayscale, dan overlay.
- Preset warna dan color picker.
- Download PNG/JPG.
- Simpan hasil ke Google Drive.
- Riwayat desain berbasis Google Spreadsheet.
- Template Manager sederhana.

## Kategori Template

- Cinematic Dark
- Editorial Beige
- Modern Gradient
- Minimal Education
- Photo Focus
- Professional Modern
- Kemerdekaan 17 Agustus

## Teknologi

- Google Apps Script
- HTML5
- CSS3
- Vanilla JavaScript
- HTML Canvas API
- Google Spreadsheet
- Google Drive
- Google Fonts

## Struktur File

```text
sampul-ig-studio/
|-- Code.gs
|-- SetupService.gs
|-- SpreadsheetService.gs
|-- DriveService.gs
|-- TemplateService.gs
|-- HistoryService.gs
|-- SettingsService.gs
|-- ValidationService.gs
|-- Utils.gs
|-- Index.html
|-- Styles.html
|-- Scripts.html
|-- CanvasRenderer.html
|-- TemplateConfig.html
|-- Components.html
|-- Admin.html
`-- History.html
```

## Peran File

- `Code.gs`: entry point Web App, include HTML, setup, dan data awal aplikasi.
- `SetupService.gs`: membuat folder Drive, Spreadsheet, settings, dan template default.
- `SpreadsheetService.gs`: helper baca/tulis Google Spreadsheet.
- `DriveService.gs`: upload aset dan simpan hasil desain ke Google Drive.
- `TemplateService.gs`: CRUD template.
- `HistoryService.gs`: simpan, ambil, duplikasi, dan hapus riwayat desain.
- `SettingsService.gs`: pengaturan aplikasi.
- `ValidationService.gs`: validasi input, file, MIME type, dan base64.
- `Utils.gs`: konfigurasi aplikasi dan helper umum.
- `Index.html`: layout utama aplikasi.
- `Styles.html`: stylesheet aplikasi.
- `Scripts.html`: state frontend, event handler, export, dan komunikasi backend.
- `CanvasRenderer.html`: renderer desain ke canvas.
- `TemplateConfig.html`: konfigurasi default frontend.
- `Components.html`: toast, modal, template card, dan history card.
- `Admin.html`: UI template manager.
- `History.html`: UI riwayat desain.

## Setup Google Apps Script

1. Buka [Google Apps Script](https://script.google.com/).
2. Buat project baru.
3. Buat file dengan nama yang sama seperti struktur di atas.
4. Salin isi setiap file dari repository ini ke file Apps Script yang sesuai.
5. Simpan project.
6. Jalankan fungsi `setupApplication()` dari editor Apps Script.
7. Berikan izin akses Google Drive dan Google Spreadsheet saat diminta.
8. Setelah setup berhasil, folder Drive dan Spreadsheet database akan dibuat otomatis.

## Deployment Web App

1. Di editor Apps Script, klik **Deploy**.
2. Pilih **New deployment**.
3. Pilih tipe **Web app**.
4. Set **Execute as** ke `Me`.
5. Set **Who has access** sesuai kebutuhan.
6. Klik **Deploy**.
7. Buka URL Web App yang diberikan.

## Pengaturan Awal

Default username Instagram:

```text
@overthinkingit.id
```

Pengaturan tersimpan di sheet `Settings`. Nilai penting:

- `InstagramUsername`
- `LogoFileID`
- `SpreadsheetID`
- `RootFolderID`
- `DefaultTemplateID`
- `DefaultExportFormat`
- `DefaultAccentColor`
- `MaxUploadSize`
- `AppName`

## Struktur Spreadsheet

Setup otomatis membuat sheet:

- `Templates`
- `DesignHistory`
- `Settings`

Template default akan dimasukkan ke sheet `Templates` saat `setupApplication()` dijalankan pertama kali.

## Struktur Folder Drive

Setup otomatis membuat folder:

```text
Sampul IG Studio/
|-- Assets
|-- Backgrounds
|-- Logos
|-- Icons
|-- Textures
|-- Uploads
|-- Generated Covers
`-- Thumbnails
```

Hasil desain disimpan di:

```text
Generated Covers/YYYY/MM-Month
```

## Cara Pakai

1. Buka Web App.
2. Pilih format canvas.
3. Pilih template.
4. Isi judul, deskripsi, label, nomor seri, username, dan CTA.
5. Upload foto bila template membutuhkan foto.
6. Atur warna, overlay, dan toggle elemen.
7. Download sebagai PNG/JPG atau simpan ke Google Drive.

## Menambahkan Template

Template dapat ditambahkan melalui Template Manager atau langsung lewat sheet `Templates`.

Kolom penting:

- `TemplateID`
- `TemplateName`
- `Category`
- `SupportedFormat`
- `BackgroundType`
- `BackgroundValue`
- `FontTitle`
- `FontDescription`
- `TitleColor`
- `DescriptionColor`
- `AccentColor`
- `OverlayColor`
- `OverlayOpacity`
- `TitlePosition`
- `DescriptionPosition`
- `LabelPosition`
- `LogoPosition`
- `UsernamePosition`
- `TitleFontSize`
- `DescriptionFontSize`
- `MaxTitleLines`
- `TextAlignment`
- `DecorationConfig`
- `IsActive`

Setelah mengubah template langsung di Spreadsheet, jalankan `clearApplicationCache()` agar data terbaru dimuat.

## Troubleshooting

**Aplikasi menampilkan halaman belum siap**

Jalankan `setupApplication()` dari editor Apps Script, lalu refresh Web App.

**Template tidak muncul**

Pastikan sheet `Templates` berisi data dan kolom `IsActive` bernilai `true`.

**Gambar gagal disimpan ke Drive**

Pastikan izin Drive sudah diberikan dan ukuran file tidak melebihi batas `MaxUploadSize`.

**Font belum tampil saat export**

Refresh halaman dan tunggu Google Fonts selesai dimuat sebelum download.

**Riwayat tidak tersimpan**

Pastikan sheet `DesignHistory` ada dan fungsi `setupApplication()` sudah berhasil.

## Checklist Pengujian

- Semua format canvas dapat dipilih.
- Semua template default muncul.
- Judul panjang tetap berada dalam area desain.
- Deskripsi panjang tetap terbaca.
- Upload foto bekerja.
- Zoom dan posisi foto bekerja.
- Overlay dan filter foto bekerja.
- Toggle elemen bekerja.
- Preview realtime berubah saat input diedit.
- Download PNG bekerja.
- Download JPG bekerja.
- Simpan ke Google Drive bekerja.
- Riwayat desain tersimpan.
- Hapus riwayat bekerja.
- Tampilan desktop responsif.
- Tampilan mobile responsif.
- Tidak ada error console saat aplikasi dibuka.

## Lisensi

Project ini disiapkan sebagai aplikasi internal/custom berbasis Google Apps Script. Sesuaikan lisensi sebelum distribusi publik.
