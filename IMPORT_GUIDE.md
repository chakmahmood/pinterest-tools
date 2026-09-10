# Panduan Import Pins via Excel

## Format File Excel

File Excel harus memiliki struktur berikut:

### Contoh File `pins-import.xlsx`:

```
postUrl | title | description | imagePrompt | overlayText | imageUrl | board | keywords
--------|-------|-------------|-------------|-----------|----------|-------|----------
https://example.com/post-1 | Modern Furniture | Beautiful modern furniture collection | Modern sofa design with clean lines | 30% Off | | Living Room | furniture,design,modern
https://example.com/post-2 | Kitchen Ideas | Kitchen organization and design tips | Minimalist kitchen with white cabinets | New | | Kitchen | kitchen,organization,design
```

## Kolom yang Wajib Diisi ✓

1. **postUrl** - URL dari Post yang sudah ada di database
   - Contoh: `https://pinterest.com/pin/12345` atau `https://example.com/posts/furniture-tips`
   - PENTING: URL harus PERSIS sama dengan yang ada di database Posts

2. **title** - Judul Pin (minimal 3 karakter)
   - Contoh: `Modern Living Room Design`

3. **description** - Deskripsi Pin (minimal 10 karakter)
   - Contoh: `Explore modern design ideas for your living room with contemporary furniture and minimalist décor.`

4. **imagePrompt** - Prompt untuk AI Image Generation (minimal 10 karakter)
   - Contoh: `A bright minimalist living room with grey sofa and natural lighting, Scandinavian interior design`

## Kolom Optional (Boleh Dikosongkan)

- **overlayText** - Teks yang ditampilkan di atas gambar
- **imageUrl** - URL gambar (jika sudah ada gambar)
- **board** - Nama board Pinterest
- **keywords** - Keywords (pisahkan dengan koma)

## Langkah-Langkah Import

### 1. Siapkan File Excel

Buka aplikasi Excel (Microsoft Excel, Google Sheets, atau LibreOffice Calc):

**Pastikan:**

- ✓ Header row berisi nama-nama kolom
- ✓ Setiap baris adalah satu PIN yang akan diimport
- ✓ Kolom wajib diisi tidak boleh kosong
- ✓ postUrl HARUS sesuai dengan URL di database

### 2. Ambil Contoh dari Database

Sebelum import, pastikan postUrl yang akan digunakan sudah ada:

1. Buka dashboard **Posts**
2. Lihat URL dari setiap Post yang akan direferensikan
3. Gunakan URL tersebut di kolom `postUrl`

### 3. Upload File

1. Buka halaman **Pins Dashboard**
2. Klik tombol **"Import Excel"**
3. Pilih file `.xlsx` atau `.xls` Anda
4. Tunggu proses import selesai

### 4. Verifikasi Hasil

Sistem akan menampilkan:

- ✓ Jumlah pins yang berhasil diimport
- ✓ Jumlah pins yang di-skip (duplikat)
- ✓ Error message untuk setiap row yang gagal

## Error Messages & Solutions

| Error                                 | Penyebab                      | Solusi                                                                         |
| ------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------ |
| `Post URL is required`                | Kolom postUrl kosong          | Pastikan kolom postUrl diisi untuk setiap row                                  |
| `Title is required`                   | Kolom title kosong            | Isi judul untuk setiap PIN                                                     |
| `Description is required`             | Kolom description kosong      | Isi deskripsi minimal 10 karakter                                              |
| `Image Prompt is required`            | Kolom imagePrompt kosong      | Isi prompt untuk AI image generation                                           |
| `Post URL not found: [URL]`           | postUrl tidak ada di database | Periksa kembali URL, pastikan Posted sudah ada di database                     |
| `Only .xlsx and .xls files supported` | Format file salah             | Gunakan file Excel (.xlsx atau .xls)                                           |
| `File is too large (max 10MB)`        | Ukuran file > 10 MB           | Gunakan file yang lebih kecil atau split menjadi beberapa file                 |
| `Unexpected token 'S'`                | Server error                  | Check console browser untuk error detail, atau pastikan database connection OK |

