import type { ButtonHTMLAttributes, ReactNode } from "react";

type PixelButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "quiet" | "danger";
  icon?: ReactNode;
};

export function PixelButton({
  variant = "secondary",
  icon,
  className = "",
  children,
  ...props
}: PixelButtonProps) {
  return (
    <button className={`pixel-button pixel-button--${variant} ${className}`} {...props}>
      {icon}
      <span>{children}</span>
    </button>
  );
}
