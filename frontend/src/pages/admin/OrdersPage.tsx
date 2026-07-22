import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import {
  adminOrderService,
  AdminOrder,
} from "../../services/admin-order.service";
import { formatCurrency, formatDate, formatDateTime } from "../../utils/format";
import IconActionButton from "../../components/ui/IconActionButton";

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
  AWAITING_PAYMENT: {
    label: "Aguard. Pagamento",
    color: "bg-orange-100 text-orange-800",
  },
  PAID: { label: "Pago", color: "bg-blue-100 text-blue-800" },
  SEPARATING: { label: "Em Separação", color: "bg-indigo-100 text-indigo-800" },
  SHIPPED: { label: "Enviado", color: "bg-purple-100 text-purple-800" },
  IN_TRANSIT: { label: "Em Trânsito", color: "bg-cyan-100 text-cyan-800" },
  DELIVERED: { label: "Entregue", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Cancelado", color: "bg-red-100 text-red-800" },
  REFUNDED: { label: "Reembolsado", color: "bg-gray-100 text-gray-800" },
};

const paymentStatusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
  PAID: { label: "Pago", color: "bg-green-100 text-green-800" },
  FAILED: { label: "Falhou", color: "bg-red-100 text-red-800" },
  REFUNDED: { label: "Reembolsado", color: "bg-gray-100 text-gray-800" },
};

const statusFlow = [
  "PENDING",
  "AWAITING_PAYMENT",
  "PAID",
  "SEPARATING",
  "SHIPPED",
  "IN_TRANSIT",
  "DELIVERED",
];

