import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PencilLine, Trash2 } from "lucide-react";
import api from "../../services/api";
import IconActionButton from "../../components/ui/IconActionButton";

export default function AdminBrandsPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: () => api.get("/admin/brands").then((r) => r.data),
  });

  const brands = data?.data || [];

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { name, description };
      if (editingId)
        return api
          .put(`/admin/brands/${editingId}`, payload)
          .then((r) => r.data);
      return api.post("/admin/brands", payload).then((r) => r.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/brands/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] }),
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingId(null);
  };

  const editBrand = (brand: any) => {
    setName(brand.name);
    setDescription(brand.description || "");
    setEditingId(brand.id);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Marcas</h1>

      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">
          {editingId ? "Editar Marca" : "Nova Marca"}
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
              {brands.map((brand: any) => (
                <tr key={brand.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium">{brand.name}</td>
                  <td className="p-3 text-sm text-gray-500">{brand.slug}</td>
                  <td className="p-3 text-sm">{brand._count?.products || 0}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <IconActionButton
                        icon={PencilLine}
                        label="Editar marca"
                        onClick={() => editBrand(brand)}
                        variant="edit"
                      />
                      <IconActionButton
                        icon={Trash2}
                        label="Eliminar marca"
                        onClick={() => {
                          if (confirm("Eliminar?"))
                            deleteMutation.mutate(brand.id);
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
