import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import {
  newsletterService,
  NewsletterSubscriber,
} from "../../services/newsletter.service";
import { formatDate } from "../../utils/format";
import IconActionButton from "../../components/ui/IconActionButton";

const filterOptions = [
  { value: "", label: "Todos" },
  { value: "active", label: "Ativos" },
  { value: "inactive", label: "Inativos" },
];

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadSubscribers = async () => {
    setIsLoading(true);
    setError("");
    try {
      const params: { page: number; limit: number; isActive?: boolean } = {
        page,
        limit: 20,
      };
      if (activeFilter === "active") params.isActive = true;
      else if (activeFilter === "inactive") params.isActive = false;

      const response = await newsletterService.getAll(params);
      if (response.data) setSubscribers(response.data);
      if (response.meta) setTotalPages(response.meta.totalPages);
    } catch {
      setError("Erro ao carregar subscrições");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubscribers();
  }, [page, activeFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este subscritor?")) return;
    setDeletingId(id);
    try {
      await newsletterService.delete(id);
      loadSubscribers();
    } catch {
      setError("Erro ao remover subscritor");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Newsletter</h1>

      <div className="flex items-center space-x-2 mb-6">
        {filterOptions.map((f) => (
          <button
            key={f.value}
            onClick={() => {
              setActiveFilter(f.value);
              setPage(1);
            }}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
              activeFilter === f.value
                ? "bg-primary-50 border-primary-300 text-primary-700"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-10 text-gray-500">A carregar...</div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          Nenhum subscritor encontrado.
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">
                    Email
                  </th>
                  <th className="text-center p-3 text-sm font-medium text-gray-500">
                    Ativo
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">
                    Subscrito em
                  </th>
                  <th className="text-right p-3 text-sm font-medium text-gray-500">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <p className="font-medium">{sub.email}</p>
                      {sub.name && (
                        <p className="text-xs text-gray-400">{sub.name}</p>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          sub.isActive ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                    </td>
                    <td className="p-3 text-sm text-gray-500">
                      {formatDate(sub.createdAt)}
                    </td>
                    <td className="p-3 text-right">
                      <IconActionButton
                        icon={Trash2}
                        label={
                          deletingId === sub.id
                            ? "A remover subscritor"
                            : "Remover subscritor"
                        }
                        onClick={() => handleDelete(sub.id)}
                        variant="delete"
                        disabled={deletingId === sub.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 mt-6">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="px-4 py-2 text-sm text-gray-500">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50"
              >
                Seguinte
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
