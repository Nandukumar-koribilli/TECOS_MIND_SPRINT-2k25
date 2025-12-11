import React, { useEffect, useMemo, useState } from 'react';

interface BlynkControlsProps {
    token?: string;
}

const BlynkControls: React.FC<BlynkControlsProps> = ({ token }) => {
    const [moisture, setMoisture] = useState<number | null>(null);
    const [autoMode, setAutoMode] = useState<boolean>(false);
    const [manualOn, setManualOn] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const auth = token || (import.meta.env.VITE_BLYNK_TOKEN as string | undefined);
    const baseGet = useMemo(() => auth ? `https://blynk.cloud/external/api/get?token=${auth}` : undefined, [auth]);
    const baseUpdate = useMemo(() => auth ? `https://blynk.cloud/external/api/update?token=${auth}` : undefined, [auth]);

    const fetchMoisture = async () => {
        if (!baseGet) { setError('Missing VITE_BLYNK_TOKEN'); return; }
        try {
            const res = await fetch(`${baseGet}&V0`);
            const text = await res.text();
            const val = Number(text);
            if (!Number.isNaN(val)) setMoisture(val);
        } catch (e: any) {
            setError(e?.message || 'Failed to read moisture');
        }
    };

    const setV = async (pin: string, value: number) => {
        if (!baseUpdate) return;
        setLoading(true);
        try {
            await fetch(`${baseUpdate}&${pin}=${value}`);
            setError(null);
        } catch (e: any) {
            setError(e?.message || 'Failed to update');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!auth) return;
        fetchMoisture();
        const id = setInterval(fetchMoisture, 3000);
        return () => clearInterval(id);
    }, [auth]);

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Blynk Controls</h2>
                {!auth && (
                    <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">Set VITE_BLYNK_TOKEN in .env</span>
                )}
            </div>

            {error && (
                <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">{error}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Soil Moisture (V0)</div>
                    <div className="text-3xl font-bold text-gray-800">{moisture ?? '—'}</div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <div className="text-sm text-gray-600">Auto Mode (V2)</div>
                            <div className="text-xs text-gray-500">Device decides pump based on threshold</div>
                        </div>
                        <button
                            onClick={async () => { const next = !autoMode; setAutoMode(next); await setV('V2', next ? 1 : 0); }}
                            className={`px-3 py-2 rounded-lg text-sm ${autoMode ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                            disabled={!auth || loading}
                        >
                            {autoMode ? 'ON' : 'OFF'}
                        </button>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <div className="text-sm text-gray-600">Manual Pump (V1)</div>
                            <div className="text-xs text-gray-500">Effective when Auto is OFF</div>
                        </div>
                        <button
                            onClick={async () => { const next = !manualOn; setManualOn(next); await setV('V1', next ? 1 : 0); }}
                            className={`px-3 py-2 rounded-lg text-sm ${manualOn ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                            disabled={!auth || loading}
                        >
                            {manualOn ? 'ON' : 'OFF'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlynkControls;
