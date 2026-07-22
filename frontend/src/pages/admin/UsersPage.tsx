import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PencilLine, Trash2, Lock, Unlock } from "lucide-react";
import { userService } from "../../services/user.service";
import { User } from "../../types";
import { formatDate } from "../../utils/format";
import IconActionButton from "../../components/ui/IconActionButton";

const roleBadge: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-800",
  STAFF: "bg-blue-100 text-blue-800",
};

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "STAFF">("STAFF");
  const [isActive, setIsActive] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => userService.getAll({ limit: 100 }),
  });

  const users = (data?.data || []) as (User & { isActive?: boolean })[];

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        name,
        email,
        phone: phone || undefined,
        role,
        isActive,
      };
      if (editingId) {
        return userService.update(editingId, payload);
      }
      payload.password = password;
      return userService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => userService.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setRole("STAFF");
    setIsActive(true);
    setEditingId(null);
  };

  const editUser = (user: User & { isActive?: boolean }) => {
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || "");
    setPassword("");
    setRole(user.role as "ADMIN" | "STAFF");
    setIsActive(user.isActive !== false);
    setEditingId(user.id);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Utilizadores</h1>

      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">
          {editingId ? "Editar Utilizador" : "Novo Utilizador"}
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
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Telefone</label>
            <input
              className="input-field"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          {!editingId && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Palavra-passe
              </label>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Cargo</label>
            <select
              className="input-field"
              value={role}
              onChange={(e) => setRole(e.target.value as "ADMIN" | "STAFF")}
            >
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              Ativo
            </label>
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
                  Email
                </th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">
                  Cargo
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
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <p className="font-medium">{user.name}</p>
                  </td>
                  <td className="p-3 text-sm text-gray-600">{user.email}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        roleBadge[user.role] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        user.isActive !== false ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <IconActionButton
                        icon={PencilLine}
                        label="Editar utilizador"
                        onClick={() => editUser(user)}
                        variant="edit"
                      />
                      <IconActionButton
                        icon={user.isActive !== false ? Lock : Unlock}
                        label={
                          user.isActive !== false
                            ? "Bloquear utilizador"
                            : "Ativar utilizador"
                        }
                        onClick={() => toggleMutation.mutate(user.id)}
                        variant={
                          user.isActive !== false ? "warning" : "success"
                        }
                      />
                      <IconActionButton
                        icon={Trash2}
                        label="Eliminar utilizador"
                        onClick={() => {
                          if (confirm("Eliminar utilizador?"))
                            deleteMutation.mutate(user.id);
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
