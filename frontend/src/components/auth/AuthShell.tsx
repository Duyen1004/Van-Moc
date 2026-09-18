"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { googleLogin, login, register } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

type AuthShellProps = {
  mode: "login" | "register";
};

const AUTH_STORAGE_KEY = "vanmoc-authenticated";
const AUTH_USER_KEY = "vanmoc-auth-user";
const AUTH_TOKEN_KEY = "vanmoc-auth-token";
const REMEMBER_KEY = "vanmoc-remember-login";

type RememberedLogin = {
  email: string;
  password: string;
};

type GoogleCredentialResponse = {
  credential?: string;
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (options: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
      <path d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.2c1.9-1.8 3.1-4.3 3.1-7.5z" fill="#4285F4" />
      <path d="M12 22c2.7 0 5-0.9 6.7-2.4l-3.2-2.6c-.9.6-2 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.9v2.7A10.1 10.1 0 0 0 12 22z" fill="#34A853" />
      <path d="M6.2 13.7a6 6 0 0 1 0-3.4V7.6H2.9a10 10 0 0 0 0 8.8l3.3-2.7z" fill="#FBBC05" />
      <path d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.7 9.7 0 0 0 12 2a10.1 10.1 0 0 0-9.1 5.6l3.3 2.7C7 7.8 9.3 6 12 6z" fill="#EA4335" />
    </svg>
  );
}

