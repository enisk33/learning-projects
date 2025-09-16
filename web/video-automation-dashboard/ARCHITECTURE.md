# 🎬 Facebook Video Paneli - Clean Architecture

Solid ve Clean Architecture prensiplerine uygun, modern renk paletine sahip Facebook video yükleme paneli.

## 📁 Proje Yapısı

```
automation/
├── src/
│   ├── core/
│   │   ├── repositories/
│   │   │   └── video-repository.interface.ts       # IVideoRepository interface
│   │   └── use-cases/
│   │       └── upload-video.use-case.ts            # UploadVideoUseCase
│   └── infrastructure/
│       ├── adapters/
│       │   └── facebook-video-repository.ts        # FacebookVideoRepository
│       └── http-client/
├── app/
│   ├── components/
│   │   ├── video-upload-form.tsx                  # Ana form bileşeni
│   │   └── toaster-provider.tsx                   # Toast bildirimleri
│   ├── actions/
│   │   └── video-upload.ts                        # Server Action
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   └── ui/
│       ├── card.tsx                               # Card bileşeni
│       ├── input.tsx                              # Input alanı
│       ├── textarea.tsx                           # Textarea alanı
│       ├── button.tsx                             # Button bileşeni
│       └── toaster.tsx                            # Toaster (Sonner)
├── hooks/
│   └── use-toast.ts                               # useToast hook
├── tailwind.config.ts                             # Tailwind yapılandırması
├── .env.local                                      # Ortam değişkenleri
└── package.json

```

## 🎨 Renk Paleti

### Deep Purple (Birincil Renk)
- `primary-600`: #9333ea
- `primary-700`: #7e22ce
- `primary-900`: #581c87

### Bright Turquoise (Vurgu Rengi)
- `accent-400`: #2dd4bf
- `accent-500`: #14b8a6
- `accent-600`: #0d9488

### Neutral Gray (Arka Plan)
- `neutral-50`: #f9fafb
- `neutral-700`: #374151
- `neutral-900`: #111827

## 🏗️ Mimari Prensipler

### 1. **Clean Architecture**
- **Core Layer**: İş mantığı ve interface'ler
  - `IVideoRepository`: Video yükleme kontratı
  - `UploadVideoUseCase`: İş kuralları
  
- **Infrastructure Layer**: Dış hizmetler ve API adaptörleri
  - `FacebookVideoRepository`: Facebook Graph API v24.0 entegrasyonu
  
- **Application Layer**: UI ve kullanıcı etkileşimleri
  - Server Actions (Server-side)
  - Client Components (React)

### 2. **SOLID Prensipler**

#### S - Single Responsibility
- Her sınıf tek bir sorumluluk taşır
- `UploadVideoUseCase` sadece yükleme logic'ini yönetir
- `FacebookVideoRepository` sadece Facebook API'si ile iletişim kurar

#### O - Open/Closed
- `IVideoRepository` interface'i açık/kapalı prensibi sağlar
- Yeni repository implementasyonları eklemek kolaydır

#### L - Liskov Substitution
- `FacebookVideoRepository`, `IVideoRepository`'yi tamamen yerine koyabilir

#### I - Interface Segregation
- `IVideoRepository` minimal ve odaklı interface

#### D - Dependency Inversion
- `UploadVideoUseCase` `IVideoRepository` interface'ine bağlıdır, implementasyona değil

## 🔐 Güvenlik

✅ **Tüm API çağrıları sunucu tarafında yapılır**
- Facebook API credential'ları `.env.local`'da saklanır
- İstemci tarafında hiç bir hassas bilgi bulunmaz
- Server Action'lar aracılığıyla güvenli iletişim

```typescript
// .env.local
FB_PAGE_ID=408225992654100
FB_PAGE_ACCESS_TOKEN=XXXX...
```

## 🚀 Başlangıç

### 1. Kurulum
```bash
npm install
npm run dev
```

### 2. Geliştirme
- Sunucu otomatik yeniden başlar
- Değişiklikler gerçek zamanda görüntülenir
- Port 3002'de erişilebilir (3000 kullanılıyorsa)

### 3. Build
```bash
npm run build
npm run start
```

## 📝 API Akışı

1. **Kullanıcı Form Doldurur**
   - Başlık, URL, Açıklama

2. **Client Tarafı Validasyonu**
   - Gerekli alanlar kontrol edilir
   - Toast ile hata gösterilir

3. **Server Action Çağrılır**
   - `uploadVideoAction()` - Server tarafında çalışır
   - Environment değişkenleri burada erişilir

4. **Use Case Yürütülür**
   - `UploadVideoUseCase.execute()`

5. **Repository Aracılığıyla API Çağrısı**
   - `FacebookVideoRepository.upload()`
   - Facebook Graph API v24.0 `/videos` endpoint'i

6. **Sonuç İstemciye Dönülür**
   - Video ID başarılıysa
   - Hata mesajı başarısızsa

7. **Toast Bildirimi Gösterilir**
   - Başarı: Yeşil toast
   - Hata: Kırmızı toast

## 🎯 Temel Özellikleri

✨ **Modern UI/UX**
- Gradient arka planlar
- Smooth transitions
- Responsive tasarım (Mobile-first)
- Dark/Light mode desteği

✅ **Validation**
- Boş alan kontrolü
- URL validasyonu (type="url")
- Character limitleri

📱 **Responsive**
- Mobile optimized
- Tablet friendly
- Desktop full-featured

🎬 **Facebook Integration**
- Video URL'si ile yükleme
- Başlık ve açıklama desteği
- Gerçek-zamanlı feedback

## 📚 Teknoloji Stack

- **Framework**: Next.js 15.5.10 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn UI inspired
- **Toast**: Sonner
- **Font**: Inter (Google Fonts)

## 🔄 Veri Akışı Diyagramı

```
┌─────────────────┐
│ Client Browser  │
│  (Form Input)   │
└────────┬────────┘
         │ formData
         ▼
┌─────────────────┐
│ Client Component│
│ (Validation)    │
└────────┬────────┘
         │ valid
         ▼
┌─────────────────┐
│ Server Action   │
│ (Security)      │
└────────┬────────┘
         │ env vars
         ▼
┌─────────────────┐
│ Use Case        │
│ (Business Logic)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Repository      │
│ (Facebook API)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Facebook Graph  │
│ API v24.0       │
└────────┬────────┘
         │ videoId
         ▼
┌─────────────────┐
│ Success/Error   │
│ Response        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Toast Alert     │
│ (UX Feedback)   │
└─────────────────┘
```

## 🧪 Test Edilebilirlik

Clean Architecture sayesinde testler kolaydır:

```typescript
// Mock Repository ile test
const mockRepo = new MockVideoRepository();
const useCase = new UploadVideoUseCase(mockRepo);
const result = await useCase.execute('url', 'title', 'desc');
```

## 📖 Dökümentation

### IVideoRepository
Tüm video repository'lerin uyması gereken contract.

```typescript
interface IVideoRepository {
  upload(videoUrl: string, title: string, description: string): Promise<string>;
}
```

### UploadVideoUseCase
Video yükleme işlemini yönetir.

```typescript
class UploadVideoUseCase {
  execute(videoUrl: string, title: string, description: string): Promise<string>
}
```

### FacebookVideoRepository
Facebook Graph API v24.0 ile entegrasyon.

```typescript
class FacebookVideoRepository implements IVideoRepository {
  async upload(videoUrl, title, description): Promise<string>
}
```

---

**Tarafından oluşturuldu**: GitHub Copilot  
**Tarih**: 28 Ocak 2026  
**Versiyon**: 1.0.0
