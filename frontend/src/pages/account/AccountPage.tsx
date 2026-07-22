import { useState } from 'react';
import { useParams } from 'react-router-dom';
import PerfilTab from './PerfilTab';
import EnderecosTab from './EnderecosTab';
import PedidosTab from './PedidosTab';
import FavoritosTab from './FavoritosTab';

type Tab = 'perfil' | 'enderecos' | 'pedidos' | 'favoritos';

const tabs: { key: Tab; label: string }[] = [
  { key: 'perfil', label: 'Perfil' },
  { key: 'enderecos', label: 'Endereços' },
  { key: 'pedidos', label: 'Pedidos' },
  { key: 'favoritos', label: 'Favoritos' },
];

export default function AccountPage() {
  const { id: orderId } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>(orderId ? 'pedidos' : 'perfil');

  const renderTab = () => {
    switch (activeTab) {
      case 'perfil': return <PerfilTab />;
      case 'enderecos': return <EnderecosTab />;
      case 'pedidos': return <PedidosTab initialOrderId={orderId} />;
      case 'favoritos': return <FavoritosTab />;
    }
  };

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl font-bold mb-8">A Minha Conta</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="md:col-span-3 min-h-[400px]">
          {renderTab()}
        </div>
      </div>
    </div>
  );
}
