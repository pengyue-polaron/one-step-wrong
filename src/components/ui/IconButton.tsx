import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon: ReactNode;
  active?: boolean;
};

export function IconButton({ label, icon, active, className = "", ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`icon-button ${active ? "icon-button--active" : ""} ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
}
