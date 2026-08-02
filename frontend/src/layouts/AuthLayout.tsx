import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const isLogin = location.pathname === '/login';

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {isLogin && (
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="absolute top-4 right-4 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      )}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-primary-600">
            Angola Express
          </Link>
          <p className="text-gray-500 mt-2">A sua loja online de confiança</p>
        </div>
        <div className="card p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
