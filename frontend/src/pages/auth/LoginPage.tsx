import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { loginSchema, LoginFormData } from "../../utils/validation";

type ToastType = "success" | "error";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      setToast({
        message: "Login efetuado com sucesso.",
        type: "success",
      });
      const redirectTo = new URLSearchParams(location.search).get("redirect") || "/";
      window.setTimeout(() => navigate(redirectTo, { state: location.state }), 1200);
    } catch (err: any) {
      const backendMessage = err.response?.data?.message;
      setToast({
        message:
          backendMessage ||
          "Não foi possível entrar. Verifique o email e a senha.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-center text-2xl font-bold">Entrar</h1>

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
          <div className="flex items-start gap-3">
            <div
              className={`rounded-full p-2 ${toast.type === "error" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}
            >
              {toast.type === "error" ? (
                <AlertCircle className="h-5 w-5" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">
                {toast.type === "error" ? "Falha ao entrar" : "Login realizado"}
              </p>
              <p className="mt-1 text-sm text-slate-600">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            {...register("email")}
            className="input-field"
            placeholder="seu@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Senha
          </label>
          <input
            type="password"
            {...register("password")}
            className="input-field"
            placeholder="Sua senha"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full"
        >
          {isSubmitting ? "A entrar..." : "Entrar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Ainda não tem conta?{" "}
        <Link
          to="/registar"
          className="font-medium text-primary-600 hover:text-primary-700"
        >
          Registar-se
        </Link>
      </p>
    </div>
  );
}
