# Test Senaryoları

## ✅ Başarılı Video Yükleme Testi

### Test Verisi
```json
{
  "title": "Test Video",
  "videoUrl": "https://www.facebook.com/video.mp4",
  "description": "Bu bir test videosudur. Clean Architecture prensiplerine uygun Facebook paneli."
}
```

### Beklenen Sonuç
- ✅ Video başarıyla yüklenecek
- ✅ Video ID döndürülecek
- ✅ Başarı toast gösterilecek
- ✅ Form sıfırlanacak

---

## ❌ Boş Alan Hatası Testi

### Test Verisi
```json
{
  "title": "",
  "videoUrl": "",
  "description": ""
}
```

### Beklenen Sonuç
- ❌ Form submit engellenir
- 🔴 Hata toast gösterilir: "Lütfen tüm alanları doldurunuz."

---

## ❌ Geçersiz URL Testi

### Test Verisi
```json
{
  "title": "Test",
  "videoUrl": "invalid-url",
  "description": "Test açıklama"
}
```

### Beklenen Sonuç
- ❌ HTML5 URL validation başarısız
- 🔴 Input alanı görsel olarak işaretlenir

---

## ❌ Facebook API Hatası Testi

### Senaryo
- Facebook API credentials yanlış
- Facebook API aşağıda ise
- Rate limit aşıldıysa

### Beklenen Sonuç
- 🔴 Server Action hatasını yakalar
- 🔴 Hata mesajı toast'ta gösterilir
- ✅ UI responsive kalır

---

## 🔐 Güvenlik Testleri

### 1. API Credentials Koruması
✅ FB_PAGE_ID ve FB_PAGE_ACCESS_TOKEN sadece sunucuda
✅ Browser DevTools'ta görülmez
✅ Network requestleri JSON döndürür, key'ler gözükmez

### 2. CSRF Koruması
✅ Server Action otomatik CSRF koruması sağlar
✅ Next.js built-in security

### 3. SQL Injection Koruması
✅ Veri doğrudan API'ye URL parametresi olarak gönderilir
✅ JSON body içinde gönderilir

---

## 🚀 Performance Testleri

### Lighthouse Hedefleri
- ⚡ Performans: 90+
- ♿ Erişilebilirlik: 90+
- 📋 Best Practices: 95+
- 🔍 SEO: 95+

### Core Web Vitals
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

---

## 📱 Responsive Testleri

### Breakpoints
- ✅ Mobile (320px): Tek kolon, dokunma optimize
- ✅ Tablet (768px): İki kolon bilgi kartları
- ✅ Desktop (1024px): Full layout

---

## 🎨 Tema Testleri

### Renk Kontrastı
✅ Text contrast oranı WCAG AA standartında
✅ Focus states açık ve belirgin
✅ Hover states intuitif

### Responsive Tipografi
✅ Mobile: 16px+ base font
✅ Desktop: 18px+ base font
✅ Başlıklar ölçeklenebilir

---

## 🧪 Kod Testleri

### Unit Tests (ileride eklenecek)
```typescript
describe('UploadVideoUseCase', () => {
  it('should upload video successfully', async () => {
    // Test implementation
  });

  it('should throw error on invalid inputs', async () => {
    // Test implementation
  });
});
```

### Integration Tests (ileride eklenecek)
```typescript
describe('Video Upload Flow', () => {
  it('should upload video through Server Action', async () => {
    // Test implementation
  });
});
```

---

## 📊 Manuel Test Checklist

- [ ] Form tüm alanları render ediyor
- [ ] Button loading state'i çalışıyor
- [ ] Toast bildirimleri gösteriliyore
- [ ] Mobile responsive
- [ ] Keyboard navigation çalışıyor
- [ ] Color contrast iyi
- [ ] Video yükleniyor
- [ ] Hata mesajları uygun
- [ ] Console'da hata yok
- [ ] Network requests secure

---

## 🔗 İlgili Linkler

- [Facebook Graph API Docs](https://developers.facebook.com/docs/graph-api)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)
