import { useState, useEffect } from 'react';
import { settingsService, Setting } from '../../services/settings.service';
import { formatDate } from '../../utils/format';

interface GroupedSettings {
  [group: string]: Setting[];
}

const groupLabels: Record<string, string> = {
  general: 'Geral',
  checkout: 'Checkout',
  shipping: 'Transporte',
  payment: 'Pagamento',
  notifications: 'Notificações',
  appearance: 'Aparência',
};

function labelFromKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  const loadSettings = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await settingsService.getAll({ limit: 100 });
      if (response.data) {
        setSettings(response.data);
        const map: Record<string, string> = {};
        response.data.forEach((s) => {
          map[s.id] = s.value;
        });
        setValues(map);
      }
    } catch {
      setError('Erro ao carregar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (setting: Setting) => {
    setSavingId(setting.id);
    try {
      await settingsService.update(setting.id, { value: values[setting.id] });
      loadSettings();
    } catch {
      setError('Erro ao guardar configuração');
    } finally {
      setSavingId(null);
    }
  };

  const grouped: GroupedSettings = {};
  settings.forEach((s) => {
    const g = s.group || 'general';
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(s);
  });

  const groupOrder = Object.keys(grouped).sort();

  if (isLoading) {
    return <div className="text-center py-10 text-gray-500">A carregar...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>
      )}

      {settings.length === 0 ? (
        <div className="text-center py-10 text-gray-500">Nenhuma configuração encontrada.</div>
      ) : (
        <div className="space-y-6">
          {groupOrder.map((group) => (
            <div key={group} className="card p-6">
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b">
                {groupLabels[group] || labelFromKey(group)}
              </h2>
              <div className="space-y-4">
                {grouped[group].map((setting) => (
                  <div key={setting.id} className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {labelFromKey(setting.key)}
                      </label>
                      <input
                        className="input-field w-full"
                        value={values[setting.id] ?? ''}
                        onChange={(e) =>
                          setValues((prev) => ({
                            ...prev,
                            [setting.id]: e.target.value,
                          }))
                        }
                      />
                      {setting.updatedAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          Última alteração: {formatDate(setting.updatedAt)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleSave(setting)}
                      disabled={savingId === setting.id}
                      className="btn-primary mt-5 whitespace-nowrap"
                    >
                      {savingId === setting.id ? 'A guardar...' : 'Guardar'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
