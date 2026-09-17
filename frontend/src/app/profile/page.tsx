"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

type ProfileUser = {
  fullName: string;
  email: string;
  phone?: string;
  role: "CUSTOMER" | "STAFF" | "ADMIN";
  status: string;
};

const AUTH_USER_KEY = "vanmoc-auth-user";

export default function ProfilePage() {
  const { t } = useI18n();
  const [user, setUser] = useState<ProfileUser | null>(null);

  useEffect(() => {
    const userJson = window.localStorage.getItem(AUTH_USER_KEY);
    if (!userJson) {
      return;
    }

    try {
      setUser(JSON.parse(userJson) as ProfileUser);
    } catch {
      window.localStorage.removeItem(AUTH_USER_KEY);
    }
  }, []);

  if (!user) {
    return (
      <main className="bg-ivory px-5 py-16 text-bark md:px-10">
        <section className="mx-auto max-w-xl rounded-lg border border-clay/20 bg-pearl p-8 text-center">
          <h1 className="font-serif text-4xl font-bold">{t.profile.notLoggedIn}</h1>
          <Link className="mt-6 inline-flex rounded-full bg-wood px-7 py-3 font-semibold text-ivory" href="/login">
            {t.common.login}
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-ivory px-5 py-16 text-bark md:px-10">
      <section className="mx-auto max-w-4xl rounded-lg border border-clay/20 bg-pearl p-8 shadow-[0_20px_70px_rgba(86,53,31,0.1)] md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-clay">{t.profile.title}</p>
        <h1 className="mt-3 font-serif text-5xl font-bold text-bark">{user.fullName}</h1>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-ivory p-5">
            <p className="text-xs font-semibold uppercase text-horn">Email</p>
            <p className="mt-2 font-semibold text-wood">{user.email}</p>
          </div>
          <div className="rounded-lg bg-ivory p-5">
            <p className="text-xs font-semibold uppercase text-horn">{t.profile.phone}</p>
            <p className="mt-2 font-semibold text-wood">{user.phone || t.profile.notUpdated}</p>
          </div>
          <div className="rounded-lg bg-ivory p-5">
            <p className="text-xs font-semibold uppercase text-horn">{t.profile.role}</p>
            <p className="mt-2 font-semibold text-wood">{user.role}</p>
          </div>
          <div className="rounded-lg bg-ivory p-5">
            <p className="text-xs font-semibold uppercase text-horn">{t.profile.status}</p>
            <p className="mt-2 font-semibold text-wood">{user.status}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {user.role === "ADMIN" ? (
            <Link className="rounded-full bg-wood px-6 py-3 font-semibold text-ivory" href="/admin">
              {t.profile.goAdmin}
            </Link>
          ) : null}
          {user.role === "STAFF" ? (
            <Link className="rounded-full bg-wood px-6 py-3 font-semibold text-ivory" href="/staff">
              {t.profile.goStaff}
            </Link>
          ) : null}
          <Link className="rounded-full border border-clay/35 px-6 py-3 font-semibold text-wood" href="/products">
            {t.common.continueShopping}
          </Link>
        </div>
      </section>
    </main>
  );
}
