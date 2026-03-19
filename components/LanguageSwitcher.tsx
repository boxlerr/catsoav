"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useTransition } from "react";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (nextLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <div className="flex gap-2 text-xs font-bold tracking-widest">
      <button
        onClick={() => switchLocale("es")}
        disabled={isPending}
        className={`${
          locale === "es" ? "text-white" : "text-white/40 hover:text-white"
        } transition-colors uppercase`}
      >
        ES
      </button>
      <span className="text-white/20">|</span>
      <button
        onClick={() => switchLocale("en")}
        disabled={isPending}
        className={`${
          locale === "en" ? "text-white" : "text-white/40 hover:text-white"
        } transition-colors uppercase`}
      >
        EN
      </button>
    </div>
  );
}
