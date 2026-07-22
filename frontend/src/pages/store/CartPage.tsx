import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency } from '../../utils/format';

export default function CartPage() {
  const { cart, itemCount, updateQuantity, removeItem, applyCoupon, removeCoupon, subtotal, discount, total } = useCart();
  const [couponCode, setCouponCode] = useState('');

  if (!cart || itemCount === 0) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Carrinho Vazio</h1>
        <p className="text-gray-500 mb-8">Adicione produtos ao seu carrinho para continuar.</p>
        <Link to="/produtos" className="btn-primary">
          Ver Produtos
        </Link>
      </div>
    );
  }

  const handleApplyCoupon = async () => {
    if (couponCode) {
      await applyCoupon(couponCode);
      setCouponCode('');
    }
  };

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl font-bold mb-8">Carrinho ({itemCount} itens)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="card p-4 flex items-center space-x-4">
              <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                {item.product.images?.[0] ? (
                  <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    Sem imagem
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/produto/${item.product.slug}`} className="font-semibold text-gray-900 hover:text-primary-600 line-clamp-1">
                  {item.product.name}
                </Link>
                <p className="text-primary-600 font-bold mt-1">
                  {formatCurrency(item.product.promotionalPrice || item.product.price)}
                </p>
              </div>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  className="px-3 py-1.5 hover:bg-gray-50"
                >
                  -
                </button>
                <span className="px-3 py-1.5 font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="px-3 py-1.5 hover:bg-gray-50"
                >
                  +
                </button>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatCurrency((item.product.promotionalPrice || item.product.price) * item.quantity)}</p>
                <button onClick={() => removeItem(item.id)} className="text-sm text-red-500 hover:text-red-600 mt-1">
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-6 h-fit">
          <h2 className="text-lg font-semibold mb-4">Resumo</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Desconto</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-3">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-lg">{formatCurrency(total)}</span>
            </div>
          </div>

          {cart.coupon ? (
            <div className="mt-4 flex items-center justify-between bg-green-50 p-3 rounded-lg">
              <span className="text-sm text-green-700">Cupão: {cart.coupon.code}</span>
              <button onClick={removeCoupon} className="text-sm text-red-500">Remover</button>
            </div>
          ) : (
            <div className="mt-4 flex space-x-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Cupão de desconto"
                className="input-field text-sm flex-1"
              />
              <button onClick={handleApplyCoupon} className="btn-secondary text-sm !py-2 !px-4">
                Aplicar
              </button>
            </div>
          )}

          <Link to="/checkout" className="btn-primary w-full mt-6 text-center block">
            Finalizar Compra
          </Link>
        </div>
      </div>
    </div>
  );
}
