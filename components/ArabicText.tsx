import clsx from "clsx";

interface ArabicTextProps {
  text: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  align?: "right" | "center";
}

// Sizes live in globals.css so the reader's Arabic-size preference (--arabic-scale) can scale them.
const sizeClasses = {
  sm: "arabic-sm",
  md: "arabic-md",
  lg: "arabic-lg",
  xl: "arabic-xl",
};

export default function ArabicText({ text, className, size = "md", align = "right" }: ArabicTextProps) {
  return (
    <p
      className={clsx(
        "arabic font-[family-name:var(--font-amiri)]",
        align === "center" ? "text-center" : "text-right",
        sizeClasses[size],
        className
      )}
      lang="ar"
      dir="rtl"
    >
      {text}
    </p>
  );
}
