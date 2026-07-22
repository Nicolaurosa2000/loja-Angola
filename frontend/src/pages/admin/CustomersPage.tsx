import { useState, useEffect } from "react";
import { Lock, Unlock } from "lucide-react";
import { customerService } from "../../services/customer.service";
import { User } from "../../types";
import { formatDate, formatPhone } from "../../utils/format";
import IconActionButton from "../../components/ui/IconActionButton";

interface CustomerRow extends User {
  _count?: { orders: number };
  isActive?: boolean;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadCustomers = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await customerService.getAll({
        page,
        limit: 20,
        search: search || undefined,
      });
      if (response.data) setCustomers(response.data);
      if (response.meta) setTotalPages(response.meta.totalPages);
    } catch {
      setError("Erro ao carregar clientes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadCustomers();
  };

  const handleToggleActive = async (id: string) => {
    setTogglingId(id);
    try {
      await customerService.toggleActive(id);
      loadCustomers();
    } catch {
      setError("Erro ao alterar estado do cliente");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Clientes</h1>

      <form onSubmit={handleSearch} className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por nome, email ou telefone..."
          className="input-field"
        />
      </form>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-10 text-gray-500">A carregar...</div>
      ) : customers.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          Nenhum cliente encontrado.
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">
                    Nome
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">
                    Email
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">
                    Telefone
                  </th>
                  <th className="text-center p-3 text-sm font-medium text-gray-500">
                    Pedidos
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">
                    Registado em
                  </th>
                  <th className="text-right p-3 text-sm font-medium text-gray-500">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <p className="font-medium">{customer.name}</p>
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {customer.email}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {customer.phone ? formatPhone(customer.phone) : "-"}
                    </td>
                    <td className="p-3 text-center text-sm">
                      {customer._count?.orders || 0}
                    </td>
                    <td className="p-3 text-sm text-gray-500">
                      {formatDate(customer.createdAt)}
                    </td>
                    <td className="p-3 text-right">
                      <IconActionButton
                        icon={customer.isActive === false ? Unlock : Lock}
                        label={
                          togglingId === customer.id
                            ? "A confirmar..."
                            : customer.isActive === false
                              ? "Ativar cliente"
                              : "Bloquear cliente"
                        }
                        onClick={() => handleToggleActive(customer.id)}
                        variant={
                          customer.isActive === false ? "success" : "warning"
                        }
                        disabled={togglingId === customer.id}
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