## Validasi Otomatis

Sistem akan melakukan validasi berikut:

✅ **File Type Check**: Hanya .xlsx dan .xls
✅ **File Size Check**: Maximum 10 MB
✅ **Required Fields Check**: postUrl, title, description, imagePrompt
✅ **Post URL Lookup**: Mencari Post berdasarkan URL
✅ **Duplicate Detection**: Tidak import PIN dengan (postId + title) yang sama
✅ **Column Normalization**: Flexibel dengan nama kolom yang berbeda

## Column Name Variations

Sistem dapat mengenali variasi nama kolom berikut:

| Standard    | Alternative 1 | Alternative 2 |
| ----------- | ------------- | ------------- |
| postUrl     | postURL       | post_url      |
| title       | Title         | -             |
| description | Description   | -             |
| overlayText | overlay_text  | Overlay Text  |
| imagePrompt | image_prompt  | Image Prompt  |
| imageUrl    | image_url     | Image URL     |
| board       | Board         | -             |
| keywords    | Keywords      | -             |

## Best Practices

### 1. Persiapan Data

```
✓ Export list Posts terlebih dahulu untuk mendapat URL yang benar
✓ Gunakan Excel untuk data entry, hindari copy-paste dari Google Docs
✓ Validate data sebelum upload
✓ Gunakan format text untuk semua kolom, bukan formula
```

### 2. File Organization

```
✓ Gunakan nama file yang deskriptif: pins-2024-01-15.xlsx
✓ Simpan backup file sebelum import
✓ Gunakan satu sheet per file
✓ Maximal 1000 rows per import untuk performance
```

### 3. Error Handling

```
✓ Cek error message dengan teliti
✓ Perbaiki baris yang error satu-satu
✓ Import kembali hanya baris yang error
✓ Duplicate tidak akan di-import ulang (aman)
```

## Debugging Tips

### Jika Import Gagal Total

1. **Check Console Browser** (F12 → Console tab)
   - Lihat error message detail
   - Copy error untuk debugging

2. **Verify Database Connection**
   - Pastikan database running
   - Check `.env.local` untuk DATABASE_URL

3. **Check Posts Table**
   - Pastikan Posts sudah ada
   - Pastikan URL dalam Posts table sesuai dengan Excel

### Jika Beberapa Row Gagal

1. **Identifikasi baris yang gagal** dari error message
2. **Perbaiki data** di Excel
3. **Re-import** file yang sudah diperbaiki
4. **Note**: Baris yang berhasil tidak akan di-import lagi (duplicate detection)

## Tips & Tricks

### Cepat Copy URL dari Posts

1. Dashboard Posts
2. Klik kanan pada URL
3. Copy link address
4. Paste di Excel

### Batch Import

Jika punya banyak pins:

1. Split menjadi beberapa file (1000 rows per file)
2. Import file satu per satu
3. Monitor progress

### Testing

1. Buat test file dengan 2-3 baris dulu
2. Pastikan import berhasil
3. Kalau OK, upload file yang lebih besar

## FAQ

**Q: Bisa import ulang PIN yang sama?**
A: Tidak, sistem akan skip duplicate berdasarkan postId + title

**Q: Bagaimana kalau imageUrl kosong?**
A: Aman, imageUrl optional. PIN bisa dibuat tanpa image dulu.

**Q: Berapa waktu untuk import 1000 rows?**
A: Biasanya 10-30 detik tergantung connection

**Q: Kolom keywords harus ada?**
A: Tidak, keywords optional. Bisa dikosongkan atau diisi "keyword1, keyword2, keyword3"

**Q: Bisa rollback kalau salah import?**
A: Delete PIN satu-satu atau contact admin untuk bulk delete

## Support

Kalau ada error atau pertanyaan:

1. Check error message di notification
2. Review file EXCEL_IMPORT_FORMAT.md
3. Check console browser (F12)
4. Test dengan file sample terlebih dahulu
