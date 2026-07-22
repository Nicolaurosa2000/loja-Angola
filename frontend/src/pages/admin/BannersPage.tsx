import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PencilLine, Trash2 } from "lucide-react";
import { bannerService } from "../../services/banner.service";
import IconActionButton from "../../components/ui/IconActionButton";

export default function AdminBannersPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [image, setImage] = useState("");
  const [link, setLink] = useState("");
  const [position, setPosition] = useState("HERO");
  const [sortOrder, setSortOrder] = useState("");
  const [isActive, setIsActive] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: () => bannerService.getAll({ limit: 100 }),
  });

  const banners = data?.data || [];

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: title || undefined,
        subtitle: subtitle || undefined,
        image,
        link: link || undefined,
        position,
        sortOrder: sortOrder ? Number(sortOrder) : undefined,
        isActive,
      };
      if (editingId) return bannerService.update(editingId, payload);
      return bannerService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => bannerService.delete(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] }),
  });

  const resetForm = () => {
    setTitle("");
    setSubtitle("");
    setImage("");
    setLink("");
    setPosition("HERO");
    setSortOrder("");
    setIsActive(true);
    setEditingId(null);
  };

  const editBanner = (banner: any) => {
    setTitle(banner.title || "");
    setSubtitle(banner.subtitle || "");
    setImage(banner.image || "");
    setLink(banner.link || "");
    setPosition(banner.position || "HERO");
    setSortOrder(banner.sortOrder != null ? String(banner.sortOrder) : "");
    setIsActive(banner.isActive ?? true);
    setEditingId(banner.id);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Banners</h1>

      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">
          {editingId ? "Editar Banner" : "Novo Banner"}
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-4 max-w-lg"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Título</label>
            <input
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subtítulo</label>
            <input
              className="input-field"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Imagem (URL)
            </label>
            <input
              className="input-field"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              required
            />
            {image && (
              <div className="mt-2">
                <img
                  src={image}
                  alt="Preview"
                  className="h-20 rounded border object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Link (opcional)
            </label>
            <input
              className="input-field"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Posição</label>
              <select
                className="input-field"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              >
                <option value="HERO">Hero</option>
                <option value="SIDEBAR">Sidebar</option>
                <option value="PROMO">Promo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ordem</label>
              <input
                className="input-field"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ativo</label>
            <div className="flex items-center h-10">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4"
              />
            </div>
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
                  Imagem
                </th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">
                  Título
                </th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">
                  Posição
                </th>
                <th className="text-center p-3 text-sm font-medium text-gray-500">
                  Ordem
                </th>
                <th className="text-center p-3 text-sm font-medium text-gray-500">
                  Ativo
                </th>
                <th className="text-right p-3 text-sm font-medium text-gray-500">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {banners.map((banner: any) => (
                <tr key={banner.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <img
                      src={banner.image}
                      alt={banner.title || ""}
                      className="h-20 w-32 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </td>
                  <td className="p-3 font-medium">{banner.title || "—"}</td>
                  <td className="p-3 text-sm text-gray-500">
                    {banner.position}
                  </td>
                  <td className="p-3 text-center text-sm">
                    {banner.sortOrder}
                  </td>
                  <td className="p-3 text-center">
                    {banner.isActive ? (
                      <span className="text-green-600 text-sm font-medium">
                        Sim
                      </span>
                    ) : (
                      <span className="text-red-500 text-sm font-medium">
                        Não
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <IconActionButton
                        icon={PencilLine}
                        label="Editar banner"
                        onClick={() => editBanner(banner)}
                        variant="edit"
                      />
                      <IconActionButton
                        icon={Trash2}
                        label="Eliminar banner"
                        onClick={() => {
                          if (confirm("Eliminar?"))
                            deleteMutation.mutate(banner.id);
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
