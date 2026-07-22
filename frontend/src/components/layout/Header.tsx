import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import {
  ShoppingCart,
  House,
  Package,
  Tags,
  UserCircle2,
  LogOut,
  ShieldCheck,
  Menu,
  Search,
  Sparkles,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Início", icon: House },
  { to: "/produtos", label: "Produtos", icon: Package },
  { to: "/categorias", label: "Categorias", icon: Tags },
];

export default function Header() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.04),0_12px_30px_-24px_rgba(15,23,42,0.16)] backdrop-blur-xl">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2 rounded-full px-1 py-1 text-lg font-semibold text-slate-900 transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-rose-500 text-white shadow-lg shadow-orange-500/20">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate tracking-tight">Angola Express</span>
            <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500">
              e-commerce premium
            </span>
          </div>
        </Link>

        <nav
          className="hidden items-center justify-center gap-1 md:flex"
          aria-label="Navegação principal"
        >
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2 sm:gap-3">
          <Link
            to="/produtos"
            aria-label="Ir para a página de produtos"
            className="hidden min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 sm:flex"
          >
            <Search className="h-4 w-4" />
            <span className="hidden lg:inline">Buscar</span>
          </Link>

          <Link
            to="/carrinho"
            aria-label={`Carrinho com ${itemCount} itens`}
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-white">
                {itemCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden min-h-11 items-center gap-1 rounded-full border border-slate-200 bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 sm:flex"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Painel admin
                </Link>
              )}
              <Link
                to="/conta"
                className="flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
                  <UserCircle2 className="h-5 w-5" />
                </div>
                <div className="hidden flex-col items-start truncate sm:flex">
                  <span className="truncate text-sm font-semibold text-slate-900">
                    {user?.name || "Administrador"}
                  </span>
                  <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                    {isAdmin ? "Administrador" : "Conta"}
                  </span>
                </div>
              </Link>
              <button
                type="button"
                onClick={logout}
                aria-label="Sair da conta"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 focus-visible:ring-offset-2"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-full px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
              >
                Entrar
              </Link>
              <Link
                to="/registar"
                className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
              >
                Registar
              </Link>
            </div>
          )}

          <button
            type="button"
            aria-label="Abrir menu"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 md:hidden"
            title="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
