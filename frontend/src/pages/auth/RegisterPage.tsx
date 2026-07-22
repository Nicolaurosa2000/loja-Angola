import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { registerSchema, RegisterFormData } from "../../utils/validation";

type ToastType = "success" | "error";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      await registerUser(data);
      setToast({
        message: "Conta criada com sucesso. Bem-vindo!",
        type: "success",
      });
      navigate("/");
    } catch (err: any) {
      setToast({
        message: err.response?.data?.message || "Erro ao registar",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-6">Criar Conta</h1>

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
                {toast.type === "error"
                  ? "Falha ao registar"
                  : "Registo concluído"}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome
          </label>
          <input
            type="text"
            {...register("name")}
            className="input-field"
            placeholder="Seu nome"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            {...register("email")}
            className="input-field"
            placeholder="seu@email.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefone (opcional)
          </label>
          <input
            type="tel"
            {...register("phone")}
            className="input-field"
            placeholder="+244 900 000 000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Senha
          </label>
          <input
            type="password"
            {...register("password")}
            className="input-field"
            placeholder="Mínimo 6 caracteres"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirmar Senha
          </label>
          <input
            type="password"
            {...register("confirmPassword")}
            className="input-field"
            placeholder="Repita a senha"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full"
        >
          {isSubmitting ? "A registar..." : "Criar Conta"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Já tem conta?{" "}
        <Link
          to="/login"
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
