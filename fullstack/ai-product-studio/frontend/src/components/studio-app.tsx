"use client";

/* eslint-disable @next/next/no-img-element */

import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  BrainCircuit,
  ImageUp,
  Loader2,
  Lock,
  LogOut,
  Palette,
  Sparkles,
  Upload,
  WandSparkles,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { apiFetch, AuthResponse, AuthUser, ImageJob, ProductTemplate } from "@/lib/api";

const fallbackProducts: ProductTemplate[] = [
  {
    id: 1,
    name: "Oversize T-shirt",
    product_type: "tshirt",
    base_price: "499.00",
    currency: "TRY",
    mockup_image_url: "",
  },
  {
    id: 2,
    name: "Gallery Poster",
    product_type: "poster",
    base_price: "349.00",
    currency: "TRY",
    mockup_image_url: "",
  },
  {
    id: 3,
    name: "Phone Case",
    product_type: "phone_case",
    base_price: "299.00",
    currency: "TRY",
    mockup_image_url: "",
  },
];

const styleOptions = [
  { value: "futuristic", label: "Futuristik" },
  { value: "streetwear", label: "Streetwear" },
  { value: "minimal", label: "Minimal" },
  { value: "poster_art", label: "Poster art" },
];

function readStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem("studio-token");
}

function readStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedUser = window.localStorage.getItem("studio-user");
  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as AuthUser;
  } catch {
    return null;
  }
}

