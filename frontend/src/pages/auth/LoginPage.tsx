import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../contexts/AuthContext";
import { loginSchema, LoginFormData } from "../../utils/validation";
import Toast, { useToast } from "../../components/Toast";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { toast, showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      showToast({
        message: "Login efetuado com sucesso.",
        type: "success",
        title: "Login realizado",
      });
      const redirectTo = new URLSearchParams(location.search).get("redirect") || "/";
      window.setTimeout(() => navigate(redirectTo, { state: location.state }), 1200);
    } catch (err: any) {
      const backendMessage = err.response?.data?.message;
      showToast({
        message:
          backendMessage ||
          "Não foi possível entrar. Verifique o email e a senha.",
        type: "error",
        title: "Falha ao entrar",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-center text-2xl font-bold">Entrar</h1>

      {toast && (
        <Toast toast={toast} onClose={() => showToast(null)} />
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
