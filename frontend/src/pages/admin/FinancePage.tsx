import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  BadgeDollarSign,
  CircleDollarSign,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";
import { financeService } from "../../services/finance.service";
import { formatCurrency, formatDate } from "../../utils/format";

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
  PAID: { label: "Pago", color: "bg-emerald-100 text-emerald-800" },
  FAILED: { label: "Falhou", color: "bg-red-100 text-red-800" },
  REFUNDED: { label: "Reembolsado", color: "bg-slate-100 text-slate-700" },
};

export default function FinancePage() {
  const [period, setPeriod] = useState("30d");

  const { data, isLoading } = useQuery({
    queryKey: ["finance", period],
    queryFn: () => financeService.getOverview(period),
  });

  const { data: transactionsData } = useQuery({
    queryKey: ["finance-transactions"],
    queryFn: () => financeService.getTransactions(8),
  });

  const overview = data?.data;
  const transactions = transactionsData?.data || [];
  const revenueByPeriod = overview?.revenueByPeriod || [];
  const paymentMethods = overview?.paymentMethods || [];
  const maxRevenue = Math.max(
    ...revenueByPeriod.map((item) => item.revenue),
    1,
  );

  const periods = [
    { value: "7d", label: "7 Dias" },
    { value: "30d", label: "30 Dias" },
    { value: "90d", label: "90 Dias" },
  ];

  const summaryItems = [
    {
      label: "Receita total",
      value: formatCurrency(overview?.totalRevenue || 0),
      icon: CircleDollarSign,
      accent: "bg-emerald-500/10 text-emerald-700",
    },
    {
      label: "Pendente",
      value: formatCurrency(overview?.pendingRevenue || 0),
      icon: WalletCards,
      accent: "bg-amber-500/10 text-amber-700",
    },
    {
      label: "Reembolsos",
      value: formatCurrency(overview?.refundedAmount || 0),
      icon: ArrowUpRight,
      accent: "bg-rose-500/10 text-rose-700",
    },
    {
      label: "Ticket médio",
      value: formatCurrency(overview?.averageOrderValue || 0),
      icon: BadgeDollarSign,
      accent: "bg-sky-500/10 text-sky-700",
    },
  ];

  if (isLoading) {
    return (
      <div className="py-10 text-center text-slate-500">
        A carregar dados financeiros...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-800 to-slate-700 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
              Módulo financeiro
            </p>
            <h1 className="mt-2 text-2xl font-semibold">Finanças</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Acompanhe receitas, pagamentos pendentes e movimentos recentes da
              loja.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {periods.map((item) => (
              <button
                key={item.value}
                onClick={() => setPeriod(item.value)}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                  period === item.value
                    ? "bg-white text-slate-900"
                    : "border border-white/20 bg-white/10 text-slate-200 hover:bg-white/20"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">
                    {item.value}
                  </p>
                </div>
                <div className={`rounded-2xl p-3 ${item.accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Receita por dia
              </h2>
              <p className="text-sm text-slate-500">
                Evolução da receita no período selecionado.
              </p>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-600">
              {overview?.transactionCount || 0} movimentos
            </div>
          </div>

          {revenueByPeriod.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nenhum movimento financeiro encontrado.
            </p>
          ) : (
            <div className="space-y-2">
              {revenueByPeriod.map((item) => (
                <div key={item.date} className="flex items-center gap-3">
                  <span className="w-24 text-sm text-slate-500">
                    {item.date}
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                  <span className="w-24 text-right text-sm font-semibold text-slate-700">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Métodos de pagamento
          </h2>
          <div className="mt-4 space-y-3">
            {paymentMethods.length === 0 ? (
              <p className="text-sm text-slate-500">
                Ainda não há dados de pagamento.
              </p>
            ) : (
              paymentMethods.map((item) => (
                <div
                  key={item.method}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5"
                >
                  <span className="text-sm font-medium text-slate-700">
                    {item.method}
                  </span>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatCurrency(item.amount)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.count} operação(ões)
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Movimentos recentes
            </h2>
            <p className="text-sm text-slate-500">
              Últimas transações e pagamentos registrados.
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            Ver pedidos
          </Link>
        </div>

        {transactions.length === 0 ? (
          <p className="text-sm text-slate-500">
            Nenhuma transação disponível.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-3 py-3 font-medium">Transação</th>
                  <th className="px-3 py-3 font-medium">Pedido</th>
                  <th className="px-3 py-3 font-medium">Cliente</th>
                  <th className="px-3 py-3 font-medium">Método</th>
                  <th className="px-3 py-3 font-medium">Valor</th>
                  <th className="px-3 py-3 font-medium">Estado</th>
                  <th className="px-3 py-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => {
                  const status = statusLabels[transaction.status] || {
                    label: transaction.status,
                    color: "bg-slate-100 text-slate-700",
                  };
                  return (
                    <tr
                      key={transaction.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-3 py-3 font-medium text-slate-900">
                        {transaction.id.slice(0, 8)}
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {transaction.order?.orderNumber || "—"}
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {transaction.order?.user?.name || "—"}
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {transaction.method}
                      </td>
                      <td className="px-3 py-3 font-semibold text-slate-900">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-500">
                        {formatDate(transaction.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
