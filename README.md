# Kamus Sejarah MY

Kamus istilah Sejarah untuk guru dan pelajar — web app (PWA) yang boleh dipasang pada telefon dan berfungsi tanpa Internet.

- **Penulis:** Cg Surina
- **Dibangunkan oleh:** Adib

## Ciri

- Carian segera pada istilah dan maksud, bertolak ansur dengan salah eja
- Tapis ikut huruf A–Z
- Istilah Hari Ini
- Flashcard dan Kuiz untuk ulang kaji
- Tema cerah/gelap, saiz tulisan boleh laras
- Boleh dipasang (Add to Home Screen) dan berfungsi offline

## Kemas kini data kamus

1. Edit `data/kamus.xls` dalam Excel (lajur B = istilah, lajur C = maksud). Simpan dalam format `.xls`.
2. Gantikan fail itu dalam repo dan push ke `main`.
3. GitHub Actions menukar Excel kepada data app dan menerbitkan versi baharu secara automatik.

Format *italic* dan **bold** dalam sel dikekalkan. Istilah yang sama pada beberapa baris digabung menjadi satu entri dengan maksud bernombor.

## Jalankan pada komputer sendiri

```bash
npm install
```

```bash
npm run dev
```

Untuk menukar Excel secara manual (perlu Python):

```bash
pip install xlrd
```

```bash
npm run data
```

## Terbitkan (GitHub Pages)

Di GitHub: **Settings → Pages → Source: GitHub Actions**. Selepas itu setiap push ke `main` akan diterbitkan.

## Teknologi

React, Vite, TypeScript, Tailwind CSS, vite-plugin-pwa.
