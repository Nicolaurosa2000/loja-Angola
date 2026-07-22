import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth.service';

export default function PerfilTab() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    try {
      const response = await authService.updateProfile({ name, phone });
      if (response.data) updateUser(response.data);
      setMessage('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Erro ao atualizar perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Perfil</h2>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Editar
          </button>
        )}
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm mb-4 ${message.includes('sucesso') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {message}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              className="input-field bg-gray-50"
              disabled
            />
            <p className="text-xs text-gray-400 mt-1">O email não pode ser alterado</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field"
              placeholder="+244 900 000 000"
            />
          </div>
          <div className="flex space-x-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'A guardar...' : 'Guardar'}
            </button>
            <button type="button" onClick={() => { setIsEditing(false); setName(user?.name || ''); setPhone(user?.phone || ''); }} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">Nome</label>
            <p className="font-medium">{user?.name}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Email</label>
            <p className="font-medium">{user?.email}</p>
          </div>
          {user?.phone && (
            <div>
              <label className="text-sm text-gray-500">Telefone</label>
              <p className="font-medium">{user.phone}</p>
            </div>
          )}
          <div>
            <label className="text-sm text-gray-500">Membro desde</label>
            <p className="font-medium">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-AO') : '-'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
