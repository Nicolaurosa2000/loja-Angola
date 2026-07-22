import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Boxes,
  CircleDollarSign,
  Eye,
  Package2,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { dashboardService } from "../../services/dashboard.service";
import { formatCurrency, formatDate } from "../../utils/format";
import { Link } from "react-router-dom";
import IconActionButton from "../../components/ui/IconActionButton";

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendente", color: "bg-amber-50 text-amber-700" },
  PAID: { label: "Pago", color: "bg-sky-50 text-sky-700" },
  SEPARATING: { label: "Em Separação", color: "bg-violet-50 text-violet-700" },
  SHIPPED: { label: "Enviado", color: "bg-fuchsia-50 text-fuchsia-700" },
  IN_TRANSIT: { label: "Em Trânsito", color: "bg-cyan-50 text-cyan-700" },
  DELIVERED: { label: "Entregue", color: "bg-emerald-50 text-emerald-700" },
  CANCELLED: { label: "Cancelado", color: "bg-rose-50 text-rose-700" },
};

export default function DashboardPage() {
  const [period, setPeriod] = useState("30d");

  const { data: overviewData, isLoading } = useQuery({
    queryKey: ["dashboard", period],
    queryFn: () => dashboardService.getOverview(period),
  });

  const { data: recentOrdersData } = useQuery({
    queryKey: ["dashboard-recent-orders"],
    queryFn: () => dashboardService.getRecentOrders(5),
  });

  const overview = overviewData?.data;
  const recentOrders = recentOrdersData?.data || [];
  const topProducts = overview?.topProducts || [];
  const revenueByPeriod = overview?.revenueByPeriod || [];
  const ordersByStatus = overview?.ordersByStatus || [];
  const maxRevenue = Math.max(...revenueByPeriod.map((r) => r.revenue), 1);
  const totalStatusCount = ordersByStatus.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  const periods = [
    { value: "7d", label: "7 Dias" },
    { value: "30d", label: "30 Dias" },
    { value: "90d", label: "90 Dias" },
  ];

  const stats = [
    {
      label: "Receita Total",
      value: formatCurrency(
        overview?.totalRevenue || overview?.totalSales || 0,
      ),
      detail: "Fluxo de vendas consolidado",
      icon: CircleDollarSign,
      accent: "bg-emerald-500/10 text-emerald-700",
    },
    {
      label: "Pedidos",
      value: String(overview?.totalOrders || 0),
      detail: "Ativos e concluídos",
      icon: ShoppingBag,
      accent: "bg-sky-500/10 text-sky-700",
    },
    {
      label: "Clientes",
      value: String(overview?.totalCustomers || 0),
      detail: "Base em crescimento",
      icon: Users,
      accent: "bg-violet-500/10 text-violet-700",
    },
    {
      label: "Produtos",
      value: String(overview?.totalProducts || 0),
      detail: "Disponíveis no catálogo",
      icon: Package2,
      accent: "bg-amber-500/10 text-amber-700",
    },
  ];

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
        A carregar painel...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_20px_60px_-20px_rgba(15,23,42,0.45)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
              <Sparkles className="h-3.5 w-3.5" />
              Visão geral
            </div>
            <h1 className="mt-3 text-2xl font-semibold">Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Acompanhe o desempenho da loja, pedidos, clientes e receitas com
              uma visão mais clara e objetiva.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                  period === p.value
                    ? "bg-white text-slate-900 shadow-sm"
                    : "border border-white/20 bg-white/10 text-slate-200 hover:bg-white/20"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Receita
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {formatCurrency(
                overview?.totalRevenue || overview?.totalSales || 0,
              )}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Foco do dia
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {overview?.totalOrders || 0} pedidos
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Estado geral
            </p>
            <p className="mt-2 text-2xl font-semibold">Operação saudável</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{stat.detail}</p>
                </div>
                <div className={`rounded-2xl p-3 ${stat.accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Receita por período
              </h2>
              <p className="text-sm text-slate-500">
                Evolução da receita nas últimas entradas.
              </p>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-600">
              {period}
            </div>
          </div>

          {revenueByPeriod.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum dado disponível.</p>
          ) : (
            <div className="space-y-3">
              {revenueByPeriod.map((item) => (
                <div key={item.date} className="flex items-center gap-3">
                  <span className="w-24 text-sm text-slate-500">
                    {item.date}
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-slate-900 via-slate-700 to-amber-500"
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
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Pedidos por estado
              </h2>
              <p className="text-sm text-slate-500">
                Distribuição do fluxo atual.
              </p>
            </div>
            <div className="rounded-full bg-slate-50 px-3 py-1 text-sm text-slate-600">
              {totalStatusCount} total
            </div>
          </div>

          {ordersByStatus.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum dado disponível.</p>
          ) : (
            <div className="space-y-3">
              {ordersByStatus.map((item) => {
                const s = statusLabels[item.status] || {
                  label: item.status,
                  color: "bg-slate-100 text-slate-700",
                };
                const percentage =
                  totalStatusCount > 0
                    ? (item.count / totalStatusCount) * 100
                    : 0;

                return (
                  <div
                    key={item.status}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${s.color}`}
                      >
                        {s.label}
                      </span>
                      <span className="text-sm font-semibold text-slate-700">
                        {item.count}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-slate-900 to-slate-600"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Últimos pedidos
              </h2>
              <p className="text-sm text-slate-500">
                Movimentação recente da operação.
              </p>
            </div>
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              Ver todos
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum pedido recente.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="px-3 py-3 font-medium">Pedido</th>
                    <th className="px-3 py-3 font-medium">Cliente</th>
                    <th className="px-3 py-3 font-medium text-right">Total</th>
                    <th className="px-3 py-3 font-medium text-center">
                      Estado
                    </th>
                    <th className="px-3 py-3 font-medium text-right">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order: any) => {
                    const s = statusLabels[order.status] || {
                      label: order.status,
                      color: "bg-slate-100 text-slate-700",
                    };
                    return (
                      <tr
                        key={order.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-3 py-3 font-medium text-slate-900">
                          #{order.orderNumber}
                        </td>
                        <td className="px-3 py-3 text-slate-600">
                          {order.user?.name || "—"}
                        </td>
                        <td className="px-3 py-3 text-right font-semibold text-slate-900">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${s.color}`}
                          >
                            {s.label}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right text-slate-500">
                          <div className="flex items-center justify-end gap-2">
                            <span>{formatDate(order.createdAt)}</span>
                            <IconActionButton
                              icon={Eye}
                              label="Ver pedido"
                              onClick={() =>
                                (window.location.href = "/admin/orders")
                              }
                              variant="neutral"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Produtos mais vendidos
              </h2>
              <p className="text-sm text-slate-500">
                Os mais procurados pelo cliente.
              </p>
            </div>
            <div className="rounded-full bg-slate-50 p-2 text-slate-500">
              <Boxes className="h-4 w-4" />
            </div>
          </div>

          {topProducts.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum dado disponível.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((item: any, index: number) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {item.product?.name || "—"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.totalSold} unidades
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatCurrency(item.revenue)}
                    </p>
                    <p className="text-xs text-slate-500">receita</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
