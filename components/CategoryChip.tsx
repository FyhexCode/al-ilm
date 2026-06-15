"use client";

import Link from "next/link";
import clsx from "clsx";

interface CategoryChipProps {
  slug: string;
  label: string;
  icon?: string;
  active?: boolean;
  href?: string;
}

export default function CategoryChip({ slug, label, icon, active, href }: CategoryChipProps) {
  const classes = clsx(
    "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer select-none",
    active
      ? "bg-gold text-dark shadow-md"
      : "bg-cream-dark text-primary border border-gold/30 hover:border-gold hover:bg-gold/10"
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {icon && <span>{icon}</span>}
        {label}
      </Link>
    );
  }

  return (
    <span className={classes} data-slug={slug}>
      {icon && <span>{icon}</span>}
      {label}
    </span>
  );
}
