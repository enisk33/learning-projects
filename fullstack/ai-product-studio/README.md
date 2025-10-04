# AI Product Studio

Fotoğraftan AI görsel üretip fiziksel ürüne bağlamaya hazırlanan ticari ürün stüdyosu.

## Mimari

- `backend/`: Django 6 + Django REST Framework API.
- `backend/apps/accounts`: token tabanlı kayıt, giriş, çıkış ve kullanıcı endpointleri.
- `backend/apps/generation`: image generation job modeli, serializer, API ve provider adapter yeri.
- `backend/apps/catalog`: satılabilir ürün şablonları. İlk migration ürünleri seed eder.
- `backend/apps/orders`: üretimi fiziksel ürün siparişine bağlayacak sipariş domain'i.
- `frontend/`: Next.js App Router + TypeScript + Tailwind v4 + shadcn/base-ui.

Şu an generation provider `mock`. Gerçek model API'si bağlanırken `backend/apps/generation/services.py` içindeki `ImageGenerationService` bir provider adapter katmanına ayrılmalı.

## Local Çalıştırma

Backend:

```powershell
.\.venv\Scripts\python backend\manage.py runserver 127.0.0.1:8000
```

Frontend:

```powershell
cd frontend
npm run dev -- --port 3000
```

Adresler:

- Frontend: http://127.0.0.1:3000
- Backend health: http://127.0.0.1:8000/api/health/
- API root: http://127.0.0.1:8000/api/v1/

## Doğrulama

```powershell
.\.venv\Scripts\python backend\manage.py test apps
cd frontend
npm run lint
npm run build
```

## Sonraki Ticari Katmanlar

- Gerçek image model provider adapter'i ve async queue.
- Kullanım kredisi, rate limit ve faturalama.
- Baskı tedarikçisi entegrasyonu.
- Sipariş, ödeme ve kargo durum webhook'ları.
- Moderasyon, lisans filtresi ve telif raporlaması.
