import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { orderService } from '../../services/order.service';
import { Order } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/format';

export default function OrderSuccessPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order & { whatsappLink?: string; receipt?: any } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [proofUploaded, setProofUploaded] = useState(false);
  const [proofError, setProofError] = useState('');
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [selectedProofName, setSelectedProofName] = useState('');

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    try {
      const response = await orderService.getById(id!);
      if (response.data) setOrder(response.data as any);
    } catch {
      // handled
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="container-custom py-20 text-center text-gray-500">A carregar...</div>;
  }

  if (!order) {
    return (
      <div className="container-custom py-20 text-center">
        <p className="text-gray-500 mb-4">Pedido não encontrado.</p>
        <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium">Voltar ao início</Link>
      </div>
    );
  }

  const isMulticaixa = order.paymentMethod === 'MULTICAIXA_EXPRESS';

  const handleProofSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedProofName(file.name);
    setProofError('');
  };

  const handleProofUpload = async () => {
    if (!selectedProofName) return;

    const input = document.getElementById('proof-file-input') as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file || !id) return;

    setIsUploadingProof(true);
    setProofError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      await orderService.uploadProof(id, formData);
      setProofUploaded(true);
      setIsProofModalOpen(true);
      setSelectedProofName('');
      if (input) input.value = '';
    } catch {
      setProofError('Não foi possível enviar o comprovativo. Tente novamente.');
    } finally {
      setIsUploadingProof(false);
    }
  };

  return (
    <div className="container-custom py-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Pedido Confirmado!</h1>
        <p className="text-gray-500 mt-1">Pedido #{order.orderNumber}</p>
        <p className="text-sm text-gray-400 mt-1">{formatDateTime(order.createdAt)}</p>
      </div>

      {isMulticaixa ? (
        <div className="card p-6 mb-6 border-2 border-primary-100 bg-primary-50">
          <h2 className="text-lg font-semibold text-primary-800 mb-3">Pagamento via Multicaixa Express</h2>
          <div className="space-y-4 text-sm text-primary-700">
            <div className="flex items-start space-x-3">
              <span className="w-6 h-6 bg-primary-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
              <p>Transfira o valor total de <strong>{formatCurrency(order.total)}</strong> para o IBAN da Angola Express.</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="w-6 h-6 bg-primary-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
              <p>Guarde o comprovativo de transferência.</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="w-6 h-6 bg-primary-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
              <p>Envie o comprovativo via WhatsApp para confirmarmos o pagamento.</p>
            </div>

            {order.whatsappLink && (
              <a
                href={order.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full flex items-center justify-center space-x-2 mt-4"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>Enviar Comprovativo via WhatsApp</span>
              </a>
            )}

            <div className="bg-white rounded-lg p-4 mt-2">
              <p className="text-xs text-gray-500 font-medium mb-2">DADOS PARA TRANSFERÊNCIA</p>
              <p className="text-sm text-gray-700"><strong>Banco:</strong> Banco Económico</p>
              <p className="text-sm text-gray-700"><strong>IBAN:</strong> AO06 0040 0000 1234 5678 9010 0</p>
              <p className="text-sm text-gray-700"><strong>Titular:</strong> Angola Express, Lda</p>
              <p className="text-sm text-gray-700"><strong>Valor:</strong> {formatCurrency(order.total)}</p>
              <p className="text-sm text-gray-700"><strong>Referência:</strong> Pedido #{order.orderNumber}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">Pagamento na Entrega</h2>
          <p className="text-sm text-gray-600">
            O pagamento será efectuado no momento da entrega dos produtos.
            Entraremos em contacto para combinar a data e hora da entrega.
          </p>
        </div>
      )}

      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Resumo do Pedido</h2>
        <div className="space-y-3">
          {order.items?.map((item) => (
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
          <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-green-600"><span>Desconto</span><span>-{formatCurrency(order.discountAmount)}</span></div>
          )}
          <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
            <span>Total</span><span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="card p-6 mb-6 border-dashed border-2 border-primary-200 bg-primary-50/50">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.9A5 5 0 1117 3c1.4 0 2.7.5 3.7 1.4A4.98 4.98 0 0122 10c0 2.8-2.2 5-5 5H7z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-primary-900">Carregar comprovativo</h2>
            <p className="mt-1 text-sm text-slate-600">
              Anexe uma imagem do comprovativo para concluirmos a confirmação do pagamento.
            </p>

            {selectedProofName && (
              <p className="mt-3 text-sm text-slate-700">
                Ficheiro selecionado: <span className="font-medium">{selectedProofName}</span>
              </p>
            )}

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-primary-300 bg-white px-4 py-2 text-sm font-semibold text-primary-700 transition hover:bg-primary-100">
                Escolher ficheiro
                <input
                  id="proof-file-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProofSelect}
                />
              </label>

              <button
                type="button"
                onClick={handleProofUpload}
                disabled={isUploadingProof || !selectedProofName}
                className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
              >
                {isUploadingProof ? 'A enviar...' : 'Enviar comprovativo'}
              </button>
            </div>

            {proofError && (
              <p className="mt-3 text-sm text-red-600">{proofError}</p>
            )}
            {proofUploaded && !proofError && (
              <p className="mt-3 text-sm font-semibold text-green-700">
                Comprovativo enviado com sucesso.
              </p>
            )}
          </div>
        </div>
      </div>

      {isProofModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-4 text-center text-xl font-semibold text-slate-900">
              Compra realizada com sucesso
            </h3>
            <p className="mt-2 text-center text-sm text-slate-600">
              O seu comprovativo foi enviado e a confirmação está a ser processada.
            </p>
            <button
              type="button"
              onClick={() => {
                setIsProofModalOpen(false);
                navigate('/');
              }}
              className="mt-6 w-full rounded-full bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <div className="text-center space-x-4">
        <Link to={`/conta/pedidos/${order.id}`} className="btn-primary">
          Ver Detalhes do Pedido
        </Link>
        <Link to="/produtos" className="btn-secondary">
          Continuar a Comprar
        </Link>
      </div>
    </div>
  );
}
