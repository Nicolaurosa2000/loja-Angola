import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productService, ProductFilters } from "../../services/product.service";
import { formatCurrency, getImageUrl } from "../../utils/format"; // 1. IMPORTADO getImageUrl AQUI

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 12,
    search: searchParams.get("q") || undefined,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => productService.getAll(filters),
  });

  const products = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="container-custom py-8 lg:py-10">
      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
              Catálogo
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              Produtos
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Explore itens selecionados com uma navegação mais clara e rápida.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none"
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split("-");
                setFilters({
                  ...filters,
                  sortBy,
                  sortOrder: sortOrder as "asc" | "desc",
                });
              }}
            >
              <option value="">Mais recentes</option>
              <option value="price-asc">Preço: Menor para maior</option>
              <option value="price-desc">Preço: Maior para menor</option>
              <option value="name-asc">Nome: A-Z</option>
              <option value="name-desc">Nome: Z-A</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-64">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="space-y-6">
              <div>
                <h3 className="mb-3 font-semibold text-slate-900">
                  Filtrar por Preço
                </h3>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-primary-500"
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        minPrice: Number(e.target.value) || undefined,
                      })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-primary-500"
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        maxPrice: Number(e.target.value) || undefined,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          {searchParams.get("q") && (
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              Resultados para:{" "}
              <span className="font-semibold text-slate-900">
                {searchParams.get("q")}
              </span>
            </div>
          )}

          {isLoading ? (
            <div className="rounded-3xl border border-slate-200 bg-white py-20 text-center text-slate-500 shadow-sm">
              A carregar...
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white py-20 text-center shadow-sm">
              <p className="mb-4 text-slate-500">Nenhum produto encontrado.</p>
              <Link
                to="/produtos"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Limpar Filtros
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
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

              {meta && meta.totalPages > 1 && (
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setFilters({ ...filters, page })}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                          page === filters.page
                            ? "bg-slate-900 text-white"
                            : "bg-white text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}