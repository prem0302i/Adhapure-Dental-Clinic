import type { ReactNode } from "react";

interface SectionHeadingProps {
  title: string;
  children?: ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2";
}

export function SectionHeading({ title, children, align = "left", as = "h2" }: SectionHeadingProps) {
  const Tag = as;
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`max-w-2xl ${alignClass}`}>
      <Tag
        className={
          as === "h1"
            ? "text-3xl md:text-5xl text-balance"
            : "text-2xl md:text-4xl text-balance"
        }
      >
        {title}
      </Tag>
      {children && <p className="mt-4 text-muted md:text-lg">{children}</p>}
    </div>
  );
}
