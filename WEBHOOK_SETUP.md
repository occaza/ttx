# Konfigurasi Webhook Pakasir

## Masalah yang Ditemukan

Webhook Pakasir tidak muncul di log server karena beberapa kemungkinan:

1. **URL Webhook Belum Dikonfigurasi** - URL webhook belum diatur di dashboard Pakasir
2. **URL Tidak Dapat Diakses** - Server lokal tidak dapat diakses dari internet
3. **Environment Variables** - API key dan project slug belum dikonfigurasi

## Solusi yang Sudah Diimplementasikan

### 1. ✅ Webhook Endpoint Sudah Diperbaiki
- **URL**: `https://yourdomain.com/api/payment/webhook`
- **Method**: POST
- **Content-Type**: application/json

### 2. ✅ Logging Lengkap Ditambahkan
Webhook sekarang mencatat:
- Headers request
- Payload lengkap
- Status processing
- Error details

### 3. ✅ Validasi Sesuai Panduan Pakasir
- Validasi required fields
- Verifikasi amount dan order_id
- Status verification dengan Pakasir API
- Error handling yang proper

## Langkah-langkah untuk Mengaktifkan Webhook

### 1. Konfigurasi Environment Variables
Buat file `.env` di root project:
```env
PAKASIR_API_KEY=your_actual_api_key_here
PUBLIC_PAKASIR_SLUG=your_project_slug_here
```

### 2. Konfigurasi Webhook URL di Pakasir Dashboard
1. Login ke dashboard Pakasir
2. Pilih project Anda
3. Masuk ke pengaturan webhook
4. Set URL webhook ke: `https://yourdomain.com/api/payment/webhook`

### 3. Deploy ke Server yang Dapat Diakses Internet
Webhook hanya bisa bekerja jika server dapat diakses dari internet. Untuk development:
- Gunakan ngrok: `ngrok http 5173`
- Atau deploy ke Vercel/Netlify

### 4. Test Webhook
Gunakan endpoint test: `GET /api/payment/webhook-test`

## Format Webhook Payload Pakasir

```json
{
  "amount": 50000,
  "order_id": "INV123456789",
  "project": "your-project-slug",
  "status": "completed",
  "payment_method": "qris",
  "completed_at": "2025-10-24T22:49:00Z"
}
```

## Monitoring Webhook

Cek log server untuk melihat:
- `=== WEBHOOK RECEIVED ===` - Webhook diterima
- `✅ Payment completed successfully` - Webhook berhasil diproses
- `❌ Webhook error` - Ada error

## Troubleshooting

1. **Webhook tidak diterima**: Pastikan URL webhook benar dan server dapat diakses
2. **"Transaksi tidak ditemukan"**: Pastikan order_id ada di database
3. **"Amount tidak sesuai"**: Pastikan amount di webhook sama dengan database
4. **"Status pembayaran tidak valid"**: Verifikasi dengan Pakasir API gagal

## Test Endpoint

- **Test Accessibility**: `GET /api/payment/webhook-test`
- **Test Webhook**: `POST /api/payment/webhook` dengan payload JSON
