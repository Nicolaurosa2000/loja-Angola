import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wishlistService } from '../../services/wishlist.service';
import { formatCurrency } from '../../utils/format';

interface WishlistItemData {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    promotionalPrice?: number;
    images: { url: string; isCover: boolean }[];
  };
  createdAt: string;
}

export default function FavoritosTab() {
  const [items, setItems] = useState<WishlistItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadWishlist = async () => {
    try {
      const response = await wishlistService.getAll();
      if (response.data) setItems(response.data);
    } catch {
      setError('Erro ao carregar favoritos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (productId: string) => {
    try {
      await wishlistService.remove(productId);
      setItems((prev) => prev.filter((i) => i.productId !== productId));
    } catch {
      setError('Erro ao remover produto');
    }
  };

  if (isLoading) return <div className="text-center py-10 text-gray-500">A carregar...</div>;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-6">Favoritos</h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>
      )}

      {items.length === 0 ? (
        <div className="card p-6 text-center text-gray-500">
          <p className="mb-2">A sua lista de favoritos está vazia.</p>
          <Link to="/produtos" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Explorar produtos &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="card group">
              <Link to={`/produto/${item.product.slug}`}>
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  {item.product.images?.[0] ? (
                    <img
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      Sem imagem
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-4">
                <Link to={`/produto/${item.product.slug}`}>
                  <h3 className="font-medium text-sm text-gray-900 truncate">{item.product.name}</h3>
                </Link>
                <div className="flex items-center space-x-2 mt-1">
                  {item.product.promotionalPrice ? (
                    <>
                      <span className="font-semibold text-primary-600">{formatCurrency(item.product.promotionalPrice)}</span>
                      <span className="text-xs text-gray-400 line-through">{formatCurrency(item.product.price)}</span>
                    </>
                  ) : (
                    <span className="font-semibold text-gray-900">{formatCurrency(item.product.price)}</span>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(item.productId)}
                  className="text-xs text-red-600 hover:text-red-700 mt-2 font-medium"
                >
                  Remover dos favoritos
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