export function StudioApp() {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [token, setToken] = useState<string | null>(() => readStoredToken());
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [username, setUsername] = useState("demo");
  const [email, setEmail] = useState("demo@studio.local");
  const [password, setPassword] = useState("strongpass123");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [products, setProducts] = useState<ProductTemplate[]>(fallbackProducts);
  const [selectedProduct, setSelectedProduct] = useState("tshirt");
  const [style, setStyle] = useState("futuristic");
  const [prompt, setPrompt] = useState(
    "Neon cam şehir dokusu, premium tişört baskısı için merkezde net kompozisyon",
  );
  const [creativeLevel, setCreativeLevel] = useState([68]);
  const [commercialSafe, setCommercialSafe] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [job, setJob] = useState<ImageJob | null>(null);
  const [jobs, setJobs] = useState<ImageJob[]>([]);
  const [generationError, setGenerationError] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    apiFetch<{ results?: ProductTemplate[] } | ProductTemplate[]>("/catalog/products/")
      .then((data) => {
        const items = Array.isArray(data) ? data : data.results ?? [];
        if (items.length > 0) {
          setProducts(items);
          setSelectedProduct(items[0].product_type);
        }
      })
      .catch(() => setProducts(fallbackProducts));
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    apiFetch<{ results?: ImageJob[] } | ImageJob[]>("/generation/jobs/", { token })
      .then((data) => {
        const items = Array.isArray(data) ? data : data.results ?? [];
        setJobs(items);
        if (items[0]) {
          setJob(items[0]);
        }
      })
      .catch(() => undefined);
  }, [token]);

  const selectedProductDetail = useMemo(
    () =>
      products.find((product) => product.product_type === selectedProduct) ??
      fallbackProducts[0],
    [products, selectedProduct],
  );

  function handleFileChange(nextFile: File | null) {
    setFile(nextFile);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(nextFile ? URL.createObjectURL(nextFile) : null);
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const path = authMode === "login" ? "/auth/login/" : "/auth/register/";
      const payload =
        authMode === "login" ? { username, password } : { username, email, password };
      const response = await apiFetch<AuthResponse>(path, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setToken(response.token);
      setUser(response.user);
      window.localStorage.setItem("studio-token", response.token);
      window.localStorage.setItem("studio-user", JSON.stringify(response.user));
    } catch {
      setAuthError("Giriş başarısız. Backend çalışıyor mu ve bilgiler doğru mu?");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleGenerate() {
    if (!token) {
      setAuthError("Üretim için önce giriş yapmalısın.");
      return;
    }

    setGenerationError("");
    setGenerating(true);

    try {
      const formData = new FormData();
      formData.set("prompt", `${prompt}\nCreative intensity: ${creativeLevel[0]}`);
      formData.set("style", style);
      formData.set("product_intent", selectedProduct);
      formData.set("aspect_ratio", selectedProduct === "poster" ? "4:5" : "1:1");
      if (file) {
        formData.set("reference_image", file);
      }
      if (commercialSafe) {
        formData.set("commercial_policy", "licensed-assets-only");
      }

      const nextJob = await apiFetch<ImageJob>("/generation/jobs/", {
        method: "POST",
        body: formData,
        token,
      });
      setJob(nextJob);
      setJobs((current) => [nextJob, ...current.filter((item) => item.id !== nextJob.id)]);
    } catch {
      setGenerationError("Üretim isteği tamamlanamadı. API bağlantısını kontrol et.");
    } finally {
      setGenerating(false);
    }
  }

  function logout() {
    setToken(null);
    setUser(null);
    setJobs([]);
    setJob(null);
    window.localStorage.removeItem("studio-token");
    window.localStorage.removeItem("studio-user");
  }

  return (
    <main className="min-h-screen bg-[#07080b] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_8%,rgba(20,184,166,0.24),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(244,63,94,0.18),transparent_28%),linear-gradient(135deg,rgba(250,204,21,0.08),transparent_38%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex min-h-16 items-center justify-between gap-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-md border border-teal-300/40 bg-teal-300/10">
              <BrainCircuit className="size-5 text-teal-200" />
            </div>
            <div>
              <p className="text-sm text-white/54">AI Product Studio</p>
              <h1 className="text-xl font-semibold tracking-normal text-white sm:text-2xl">
                Üret, ürüne bağla, siparişe hazırla
              </h1>
            </div>
          </div>
          {user ? (
            <div className="flex items-center gap-2">
              <Badge className="hidden rounded-md border-teal-300/30 bg-teal-300/10 text-teal-100 sm:inline-flex">
                {user.username}
              </Badge>
              <Tooltip>
                <TooltipTrigger
                  type="button"
                  className="inline-flex size-8 items-center justify-center rounded-md bg-white/10 text-white transition hover:bg-white/16"
                  onClick={logout}
                >
                  <LogOut className="size-4" />
                </TooltipTrigger>
                <TooltipContent>Çıkış</TooltipContent>
              </Tooltip>
            </div>
          ) : null}
        </header>

        <section className="grid flex-1 gap-5 py-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="flex flex-col gap-5">
            <AuthPanel
              authMode={authMode}
              setAuthMode={setAuthMode}
              username={username}
              setUsername={setUsername}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              authLoading={authLoading}
              authError={authError}
              user={user}
              onSubmit={handleAuth}
            />
            <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-black/20">
              <div className="mb-4 flex items-center gap-2">
                <Boxes className="size-4 text-amber-200" />
                <h2 className="text-base font-semibold">Ürün hattı</h2>
              </div>
              <div className="grid gap-2">
                {products.map((product) => (
                  <button
                    key={product.id}
                    className={`flex h-14 items-center justify-between rounded-md border px-3 text-left transition ${
                      selectedProduct === product.product_type
                        ? "border-teal-300/60 bg-teal-300/12"
                        : "border-white/10 bg-black/20 hover:border-white/25"
                    }`}
                    type="button"
                    onClick={() => setSelectedProduct(product.product_type)}
                  >
                    <span className="text-sm font-medium">{product.name}</span>
                    <span className="text-xs text-white/58">
                      {product.base_price} {product.currency}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="rounded-lg border border-white/10 bg-white/[0.07] p-4 shadow-2xl shadow-black/25 sm:p-5">
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm text-white/54">Görsel motoru</p>
                  <h2 className="text-2xl font-semibold tracking-normal">Image to product</h2>
                </div>
                <Badge className="w-fit rounded-md border-amber-300/35 bg-amber-300/12 text-amber-100">
                  Mock provider
                </Badge>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <label className="group grid min-h-[340px] cursor-pointer place-items-center rounded-lg border border-dashed border-white/20 bg-black/28 p-4 transition hover:border-teal-200/45">
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
                  />
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Referans görsel önizlemesi"
                      className="max-h-[420px] w-full rounded-md object-contain"
                    />
                  ) : (
                    <div className="flex max-w-xs flex-col items-center gap-4 text-center">
                      <div className="grid size-14 place-items-center rounded-md bg-teal-300/12 text-teal-100">
                        <ImageUp className="size-7" />
                      </div>
                      <div>
                        <p className="font-medium">Referans fotoğraf seç</p>
                        <p className="mt-1 text-sm text-white/50">
                          PNG, JPG veya webp görselini stüdyoya bırak.
                        </p>
                      </div>
                    </div>
                  )}
                </label>

                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="prompt">Prompt</Label>
                    <Textarea
                      id="prompt"
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                      className="min-h-32 resize-none rounded-md border-white/12 bg-black/30 text-white placeholder:text-white/35"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Stil</Label>
                      <Select
                        value={style}
                        onValueChange={(value) => {
                          if (value) {
                            setStyle(value);
                          }
                        }}
                      >
                        <SelectTrigger className="rounded-md border-white/12 bg-black/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {styleOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Ürün</Label>
                      <Select
                        value={selectedProduct}
                        onValueChange={(value) => {
                          if (value) {
                            setSelectedProduct(value);
                          }
                        }}
                      >
                        <SelectTrigger className="rounded-md border-white/12 bg-black/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.product_type}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-3 rounded-lg border border-white/10 bg-black/24 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <Label>Yaratıcılık</Label>
                      <span className="text-sm text-teal-100">{creativeLevel[0]}%</span>
                    </div>
                    <Slider
                      value={creativeLevel}
                      max={100}
                      step={1}
                      onValueChange={(value) =>
                        setCreativeLevel(Array.isArray(value) ? [...value] : [value])
                      }
                    />
                    <Separator className="bg-white/10" />
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium">Ticari lisans filtresi</p>
                        <p className="text-xs text-white/48">Baskıya uygun güvenli üretim modu</p>
                      </div>
                      <Switch checked={commercialSafe} onCheckedChange={setCommercialSafe} />
                    </div>
                  </div>

                  {generationError ? (
                    <p className="rounded-md border border-rose-300/25 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
                      {generationError}
                    </p>
                  ) : null}

                  <Button
                    type="button"
                    className="h-12 rounded-md bg-teal-300 text-black hover:bg-teal-200"
                    onClick={handleGenerate}
                    disabled={generating || !token}
                  >
                    {generating ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <WandSparkles className="size-4" />
                    )}
                    Görsel üret
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            </div>

            <ResultPanel
              job={job}
              selectedProductDetail={selectedProductDetail}
              jobs={jobs}
            />
          </section>
        </section>
      </div>
    </main>
  );
}

type AuthPanelProps = {
  authMode: "login" | "register";
  setAuthMode: (mode: "login" | "register") => void;
  username: string;
  setUsername: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  authLoading: boolean;
  authError: string;
  user: AuthUser | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function AuthPanel(props: AuthPanelProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-black/20">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Lock className="size-4 text-teal-200" />
          <h2 className="text-base font-semibold">Giriş</h2>
        </div>
        {props.user ? (
          <Badge className="rounded-md border-teal-300/35 bg-teal-300/12 text-teal-100">
            <BadgeCheck className="size-3" />
            Aktif
          </Badge>
        ) : null}
      </div>

      {props.user ? (
        <div className="rounded-md border border-teal-300/25 bg-teal-300/10 p-3 text-sm text-teal-50">
          {props.user.username} hesabı ile stüdyo açık.
        </div>
      ) : (
        <form className="grid gap-3" onSubmit={props.onSubmit}>
          <Tabs
            value={props.authMode}
            onValueChange={(value) => props.setAuthMode(value as "login" | "register")}
          >
            <TabsList className="grid w-full grid-cols-2 rounded-md bg-black/28">
              <TabsTrigger value="login">Giriş</TabsTrigger>
              <TabsTrigger value="register">Kayıt</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="grid gap-2">
            <Label htmlFor="username">Kullanıcı adı</Label>
            <Input
              id="username"
              value={props.username}
              onChange={(event) => props.setUsername(event.target.value)}
              className="rounded-md border-white/12 bg-black/30 text-white"
            />
          </div>
          {props.authMode === "register" ? (
            <div className="grid gap-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={props.email}
                onChange={(event) => props.setEmail(event.target.value)}
                className="rounded-md border-white/12 bg-black/30 text-white"
              />
            </div>
          ) : null}
          <div className="grid gap-2">
            <Label htmlFor="password">Şifre</Label>
            <Input
              id="password"
              type="password"
              value={props.password}
              onChange={(event) => props.setPassword(event.target.value)}
              className="rounded-md border-white/12 bg-black/30 text-white"
            />
          </div>
          {props.authError ? (
            <p className="rounded-md border border-rose-300/25 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
              {props.authError}
            </p>
          ) : null}
          <Button
            type="submit"
            className="h-11 rounded-md bg-white text-black hover:bg-white/88"
            disabled={props.authLoading}
          >
            {props.authLoading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            Devam et
          </Button>
        </form>
      )}
    </div>
  );
}

function ResultPanel({
  job,
  selectedProductDetail,
  jobs,
}: {
  job: ImageJob | null;
  selectedProductDetail: ProductTemplate;
  jobs: ImageJob[];
}) {
  return (
    <aside className="flex flex-col gap-5">
      <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-black/20">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Palette className="size-4 text-rose-200" />
            <h2 className="text-base font-semibold">Önizleme</h2>
          </div>
          <Badge className="rounded-md border-white/12 bg-white/10 text-white">
            {selectedProductDetail.name}
          </Badge>
        </div>
        <div className="grid aspect-square place-items-center overflow-hidden rounded-lg border border-white/10 bg-[#101318]">
          {job?.output_image_url ? (
            <img
              src={job.output_image_url}
              alt="Üretilen tasarım"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-center text-white/50">
              <Sparkles className="size-9 text-amber-200" />
              <p className="max-w-48 text-sm">İlk üretim sonucu burada görünecek.</p>
            </div>
          )}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Metric label="Durum" value={job?.status ?? "hazır"} />
          <Metric label="Format" value={job?.aspect_ratio ?? "1:1"} />
          <Metric label="Provider" value={job?.provider ?? "mock"} />
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
        <h2 className="mb-3 text-base font-semibold">Son üretimler</h2>
        <div className="grid gap-2">
          {jobs.length > 0 ? (
            jobs.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[48px_minmax(0,1fr)] gap-3 rounded-md border border-white/10 bg-black/24 p-2"
              >
                <div className="overflow-hidden rounded-md bg-white/8">
                  {item.output_image_url ? (
                    <img
                      src={item.output_image_url}
                      alt=""
                      className="size-12 object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm">{item.prompt}</p>
                  <p className="text-xs text-white/45">{item.style}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-md border border-white/10 bg-black/24 px-3 py-3 text-sm text-white/50">
              Henüz üretim yok.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/24 px-2 py-3">
      <p className="text-[11px] text-white/42">{label}</p>
      <p className="mt-1 truncate text-sm font-medium text-white">{value}</p>
    </div>
  );
}
