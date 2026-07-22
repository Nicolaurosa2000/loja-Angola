import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SEO from "../../components/SEO";
import { productService } from "../../services/product.service";
import { wishlistService } from "../../services/wishlist.service";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { formatCurrency } from "../../utils/format";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistMessage, setWishlistMessage] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => productService.getBySlug(slug!),
    enabled: !!slug,
  });

  const product = data?.data;

  if (isLoading) {
    return (
      <div className="container-custom py-20 text-center text-gray-500">
        A carregar...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-custom py-20 text-center text-gray-500">
        Produto não encontrado
      </div>
    );
  }

  const handleAddToCart = async () => {
    await addItem(product.id, quantity);
  };

  const handleBuyNow = () => {
    if (!product) return;

    const buyNowState = {
      buyNow: {
        productId: product.id,
        quantity,
        product,
      },
    };

    if (!isAuthenticated) {
      navigate(`/login?redirect=/checkout`, {
        state: buyNowState,
      });
      return;
    }

    navigate("/checkout", {
      state: buyNowState,
    });
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) return;
    setWishlistLoading(true);
    setWishlistMessage("");
    try {
      await wishlistService.add(product.id);
      setWishlistMessage("Adicionado aos favoritos!");
      setTimeout(() => setWishlistMessage(""), 3000);
    } catch {
      setWishlistMessage("Erro ao adicionar aos favoritos");
      setTimeout(() => setWishlistMessage(""), 3000);
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <>
      <SEO
        title={product.name}
        description={product.description}
        image={product.images?.[0]?.url}
        type="product"
      />
      <div className="container-custom py-8 lg:py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <div className="mb-4 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
              {product.images?.[selectedImage] ? (
                <img
                  src={product.images[selectedImage].url}
                  alt={product.images[selectedImage].alt || product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[320px] items-center justify-center text-sm text-slate-400">
                  Sem imagem
                </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`h-20 w-20 overflow-hidden rounded-2xl border-2 transition ${
                      index === selectedImage
                        ? "border-primary-600"
                        : "border-slate-200"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt || ""}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
              Detalhes do produto
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              {product.name}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {product.promotionalPrice ? (
                <>
                  <span className="text-3xl font-semibold text-primary-600">
                    {formatCurrency(product.promotionalPrice)}
                  </span>
                  <span className="text-xl text-slate-400 line-through">
                    {formatCurrency(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-3xl font-semibold text-slate-900">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>

            <p className="mt-5 text-sm leading-7 text-slate-600">
              {product.description}
            </p>

            <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">SKU</span>
                <span className="font-medium text-slate-900">
                  {product.sku}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Stock</span>
                <span
                  className={`font-medium ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {product.stock > 0
                    ? `${product.stock} unidades`
                    : "Indisponível"}
                </span>
              </div>
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {product.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm"
                    >
                      {typeof tag === "string" ? tag : tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {product.stock > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="flex items-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2.5 text-lg text-slate-600 transition hover:bg-slate-100"
                  >
                    -
                  </button>
                  <span className="min-w-10 px-4 py-2.5 text-center font-semibold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="px-4 py-2.5 text-lg text-slate-600 transition hover:bg-slate-100"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Adicionar ao Carrinho
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 rounded-full bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
                >
                  Pagar agora
                </button>
                {isAuthenticated && (
                  <button
                    onClick={handleToggleWishlist}
                    disabled={wishlistLoading}
                    className="rounded-full border border-slate-200 p-3 text-slate-600 transition hover:bg-slate-100 hover:text-red-500 disabled:opacity-50"
                    title="Adicionar aos favoritos"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}
            {wishlistMessage && (
              <p
                className={`mt-3 text-sm ${wishlistMessage.includes("sucesso") || wishlistMessage.includes("Adicionado") ? "text-green-600" : "text-red-600"}`}
              >
                {wishlistMessage}
              </p>
            )}

            {product.fullDescription && (
              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h2 className="mb-2 text-lg font-semibold text-slate-900">
                  Descrição Completa
                </h2>
                <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                  {product.fullDescription}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
