# Format File Excel untuk Import Pins

Untuk mengimport pins menggunakan Excel, file harus memiliki format berikut:

## Kolom yang Diperlukan (Required)

| Kolom           | Tipe | Deskripsi                                              | Contoh                                       |
| --------------- | ---- | ------------------------------------------------------ | -------------------------------------------- |
| **postUrl**     | Text | URL posting (harus sesuai dengan Post.url di database) | `https://example.com/post-1`                 |
| **title**       | Text | Judul pin (minimal 3 karakter)                         | `My Amazing Pin`                             |
| **description** | Text | Deskripsi pin (minimal 10 karakter)                    | `This is a detailed description of the pin`  |
| **imagePrompt** | Text | Prompt untuk AI image generation (minimal 10 karakter) | `A beautiful landscape photo with mountains` |

## Kolom Optional

| Kolom       | Tipe | Deskripsi                             | Contoh                              |
| ----------- | ---- | ------------------------------------- | ----------------------------------- |
| overlayText | Text | Teks overlay di atas gambar           | `Sale 50%`                          |
| imageUrl    | Text | URL gambar (jika ada gambar existing) | `https://cdn.example.com/image.jpg` |
| board       | Text | Nama board Pinterest                  | `Home Decor`                        |
| keywords    | Text | Kata kunci (pisahkan dengan koma)     | `furniture, design, interior`       |

## Validasi yang Dilakukan

✅ **Post URL Lookup**: Sistem akan mencari Post berdasarkan URL, bukan ID manual
✅ **Duplicate Detection**: Tidak akan import pin dengan postId + title yang sama
✅ **File Format**: Hanya file .xlsx dan .xls yang didukung
✅ **File Size**: Maximum 10 MB
✅ **Column Normalization**: Kolom dapat ditulis sebagai:

- `postUrl` atau `postURL` atau `post_url`
- `title` atau `Title`
- `overlayText` atau `overlay_text` atau `Overlay Text`
- `imagePrompt` atau `image_prompt` atau `Image Prompt`
- `imageUrl` atau `image_url` atau `Image URL`
- `keywords` atau `Keywords`

## Contoh File Excel

### Sheet 1: Pins to Import

| postUrl                    | title           | description                                             | imagePrompt                                            | overlayText  | imageUrl                         | board       | keywords                      |
| -------------------------- | --------------- | ------------------------------------------------------- | ------------------------------------------------------ | ------------ | -------------------------------- | ----------- | ----------------------------- |
| https://example.com/post-1 | Modern Sofa     | A stunning modern sofa design for contemporary homes    | A minimalist modern sofa in gray color, sleek design   | Limited Sale | https://cdn.example.com/sofa.jpg | Living Room | furniture, design, modern     |
| https://example.com/post-2 | Kitchen Cabinet | Beautiful kitchen cabinet organization and design ideas | Modern kitchen with white cabinets and stainless steel | New Arrivals |                                  | Kitchen     | organization, storage, modern |
| https://example.com/post-3 | Bedroom Decor   | Cozy bedroom decoration with warm colors                | Warm and inviting bedroom with soft lighting           |              |                                  | Bedroom     | decoration, cozy, bedroom     |

## Error Messages & Solutions

| Error                                     | Penyebab                             | Solusi                                     |
| ----------------------------------------- | ------------------------------------ | ------------------------------------------ |
| `Post URL is required`                    | Kolom postUrl kosong                 | Isi URL posting yang valid                 |
| `Title is required`                       | Kolom title kosong                   | Isi judul pin                              |
| `Description is required`                 | Kolom description kosong             | Isi deskripsi minimal 10 karakter          |
| `Image Prompt is required`                | Kolom imagePrompt kosong             | Isi prompt untuk AI image generation       |
| `Post URL not found`                      | postUrl tidak sesuai dengan database | Pastikan URL posting sudah ada di database |
| `Only .xlsx and .xls files are supported` | Format file salah                    | Gunakan file Excel (.xlsx atau .xls)       |
| `File is too large`                       | Ukuran file > 10 MB                  | Gunakan file yang lebih kecil              |

## Tips Import

1. **Cek URL terlebih dahulu**: Pastikan semua `postUrl` sudah ada di database sebelum import
2. **Gunakan Excel untuk membuat file**: Pastikan format cell sudah benar (Text, bukan Number)
3. **Hindari karakter khusus**: Gunakan text yang clean tanpa karakter yang tidak perlu
4. **Test dengan file kecil dulu**: Coba import beberapa baris terlebih dahulu
5. **Keywords tidak wajib**: Kolom keywords bisa dikosongkan, field lain harus diisi

## Troubleshooting

### "Unexpected token 'S'" Error

- Ini biasanya tanda server error
- Check console browser untuk melihat error detail
- Pastikan semua URL posting sudah ada di database

### Import berhasil tapi data tidak muncul

- Refresh halaman untuk melihat data terbaru
- Check di database apakah pin sudah tersimpan

### Beberapa row berhasil, beberapa error

- Sistem akan import yang valid dan skip yang error
- Error akan ditampilkan per row di notification