export function AuthShell({ mode }: AuthShellProps) {
  const isLogin = mode === "login";
  const router = useRouter();
  const { t } = useI18n();
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const googleInitializedRef = useRef(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!isLogin) {
      return;
    }

    const remembered = window.localStorage.getItem(REMEMBER_KEY);
    if (!remembered) {
      return;
    }

    try {
      const parsed = JSON.parse(remembered) as RememberedLogin;
      setForm((current) => ({ ...current, email: parsed.email, password: parsed.password }));
      setRememberMe(true);
    } catch {
      window.localStorage.removeItem(REMEMBER_KEY);
    }
  }, [isLogin]);

  const setField = (field: keyof typeof form) => (value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleAuthSuccess = (user: unknown, token: string) => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, "true");
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    window.dispatchEvent(new Event("vanmoc-auth-changed"));
  };

  const redirectAfterAuth = (role: "CUSTOMER" | "STAFF" | "ADMIN") => {
    if (role === "ADMIN") {
      router.push("/admin");
    } else if (role === "STAFF") {
      router.push("/staff");
    } else {
      router.push("/");
    }
  };

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      return;
    }

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) {
        return;
      }

      if (googleInitializedRef.current) {
        setGoogleReady(true);
        return;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          if (!response.credential) {
            setError("Google chưa trả về thông tin đăng nhập.");
            return;
          }

          setError("");
          setIsGoogleSubmitting(true);
          try {
            const result = await googleLogin(response.credential);
            window.localStorage.removeItem(REMEMBER_KEY);
            handleAuthSuccess(result.user, result.token);
            redirectAfterAuth(result.user.role);
          } catch (exception) {
            setError(exception instanceof Error ? exception.message : t.auth.genericError);
          } finally {
            setIsGoogleSubmitting(false);
          }
        },
      });
      googleInitializedRef.current = true;
      setGoogleReady(true);
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener("load", initializeGoogle, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.head.appendChild(script);
  }, [t.auth.genericError]);

  const handleGoogleSubmit = () => {
    setError("");

    if (!GOOGLE_CLIENT_ID) {
      setError("Chưa cấu hình NEXT_PUBLIC_GOOGLE_CLIENT_ID để đăng nhập bằng Google.");
      return;
    }

    if (!googleReady || !window.google?.accounts?.id) {
      setError("Google đang tải, bạn thử lại sau vài giây.");
      return;
    }

    window.google.accounts.id.prompt();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = isLogin
        ? await login({ email: form.email, password: form.password, rememberMe })
        : await register({
            fullName: form.fullName,
            email: form.email,
            phone: form.phone,
            password: form.password,
            confirmPassword: form.confirmPassword,
          });

      if (isLogin && rememberMe) {
        window.localStorage.setItem(REMEMBER_KEY, JSON.stringify({ email: form.email, password: form.password }));
      } else {
        window.localStorage.removeItem(REMEMBER_KEY);
      }

      handleAuthSuccess(result.user, result.token);
      redirectAfterAuth(result.user.role);
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : t.auth.genericError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-ivory text-bark">
      <section className="mx-auto grid min-h-[calc(100vh-13rem)] max-w-6xl gap-10 px-5 py-14 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-20">
        <div className="relative overflow-hidden rounded-lg bg-wood px-8 py-10 text-ivory shadow-[0_24px_80px_rgba(45,33,24,0.18)] md:px-10 md:py-14">
          <div className="relative">
            <div className="mb-10 inline-flex rounded-sm bg-[#f4ead8] px-6 py-3">
              <Image
                src="/images/van-moc-logo-horizontal-original.png"
                alt="Van Moc"
                width={260}
                height={86}
                className="h-16 w-auto object-contain"
                priority
              />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-clay">{t.auth.account}</p>
            <h1 className="mt-5 font-serif text-5xl font-bold leading-[0.95] md:text-6xl">{t.auth.headline}</h1>
            <p className="mt-6 max-w-md text-base leading-8 text-sand">{t.auth.description}</p>
          </div>
        </div>

        <div className="rounded-lg border border-clay/20 bg-pearl p-6 shadow-[0_20px_70px_rgba(86,53,31,0.1)] md:p-10">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-clay">
              {isLogin ? t.auth.welcome : t.auth.start}
            </p>
            <h2 className="mt-3 font-serif text-4xl font-bold text-bark md:text-5xl">
              {isLogin ? t.auth.loginTitle : t.auth.registerTitle}
            </h2>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-wood" htmlFor="name">
                  {t.auth.fullName}
                </label>
                <input
                  id="name"
                  className="h-12 w-full rounded-full border border-clay/30 bg-ivory px-5 text-sm text-bark outline-none transition placeholder:text-horn/70 focus:border-wood focus:ring-4 focus:ring-clay/15"
                  onChange={(event) => setField("fullName")(event.target.value)}
                  placeholder={t.auth.fullNamePlaceholder}
                  required
                  type="text"
                  value={form.fullName}
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-wood" htmlFor="email">
                {t.auth.email}
              </label>
              <input
                id="email"
                className="h-12 w-full rounded-full border border-clay/30 bg-ivory px-5 text-sm text-bark outline-none transition placeholder:text-horn/70 focus:border-wood focus:ring-4 focus:ring-clay/15"
                onChange={(event) => setField("email")(event.target.value)}
                placeholder={t.auth.emailPlaceholder}
                required
                type="email"
                value={form.email}
              />
            </div>

            {!isLogin && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-wood" htmlFor="phone">
                  {t.auth.phone}
                </label>
                <input
                  id="phone"
                  className="h-12 w-full rounded-full border border-clay/30 bg-ivory px-5 text-sm text-bark outline-none transition placeholder:text-horn/70 focus:border-wood focus:ring-4 focus:ring-clay/15"
                  onChange={(event) => setField("phone")(event.target.value)}
                  placeholder={t.auth.phonePlaceholder}
                  type="tel"
                  value={form.phone}
                />
              </div>
            )}

            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <label className="block text-sm font-semibold text-wood" htmlFor="password">
                  {t.auth.password}
                </label>
                {isLogin && (
                  <Link href="/forgot-password" className="text-xs font-semibold text-clay underline-offset-4 hover:text-wood hover:underline">
                    {t.auth.forgotPassword}
                  </Link>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  className="h-12 w-full rounded-full border border-clay/30 bg-ivory px-5 pr-12 text-sm text-bark outline-none transition placeholder:text-horn/70 focus:border-wood focus:ring-4 focus:ring-clay/15"
                  onChange={(event) => setField("password")(event.target.value)}
                  placeholder={t.auth.passwordPlaceholder}
                  required
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                />
                <button
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  className="absolute right-4 top-1/2 inline-flex -translate-y-1/2 text-horn transition hover:text-wood"
                  onClick={() => setShowPassword((current) => !current)}
                  type="button"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-wood" htmlFor="confirm-password">
                  {t.auth.confirmPassword}
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    className="h-12 w-full rounded-full border border-clay/30 bg-ivory px-5 pr-12 text-sm text-bark outline-none transition placeholder:text-horn/70 focus:border-wood focus:ring-4 focus:ring-clay/15"
                    onChange={(event) => setField("confirmPassword")(event.target.value)}
                    placeholder={t.auth.confirmPasswordPlaceholder}
                    required
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                  />
                  <button
                    aria-label={showConfirmPassword ? "Ẩn mật khẩu nhập lại" : "Hiện mật khẩu nhập lại"}
                    className="absolute right-4 top-1/2 inline-flex -translate-y-1/2 text-horn transition hover:text-wood"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    type="button"
                  >
                    {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>
            )}

            {isLogin && (
              <label className="flex items-center gap-3 text-sm font-semibold text-horn">
                <input
                  checked={rememberMe}
                  className="size-4 accent-wood"
                  onChange={(event) => setRememberMe(event.target.checked)}
                  type="checkbox"
                />
                {t.auth.rememberPassword}
              </label>
            )}

            {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}

            <button
              className="h-12 w-full rounded-full bg-wood px-6 font-serif text-xl font-bold text-ivory transition hover:bg-bark disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? t.auth.processing : isLogin ? t.auth.loginTitle : t.auth.createAccount}
            </button>
          </form>

          <div className="my-7 flex items-center gap-4">
            <span className="h-px flex-1 bg-clay/25" />
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">{t.auth.or}</span>
            <span className="h-px flex-1 bg-clay/25" />
          </div>

          <button
            className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-clay/35 bg-white px-6 text-sm font-semibold text-wood transition hover:border-wood disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isGoogleSubmitting}
            onClick={handleGoogleSubmit}
            type="button"
          >
            <GoogleIcon />
            {t.auth.google}
          </button>

          <p className="mt-8 text-center text-sm text-horn">
            {isLogin ? t.auth.noAccount : t.auth.hasAccount}{" "}
            <Link href={isLogin ? "/register" : "/login"} className="font-bold text-wood underline-offset-4 hover:underline">
              {isLogin ? t.auth.registerNow : t.auth.loginTitle}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
