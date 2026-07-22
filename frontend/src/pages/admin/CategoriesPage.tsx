import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PencilLine, Trash2 } from "lucide-react";
import api from "../../services/api";
import IconActionButton from "../../components/ui/IconActionButton";

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => api.get("/admin/categories?limit=100").then((r) => r.data),
  });

  const { data: allCats } = useQuery({
    queryKey: ["all-categories-admin"],
    queryFn: () => api.get("/categories").then((r) => r.data),
  });

  const categories = data?.data || [];
  const allCategories = allCats?.data || [];

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { name, description, parentId: parentId || undefined };
      if (editingId)
        return api
          .put(`/admin/categories/${editingId}`, payload)
          .then((r) => r.data);
      return api.post("/admin/categories", payload).then((r) => r.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["all-categories"] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["all-categories"] });
    },
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setParentId("");
    setEditingId(null);
  };

  const editCategory = (cat: any) => {
    setName(cat.name);
    setDescription(cat.description || "");
    setParentId(cat.parentId || "");
    setEditingId(cat.id);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Categorias</h1>

      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">
          {editingId ? "Editar Categoria" : "Nova Categoria"}
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-4 max-w-lg"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              className="input-field"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Categoria Pai
            </label>
            <select
              className="input-field"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">Nenhuma (raiz)</option>
              {allCategories.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="btn-primary"
            >
              {saveMutation.isPending
                ? "A salvar..."
                : editingId
                  ? "Atualizar"
                  : "Criar"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {isLoading ? (
        <p className="text-gray-500">A carregar...</p>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-gray-500">
                  Nome
                </th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">
                  Slug
                </th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">
                  Produtos
                </th>
                <th className="text-right p-3 text-sm font-medium text-gray-500">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map((cat: any) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <p className="font-medium">{cat.name}</p>
                    {cat.parent && (
                      <p className="text-xs text-gray-400">
                        Sub de: {cat.parent.name}
                      </p>
                    )}
                  </td>
                  <td className="p-3 text-sm text-gray-500">{cat.slug}</td>
                  <td className="p-3 text-sm">{cat._count?.products || 0}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <IconActionButton
                        icon={PencilLine}
                        label="Editar categoria"
                        onClick={() => editCategory(cat)}
                        variant="edit"
                      />
                      <IconActionButton
                        icon={Trash2}
                        label="Eliminar categoria"
                        onClick={() => {
                          if (confirm("Eliminar?"))
                            deleteMutation.mutate(cat.id);
                        }}
                        variant="delete"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