const extractProofUrl = (notes?: string) => {
  if (!notes) return null;
  const match = notes.match(/https?:\/\/[^\s)]+|\/uploads\/[^\s)]+/);
  return match ? match[0].replace(/[.,;]+$/, "") : null;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const response = await adminOrderService.getAll({
        page,
        limit: 20,
        search: search || undefined,
        status: statusFilter || undefined,
        paymentStatus: paymentFilter || undefined,
      });
      if (response.data) setOrders(response.data);
      if (response.meta) setTotalPages(response.meta.totalPages);
    } catch {
      setError("Erro ao carregar pedidos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [page, statusFilter, paymentFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadOrders();
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    setIsUpdating(true);
    try {
      await adminOrderService.updateStatus(id, { status });
      loadOrders();
      if (selectedOrder?.id === id) {
        const updated = await adminOrderService.getById(id);
        if (updated.data) setSelectedOrder(updated.data);
      }
    } catch {
      setError("Erro ao atualizar status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePayment = async (id: string, paymentStatus: string) => {
    setIsUpdating(true);
    try {
      await adminOrderService.updatePayment(id, { paymentStatus });
      loadOrders();
      if (selectedOrder?.id === id) {
        const updated = await adminOrderService.getById(id);
        if (updated.data) setSelectedOrder(updated.data);
      }
    } catch {
      setError("Erro ao atualizar pagamento");
    } finally {
      setIsUpdating(false);
    }
  };

  const nextStatus = (current: string): string | null => {
    const idx = statusFlow.indexOf(current);
    if (idx >= 0 && idx < statusFlow.length - 1) return statusFlow[idx + 1];
    return null;
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((order) =>
    ["PENDING", "AWAITING_PAYMENT"].includes(order.status),
  ).length;
  const paidOrders = orders.filter(
    (order) => order.paymentStatus === "PAID",
  ).length;
  const deliveredOrders = orders.filter(
    (order) => order.status === "DELIVERED",
  ).length;

  if (selectedOrder) {
    const s = statusLabels[selectedOrder.status] || {
      label: selectedOrder.status,
      color: "bg-gray-100",
    };
    const ps = paymentStatusLabels[
      selectedOrder.paymentStatus || "PENDING"
    ] || { label: "Pendente", color: "bg-yellow-100" };

    const proofUrl = extractProofUrl(selectedOrder.notes);

    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedOrder(null)}
          className="inline-flex items-center text-sm font-semibold text-slate-600 transition hover:text-slate-900"
        >
          ← Voltar à lista
        </button>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
                Pedido detalhado
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                Pedido #{selectedOrder.orderNumber}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {formatDateTime(selectedOrder.createdAt)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${s.color}`}
              >
                {s.label}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${ps.color}`}
              >
                Pag: {ps.label}
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Itens do pedido
                </p>
                <div className="mt-3 space-y-3">
                  {selectedOrder.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          Qty: {item.quantity} ×{" "}
                          {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Resumo</p>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Desconto</span>
                      <span>
                        -{formatCurrency(selectedOrder.discountAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900">
                    <span>Total</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {selectedOrder.user && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Cliente
                  </p>
                  <p className="mt-2 text-sm text-slate-900">
                    {selectedOrder.user.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {selectedOrder.user.email}
                  </p>
                  {selectedOrder.user.phone && (
                    <p className="text-sm text-slate-500">
                      {selectedOrder.user.phone}
                    </p>
                  )}
                </div>
              )}

              {selectedOrder.address && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Endereço de entrega
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {selectedOrder.address.street}
                    {selectedOrder.address.number
                      ? `, ${selectedOrder.address.number}`
                      : ""}
                  </p>
                  <p className="text-sm text-slate-600">
                    {selectedOrder.address.neighborhood},{" "}
                    {selectedOrder.address.city} -{" "}
                    {selectedOrder.address.province}
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Atualizar estado
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {statusFlow.map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                      disabled={isUpdating || selectedOrder.status === st}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        selectedOrder.status === st
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      } disabled:opacity-50`}
                    >
                      {statusLabels[st]?.label || st}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedOrder.id, "CANCELLED")
                    }
                    disabled={
                      isUpdating || selectedOrder.status === "CANCELLED"
                    }
                    className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-900">
                  Estado do pagamento
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["PENDING", "PAID", "FAILED", "REFUNDED"].map((psKey) => (
                    <button
                      key={psKey}
                      onClick={() =>
                        handleUpdatePayment(selectedOrder.id, psKey)
                      }
                      disabled={
                        isUpdating || selectedOrder.paymentStatus === psKey
                      }
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        selectedOrder.paymentStatus === psKey
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      } disabled:opacity-50`}
                    >
                      {paymentStatusLabels[psKey]?.label || psKey}
                    </button>
                  ))}
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Observações
                  </p>
                  <p className="mt-2 text-sm text-slate-600 whitespace-pre-line">
                    {selectedOrder.notes.replace(/Comprovativo:\s*\/uploads\/[^\s]+/g, "").trim()}
                  </p>
                  {proofUrl && (
                    <button
                      type="button"
                      onClick={() => setProofPreviewUrl(proofUrl)}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                    >
                      Exibir comprovativo
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {proofPreviewUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-3xl rounded-[24px] border border-slate-200 bg-white p-4 shadow-2xl">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-900">
                  Comprovativo do pedido
                </h3>
                <button
                  type="button"
                  onClick={() => setProofPreviewUrl(null)}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Fechar
                </button>
              </div>
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <img
                  src={proofPreviewUrl}
                  alt="Comprovativo do pedido"
                  className="max-h-[70vh] w-full object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
              Operação
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              Pedidos
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Acompanhe o fluxo de compras, pagamentos e entregas com uma visão
              mais clara.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
            >
              <option value="">Todos os estados</option>
              {Object.entries(statusLabels).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
            >
              <option value="">Todos os pagamentos</option>
              {Object.entries(paymentStatusLabels).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Total</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {totalOrders}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-700">Pendentes</p>
            <p className="mt-1 text-xl font-semibold text-amber-800">
              {pendingOrders}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-emerald-50 p-4">
            <p className="text-sm text-emerald-700">Pagos</p>
            <p className="mt-1 text-xl font-semibold text-emerald-800">
              {paidOrders}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-sky-50 p-4">
            <p className="text-sm text-sky-700">Entregues</p>
            <p className="mt-1 text-xl font-semibold text-sky-800">
              {deliveredOrders}
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSearch}
        className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm"
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por nº pedido, cliente, email..."
          className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-400"
        />
      </form>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
          A carregar pedidos...
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
          Nenhum pedido encontrado.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const s = statusLabels[order.status] || {
              label: order.status,
              color: "bg-slate-100 text-slate-700",
            };
            const ps = paymentStatusLabels[
              order.paymentStatus || "PENDING"
            ] || {
              label: "Pendente",
              color: "bg-amber-100 text-amber-700",
            };
            const proofUrl = extractProofUrl(order.notes);
            return (
              <div
                key={order.id}
                className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        #{order.orderNumber}
                      </span>
                      <span className="text-sm text-slate-500">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 font-medium text-slate-900">
                      {order.user?.name || "Cliente sem nome"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {order.user?.email || "—"} • {order.items?.length || 0}{" "}
                      itens
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${s.color}`}
                    >
                      {s.label}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${ps.color}`}
                    >
                      Pag: {ps.label}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {formatCurrency(order.total)}
                    </span>
                    {proofUrl && (
                      <button
                        type="button"
                        onClick={() => setProofPreviewUrl(proofUrl)}
                        className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        Exibir comprovativo
                      </button>
                    )}
                    <IconActionButton
                      icon={Eye}
                      label="Ver pedido"
                      onClick={() => setSelectedOrder(order)}
                      variant="neutral"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
          >
            Seguinte
          </button>
        </div>
      )}
    </div>
  );
}
