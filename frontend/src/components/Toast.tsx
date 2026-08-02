import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

export interface ToastData {
  message: string;
  type: "success" | "error";
  title?: string;
}

export function useToast(duration = 3600) {
  const [toast, setToast] = useState<ToastData | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), duration);
    return () => window.clearTimeout(timer);
  }, [toast, duration]);

  return { toast, showToast: setToast };
}

export default function Toast({
  toast,
  onClose,
}: {
  toast: ToastData;
  onClose: () => void;
}) {
  const title =
    toast.title ||
    (toast.type === "error" ? "Ocorreu um erro" : "Operação concluída");

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
      <div className="flex items-start gap-3">
        <div
          className={`rounded-full p-2 ${
            toast.type === "error"
              ? "bg-red-50 text-red-600"
              : "bg-emerald-50 text-emerald-600"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle className="h-5 w-5" />
          ) : (
            <CheckCircle2 className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-sm text-slate-600">{toast.message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
