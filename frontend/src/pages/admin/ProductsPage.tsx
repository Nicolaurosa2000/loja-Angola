import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import { formatCurrency, formatDate } from "../../utils/format";
import { Product } from "../../types";
import ImageUploader, { UploadedImage } from "../../components/ImageUploader";
import Toast, { useToast } from "../../components/Toast";
import {
  PlusCircle,
  PencilLine,
  Trash2,
  ImagePlus,
  FileText,
  Search,
  Package2,
  Boxes,
  Sparkles,
} from "lucide-react";

interface ProductForm {
  name: string;
  description: string;
  fullDescription: string;
  price: number;
  promotionalPrice: string;
  sku: string;
  code?: string;
  stock: number;
  minStock?: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  categoryId: string;
  brandId: string;
  isFeatured: boolean;
  status: string;
  tags: string;
  metaTitle?: string;
  metaDescription?: string;
  videoUrl?: string;
}

interface ProductFormState extends ProductForm {
  images: UploadedImage[];
}

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const { toast, showToast } = useToast();
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "basico" | "imagens" | "descricao" | "seo" | "estoque"
  >("basico");
  const [form, setForm] = useState<ProductFormState>({
    name: "",
    description: "",
    fullDescription: "",
    price: 0,
    promotionalPrice: "",
    sku: "",
    code: "",
    stock: 0,
    minStock: 0,
    weight: undefined,
    length: undefined,
    width: undefined,
    height: undefined,
    categoryId: "",
    brandId: "",
    isFeatured: false,
    status: "ACTIVE",
    tags: "",
    metaTitle: "",
    metaDescription: "",
    videoUrl: "",
    images: [],
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", page],
    queryFn: () =>
      api.get(`/admin/products?page=${page}&limit=10`).then((r) => r.data),
  });

  const { data: catData } = useQuery({
    queryKey: ["admin-categories-dropdown"],
    queryFn: () => api.get("/admin/categories?limit=100").then((r) => r.data),
  });

  const { data: brandData } = useQuery({
    queryKey: ["admin-brands-dropdown"],
    queryFn: () => api.get("/admin/brands").then((r) => r.data),
  });

  const products: Product[] = data?.data || [];
  const meta = data?.meta;
  const categories = catData?.data || [];
  const brands = brandData?.data || [];
  const totalProducts = products.length;
  const activeProducts = products.filter(
    (product: any) => product.status === "ACTIVE",
  ).length;
  const lowStockProducts = products.filter(
    (product: any) => (product.stock || 0) <= (product.minStock || 0),
  ).length;
  const catalogValue = products.reduce(
    (sum: number, product: any) => sum + Number(product.price || 0),
    0,
  );

  const saveMutation = useMutation({
    mutationFn: async (formData: ProductFormState) => {
      const payload = {
        name: formData.name,
        description: formData.description,
        fullDescription: formData.fullDescription,
        price: Number(formData.price),
        promotionalPrice: formData.promotionalPrice
          ? Number(formData.promotionalPrice)
          : undefined,
        sku: formData.sku,
        code: formData.code,
        stock: Number(formData.stock),
        minStock: formData.minStock ? Number(formData.minStock) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        length: formData.length ? Number(formData.length) : undefined,
        width: formData.width ? Number(formData.width) : undefined,
        height: formData.height ? Number(formData.height) : undefined,
        categoryId: formData.categoryId,
        brandId: formData.brandId || undefined,
        isFeatured: formData.isFeatured,
        status: formData.status,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        videoUrl: formData.videoUrl,
        images: formData.images.map((img) => ({
          url: img.url,
          isCover: img.isCover,
          sortOrder: img.order,
        })),
      };
      if (editingId) {
        return api
          .put(`/admin/products/${editingId}`, payload)
          .then((r) => r.data);
      }
      return api.post("/admin/products", payload).then((r) => r.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setShowForm(false);
      setEditingId(null);
      resetForm();
      showToast({
        message: "Produto salvo com sucesso.",
        type: "success",
        title: editingId ? "Produto atualizado" : "Produto criado",
      });
    },
    onError: (error: any) => {
      console.error("Erro ao salvar produto:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao salvar produto";
      showToast({
        message: errorMessage,
        type: "error",
        title: "Erro ao salvar produto",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      showToast({
        message: "Produto eliminado com sucesso.",
        type: "success",
        title: "Produto eliminado",
      });
    },
  });

  const resetForm = () =>
    setForm({
      name: "",
      description: "",
      fullDescription: "",
      price: 0,
      promotionalPrice: "",
      sku: "",
      code: "",
      stock: 0,
      minStock: 0,
      weight: undefined,
      length: undefined,
      width: undefined,
      height: undefined,
      categoryId: "",
      brandId: "",
      isFeatured: false,
      status: "ACTIVE",
      tags: "",
      metaTitle: "",
      metaDescription: "",
      videoUrl: "",
      images: [],
    });

  const editProduct = async (product: any) => {
    // Buscar produto completo com todas as imagens
    try {
      const response = await api.get(`/admin/products/${product.id}`);
      const fullProduct = response.data.data;

      const images: UploadedImage[] = (fullProduct.images || []).map(
        (img: any) => ({
          id: img.id,
          url: img.url,
          isCover: img.isCover,
          order: img.sortOrder || 0,
        }),
      );

      setForm({
        name: fullProduct.name,
        description: fullProduct.description,
        fullDescription: fullProduct.fullDescription || "",
        price: fullProduct.price,
        promotionalPrice: fullProduct.promotionalPrice?.toString() || "",
        sku: fullProduct.sku,
        code: fullProduct.code || "",
        stock: fullProduct.stock,
        minStock: fullProduct.minStock || 0,
        weight: fullProduct.weight || undefined,
        length: fullProduct.length || undefined,
        width: fullProduct.width || undefined,
        height: fullProduct.height || undefined,
        categoryId: fullProduct.categoryId,
        brandId: fullProduct.brand?.id || "",
        isFeatured: fullProduct.isFeatured,
        status: fullProduct.status || "ACTIVE",
        tags: fullProduct.tags?.map((t: any) => t.name).join(", ") || "",
        metaTitle: fullProduct.metaTitle || "",
        metaDescription: fullProduct.metaDescription || "",
        videoUrl: fullProduct.videoUrl || "",
        images,
      });
      setEditingId(fullProduct.id);
      setShowForm(true);
      setActiveTab("basico");
    } catch (error) {
      console.error("Erro ao carregar produto:", error);
      showToast({
        message: "Erro ao carregar dados do produto.",
        type: "error",
        title: "Erro",
      });
    }
  };

  return (
    <div>
      <div className="mb-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
              Catálogo
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              Produtos
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Gerir catálogo, estoque e fotos dos produtos com mais clareza.
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingId(null);
              setShowForm(!showForm);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {showForm ? (
              <>
                <Trash2 className="h-4 w-4" /> Cancelar
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4" /> Novo Produto
              </>
            )}
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Produtos</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {totalProducts}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-emerald-50 p-4">
            <p className="text-sm text-emerald-700">Ativos</p>
            <p className="mt-1 text-xl font-semibold text-emerald-800">
              {activeProducts}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-700">Stock baixo</p>
            <p className="mt-1 text-xl font-semibold text-amber-800">
              {lowStockProducts}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-sky-50 p-4">
            <p className="text-sm text-sky-700">Valor catálogo</p>
            <p className="mt-1 text-xl font-semibold text-sky-800">
              {formatCurrency(catalogValue)}
            </p>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
                {editingId ? "Edição" : "Criação"}
              </p>
              <h2 className="text-lg font-semibold text-slate-900">
                {editingId ? "Editar Produto" : "Novo Produto"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setEditingId(null);
                setShowForm(false);
              }}
              className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              ✕
            </button>
          </div>

          <div className="mb-6 flex flex-wrap gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-2">
            {[
              { key: "basico", label: "Básico", icon: Package2 },
              { key: "imagens", label: "Imagens", icon: ImagePlus },
              { key: "descricao", label: "Descrição", icon: FileText },
              { key: "seo", label: "SEO", icon: Search },
              { key: "estoque", label: "Estoque", icon: Boxes },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap transition ${
                  activeTab === key
                    ? "bg-primary-600 text-white shadow-sm"
                    : "bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();

              // Validações
              if (!form.name.trim()) {
                showToast({
                  message: "Nome do produto é obrigatório.",
                  type: "error",
                  title: "Validação",
                });
                return;
              }
              if (!form.description.trim()) {
                showToast({
                  message: "Descrição é obrigatória.",
                  type: "error",
                  title: "Validação",
                });
                return;
              }
              if (form.description.trim().length < 10) {
                showToast({
                  message: "Descrição deve ter pelo menos 10 caracteres.",
                  type: "error",
                  title: "Validação",
                });
                return;
              }
              if (!form.sku.trim()) {
                showToast({
                  message: "SKU é obrigatório.",
                  type: "error",
                  title: "Validação",
                });
                return;
              }
              if (form.price <= 0) {
                showToast({
                  message: "Preço deve ser maior que 0.",
                  type: "error",
                  title: "Validação",
                });
                return;
              }
              if (!form.categoryId) {
                showToast({
                  message: "Categoria é obrigatória.",
                  type: "error",
                  title: "Validação",
                });
                return;
              }
              if (
                form.promotionalPrice &&
                Number(form.promotionalPrice) >= form.price
              ) {
                showToast({
                  message:
                    "Preço promocional deve ser menor que o preço normal.",
                  type: "error",
                  title: "Validação",
                });
                return;
              }

              saveMutation.mutate(form);
            }}
            className="space-y-4"
          >
            {/* ABA: BÁSICO */}
            {activeTab === "basico" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nome *
                  </label>
                  <input
                    className="input-field"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Preço (Kz) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: Number(e.target.value) })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Preço Promocional
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field"
                      value={form.promotionalPrice}
                      onChange={(e) =>
                        setForm({ ...form, promotionalPrice: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      SKU *
                    </label>
                    <input
                      className="input-field"
                      value={form.sku}
                      onChange={(e) =>
                        setForm({ ...form, sku: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Código do Produto
                    </label>
                    <input
                      className="input-field"
                      value={form.code}
                      onChange={(e) =>
                        setForm({ ...form, code: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Descrição Breve *
                  </label>
                  <textarea
                    className="input-field"
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Categoria *
                    </label>
                    <select
                      className="input-field"
                      value={form.categoryId}
                      onChange={(e) =>
                        setForm({ ...form, categoryId: e.target.value })
                      }
                      required
                    >
                      <option value="">Selecione</option>
                      {categories.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Marca
                    </label>
                    <select
                      className="input-field"
                      value={form.brandId}
                      onChange={(e) =>
                        setForm({ ...form, brandId: e.target.value })
                      }
                    >
                      <option value="">Selecione</option>
                      {brands.map((b: any) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tags (separadas por vírgula)
                  </label>
                  <input
                    className="input-field"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="Premium, Promoção, Novo"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) =>
                        setForm({ ...form, isFeatured: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Destaque</span>
                  </label>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Status
                    </label>
                    <select
                      className="input-field"
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value })
                      }
                    >
                      <option value="ACTIVE">Ativo</option>
                      <option value="INACTIVE">Inativo</option>
                      <option value="DRAFT">Rascunho</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ABA: IMAGENS */}
            {activeTab === "imagens" && (
              <ImageUploader
                images={form.images}
                onImagesChange={(images) => setForm({ ...form, images })}
                maxImages={5}
              />
            )}

            {/* ABA: DESCRIÇÃO */}
            {activeTab === "descricao" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Descrição Completa
                  </label>
                  <textarea
                    className="input-field"
                    rows={6}
                    value={form.fullDescription}
                    onChange={(e) =>
                      setForm({ ...form, fullDescription: e.target.value })
                    }
                    placeholder="Descrição detalhada do produto, especificações, benefícios..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    URL do Vídeo
                  </label>
                  <input
                    type="url"
                    className="input-field"
                    value={form.videoUrl}
                    onChange={(e) =>
                      setForm({ ...form, videoUrl: e.target.value })
                    }
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>
            )}

            {/* ABA: SEO */}
            {activeTab === "seo" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Meta Título
                  </label>
                  <input
                    type="text"
                    maxLength={60}
                    className="input-field"
                    value={form.metaTitle}
                    onChange={(e) =>
                      setForm({ ...form, metaTitle: e.target.value })
                    }
                    placeholder="Máximo 60 caracteres"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {form.metaTitle?.length || 0}/60
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Meta Descrição
                  </label>
                  <textarea
                    maxLength={160}
                    className="input-field"
                    rows={3}
                    value={form.metaDescription}
                    onChange={(e) =>
                      setForm({ ...form, metaDescription: e.target.value })
                    }
                    placeholder="Máximo 160 caracteres"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {form.metaDescription?.length || 0}/160
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700">
                    💡 <strong>Dica SEO:</strong> Use palavras-chave relevantes
                    no título e descrição para melhorar o ranking de busca.
                  </p>
                </div>
              </div>
            )}

            {/* ABA: ESTOQUE */}
            {activeTab === "estoque" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Stock *
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      value={form.stock}
                      onChange={(e) =>
                        setForm({ ...form, stock: Number(e.target.value) })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Stock Mínimo
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      value={form.minStock}
                      onChange={(e) =>
                        setForm({ ...form, minStock: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium text-sm mb-4">
                    Dimensões (opcional)
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Peso (kg)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="input-field"
                        value={form.weight || ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            weight: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Comprimento (cm)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="input-field"
                        value={form.length || ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            length: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Largura (cm)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="input-field"
                        value={form.width || ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            width: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Altura (cm)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="input-field"
                        value={form.height || ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            height: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                disabled={
                  saveMutation.isPending ||
                  !form.name ||
                  !form.description ||
                  !form.categoryId
                }
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saveMutation.isPending
                  ? "A salvar..."
                  : editingId
                    ? "Atualizar Produto"
                    : "Criar Produto"}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setEditingId(null);
                  setShowForm(false);
                }}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <p className="text-slate-500">A carregar...</p>
      ) : (
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">
              Lista de produtos
            </p>
            <p className="text-sm text-slate-500">
              Visão rápida de preço, stock e estado de cada item.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-white">
                <tr className="border-b border-slate-200 text-left text-sm text-slate-500">
                  <th className="p-3 font-medium">Imagem</th>
                  <th className="p-3 font-medium">Produto</th>
                  <th className="p-3 font-medium">SKU</th>
                  <th className="p-3 font-medium">Preço</th>
                  <th className="p-3 font-medium text-center">Stock</th>
                  <th className="p-3 font-medium text-center">Status</th>
                  <th className="p-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p: any) => (
                  <tr
                    key={p.id}
                    className="bg-white transition-colors hover:bg-slate-50"
                  >
                    <td className="p-3">
                      {p.images && p.images.length > 0 ? (
                        <img
                          src={
                            p.images.find((img: any) => img.isCover)?.url ||
                            p.images[0]?.url
                          }
                          alt={p.name}
                          className="h-12 w-12 rounded-xl border border-slate-200 object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-xs text-slate-400">
                          Sem foto
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <p className="text-sm font-semibold text-slate-900">
                        {p.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(p.createdAt)}
                      </p>
                    </td>
                    <td className="p-3 text-sm text-slate-600">{p.sku}</td>
                    <td className="p-3">
                      <div className="text-sm font-semibold text-slate-900">
                        {formatCurrency(p.price)}
                      </div>
                      {p.promotionalPrice && (
                        <div className="text-xs text-rose-600 line-through">
                          {formatCurrency(p.promotionalPrice)}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`text-sm font-semibold ${
                          p.stock > 5
                            ? "text-emerald-600"
                            : p.stock > 0
                              ? "text-amber-600"
                              : "text-rose-600"
                        }`}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          p.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700"
                            : p.status === "INACTIVE"
                              ? "bg-slate-100 text-slate-600"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {p.status === "ACTIVE"
                          ? "Ativo"
                          : p.status === "DRAFT"
                            ? "Rascunho"
                            : "Inativo"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => editProduct(p)}
                          title="Editar"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                        >
                          <PencilLine className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                "Tem certeza que deseja eliminar este produto?",
                              )
                            ) {
                              deleteMutation.mutate(p.id);
                            }
                          }}
                          title="Eliminar"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && meta.totalPages > 1 && (
            <div className="flex justify-center gap-2 border-t border-slate-200 bg-slate-50 p-4">
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(
                (p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                      p === page
                        ? "bg-slate-900 text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      )}

      {toast && <Toast toast={toast} onClose={() => showToast(null)} />}
    </div>
  );
}
