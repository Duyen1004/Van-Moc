"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { forgotPassword, resetPassword } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"request" | "reset">("request");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSubmitting(true);

    try {
      const result = await forgotPassword(email);
      setMessage(result.message);
      setStep("reset");
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : t.forgot.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSubmitting(true);

    try {
      const result = await resetPassword({ email, resetCode, password, confirmPassword });
      setMessage(result.message);
      setPassword("");
      setConfirmPassword("");
      setResetCode("");
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : t.forgot.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-ivory px-5 py-16 text-bark md:px-10">
      <section className="mx-auto max-w-xl rounded-lg border border-clay/20 bg-pearl p-7 shadow-[0_20px_70px_rgba(86,53,31,0.1)] md:p-10">
        <div className="text-center">
          <Image
            src="/images/van-moc-logo-horizontal-original.png"
            alt="Van Moc"
            width={260}
            height={86}
            className="mx-auto h-16 w-auto object-contain"
            priority
          />
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.32em] text-clay">{t.auth.account}</p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-bark md:text-5xl">{t.forgot.title}</h1>
          <p className="mt-4 text-sm leading-7 text-horn">{t.forgot.description}</p>
        </div>

        {step === "request" ? <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-wood">{t.auth.email}</span>
            <input
              className="h-12 w-full rounded-full border border-clay/30 bg-ivory px-5 text-sm text-bark outline-none transition placeholder:text-horn/70 focus:border-wood focus:ring-4 focus:ring-clay/15"
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t.auth.emailPlaceholder}
              required
              type="email"
              value={email}
            />
          </label>

          {message ? <p className="rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">{message}</p> : null}
          {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}

          <button
            className="h-12 w-full rounded-full bg-wood px-6 font-serif text-xl font-bold text-ivory transition hover:bg-bark disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? t.forgot.sending : t.forgot.submit}
          </button>
        </form> : (
          <form className="mt-8 space-y-5" onSubmit={handleReset}>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-wood">{t.auth.email}</span>
              <input
                className="h-12 w-full rounded-full border border-clay/30 bg-ivory px-5 text-sm text-bark outline-none transition placeholder:text-horn/70 focus:border-wood focus:ring-4 focus:ring-clay/15"
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t.auth.emailPlaceholder}
                required
                type="email"
                value={email}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-wood">Mã đặt lại mật khẩu</span>
              <input
                className="h-12 w-full rounded-full border border-clay/30 bg-ivory px-5 text-sm text-bark outline-none transition placeholder:text-horn/70 focus:border-wood focus:ring-4 focus:ring-clay/15"
                onChange={(event) => setResetCode(event.target.value)}
                placeholder="VM-RESET-2026"
                required
                value={resetCode}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-wood">Mật khẩu mới</span>
              <div className="relative">
                <input
                  className="h-12 w-full rounded-full border border-clay/30 bg-ivory px-5 pr-12 text-sm text-bark outline-none transition placeholder:text-horn/70 focus:border-wood focus:ring-4 focus:ring-clay/15"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button className="absolute right-4 top-1/2 inline-flex -translate-y-1/2 text-horn transition hover:text-wood" onClick={() => setShowPassword((current) => !current)} type="button">
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-wood">Nhập lại mật khẩu</span>
              <div className="relative">
                <input
                  className="h-12 w-full rounded-full border border-clay/30 bg-ivory px-5 pr-12 text-sm text-bark outline-none transition placeholder:text-horn/70 focus:border-wood focus:ring-4 focus:ring-clay/15"
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  required
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                />
                <button className="absolute right-4 top-1/2 inline-flex -translate-y-1/2 text-horn transition hover:text-wood" onClick={() => setShowConfirmPassword((current) => !current)} type="button">
                  {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </label>

            {message ? <p className="rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">{message}</p> : null}
            {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}

            <button className="h-12 w-full rounded-full bg-wood px-6 font-serif text-xl font-bold text-ivory transition hover:bg-bark disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
            </button>
            <button className="h-11 w-full rounded-full border border-clay/30 px-6 text-sm font-semibold text-wood transition hover:bg-sand" onClick={() => setStep("request")} type="button">
              Gửi lại mã
            </button>
          </form>
        )}

        <p className="mt-7 text-center text-sm text-horn">
          {t.forgot.remembered}{" "}
          <Link href="/login" className="font-bold text-wood underline-offset-4 hover:underline">
            {t.common.login}
          </Link>
        </p>
      </section>
    </main>
  );
}
