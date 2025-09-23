import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/score', {   // NEW route
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      setScore(data);
    } catch (e) {
      setScore({ e: 0, x: 0, a: 0, t: 0, debug: e.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-4">EEAT v2</h1>
        <input className="border w-full p-2 mb-4" placeholder="Paste URL" value={url} onChange={(e) => setUrl(e.target.value)} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={analyze} disabled={loading}>
          {loading ? 'Checking…' : 'Analyze'}
        </button>
        {score && <pre className="mt-4 text-sm">{JSON.stringify(score, null, 2)}</pre>}
      </div>
    </div>
  );
}
