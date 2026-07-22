import { useState, useEffect } from 'react';
import { orderService } from '../../services/order.service';
import { Order } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  AWAITING_PAYMENT: { label: 'Aguardando Pagamento', color: 'bg-orange-100 text-orange-800' },
  PAID: { label: 'Pago', color: 'bg-blue-100 text-blue-800' },
  SEPARATING: { label: 'Em Separação', color: 'bg-indigo-100 text-indigo-800' },
  SHIPPED: { label: 'Enviado', color: 'bg-purple-100 text-purple-800' },
  IN_TRANSIT: { label: 'Em Trânsito', color: 'bg-cyan-100 text-cyan-800' },
  DELIVERED: { label: 'Entregue', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
  REFUNDED: { label: 'Reembolsado', color: 'bg-gray-100 text-gray-800' },
};

interface Props {
  initialOrderId?: string;
}

export default function PedidosTab({ initialOrderId }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (initialOrderId) {
      if (orders.length > 0) {
        const order = orders.find((o) => o.id === initialOrderId);
        if (order) setSelectedOrder(order);
      } else {
        loadOrderById(initialOrderId);
      }
    }
  }, [initialOrderId, orders]);

  const loadOrderById = async (id: string) => {
    try {
      const response = await orderService.getById(id);
      if (response.data) setSelectedOrder(response.data);
    } catch {
      setError('Pedido não encontrado');
    }
  };

  const loadOrders = async () => {
    try {
      const response = await orderService.getAll();
      if (response.data) setOrders(response.data);
    } catch {
      setError('Erro ao carregar pedidos');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="text-center py-10 text-gray-500">A carregar...</div>;

  if (error) return <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>;

  if (selectedOrder) {
    const s = statusLabels[selectedOrder.status] || { label: selectedOrder.status, color: 'bg-gray-100 text-gray-800' };

    return (
      <div>
        <button onClick={() => setSelectedOrder(null)} className="text-sm text-primary-600 hover:text-primary-700 mb-4 block">
          &larr; Voltar aos pedidos
        </button>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Pedido #{selectedOrder.orderNumber}</h2>
              <p className="text-sm text-gray-500">{formatDate(selectedOrder.createdAt)}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>
          </div>

          {selectedOrder.address && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium mb-1">Morada de Entrega</p>
              <p className="text-sm text-gray-600">
                {selectedOrder.address.street}
                {selectedOrder.address.neighborhood && `, ${selectedOrder.address.neighborhood}`}
              </p>
              <p className="text-sm text-gray-600">{selectedOrder.address.city} - {selectedOrder.address.province}</p>
            </div>
          )}

          <div className="space-y-3">
            {selectedOrder.items?.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{item.product.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity} x {formatCurrency(item.unitPrice)}</p>
                </div>
                <span className="text-sm font-medium">{formatCurrency(item.totalPrice)}</span>
              </div>
            ))}
          </div>

          <div className="border-t mt-4 pt-4 space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(selectedOrder.subtotal)}</span></div>
            {selectedOrder.discountAmount > 0 && (
              <div className="flex justify-between text-green-600"><span>Desconto</span><span>-{formatCurrency(selectedOrder.discountAmount)}</span></div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
              <span>Total</span><span>{formatCurrency(selectedOrder.total)}</span>
            </div>
          </div>

          {selectedOrder.paymentMethod && (
            <p className="text-xs text-gray-400 mt-2">
              Pagamento: {selectedOrder.paymentMethod === 'MULTICAIXA_EXPRESS' ? 'Multicaixa Express' : 'Pagamento na Entrega'}
            </p>
          )}
          {(selectedOrder as any).whatsappLink && (
            <a
              href={(selectedOrder as any).whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>Enviar Comprovativo via WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="card p-6 text-center text-gray-500">
        <p className="mb-2">Nenhum pedido encontrado.</p>
        <p className="text-sm">Os seus pedidos aparecerão aqui após a primeira compra.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-6">Meus Pedidos</h2>
      <div className="space-y-4">
        {orders.map((order) => {
          const s = statusLabels[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' };
          return (
            <div key={order.id} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">Pedido #{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'itens'}
                </p>
                <span className="font-semibold">{formatCurrency(order.total)}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(order)}
                className="text-sm text-primary-600 hover:text-primary-700 mt-2 font-medium"
              >
                Ver detalhes &rarr;
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
