import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressService } from '../../services/address.service';
import { Address } from '../../types';
import { addressSchema, AddressFormData } from '../../utils/validation';

export default function EnderecosTab() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  const loadAddresses = async () => {
    try {
      const response = await addressService.getAll();
      if (response.data) setAddresses(response.data);
    } catch {
      setError('Erro ao carregar endereços');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const onSubmit = async (data: AddressFormData) => {
    setError('');
    try {
      if (editingId) {
        await addressService.update(editingId, data);
      } else {
        await addressService.create(data);
      }
      reset();
      setIsAdding(false);
      setEditingId(null);
      loadAddresses();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar endereço');
    }
  };

  const handleEdit = (address: Address) => {
    setEditingId(address.id);
    reset(address);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja eliminar este endereço?')) return;
    try {
      await addressService.delete(id);
      loadAddresses();
    } catch {
      setError('Erro ao eliminar endereço');
    }
  };

  const cancelForm = () => {
    setIsAdding(false);
    setEditingId(null);
    reset({});
  };

  if (isLoading) return <div className="text-center py-10 text-gray-500">A carregar...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Endereços</h2>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="btn-primary text-sm">
            + Novo Endereço
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>
      )}

      {isAdding && (
        <div className="card p-6 mb-6">
          <h3 className="font-semibold mb-4">{editingId ? 'Editar Endereço' : 'Novo Endereço'}</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Designação</label>
              <input {...register('label')} className="input-field" placeholder="Casa, Trabalho, etc." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rua *</label>
              <input {...register('street')} className="input-field" />
              {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
              <input {...register('number')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
              <input {...register('complement')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
              <input {...register('neighborhood')} className="input-field" />
              {errors.neighborhood && <p className="text-red-500 text-xs mt-1">{errors.neighborhood.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
              <input {...register('city')} className="input-field" />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Província *</label>
              <input {...register('province')} className="input-field" />
              {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
              <input {...register('zipCode')} className="input-field" />
            </div>
            <div className="md:col-span-2 flex items-center space-x-3 pt-2">
              <button type="submit" className="btn-primary">
                {editingId ? 'Atualizar' : 'Salvar'}
              </button>
              <button type="button" onClick={cancelForm} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="card p-6 text-center text-gray-500">
          Nenhum endereço cadastrado.
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div key={address.id} className="card p-4 flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  {address.label && <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded">{address.label}</span>}
                  {address.isDefault && <span className="text-xs font-medium bg-primary-50 text-primary-700 px-2 py-0.5 rounded">Padrão</span>}
                </div>
                <p className="text-sm">
                  {address.street}{address.number ? `, ${address.number}` : ''}
                  {address.complement ? ` - ${address.complement}` : ''}
                </p>
                <p className="text-sm text-gray-500">
                  {address.neighborhood}, {address.city} - {address.province}
                </p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button onClick={() => handleEdit(address)} className="text-sm text-primary-600 hover:text-primary-700">
                  Editar
                </button>
                <button onClick={() => handleDelete(address.id)} className="text-sm text-red-600 hover:text-red-700">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
