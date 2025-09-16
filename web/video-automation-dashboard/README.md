# 🎬 Facebook Video Paneli

Solid ve Clean Architecture prensiplerine uygun, modern renk paletine sahip **Facebook video yükleme paneli**. Next.js 14, TypeScript ve Shadcn UI ile geliştirilmiştir.

## ✨ Özellikler

- 🎨 **Modern Tasarım**: Deep Purple, Bright Turquoise ve Neutral Gray renk paletine sahip
- 🏗️ **Clean Architecture**: Solid prensiplerine uygun, test edilebilir kod yapısı
- 🔐 **Güvenlik**: Tüm API çağrıları sunucu tarafında (Server Actions)
- 📱 **Responsive**: Mobile-first, tüm cihazlarda optimize
- ⚡ **Performans**: Next.js 15 Turbopack ile ultra hızlı
- 🎯 **TypeScript**: Type-safe kod
- 🔄 **Real-time Feedback**: Toast bildirimleri ile anında geribildirim

## 🚀 Başlangıç

### Gereksinimler
- Node.js 18+
- npm veya yarn

### Kurulum

1. **Bağımlılıkları Kurun**
```bash
npm install
```

2. **Ortam Değişkenlerini Ayarlayın** (`.env.local`)
```env
FB_PAGE_ID=YOUR_PAGE_ID
FB_PAGE_ACCESS_TOKEN=YOUR_ACCESS_TOKEN
```

3. **Dev Sunucusunu Başlatın**
```bash
npm run dev
```

4. **Tarayıcıda Açın**
```
http://localhost:3002
```

## 📦 Build & Deploy

```bash
# Production build
npm run build

# Production sunucusunu başlat
npm run start
```

## 📁 Proje Yapısı

```
src/
  ├── core/
  │   ├── repositories/          # Interface tanımları
  │   └── use-cases/             # Business logic
  └── infrastructure/
      ├── adapters/              # External service implementations
      └── http-client/           # API communication

app/
  ├── components/                # React components
  ├── actions/                   # Server Actions
  ├── layout.tsx                 # Root layout
  └── page.tsx                   # Home page

components/ui/                    # Shadcn UI-inspired components
hooks/                            # Custom React hooks
```

## 🎨 Renk Sistemi

### Tailwind Config

```typescript
colors: {
  primary: { ... }    // Deep Purple
  accent: { ... }     // Bright Turquoise
  neutral: { ... }    # Neutral Gray
}
```

## 🏛️ Mimari

### Clean Architecture Katmanları

```
┌─────────────────────────────────────┐
│   Presentation Layer                │
│   (React Components, UI)            │
├─────────────────────────────────────┤
│   Application Layer                 │
│   (Server Actions, Use Cases)       │
├─────────────────────────────────────┤
│   Domain Layer                      │
│   (Interfaces, Entities)            │
├─────────────────────────────────────┤
│   Infrastructure Layer              │
│   (Facebook API, External Services) │
└─────────────────────────────────────┘
```

### SOLID Prensipler

- **S**ingle Responsibility: Her class tek bir sorumluluk
- **O**pen/Closed: Extension'a açık, modification'a kapalı
- **L**iskov Substitution: Interface implementasyonları yerine koyulabilir
- **I**nterface Segregation: Minimal focused interfaces
- **D**ependency Inversion: Abstraction'a bağlı concrete class'lara değil

## 📝 API Akışı

```
User Input (Form)
    ↓
Client Validation
    ↓
Server Action (uploadVideoAction)
    ↓
Use Case (UploadVideoUseCase)
    ↓
Repository (FacebookVideoRepository)
    ↓
Facebook Graph API v24.0
    ↓
Response (Video ID veya Hata)
    ↓
Toast Notification
```

## 🔐 Güvenlik

✅ **API Credentials Koruması**
- Facebook API key'leri `.env.local`'da saklanır
- Hiç bir şekilde istemci tarafında expose edilmez
- Server Actions aracılığıyla güvenli iletişim

✅ **CSRF Koruması**
- Next.js built-in CSRF protection

✅ **Input Validation**
- Client-side: Form validation
- Server-side: Use case validation

## 📱 Responsive Breakpoints

- **Mobile**: 320px+
- **Tablet**: 768px+
- **Desktop**: 1024px+

## 🎯 Kullanım Örneği

### Video Yükleme

1. Sayfaya gir: `http://localhost:3002`
2. Form alanlarını doldur:
   - Video Başlığı
   - Video URL'si
   - Video Açıklaması
3. "Videoyu Yükle" butonuna tıkla
4. Loading state'ini gözle
5. Toast bildirimiyle sonucu gör

## 🧪 Test

### Manual Testing

Bkz. [TESTING.md](./TESTING.md)

### Unit Tests (ileride eklenecek)

```bash
npm run test
```

## 📚 Teknoloji Stack

| Teknoloji | Versiyon | Kullanım |
|-----------|----------|---------|
| Next.js | 15.5.10 | Framework |
| React | 19.1.0 | UI Library |
| TypeScript | 5+ | Language |
| Tailwind CSS | 4 | Styling |
| Sonner | 2.0.7 | Toast Library |
| Inter Font | - | Typography |

## 🔗 İlgili Dökümentler

- [Mimari Dökümentasyon](./ARCHITECTURE.md)
- [Test Rehberi](./TESTING.md)

## 📖 Facebook Graph API

- **API Version**: v24.0
- **Endpoint**: `POST /{page_id}/videos`
- **Documentation**: [Facebook Developers](https://developers.facebook.com/docs/graph-api)

### Video Upload Parametreleri

```typescript
{
  source: string,        // Video URL
  title: string,         // Video başlığı
  description: string    // Video açıklaması
}
```

## 🤝 Katkıda Bulunma

Katkılar memnuniyetle karşılanır! Lütfen:

1. Fork'layın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit'leyin (`git commit -m 'Add some AmazingFeature'`)
4. Push'layın (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📝 Lisans

MIT

## 👨‍💻 Geliştirici

GitHub Copilot tarafından geliştirilmiştir.

---

**Son Güncelleme**: 28 Ocak 2026  
**Versiyon**: 1.0.0

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
