import clsx from "clsx";

interface ArabicTextProps {
  text: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  align?: "right" | "center";
}

const sizeClasses = {
  sm: "text-xl sm:text-2xl leading-9 sm:leading-10",
  md: "text-2xl sm:text-3xl leading-[2.5rem] sm:leading-[3rem]",
  lg: "text-3xl sm:text-4xl leading-[3rem] sm:leading-[3.5rem]",
  xl: "text-3xl sm:text-4xl md:text-5xl leading-[3rem] sm:leading-[3.5rem] md:leading-[4.5rem]",
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
