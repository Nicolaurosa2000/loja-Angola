import type { LucideIcon } from "lucide-react";

interface IconActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: "edit" | "delete" | "success" | "neutral" | "warning";
  disabled?: boolean;
  title?: string;
}

const variantClasses = {
  edit: "text-blue-600 hover:bg-blue-50 hover:text-blue-700",
  delete: "text-red-600 hover:bg-red-50 hover:text-red-700",
  success: "text-green-600 hover:bg-green-50 hover:text-green-700",
  neutral: "text-gray-600 hover:bg-gray-100 hover:text-gray-800",
  warning: "text-amber-600 hover:bg-amber-50 hover:text-amber-700",
};

export default function IconActionButton({
  icon: Icon,
  label,
  onClick,
  variant = "neutral",
  disabled = false,
  title,
}: IconActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title ?? label}
      aria-label={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${variantClasses[variant]} ${disabled ? "cursor-not-allowed opacity-50" : "hover:-translate-y-0.5 hover:shadow-sm"}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
