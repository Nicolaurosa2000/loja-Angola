import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SEO from "../../components/SEO";
import { productService } from "../../services/product.service";
import { formatCurrency, getImageUrl } from "../../utils/format"; // 1. IMPORTADO getImageUrl AQUI

export default function HomePage() {
  return (
    <>
      <SEO title="Início" />
      <HomeContent />
    </>
  );
}

function HomeContent() {
  const { data: featuredData } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => productService.getFeatured(),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => productService.getCategories(),
  });

  const featured = featuredData?.data || [];
  const categories = categoriesData?.data || [];

  return (
    <>
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.28),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(251,191,36,0.2),_transparent_35%)]" />
        <div className="container-custom relative py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-slate-200 backdrop-blur">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
              Novidades e ofertas exclusivas
            </div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Encontre tudo o que a sua loja precisa, com mais praticidade.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Produtos selecionados com qualidade, preços competitivos e entrega
              confiável em todo o país.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/produtos"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Ver produtos
              </Link>
              <Link
                to="/categorias"
                className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Explorar categorias
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-custom py-16 lg:py-20">
        <div className="mb-8 flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
              Seleção premium
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">
              Produtos em Destaque
            </h2>
          </div>
          <Link
            to="/produtos"
            className="text-sm font-semibold text-primary-600 transition hover:text-primary-700"
          >
            Ver todos
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {featured.map((product) => (
            <Link
              key={product.id}
              to={`/produto/${product.slug}`}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                {product.images?.[0] ? (
                  /* 2. ALTERADO AQUI: USO DO getImageUrl(...) */
                  <img
                    src={getImageUrl(product.images[0].url)}
                    alt={product.images[0].alt || product.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    Sem imagem
                  </div>
                )}
                {product.promotionalPrice && (
                  <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                    Promoção
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-slate-900">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  {product.promotionalPrice ? (
                    <>
                      <span className="text-base font-semibold text-primary-600">
                        {formatCurrency(product.promotionalPrice)}
                      </span>
                      <span className="text-sm text-slate-400 line-through">
                        {formatCurrency(product.price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-base font-semibold text-slate-900">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16 lg:py-20">
        <div className="container-custom">
          <div className="mb-8 text-center">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
              Explorar
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">
              Categorias
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/categoria/${category.slug}`}
                className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <h3 className="font-semibold text-slate-900">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}