import React from "react";
import { Link, type LinkProps } from "react-router-dom";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "subtle";
type Size = "sm" | "md" | "lg" | "icon";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand-700 text-white shadow-sm hover:bg-brand-800 active:bg-brand-900 disabled:bg-brand-300",
  secondary:
    "bg-secondary text-white shadow-sm hover:bg-secondary-hover disabled:bg-ink-faint",
  outline:
    "border border-line-strong bg-card text-ink-soft hover:border-ink-faint hover:bg-canvas hover:text-ink",
  ghost: "text-ink-soft hover:bg-sunken hover:text-ink",
  subtle: "bg-accent-soft text-accent hover:bg-brand-500/15",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-700 disabled:bg-red-300",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 gap-1.5 rounded-full px-4 text-sm",
  md: "h-11 gap-2 rounded-full px-5 text-[15px]",
  lg: "h-12 gap-2 rounded-full px-6 text-base",
  icon: "h-10 w-10 rounded-full",
};

export function buttonClasses(
  variant: Variant = "primary",
  size: Size = "md",
  extra = "",
) {
  // Press feedback (scale) is immediate; colors ease with the micro token.
  return `inline-flex select-none items-center justify-center whitespace-nowrap font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-micro ease-out active:scale-[0.97] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-70 ${VARIANTS[variant]} ${SIZES[size]} ${extra}`;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      loadingText,
      icon,
      iconRight,
      className = "",
      children,
      disabled,
      type = "button",
      ...rest
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses(variant, size, className)}
      {...rest}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        icon
      )}
      {loading && loadingText ? loadingText : children}
      {!loading && iconRight}
    </button>
  ),
);
Button.displayName = "Button";

interface ButtonLinkProps extends LinkProps {
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  className = "",
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...rest}>
      {icon}
      {children}
      {iconRight}
    </Link>
  );
}
