"use client";

import Link from "next/link";
import { MAX_NOTE_CHARS, useJournal } from "@/lib/journal";
import { useT } from "@/lib/i18n/useT";

/** Private reflection box for one verse. Saves as you type; nothing leaves the browser. */
export default function JournalNote({ surah, ayah }: { surah: number; ayah: number }) {
  const t = useT();
  const { notes, setNote } = useJournal();
  const id = `${surah}:${ayah}`;
  const value = notes[id] ?? "";

  return (
    <section className="mt-8">
      <label htmlFor={`note-${id}`} className="block text-gold text-xs uppercase tracking-widest mb-2">
        {t("journal.label")}
      </label>
      <textarea
        id={`note-${id}`}
        value={value}
        onChange={(e) => setNote(id, e.target.value)}
        maxLength={MAX_NOTE_CHARS}
        rows={4}
        placeholder={t("journal.placeholder")}
        className="w-full rounded-2xl border border-gold/30 bg-surface-2 px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-ink/40 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/30 resize-y"
      />
      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-ink/50">
        <span>{t("journal.privacy")}</span>
        <span className="flex items-center gap-3">
          {value && (
            <span>
              {value.length}/{MAX_NOTE_CHARS}
            </span>
          )}
          <Link href="/journal" className="text-heading hover:underline">
            {t("journal.viewAll")}
          </Link>
        </span>
      </div>
    </section>
  );
}
