import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { orderService } from "../../services/order.service";
import { addressService } from "../../services/address.service";
import { Address } from "../../types";
import { formatCurrency } from "../../utils/format";
import { checkoutSchema, CheckoutFormData } from "../../utils/validation";
import { zodResolver } from "@hookform/resolvers/zod";

type ToastType = "success" | "error";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { total, items, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const buyNow = (location.state as { buyNow?: { productId: string; quantity: number; product: any } } | null)?.buyNow;
  const checkoutItems = buyNow
    ? [
        {
          id: buyNow.productId,
          product: buyNow.product,
          quantity: buyNow.quantity,
        },
      ]
    : items;
  const checkoutTotal = buyNow
    ? checkoutItems.reduce(
        (sum, item) => sum + (item.product.promotionalPrice || item.product.price) * item.quantity,
        0,
      )
    : total;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "MULTICAIXA_EXPRESS",
    },
  });

  const paymentMethod = watch("paymentMethod");

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const response = await addressService.getAll();
      if (response.data) {
        setAddresses(response.data);
        const defaultAddr = response.data.find((a) => a.isDefault);
        if (defaultAddr) {
          setValue("addressId", defaultAddr.id);
        }
      }
    } catch {
      // guest
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);
    try {
      const payload = buyNow
        ? {
            ...data,
            items: [{ productId: buyNow.productId, quantity: buyNow.quantity }],
          }
        : data;

      const response = await orderService.create(payload);
      if (response.data) {
        if (!buyNow) {
          clearCart();
        }
        setToast({
          message:
            "Pedido criado com sucesso. Acompanhe o estado na sua conta.",
          type: "success",
        });
        navigate(`/pedido/${response.data.id}`);
      }
    } catch (err: any) {
      setToast({
        message: err.response?.data?.message || "Erro ao finalizar compra",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl font-bold mb-8">Finalizar Compra</h1>

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
                  ? "Falha no checkout"
                  : "Pedido confirmado"}
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

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Endereço de Entrega</h2>
            {isLoadingAddresses ? (
              <p className="text-gray-500 text-sm">A carregar endereços...</p>
            ) : addresses.length > 0 ? (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${watch("addressId") === addr.id ? "border-primary-500 bg-primary-50" : ""}`}
                  >
                    <input
                      type="radio"
                      value={addr.id}
                      {...register("addressId")}
                      className="mt-1 mr-3"
                    />
                    <div className="text-sm">
                      <p className="font-medium">{addr.label || "Endereço"}</p>
                      <p className="text-gray-500">
                        {addr.street}
                        {addr.number ? `, ${addr.number}` : ""}
                      </p>
                      <p className="text-gray-500">
                        {addr.neighborhood}, {addr.city} - {addr.province}
                      </p>
                    </div>
                  </label>
                ))}
                {errors.addressId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.addressId.message}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm mb-4">
                  Nenhum endereço cadastrado.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/conta")}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Gerir endereços &rarr;
                </button>
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Método de Pagamento</h2>
            <div className="space-y-3">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="MULTICAIXA_EXPRESS"
                  {...register("paymentMethod")}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium">Multicaixa Express</p>
                  <p className="text-sm text-gray-500">
                    Pague via Multicaixa Express
                  </p>
                </div>
              </label>
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="CASH_ON_DELIVERY"
                  {...register("paymentMethod")}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium">Pagamento na Entrega</p>
                  <p className="text-sm text-gray-500">
                    Pague quando receber o produto
                  </p>
                </div>
              </label>
            </div>
            {errors.paymentMethod && (
              <p className="text-red-500 text-sm mt-1">
                {errors.paymentMethod.message}
              </p>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Observações</h2>
            <textarea
              {...register("notes")}
              className="input-field"
              rows={3}
              placeholder="Alguma observação sobre a entrega?"
            />
          </div>
        </div>

        <div className="card p-6 h-fit">
          <h2 className="text-lg font-semibold mb-4">Resumo do Pedido</h2>
          <div className="space-y-2 text-sm">
            {checkoutItems?.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-gray-600 truncate">
                  {item.product.name} x{item.quantity}
                </span>
                <span className="font-medium">
                  {formatCurrency(
                    (item.product.promotionalPrice || item.product.price) *
                      item.quantity,
                  )}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(checkoutTotal)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {paymentMethod === "MULTICAIXA_EXPRESS"
                ? "Após confirmar, será gerado um recibo para pagamento."
                : "Pagamento no momento da entrega."}
            </p>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full mt-6"
          >
            {isSubmitting ? "A processar..." : "Confirmar Pedido"}
          </button>
        </div>
      </form>
    </div>
  );
}
