import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PencilLine, Trash2 } from "lucide-react";
import { couponService } from "../../services/coupon.service";
import { formatCurrency, formatDate } from "../../utils/format";
import IconActionButton from "../../components/ui/IconActionButton";

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [value, setValue] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [maxUsesPerUser, setMaxUsesPerUser] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: () => couponService.getAll({ limit: 100 }),
  });

  const coupons = data?.data || [];

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        code,
        description: description || undefined,
        type,
        value: Number(value),
        minOrderValue: minOrderValue ? Number(minOrderValue) : undefined,
        maxUses: maxUses ? Number(maxUses) : undefined,
        maxUsesPerUser: maxUsesPerUser ? Number(maxUsesPerUser) : undefined,
        startsAt: startsAt || undefined,
        expiresAt: expiresAt || undefined,
        isActive,
      };
      if (editingId) return couponService.update(editingId, payload);
      return couponService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => couponService.delete(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] }),
  });

  const resetForm = () => {
    setCode("");
    setDescription("");
    setType("PERCENTAGE");
    setValue("");
    setMinOrderValue("");
    setMaxUses("");
    setMaxUsesPerUser("");
    setStartsAt("");
    setExpiresAt("");
    setIsActive(true);
    setEditingId(null);
  };

  const editCoupon = (coupon: any) => {
    setCode(coupon.code);
    setDescription(coupon.description || "");
    setType(coupon.type);
    setValue(String(coupon.value));
    setMinOrderValue(coupon.minOrderValue ? String(coupon.minOrderValue) : "");
    setMaxUses(coupon.maxUses ? String(coupon.maxUses) : "");
    setMaxUsesPerUser(
      coupon.maxUsesPerUser ? String(coupon.maxUsesPerUser) : "",
    );
    setStartsAt(coupon.startsAt ? coupon.startsAt.slice(0, 10) : "");
    setExpiresAt(coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : "");
    setIsActive(coupon.isActive ?? true);
    setEditingId(coupon.id);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Cupões</h1>

      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">
          {editingId ? "Editar Cupão" : "Novo Cupão"}
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-4 max-w-lg"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Código</label>
            <input
              className="input-field"
              value={code}
              onChange={(e) => setCode(e.target.value)}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select
                className="input-field"
                value={type}
                onChange={(e) =>
                  setType(e.target.value as "PERCENTAGE" | "FIXED")
                }
              >
                <option value="PERCENTAGE">Percentagem</option>
                <option value="FIXED">Valor Fixo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Valor</label>
              <input
                className="input-field"
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Valor Mínimo (opcional)
              </label>
              <input
                className="input-field"
                type="number"
                step="0.01"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Usos Máx. (opcional)
              </label>
              <input
                className="input-field"
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Usos por Utilizador (opcional)
              </label>
              <input
                className="input-field"
                type="number"
                value={maxUsesPerUser}
                onChange={(e) => setMaxUsesPerUser(e.target.value)}
              />
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
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Início</label>
              <input
                className="input-field"
                type="date"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expira</label>
              <input
                className="input-field"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
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
                  Código
                </th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">
                  Tipo
                </th>
                <th className="text-right p-3 text-sm font-medium text-gray-500">
                  Valor
                </th>
                <th className="text-center p-3 text-sm font-medium text-gray-500">
                  Usos
                </th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">
                  Expira
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
              {coupons.map((coupon: any) => (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium">{coupon.code}</td>
                  <td className="p-3 text-sm text-gray-500">
                    {coupon.type === "PERCENTAGE"
                      ? "Percentagem"
                      : coupon.type === "FIXED"
                        ? "Valor Fixo"
                        : coupon.type}
                  </td>
                  <td className="p-3 text-right text-sm">
                    {coupon.type === "PERCENTAGE"
                      ? `${coupon.value}%`
                      : formatCurrency(coupon.value)}
                  </td>
                  <td className="p-3 text-center text-sm">
                    {coupon._count?.used ?? 0}
                    {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                  </td>
                  <td className="p-3 text-sm text-gray-500">
                    {coupon.expiresAt ? formatDate(coupon.expiresAt) : "—"}
                  </td>
                  <td className="p-3 text-center">
                    {coupon.isActive ? (
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
                        label="Editar cupão"
                        onClick={() => editCoupon(coupon)}
                        variant="edit"
                      />
                      <IconActionButton
                        icon={Trash2}
                        label="Eliminar cupão"
                        onClick={() => {
                          if (confirm("Eliminar?"))
                            deleteMutation.mutate(coupon.id);
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
