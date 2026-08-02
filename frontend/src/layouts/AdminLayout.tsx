import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tags,
  BadgeCheck,
  TicketPercent,
  ImageIcon,
  UserCog,
  MessageSquareQuote,
  Mail,
  Settings,
  Search,
  Bell,
  ChevronRight,
  DollarSign,
  ExternalLink,
  Menu,
  Store,
  X,
  LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
};

const navGroups = [
  {
    title: "Gestão",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { to: "/admin/products", label: "Produtos", icon: Package },
      { to: "/admin/orders", label: "Pedidos", icon: ShoppingCart },
      { to: "/admin/finance", label: "Finanças", icon: DollarSign },
      { to: "/admin/customers", label: "Clientes", icon: Users },
      { to: "/admin/categories", label: "Categorias", icon: Tags },
      { to: "/admin/brands", label: "Marcas", icon: BadgeCheck },
    ],
  },
  {
    title: "Ferramentas",
    items: [
      { to: "/admin/coupons", label: "Promoções", icon: TicketPercent },
      { to: "/admin/banners", label: "Banners", icon: ImageIcon },
      { to: "/admin/users", label: "Utilizadores", icon: UserCog },
      { to: "/admin/reviews", label: "Avaliações", icon: MessageSquareQuote },
      { to: "/admin/newsletter", label: "Newsletter", icon: Mail },
      { to: "/admin/settings", label: "Configurações", icon: Settings },
    ],
  },
];

export default function AdminLayout() {
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const allNavItems = navGroups.flatMap((group) => group.items);
  const currentLabel =
    allNavItems.find((item) => item.to === location.pathname)?.label ??
    "Painel";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <button
        type="button"
        aria-label="Fechar navegação"
        className={`fixed inset-0 z-30 bg-slate-950/45 transition-opacity duration-300 lg:hidden ${
          isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-slate-950 text-white shadow-2xl shadow-slate-950/30 transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-rose-500 text-sm font-semibold shadow-lg shadow-orange-500/30">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide">
                Angola Express
              </p>
              <p className="text-xs text-slate-400">Painel administrativo</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Fechar menu"
            className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-5">
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                {group.title}
              </p>
              <nav className="space-y-1">
                {group.items.map(({ to, label, icon: Icon }) => (
                  <NavItem key={to} to={to} label={label} icon={Icon} />
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
                {(user?.name?.[0] ?? "A").toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {user?.name || "Administrador"}
                </p>
                <p className="text-xs text-slate-400">
                  {isAdmin ? "Administrador" : "Gestor da loja"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 px-4 py-3 shadow-[0_1px_0_rgba(15,23,42,0.04),0_12px_30px_-24px_rgba(15,23,42,0.14)] backdrop-blur sm:px-6 lg:px-8">
          <div className="mx-auto flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Abrir navegação"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  <span>Painel admin</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className="text-slate-600">{currentLabel}</span>
                </div>
                <h2 className="mt-1 text-lg font-semibold text-slate-900 sm:text-xl">
                  {currentLabel}
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              <a
                href="/"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Ver site</span>
              </a>
              <button
                type="button"
                aria-label="Notificações"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
              >
                <Bell className="h-4 w-4" />
              </button>
              <div className="flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 shadow-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                  {(user?.name?.[0] ?? "A").toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">
                    {user?.name || "Administrador"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {isAdmin ? "Administrador" : "Gestor"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Sair da conta"
                title="Sair"
                onClick={logout}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, label, icon: Icon }: NavItem) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
          isActive
            ? "bg-white/15 text-white shadow-lg shadow-black/10"
            : "text-slate-300 hover:bg-white/10 hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <span className="flex items-center gap-3">
          <span
            className={`rounded-xl p-2 transition ${
              isActive
                ? "bg-white/15"
                : "bg-white/5 text-slate-400 group-hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" />
          </span>
          <span>{label}</span>
        </span>
      )}
    </NavLink>
  );
}
