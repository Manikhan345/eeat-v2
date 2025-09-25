import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans">
      {/* Title */}
      <h1 className="text-4xl font-bold mb-8">EEAT v2</h1>

      {/* Input + Button */}
      <div className="flex w-full max-w-xl gap-2">
        <input
          className="flex-grow border border-gray-300 rounded px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Paste URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded text-lg hover:bg-blue-700 disabled:opacity-50"
          onClick={analyze}
          disabled={loading}
        >
          {loading ? "Checking…" : "Analyze"}
        </button>
      </div>

      {/* Results */}
      <div className="mt-8 w-full max-w-3xl">
        {score && (
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(score, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
