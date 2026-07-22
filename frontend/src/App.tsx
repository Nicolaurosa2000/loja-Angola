import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import StoreLayout from "./layouts/StoreLayout";
import AuthLayout from "./layouts/AuthLayout";
import AdminLayout from "./layouts/AdminLayout";
import { ProtectedRoute } from "./routes/ProtectedRoute";

const HomePage = lazy(() => import("./pages/store/HomePage"));
const ProductsPage = lazy(() => import("./pages/store/ProductsPage"));
const ProductDetailPage = lazy(() => import("./pages/store/ProductDetailPage"));
const CartPage = lazy(() => import("./pages/store/CartPage"));
const CheckoutPage = lazy(() => import("./pages/store/CheckoutPage"));
const OrderSuccessPage = lazy(() => import("./pages/store/OrderSuccessPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const AccountPage = lazy(() => import("./pages/account/AccountPage"));
const DashboardPage = lazy(() => import("./pages/admin/DashboardPage"));
const AdminProductsPage = lazy(() => import("./pages/admin/ProductsPage"));
const AdminCategoriesPage = lazy(() => import("./pages/admin/CategoriesPage"));
const AdminBrandsPage = lazy(() => import("./pages/admin/BrandsPage"));
const AdminOrdersPage = lazy(() => import("./pages/admin/OrdersPage"));
const AdminCouponsPage = lazy(() => import("./pages/admin/CouponsPage"));
const AdminBannersPage = lazy(() => import("./pages/admin/BannersPage"));
const AdminCustomersPage = lazy(() => import("./pages/admin/CustomersPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/UsersPage"));
const AdminReviewsPage = lazy(() => import("./pages/admin/ReviewsPage"));
const AdminNewsletterPage = lazy(() => import("./pages/admin/NewsletterPage"));
const AdminSettingsPage = lazy(() => import("./pages/admin/SettingsPage"));
const AdminFinancePage = lazy(() => import("./pages/admin/FinancePage"));

const fallback = (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

export default function App() {
  return (
    <Suspense fallback={fallback}>
      <Routes>
        <Route element={<StoreLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/produtos" element={<ProductsPage />} />
          <Route path="/produto/:slug" element={<ProductDetailPage />} />
          <Route path="/categorias" element={<ProductsPage />} />
          <Route path="/categoria/:slug" element={<ProductsPage />} />
          <Route path="/carrinho" element={<CartPage />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pedido/:id"
            element={
              <ProtectedRoute>
                <OrderSuccessPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/conta"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/conta/pedidos/:id"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registar" element={<RegisterPage />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="brands" element={<AdminBrandsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="coupons" element={<AdminCouponsPage />} />
          <Route path="banners" element={<AdminBannersPage />} />
          <Route path="finance" element={<AdminFinancePage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="newsletter" element={<AdminNewsletterPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
