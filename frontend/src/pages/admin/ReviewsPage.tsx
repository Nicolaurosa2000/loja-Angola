import { useState, useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { reviewService } from "../../services/review.service";
import { formatDate, truncate } from "../../utils/format";
import IconActionButton from "../../components/ui/IconActionButton";

interface AdminReview {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  status: string;
  product?: { id: string; name: string };
  user: { name: string };
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
  APPROVED: { label: "Aprovada", color: "bg-green-100 text-green-800" },
  REJECTED: { label: "Rejeitada", color: "bg-red-100 text-red-800" },
};

const statusFilters = [
  { value: "", label: "Todas" },
  { value: "PENDING", label: "Pendentes" },
  { value: "APPROVED", label: "Aprovadas" },
  { value: "REJECTED", label: "Rejeitadas" },
];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadReviews = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await reviewService.getAll({
        page,
        limit: 20,
        status: statusFilter || undefined,
      });
      if (response.data) setReviews(response.data as AdminReview[]);
      if (response.meta) setTotalPages(response.meta.totalPages);
    } catch {
      setError("Erro ao carregar avaliações");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [page, statusFilter]);

  const handleUpdateStatus = async (id: string, status: string) => {
    setActionId(id);
    try {
      await reviewService.updateStatus(id, { status });
      loadReviews();
    } catch {
      setError("Erro ao atualizar avaliação");
    } finally {
      setActionId(null);
    }
  };

  const renderStars = (rating: number) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Avaliações</h1>
        <div className="flex items-center space-x-2">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setStatusFilter(f.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                statusFilter === f.value
                  ? "bg-primary-50 border-primary-300 text-primary-700"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-10 text-gray-500">A carregar...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          Nenhuma avaliação encontrada.
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">
                    Produto
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">
                    Cliente
                  </th>
                  <th className="text-center p-3 text-sm font-medium text-gray-500">
                    Avaliação
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">
                    Título
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">
                    Comentário
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">
                    Status
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">
                    Data
                  </th>
                  <th className="text-right p-3 text-sm font-medium text-gray-500">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reviews.map((review) => {
                  const sc = statusConfig[review.status] || {
                    label: review.status,
                    color: "bg-gray-100 text-gray-800",
                  };
                  return (
                    <tr key={review.id} className="hover:bg-gray-50">
                      <td className="p-3 text-sm">
                        {review.product?.name || "-"}
                      </td>
                      <td className="p-3 text-sm">{review.user.name}</td>
                      <td className="p-3 text-center text-sm text-yellow-500">
                        {renderStars(review.rating)}
                      </td>
                      <td className="p-3 text-sm max-w-[120px] truncate">
                        {review.title || "-"}
                      </td>
                      <td className="p-3 text-sm text-gray-600 max-w-[200px]">
                        {review.comment ? truncate(review.comment, 60) : "-"}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}
                        >
                          {sc.label}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          {review.status !== "APPROVED" && (
                            <IconActionButton
                              icon={CheckCircle2}
                              label="Aprovar avaliação"
                              onClick={() =>
                                handleUpdateStatus(review.id, "APPROVED")
                              }
                              variant="success"
                              disabled={actionId === review.id}
                            />
                          )}
                          {review.status !== "REJECTED" && (
                            <IconActionButton
                              icon={XCircle}
                              label="Rejeitar avaliação"
                              onClick={() =>
                                handleUpdateStatus(review.id, "REJECTED")
                              }
                              variant="delete"
                              disabled={actionId === review.id}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
